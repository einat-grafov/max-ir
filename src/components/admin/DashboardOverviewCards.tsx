import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, TrendingDown, HelpCircle } from "lucide-react";

const PCT = (curr: number, prev: number) => {
  if (prev === 0) return curr === 0 ? 0 : 100;
  return ((curr - prev) / prev) * 100;
};

const Delta = ({ pct }: { pct: number }) => {
  const positive = pct >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  return (
    <span
      className={`inline-flex items-center gap-1 text-sm font-medium ${
        positive ? "text-emerald-500" : "text-destructive"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {positive ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
};

// Build 24-hour buckets for "yesterday vs today"
function buildHourlyBuckets() {
  const today0 = startOfDay(new Date());
  const yest0 = subDays(today0, 1);
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: h === 0 ? "12am" : h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`,
    todayStart: new Date(today0.getTime() + h * 3600_000),
    todayEnd: new Date(today0.getTime() + (h + 1) * 3600_000),
    yestStart: new Date(yest0.getTime() + h * 3600_000),
    yestEnd: new Date(yest0.getTime() + (h + 1) * 3600_000),
  }));
}

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "10px",
    fontSize: "12px",
    color: "hsl(var(--foreground))",
  },
};

export default function DashboardOverviewCards() {
  const today0 = startOfDay(new Date());
  const yest0 = startOfDay(subDays(new Date(), 1));
  const todayEnd = endOfDay(new Date());
  const yestEnd = endOfDay(subDays(new Date(), 1));
  const since = subDays(new Date(), 2).toISOString();

  // Orders for today/yesterday (Total sales + AOV)
  const { data: orders = [] } = useQuery({
    queryKey: ["dashboard-orders-2d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, created_at, payment_status")
        .gte("created_at", since)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  // Page views by country (last 30 days)
  const since30 = subDays(new Date(), 30).toISOString();
  const { data: views = [] } = useQuery({
    queryKey: ["dashboard-views-30d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("country, session_id, created_at")
        .gte("created_at", since30);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  // Commerce events for funnel (last 30 days)
  const { data: events = [] } = useQuery({
    queryKey: ["dashboard-events-30d"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commerce_events")
        .select("event_type, session_id, created_at")
        .gte("created_at", since30);
      if (error) throw error;
      return data;
    },
    refetchInterval: 60_000,
  });

  /* ───── Total sales ───── */
  const todayOrders = orders.filter(
    (o) => new Date(o.created_at) >= today0 && new Date(o.created_at) <= todayEnd
  );
  const yestOrders = orders.filter(
    (o) => new Date(o.created_at) >= yest0 && new Date(o.created_at) <= yestEnd
  );
  const todaySales = todayOrders.reduce((s, o) => s + Number(o.total), 0);
  const yestSales = yestOrders.reduce((s, o) => s + Number(o.total), 0);
  const salesPct = PCT(todaySales, yestSales);

  const buckets = buildHourlyBuckets();
  const salesSeries = buckets.map((b) => ({
    name: b.label,
    today: orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= b.todayStart && d < b.todayEnd;
      })
      .reduce((s, o) => s + Number(o.total), 0),
    yesterday: orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= b.yestStart && d < b.yestEnd;
      })
      .reduce((s, o) => s + Number(o.total), 0),
  }));

  /* ───── Visits by location ───── */
  const visitsByCountry = (() => {
    const map = new Map<string, number>();
    views.forEach((v) => {
      const c = v.country || "Unknown";
      map.set(c, (map.get(c) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  })();
  const totalVisits = views.length;

  /* ───── Average order value ───── */
  const todayAOV = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;
  const yestAOV = yestOrders.length > 0 ? yestSales / yestOrders.length : 0;
  const aovPct = PCT(todayAOV, yestAOV);

  const aovSeries = buckets.map((b) => {
    const todayBucketOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= b.todayStart && d < b.todayEnd;
    });
    const yestBucketOrders = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= b.yestStart && d < b.yestEnd;
    });
    return {
      name: b.label,
      today:
        todayBucketOrders.length > 0
          ? todayBucketOrders.reduce((s, o) => s + Number(o.total), 0) /
            todayBucketOrders.length
          : 0,
      yesterday:
        yestBucketOrders.length > 0
          ? yestBucketOrders.reduce((s, o) => s + Number(o.total), 0) /
            yestBucketOrders.length
          : 0,
    };
  });

  /* ───── Conversion funnel ───── */
  const sessionsAdded = new Set(
    events.filter((e) => e.event_type === "add_to_cart").map((e) => e.session_id)
  );
  const sessionsCheckout = new Set(
    events.filter((e) => e.event_type === "reached_checkout").map((e) => e.session_id)
  );
  const sessionsPurchased = new Set(
    events.filter((e) => e.event_type === "purchased").map((e) => e.session_id)
  );
  const totalSessions = new Set(views.map((v) => v.session_id).filter(Boolean)).size;

  const pct = (n: number) =>
    totalSessions > 0 ? ((n / totalSessions) * 100).toFixed(2) : "0.00";

  const conversionRate =
    totalSessions > 0 ? (sessionsPurchased.size / totalSessions) * 100 : 0;

  const fmtMoney = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="mb-8">
      <h2 className="text-foreground font-semibold mb-4">Today's overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total sales */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Total sales</h3>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Delta pct={salesPct} />
          </div>
          <p className="text-3xl font-bold text-foreground mb-4">{fmtMoney(todaySales)}</p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-2">
            Sales over time
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval={5}
                />
                <YAxis hide />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: number) => fmtMoney(v)}
                />
                <Area
                  type="monotone"
                  dataKey="yesterday"
                  stroke="hsl(var(--muted-foreground))"
                  fill="hsl(var(--muted-foreground))"
                  fillOpacity={0.1}
                  strokeWidth={1.5}
                />
                <Area
                  type="monotone"
                  dataKey="today"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 justify-center mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-muted-foreground/40" />
              Yesterday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
              Today
            </span>
          </div>
        </Card>

        {/* Visits by location */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Online store visits by location
            </h3>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          {visitsByCountry.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No visits recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {visitsByCountry.map(([country, count]) => {
                const share = totalVisits > 0 ? (count / totalVisits) * 100 : 0;
                return (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{country}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {count.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums w-14 text-right">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Conversion rate */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">
                Online store conversion rate
              </h3>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs text-muted-foreground">Last 30 days</span>
          </div>
          <p className="text-3xl font-bold text-foreground mb-4">
            {conversionRate.toFixed(2)}%
          </p>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-3">
            Conversion funnel
          </p>
          <div className="space-y-3">
            <FunnelRow
              label="Added to cart"
              sessions={sessionsAdded.size}
              percent={pct(sessionsAdded.size)}
            />
            <FunnelRow
              label="Reached checkout"
              sessions={sessionsCheckout.size}
              percent={pct(sessionsCheckout.size)}
            />
            <FunnelRow
              label="Purchased"
              orders={sessionsPurchased.size}
              percent={pct(sessionsPurchased.size)}
            />
          </div>
        </Card>

        {/* Average order value */}
        <Card className="p-6">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-semibold text-foreground">Average order value</h3>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <Delta pct={aovPct} />
          </div>
          <p className="text-3xl font-bold text-foreground mb-4">{fmtMoney(todayAOV)}</p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={aovSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  interval={5}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(v) => `$${v}`}
                  width={36}
                />
                <Tooltip {...tooltipStyle} formatter={(v: number) => fmtMoney(v)} />
                <Line
                  type="monotone"
                  dataKey="yesterday"
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="today"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-4 justify-center mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-muted-foreground/40" />
              Yesterday
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 rounded-sm bg-primary" />
              Today
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  sessions,
  orders,
  percent,
}: {
  label: string;
  sessions?: number;
  orders?: number;
  percent: string;
}) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">
          {sessions !== undefined
            ? `${sessions.toLocaleString()} session${sessions === 1 ? "" : "s"}`
            : `${orders?.toLocaleString() ?? 0} order${orders === 1 ? "" : "s"}`}
        </p>
      </div>
      <span className="text-sm font-semibold text-foreground tabular-nums">{percent}%</span>
    </div>
  );
}
