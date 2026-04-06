import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Briefcase, Mail, MailOpen, MailX, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CareerApplications = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-career-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: suppressedEmails = [] } = useQuery({
    queryKey: ["suppressed-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppressed_emails")
        .select("email");
      if (error) throw error;
      return data.map((s) => s.email.toLowerCase());
    },
  });

  const suppressedSet = useMemo(() => new Set(suppressedEmails), [suppressedEmails]);

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("career_applications")
        .update({ read: !read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] }),
  });

  const enriched = useMemo(() => {
    return (applications || []).map((app) => ({
      ...app,
      unsubscribed: suppressedSet.has(app.email.toLowerCase()),
    }));
  }, [applications, suppressedSet]);

  const filtered = useMemo(() => {
    if (filter === "unread") return enriched.filter((a) => !a.read);
    if (filter === "unsubscribed") return enriched.filter((a) => a.unsubscribed);
    return enriched;
  }, [enriched, filter]);

  const unreadCount = enriched.filter((a) => !a.read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Career Applications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="All applications" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All applications</SelectItem>
            <SelectItem value="unread">Unread only</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium px-6 py-3 w-10"></th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Full Name</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Email</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Status</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Country</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Education</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">About</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-b border-border/50">
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !filtered.length ? (
                <tr className="border-b border-border/50">
                  <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                    {filter !== "all" ? "No applications match the selected filter" : "No career applications yet"}
                  </td>
                </tr>
              ) : (
                filtered.map((app) => (
                  <tr
                    key={app.id}
                    className={`border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${!app.read ? "bg-primary/5" : ""}`}
                    onClick={() => toggleRead.mutate({ id: app.id, read: app.read })}
                  >
                    <td className="px-6 py-3">
                      {app.read ? (
                        <MailOpen className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Mail className="w-4 h-4 text-primary" />
                      )}
                    </td>
                    <td className={`px-6 py-3 ${!app.read ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {app.full_name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{app.email}</td>
                    <td className="px-6 py-3">
                      {app.unsubscribed ? (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                          <MailX className="h-3 w-3" />
                          Unsubscribed
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          Subscribed
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{app.country || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{app.education || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground max-w-[300px] truncate">
                      {app.about || "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-sm whitespace-nowrap">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CareerApplications;
