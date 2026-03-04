import { Users, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  new_lead: { label: "New Lead", className: "bg-blue-100 text-blue-800 border-blue-200" },
  new_inquiry: { label: "New Inquiry", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

type SortField = "created_at" | "first_name" | "status";
type SortDir = "asc" | "desc";

const Customers = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    let list = [...customers];
    if (statusFilter !== "all") {
      list = list.filter((c) => (c as any).status === statusFilter);
    }
    list.sort((a, b) => {
      let aVal: string, bVal: string;
      if (sortField === "first_name") {
        aVal = a.first_name.toLowerCase();
        bVal = b.first_name.toLowerCase();
      } else if (sortField === "status") {
        aVal = (a as any).status || "new_lead";
        bVal = (b as any).status || "new_lead";
      } else {
        aVal = a.created_at;
        bVal = b.created_at;
      }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [customers, statusFilter, sortField, sortDir]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
        </div>
        <Button asChild>
          <Link to="/admin/customers/create">
            <Plus className="h-4 w-4 mr-1" />
            Add customer
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px] h-9 text-sm">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="new_lead">New Lead</SelectItem>
            <SelectItem value="new_inquiry">New Inquiry</SelectItem>
          </SelectContent>
        </Select>
        <Select value={`${sortField}:${sortDir}`} onValueChange={(v) => { const [f, d] = v.split(":"); setSortField(f as SortField); setSortDir(d as SortDir); }}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at:desc">Newest first</SelectItem>
            <SelectItem value="created_at:asc">Oldest first</SelectItem>
            <SelectItem value="first_name:asc">Name A–Z</SelectItem>
            <SelectItem value="first_name:desc">Name Z–A</SelectItem>
            <SelectItem value="status:asc">Status A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Name</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Status</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Email</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Country</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Company</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr className="border-b border-border/50">
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {customers.length === 0
                      ? 'No customers yet. Click "Add customer" to create one.'
                      : "No customers match the selected filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => navigate(`/admin/customers/${c.id}`)}>
                    <td className="px-6 py-3 text-foreground font-medium">
                      <Link to={`/admin/customers/${c.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                        {c.first_name} {c.last_name || ""}
                      </Link>
                    </td>
                    <td className="px-6 py-3">
                      {(() => {
                        const config = statusConfig[(c as any).status] || statusConfig.new_lead;
                        return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
                      })()}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{c.email || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.country || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{c.company || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()}
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

export default Customers;
