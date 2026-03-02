import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, Bell } from "lucide-react";
import { toast } from "sonner";

const StockNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["admin-stock-notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_notifications")
        .select("*, products(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("stock_notifications")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stock-notifications"] });
      toast.success("Notification removed");
    },
  });

  const count = notifications?.length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-maxir-white">Stock Notifications</h1>
          <p className="text-maxir-gray text-sm mt-1">
            {count} request{count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="bg-maxir-dark-surface border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-maxir-gray">Email</TableHead>
              <TableHead className="text-maxir-gray">Product</TableHead>
              <TableHead className="text-maxir-gray">Variant</TableHead>
              <TableHead className="text-maxir-gray">SKU</TableHead>
              <TableHead className="text-maxir-gray">Date</TableHead>
              <TableHead className="text-maxir-gray w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-maxir-gray py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !notifications?.length ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-maxir-gray py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Bell className="w-8 h-8 text-maxir-gray/50" />
                    <span>No notification requests yet</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((n) => (
                <TableRow key={n.id} className="border-white/10">
                  <TableCell className="text-maxir-white">{n.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-white/10 text-maxir-white border-0 text-xs">
                      {(n as any).products?.name ?? "—"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-maxir-gray">{n.variant_name}</TableCell>
                  <TableCell className="text-maxir-gray font-mono text-xs">{n.variant_sku ?? "—"}</TableCell>
                  <TableCell className="text-maxir-gray text-sm whitespace-nowrap">
                    {format(new Date(n.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-maxir-gray hover:text-destructive"
                      onClick={() => deleteMutation.mutate(n.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockNotifications;
