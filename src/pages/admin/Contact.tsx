import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, MessageSquare, LifeBuoy, Briefcase } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import NotificationEmailCard from "@/components/admin/NotificationEmailCard";
import InquiriesTable from "@/components/admin/InquiriesTable";
import CareerApplicationsTable from "@/components/admin/CareerApplicationsTable";

type TabKey = "sales" | "support" | "careers";

const Contact = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get("tab") as TabKey) || "sales";
  const activeTab: TabKey = ["sales", "support", "careers"].includes(tabParam) ? tabParam : "sales";

  const { data: counts } = useQuery({
    queryKey: ["contact-unread-counts"],
    queryFn: async () => {
      const [salesRows, support, careers, orderRows] = await Promise.all([
        supabase.from("inquiries").select("id, customer_id").eq("read", false).eq("source", "sales"),
        supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("read", false).eq("source", "support"),
        supabase.from("career_applications").select("id", { count: "exact", head: true }).eq("read", false),
        supabase.from("orders").select("customer_id").not("customer_id", "is", null),
      ]);
      const customersWithOrders = new Set(
        (orderRows.data ?? []).map((o: { customer_id: string | null }) => o.customer_id).filter(Boolean) as string[]
      );
      const salesUnread = (salesRows.data ?? []).filter(
        (i: { customer_id: string | null }) => !(i.customer_id && customersWithOrders.has(i.customer_id))
      ).length;
      return {
        sales: salesUnread,
        support: support.count ?? 0,
        careers: careers.count ?? 0,
      };
    },
  });

  const totalUnread = (counts?.sales ?? 0) + (counts?.support ?? 0) + (counts?.careers ?? 0);

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Inbox className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Contact</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="sales" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Sales
            {(counts?.sales ?? 0) > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {counts!.sales > 99 ? "99+" : counts!.sales}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <LifeBuoy className="h-4 w-4" />
            Support
            {(counts?.support ?? 0) > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {counts!.support > 99 ? "99+" : counts!.support}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="careers" className="gap-2">
            <Briefcase className="h-4 w-4" />
            Careers
            {(counts?.careers ?? 0) > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {counts!.careers > 99 ? "99+" : counts!.careers}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <NotificationEmailCard
            column="inquiries_notification_email"
            title="Inquiry notification email"
            description="A copy of every product inquiry submission will also be sent to this address."
          />
          <InquiriesTable source="sales" />
        </TabsContent>

        <TabsContent value="support">
          <NotificationEmailCard
            column="inquiries_notification_email"
            title="Inquiry notification email"
            description="A copy of every contact form submission will also be sent to this address."
          />
          <InquiriesTable source="support" />
        </TabsContent>

        <TabsContent value="careers">
          <NotificationEmailCard
            column="careers_notification_email"
            title="Career application notification email"
            description="A copy of every job application submitted on the public careers page will also be sent to this address."
          />
          <CareerApplicationsTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Contact;
