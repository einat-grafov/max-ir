import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = "0b82eace-8a14-48d4-a50c-315652155103";

type ActivityRow = { date: Date; event: React.ReactNode; user: string };

const General = () => {
  // Counts for overview
  const { data: counts } = useQuery({
    queryKey: ["general-overview-counts"],
    queryFn: async () => {
      const [products, customers, orders, inquiries, careers, sections] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("career_applications").select("id", { count: "exact", head: true }),
        supabase.from("website_content").select("page", { count: "exact" }),
      ]);
      const uniquePages = new Set((sections.data || []).map((s: any) => s.page)).size;
      return {
        products: products.count ?? 0,
        customers: customers.count ?? 0,
        orders: orders.count ?? 0,
        inquiries: inquiries.count ?? 0,
        careers: careers.count ?? 0,
        pages: uniquePages,
      };
    },
  });

  // Last update timestamp across content tables
  const { data: lastUpdated } = useQuery({
    queryKey: ["general-last-updated"],
    queryFn: async () => {
      const tables = ["website_content", "products", "seo_settings"] as const;
      const results = await Promise.all(
        tables.map((t) =>
          supabase.from(t).select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
        ),
      );
      const dates = results.map((r) => r.data?.updated_at).filter(Boolean) as string[];
      if (!dates.length) return null;
      return new Date(dates.sort().reverse()[0]);
    },
  });

  // Recent activity (mix of orders, inquiries, career applications, customers)
  const { data: activity = [] } = useQuery<ActivityRow[]>({
    queryKey: ["general-activity"],
    queryFn: async () => {
      const [orders, inquiries, careers, customers] = await Promise.all([
        supabase.from("orders").select("order_number, customer_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("inquiries").select("name, company_name, product_name, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("career_applications").select("full_name, position, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("customers").select("first_name, last_name, company, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      const rows: ActivityRow[] = [];
      (orders.data || []).forEach((o: any) =>
        rows.push({ date: new Date(o.created_at), event: <>New order <span className="font-medium">#{o.order_number}</span></>, user: o.customer_name || "—" }),
      );
      (inquiries.data || []).forEach((i: any) =>
        rows.push({ date: new Date(i.created_at), event: <>Product inquiry: <span className="font-medium">{i.product_name}</span></>, user: i.company_name || i.name || "—" }),
      );
      (careers.data || []).forEach((c: any) =>
        rows.push({ date: new Date(c.created_at), event: <>Career application{c.position ? <> — <span className="font-medium">{c.position}</span></> : null}</>, user: c.full_name || "—" }),
      );
      (customers.data || []).forEach((c: any) =>
        rows.push({ date: new Date(c.created_at), event: <>New customer added</>, user: c.company || [c.first_name, c.last_name].filter(Boolean).join(" ") || "—" }),
      );
      return rows.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10);
    },
  });

  const overviewRows: { label: string; value: React.ReactNode }[] = [
    { label: "Project ID", value: <span className="font-mono text-xs">{PROJECT_ID}</span> },
    { label: "Pages", value: counts?.pages ?? "—" },
    { label: "Products", value: counts?.products ?? "—" },
    { label: "Customers", value: counts?.customers ?? "—" },
    { label: "Orders", value: counts?.orders ?? "—" },
    { label: "Inquiries", value: counts?.inquiries ?? "—" },
    { label: "Career applications", value: counts?.careers ?? "—" },
    {
      label: "Last updated",
      value: lastUpdated
        ? `${formatDistanceToNow(lastUpdated, { addSuffix: true })}, on ${format(lastUpdated, "MMMM do yyyy, h:mm:ss a")}`
        : "—",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">General</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A high-level snapshot of your project — content, activity, and recent events.
        </p>
      </div>

      {/* Overview */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Overview</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {overviewRows.map((row, i) => (
                <tr key={row.label} className={i !== overviewRows.length - 1 ? "border-b" : ""}>
                  <td className="bg-muted/50 px-4 py-3 font-medium text-foreground w-1/3 align-top">
                    {row.label}
                  </td>
                  <td className="px-4 py-3 text-foreground break-all">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Site activity */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Site activity</h2>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground w-44">Date</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground">Event</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground w-1/3">User</th>
              </tr>
            </thead>
            <tbody>
              {activity.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No recent activity yet.
                  </td>
                </tr>
              ) : (
                activity.map((row, i) => (
                  <tr key={i} className={i !== activity.length - 1 ? "border-b" : ""}>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap align-top">
                      {formatDistanceToNow(row.date, { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.event}</td>
                    <td className="px-4 py-3 text-foreground">{row.user}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default General;
