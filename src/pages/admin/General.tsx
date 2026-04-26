import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow, format, subDays, startOfDay } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Download,
  ArrowRight,
  TrendingDown,
  Minus,
  Home,
} from "lucide-react";

const PROJECT_ID = "0b82eace-8a14-48d4-a50c-315652155103";

type ActivityRow = { date: Date; event: React.ReactNode; user: string };

/* ─────────────────────────── Header data hook ─────────────────────────── */

const useLastUpdated = () =>
  useQuery({
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

/* ─────────────────────────── Site Activity Tab ─────────────────────────── */

const SiteActivityTab = () => {
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

  return (
    <section>
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
  );
};

/* ─────────────────────────── Dashboard Tab ─────────────────────────── */

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const trendInfo = (current: number, previous: number) => {
  if (previous === 0 && current === 0) return { pct: 0, dir: "flat" as const };
  if (previous === 0) return { pct: 100, dir: "up" as const };
  const pct = ((current - previous) / previous) * 100;
  return { pct: Math.abs(pct), dir: pct > 0.5 ? "up" : pct < -0.5 ? "down" : "flat" } as const;
};

const KpiCard = ({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  trend: { pct: number; dir: "up" | "down" | "flat" };
}) => {
  const TrendIcon = trend.dir === "up" ? TrendingUp : trend.dir === "down" ? TrendingDown : Minus;
  const trendColor =
    trend.dir === "up" ? "text-emerald-600" : trend.dir === "down" ? "text-red-600" : "text-muted-foreground";
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
          <div className="text-2xl font-semibold text-foreground mt-2">{value}</div>
        </div>
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className={`flex items-center gap-1 mt-3 text-xs ${trendColor}`}>
        <TrendIcon className="h-3.5 w-3.5" />
        <span className="font-medium">{trend.pct.toFixed(1)}%</span>
        <span className="text-muted-foreground">vs previous 30 days</span>
      </div>
    </Card>
  );
};

const downloadCsv = (filename: string, rows: Record<string, any>[]) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const DashboardTab = () => {
  const now = new Date();
  const start30 = startOfDay(subDays(now, 30));
  const start60 = startOfDay(subDays(now, 60));

  const { data: kpis } = useQuery({
    queryKey: ["general-dashboard-kpis"],
    queryFn: async () => {
      const [ordersRecent, ordersPrev, customersRecent, customersPrev] = await Promise.all([
        supabase
          .from("orders")
          .select("id, total, created_at")
          .gte("created_at", start30.toISOString()),
        supabase
          .from("orders")
          .select("id, total, created_at")
          .gte("created_at", start60.toISOString())
          .lt("created_at", start30.toISOString()),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .gte("created_at", start30.toISOString()),
        supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .gte("created_at", start60.toISOString())
          .lt("created_at", start30.toISOString()),
      ]);

      const sum = (rows: any[] | null) => (rows || []).reduce((a, r) => a + Number(r.total || 0), 0);
      const recentRevenue = sum(ordersRecent.data);
      const prevRevenue = sum(ordersPrev.data);
      const recentOrders = ordersRecent.data?.length ?? 0;
      const prevOrders = ordersPrev.data?.length ?? 0;
      const recentAov = recentOrders ? recentRevenue / recentOrders : 0;
      const prevAov = prevOrders ? prevRevenue / prevOrders : 0;

      return {
        revenue: { current: recentRevenue, previous: prevRevenue },
        orders: { current: recentOrders, previous: prevOrders },
        customers: { current: customersRecent.count ?? 0, previous: customersPrev.count ?? 0 },
        aov: { current: recentAov, previous: prevAov },
      };
    },
  });

  const { data: dailySeries = [] } = useQuery({
    queryKey: ["general-dashboard-daily-series"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("total, created_at")
        .gte("created_at", start30.toISOString())
        .order("created_at", { ascending: true });

      const buckets = new Map<string, { revenue: number; orders: number }>();
      for (let i = 29; i >= 0; i--) {
        const d = format(subDays(now, i), "yyyy-MM-dd");
        buckets.set(d, { revenue: 0, orders: 0 });
      }
      (data || []).forEach((o: any) => {
        const k = format(new Date(o.created_at), "yyyy-MM-dd");
        const b = buckets.get(k);
        if (b) {
          b.revenue += Number(o.total || 0);
          b.orders += 1;
        }
      });
      return Array.from(buckets.entries()).map(([date, v]) => ({
        date,
        label: format(new Date(date), "MMM d"),
        revenue: Math.round(v.revenue * 100) / 100,
        orders: v.orders,
      }));
    },
  });

  const { data: recentInquiries = [] } = useQuery({
    queryKey: ["general-dashboard-inquiries"],
    queryFn: async () => {
      const { data } = await supabase
        .from("inquiries")
        .select("id, name, company_name, email, product_name, created_at, read")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  const exportOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("order_number, customer_name, customer_email, status, payment_status, fulfillment_status, subtotal, tax, shipping_cost, total, created_at")
      .order("created_at", { ascending: false });
    downloadCsv(`orders-${format(now, "yyyy-MM-dd")}.csv`, data || []);
  };

  const exportCustomers = async () => {
    const { data } = await supabase
      .from("customers")
      .select("first_name, last_name, company, email, phone, country, state, city, status, accepts_marketing, created_at")
      .order("created_at", { ascending: false });
    downloadCsv(`customers-${format(now, "yyyy-MM-dd")}.csv`, data || []);
  };

  const exportInquiries = async () => {
    const { data } = await supabase
      .from("inquiries")
      .select("name, company_name, email, phone, country, state, product_name, message, read, created_at")
      .order("created_at", { ascending: false });
    downloadCsv(`inquiries-${format(now, "yyyy-MM-dd")}.csv`, data || []);
  };

  const cards = useMemo(() => {
    if (!kpis) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Revenue (30d)"
          value={formatCurrency(kpis.revenue.current)}
          icon={DollarSign}
          trend={trendInfo(kpis.revenue.current, kpis.revenue.previous)}
        />
        <KpiCard
          label="Orders (30d)"
          value={String(kpis.orders.current)}
          icon={ShoppingCart}
          trend={trendInfo(kpis.orders.current, kpis.orders.previous)}
        />
        <KpiCard
          label="New customers (30d)"
          value={String(kpis.customers.current)}
          icon={Users}
          trend={trendInfo(kpis.customers.current, kpis.customers.previous)}
        />
        <KpiCard
          label="Avg. order value"
          value={formatCurrency(kpis.aov.current)}
          icon={TrendingUp}
          trend={trendInfo(kpis.aov.current, kpis.aov.previous)}
        />
      </div>
    );
  }, [kpis]);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Key metrics</h2>
        {cards ?? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5 h-[112px] animate-pulse bg-muted/30" />
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue</h3>
              <p className="text-xs text-muted-foreground">Daily revenue, last 30 days</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </div>
          <ChartContainer
            config={{ revenue: { label: "Revenue", color: "hsl(var(--primary))" } }}
            className="h-[240px] w-full aspect-auto"
          >
            <AreaChart data={dailySeries} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={Math.ceil(dailySeries.length / 6)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => (
                      <span className="font-mono font-medium tabular-nums text-foreground">
                        {formatCurrency(Number(value))}
                      </span>
                    )}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueFill)"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-foreground">Orders</h3>
              <p className="text-xs text-muted-foreground">Daily orders, last 30 days</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </div>
          <ChartContainer
            config={{ orders: { label: "Orders", color: "hsl(var(--primary))" } }}
            className="h-[240px] w-full aspect-auto"
          >
            <BarChart data={dailySeries} margin={{ left: 4, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={Math.ceil(dailySeries.length / 6)}
              />
              <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent inquiries</h2>
          <Button asChild variant="ghost" size="sm" className="text-primary">
            <Link to="/admin/inquiries">
              View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Link>
          </Button>
        </div>
        <div className="rounded-xl border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground">Date</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground">Contact</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground">Company</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground">Product</th>
                <th className="bg-muted/50 px-4 py-3 text-left font-medium text-foreground w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No inquiries yet.
                  </td>
                </tr>
              ) : (
                recentInquiries.map((row: any, i: number) => (
                  <tr key={row.id} className={i !== recentInquiries.length - 1 ? "border-b" : ""}>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap align-top">
                      {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      <div className="font-medium">{row.name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{row.email}</div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{row.company_name || "—"}</td>
                    <td className="px-4 py-3 text-foreground">{row.product_name}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          row.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {row.read ? "Read" : "New"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold text-foreground mb-3">Exports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" onClick={exportOrders} className="justify-start h-auto py-3">
            <Download className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Orders CSV</div>
              <div className="text-xs text-muted-foreground font-normal">All orders, all time</div>
            </div>
          </Button>
          <Button variant="outline" onClick={exportCustomers} className="justify-start h-auto py-3">
            <Download className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Customers CSV</div>
              <div className="text-xs text-muted-foreground font-normal">All customer records</div>
            </div>
          </Button>
          <Button variant="outline" onClick={exportInquiries} className="justify-start h-auto py-3">
            <Download className="h-4 w-4 mr-2" />
            <div className="text-left">
              <div className="font-medium">Inquiries CSV</div>
              <div className="text-xs text-muted-foreground font-normal">All product inquiries</div>
            </div>
          </Button>
        </div>
      </section>
    </div>
  );
};

/* ─────────────────────────── Page ─────────────────────────── */

const General = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Home className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">General</h1>
            <p className="text-sm text-muted-foreground mt-1">
              A high-level snapshot of your project — content, activity, and recent events.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <OverviewTab />
        </TabsContent>
        <TabsContent value="dashboard" className="mt-6">
          <DashboardTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default General;
