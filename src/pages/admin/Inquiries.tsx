import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import NotificationEmailCard from "@/components/admin/NotificationEmailCard";

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  country: string | null;
  state: string | null;
  product_name: string;
  message: string;
  read: boolean;
  created_at: string;
  customers?: { id: string; first_name: string; last_name: string | null; company: string | null } | null;
};

const Inquiries = () => {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Inquiry | null>(null);

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, customers:customer_id(id, first_name, last_name, company)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Inquiry[];
    },
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").update({ read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase.from("inquiries").update({ read: !read }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const deleteInquiry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("inquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      setSelected(null);
      toast.success("Inquiry deleted");
    },
    onError: () => toast.error("Failed to delete inquiry"),
  });

  const openInquiry = (inq: Inquiry) => {
    setSelected(inq);
    if (!inq.read) markRead.mutate(inq.id);
  };

  const unreadCount = inquiries?.filter((i) => !i.read).length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !inquiries?.length ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                  No inquiries yet
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow
                  key={inq.id}
                  className={`cursor-pointer hover:bg-muted/50 ${!inq.read ? "bg-primary/5" : ""}`}
                  onClick={() => openInquiry(inq)}
                >
                  <TableCell>
                    {inq.read ? (
                      <MailOpen className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell className={!inq.read ? "text-foreground font-semibold" : "text-foreground"}>
                    {inq.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {inq.customers ? (
                      <Link
                        to={`/admin/customers/${inq.customers.id}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inq.customers.company ||
                          `${inq.customers.first_name} ${inq.customers.last_name || ""}`.trim()}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{inq.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {inq.product_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate">
                    {inq.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                    {format(new Date(inq.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl pr-8">
              {selected?.name}
            </DialogTitle>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="text-xs">
                {selected?.product_name}
              </Badge>
              {selected && (
                <span className="text-xs text-muted-foreground">
                  {format(new Date(selected.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              )}
            </div>
          </DialogHeader>

          {selected && (
            <div className="flex-1 overflow-y-auto space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <a href={`mailto:${selected.email}`} className="text-primary hover:underline break-all">
                    {selected.email}
                  </a>
                </div>
                {selected.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Phone</p>
                    <p className="text-foreground">{selected.phone}</p>
                  </div>
                )}
                {selected.company_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Company</p>
                    <p className="text-foreground">{selected.company_name}</p>
                  </div>
                )}
                {(selected.country || selected.state) && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground">
                      {[selected.state, selected.country].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Message</p>
                <div className="bg-muted/50 border border-border rounded-md p-4 text-sm text-foreground whitespace-pre-wrap">
                  {selected.message}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-row sm:justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => selected && deleteInquiry.mutate(selected.id)}
              disabled={deleteInquiry.isPending}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selected && toggleRead.mutate({ id: selected.id, read: selected.read })
                }
              >
                Mark as {selected?.read ? "unread" : "read"}
              </Button>
              <Button size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;
