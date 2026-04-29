import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MailOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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
  source: string;
  customers?: { id: string; first_name: string; last_name: string | null; company: string | null } | null;
};

interface Props {
  source: "sales" | "support";
}

const InquiriesTable = ({ source }: Props) => {
  const navigate = useNavigate();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-inquiries", source],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, customers:customer_id(id, first_name, last_name, company)")
        .eq("source", source)
        .order("created_at", { ascending: false });
      if (error) throw error;
      let rows = (data ?? []) as unknown as Inquiry[];

      // For Sales tab: hide inquiries from customers who already have an order (they're customers now, not leads)
      if (source === "sales") {
        const { data: orderRows } = await supabase
          .from("orders")
          .select("customer_id")
          .not("customer_id", "is", null);
        const customerIdsWithOrders = new Set(
          (orderRows ?? []).map((o: { customer_id: string | null }) => o.customer_id).filter(Boolean) as string[]
        );
        rows = rows.filter((inq) => !inq.customers?.id || !customerIdsWithOrders.has(inq.customers.id));
      }

      return rows;
    },
  });

  const subjectLabel = source === "support" ? "Subject" : "Product";

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>{subjectLabel}</TableHead>
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
                {source === "support" ? "No support messages yet" : "No sales inquiries yet"}
              </TableCell>
            </TableRow>
          ) : (
            inquiries.map((inq) => (
              <TableRow
                key={inq.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/admin/inquiries/${inq.id}`)}
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
  );
};

export default InquiriesTable;
