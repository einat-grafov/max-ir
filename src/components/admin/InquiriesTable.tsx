import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MailOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { SortableHeader, SortState } from "./SortableHeader";

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

const statusStyles: Record<string, string> = {
  // Sales
  "New": "bg-blue-100 text-blue-800 border-blue-200",
  "Outreach": "bg-purple-100 text-purple-800 border-purple-200",
  "Connected": "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Qualified": "bg-teal-100 text-teal-800 border-teal-200",
  "Unqualified": "bg-orange-100 text-orange-800 border-orange-200",
  "Active buying process": "bg-amber-100 text-amber-800 border-amber-200",
  "Closed Won": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Closed Lost": "bg-red-100 text-red-700 border-red-200",
  // Support
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  "Resolved": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Closed": "bg-slate-100 text-slate-700 border-slate-200",
};

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

  // Fetch latest status per inquiry from inquiry_notes
  const inquiryIds = (inquiries || []).map((i) => i.id);
  const { data: statusMap = {} } = useQuery({
    queryKey: ["admin-inquiry-statuses", inquiryIds.join(",")],
    enabled: inquiryIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiry_notes")
        .select("inquiry_id, lead_status, created_at")
        .in("inquiry_id", inquiryIds)
        .not("lead_status", "is", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const map: Record<string, string> = {};
      for (const note of data || []) {
        const nid = (note as { inquiry_id: string }).inquiry_id;
        if (!map[nid] && (note as { lead_status: string | null }).lead_status) {
          map[nid] = (note as { lead_status: string }).lead_status;
        }
      }
      return map;
    },
  });

  const SALES_ORDER = ["New", "Outreach", "Connected", "Qualified", "Active buying process", "Unqualified", "Closed Won", "Closed Lost"];
  const SUPPORT_ORDER = ["New", "In Progress", "Resolved", "Closed"];
  const statusOrder = source === "support" ? SUPPORT_ORDER : SALES_ORDER;
  const sortedInquiries = [...(inquiries || [])].sort((a, b) => {
    const sa = (statusMap as Record<string, string>)[a.id] || "New";
    const sb = (statusMap as Record<string, string>)[b.id] || "New";
    const ia = statusOrder.indexOf(sa); const ib = statusOrder.indexOf(sb);
    const ra = ia === -1 ? 999 : ia; const rb = ib === -1 ? 999 : ib;
    if (ra !== rb) return ra - rb;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const subjectLabel = source === "support" ? "Subject" : "Product";

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Customer</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">{subjectLabel}</TableHead>
            <TableHead className="hidden xl:table-cell">Message</TableHead>
            <TableHead className="hidden md:table-cell">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                Loading…
              </TableCell>
            </TableRow>
          ) : !inquiries?.length ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                {source === "support" ? "No support messages yet" : "No sales inquiries yet"}
              </TableCell>
            </TableRow>
          ) : (
            sortedInquiries.map((inq) => {
              const status = (statusMap as Record<string, string>)[inq.id] || "New";
              return (
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
                  <TableCell>
                    <Badge variant="outline" className={cn("font-medium", statusStyles[status])}>
                      {status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden lg:table-cell">
                    {inq.customers ? (
                      <Link
                        to={`/admin/customers/${inq.customers.id}`}
                        className="text-blue-600 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {inq.customers.company ||
                          `${inq.customers.first_name} ${inq.customers.last_name || ""}`.trim()}
                      </Link>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{inq.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <Badge variant="secondary" className="text-xs">
                      {inq.product_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[300px] truncate hidden xl:table-cell">
                    {inq.message}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm whitespace-nowrap hidden md:table-cell">
                    {format(new Date(inq.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InquiriesTable;
