import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { MailX, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SortableHeader, SortState } from "./SortableHeader";

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200" },
  new: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200" },
  under_review: { label: "Under Review", className: "bg-amber-100 text-amber-800 border-amber-200" },
  reviewing: { label: "Under Review", className: "bg-amber-100 text-amber-800 border-amber-200" },
  interview: { label: "Interview Stage", className: "bg-purple-100 text-purple-800 border-purple-200" },
  interviewing: { label: "Interview Stage", className: "bg-purple-100 text-purple-800 border-purple-200" },
  offer_extended: { label: "Offer Extended", className: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  offer_accepted: { label: "Offer Accepted", className: "bg-teal-100 text-teal-800 border-teal-200" },
  hired: { label: "Hired", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
};

const FILTER_STATUSES = ["applied", "under_review", "interview", "offer_extended", "offer_accepted", "hired", "rejected"];

const CareerApplicationsTable = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-career-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: suppressedEmails = [] } = useQuery({
    queryKey: ["suppressed-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppressed_emails").select("email");
      if (error) throw error;
      return data.map((s) => s.email.toLowerCase());
    },
  });

  const suppressedSet = useMemo(() => new Set(suppressedEmails), [suppressedEmails]);

  const enriched = useMemo(() => {
    return (applications || []).map((app) => ({
      ...app,
      unsubscribed: app.email ? suppressedSet.has(app.email.toLowerCase()) : false,
    }));
  }, [applications, suppressedSet]);

  const statusEquivalents: Record<string, string[]> = {
    applied: ["applied", "new"],
    under_review: ["under_review", "reviewing"],
    interview: ["interview", "interviewing"],
    offer_extended: ["offer_extended"],
    offer_accepted: ["offer_accepted"],
    hired: ["hired"],
    rejected: ["rejected"],
  };

  const filtered = useMemo(() => {
    if (filter === "unread") return enriched.filter((a) => !a.read);
    if (filter === "unsubscribed") return enriched.filter((a) => a.unsubscribed);
    if (filter !== "all") {
      const equivs = statusEquivalents[filter] || [filter];
      return enriched.filter((a) => equivs.includes(a.status || "applied"));
    }
    return enriched;
  }, [enriched, filter]);

  const STATUS_ORDER = ["applied", "under_review", "interview", "offer_extended", "offer_accepted", "hired", "rejected"];
  const normalizeStatus = (s: string | null | undefined) => {
    const v = s || "applied";
    if (v === "new") return "applied";
    if (v === "reviewing") return "under_review";
    if (v === "interviewing") return "interview";
    return v;
  };

  type SortKey = "name" | "status" | "email" | "country" | "education" | "date";
  const [sort, setSort] = useState<SortState<SortKey>>({ key: "date", dir: "desc" });

  const sorted = useMemo(() => {
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sort.key) {
        case "name":
          return (a.full_name || "").localeCompare(b.full_name || "") * dir;
        case "status": {
          const ia = STATUS_ORDER.indexOf(normalizeStatus(a.status));
          const ib = STATUS_ORDER.indexOf(normalizeStatus(b.status));
          return ((ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)) * dir;
        }
        case "email":
          return (a.email || "").localeCompare(b.email || "") * dir;
        case "country":
          return (a.country || "").localeCompare(b.country || "") * dir;
        case "education":
          return (a.education || "").localeCompare(b.education || "") * dir;
        case "date":
        default:
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      }
    });
  }, [filtered, sort]);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px] h-9 text-sm">
            <SelectValue placeholder="All applications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All applications</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            {FILTER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{statusConfig[s].label}</SelectItem>
            ))}
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-medium px-6 py-3"><SortableHeader label="Name" sortKey="name" state={sort} onChange={setSort} /></th>
                <th className="text-left font-medium px-6 py-3"><SortableHeader label="Status" sortKey="status" state={sort} onChange={setSort} /></th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell"><SortableHeader label="Email" sortKey="email" state={sort} onChange={setSort} /></th>
                <th className="text-left font-medium px-6 py-3 hidden lg:table-cell"><SortableHeader label="Country" sortKey="country" state={sort} onChange={setSort} /></th>
                <th className="text-left font-medium px-6 py-3 hidden lg:table-cell"><SortableHeader label="Education" sortKey="education" state={sort} onChange={setSort} /></th>
                <th className="text-left font-medium px-6 py-3 hidden md:table-cell"><SortableHeader label="Date" sortKey="date" state={sort} onChange={setSort} /></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-b border-border/50">
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr className="border-b border-border/50">
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {filter !== "all" ? "No applications match the selected filter" : "No career applications yet"}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => {
                  const config = statusConfig[app.status || "applied"] || statusConfig.applied;
                  return (
                    <tr
                      key={app.id}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/careers/${app.id}`)}
                    >
                      <td className="px-6 py-3 font-medium text-foreground">
                        <span className="flex items-center gap-2">
                          {!app.read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" aria-label="Unread" />}
                          {app.full_name}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge variant="outline" className={config.className}>{config.label}</Badge>
                          {app.unsubscribed && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                              <MailX className="h-3 w-3" />
                              Unsubscribed
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground hidden md:table-cell">{app.email}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden lg:table-cell">{app.country || "—"}</td>
                      <td className="px-6 py-3 text-muted-foreground hidden lg:table-cell">{app.education || "—"}</td>
                      <td className="px-6 py-3 text-muted-foreground text-sm whitespace-nowrap hidden md:table-cell">
                        {format(new Date(app.created_at), "MMM d, yyyy")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CareerApplicationsTable;
