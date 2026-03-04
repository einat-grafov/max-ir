import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  new_lead: { label: "New Lead", className: "bg-blue-100 text-blue-800 border-blue-200" },
  new_inquiry: { label: "New Inquiry", className: "bg-amber-100 text-amber-800 border-amber-200" },
};

const Customers = () => {
  const navigate = useNavigate();
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
              {customers.length === 0 ? (
                <tr className="border-b border-border/50">
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    No customers yet. Click "Add customer" to create one.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
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
