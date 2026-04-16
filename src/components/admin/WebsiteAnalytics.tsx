import { useState, useMemo } from "react";
import { Clock, Eye, Users, MousePointerClick, Timer, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ─── Static analytics snapshot from Lovable (2026-04-16) ─── */
const ANALYTICS_UPDATED = "2026-04-16";

const DAILY_DATA = [
  { date: "Mar 17", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 18", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 19", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 20", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 21", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 22", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 23", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 24", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 25", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 26", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 27", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 28", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 29", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 30", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 31", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 1", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 2", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 3", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 4", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 5", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 6", visitors: 1, pageviews: 2, bounceRate: 0, duration: 172 },
  { date: "Apr 7", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 8", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 9", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 10", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 11", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 12", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 13", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 14", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 15", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 16", visitors: 0, pageviews: 0, bounceRate: 0, duration: 0 },
];

const TOP_PAGES = [
  { path: "/unsubscribe", visitors: 1 },
];

const SOURCES = [
  { name: "Direct", visitors: 1, pct: 100 },
];

const COUNTRIES = [
  { name: "Israel", code: "IL", visitors: 1 },
];

const DEVICES = [
  { name: "Desktop", visitors: 1, pct: 100 },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

function TrendBadge({ current, previous, inverse = false }: { current: number; previous: number; inverse?: boolean }) {
  if (previous === 0 && current === 0) return <span className="text-xs text-muted-foreground">—</span>;
  if (previous === 0) return <span className="text-xs text-emerald-600 flex items-center gap-0.5"><TrendingUp className="h-3 w-3" /> New</span>;
  const pct = Math.round(((current - previous) / previous) * 100);
  const isPositive = inverse ? pct < 0 : pct > 0;
  if (pct === 0) return <span className="text-xs text-muted-foreground flex items-center gap-0.5"><Minus className="h-3 w-3" /> 0%</span>;
  return (
    <span className={`text-xs flex items-center gap-0.5 ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
      {pct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {pct > 0 ? "+" : ""}{pct}%
    </span>
  );
}

export default function WebsiteAnalytics() {
  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [chartMetric, setChartMetric] = useState<"visitors" | "pageviews">("visitors");

  const filteredDaily = useMemo(() => DAILY_DATA.slice(-dateRange), [dateRange]);

  const kpis = useMemo(() => {
    const current = filteredDaily;
    const previous = DAILY_DATA.slice(-dateRange * 2, -dateRange);
    const sum = (arr: typeof DAILY_DATA, key: keyof typeof DAILY_DATA[0]) =>
      arr.reduce((a, b) => a + (b[key] as number), 0);
    const avg = (arr: typeof DAILY_DATA, key: keyof typeof DAILY_DATA[0]) => {
      const valid = arr.filter((d) => (d[key] as number) > 0);
      return valid.length ? sum(valid, key) / valid.length : 0;
    };

    return {
      visitors: { current: sum(current, "visitors"), previous: sum(previous, "visitors") },
      pageviews: { current: sum(current, "pageviews"), previous: sum(previous, "pageviews") },
      viewsPerVisit: {
        current: sum(current, "visitors") > 0 ? +(sum(current, "pageviews") / sum(current, "visitors")).toFixed(2) : 0,
        previous: sum(previous, "visitors") > 0 ? +(sum(previous, "pageviews") / sum(previous, "visitors")).toFixed(2) : 0,
      },
      duration: { current: Math.round(avg(current, "duration")), previous: Math.round(avg(previous, "duration")) },
      bounceRate: { current: Math.round(avg(current, "bounceRate")), previous: Math.round(avg(previous, "bounceRate")) },
    };
  }, [filteredDaily]);

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "10px",
      fontSize: "12px",
      color: "hsl(var(--foreground))",
    },
  };

  const kpiCards = [
    { label: "Visitors", value: kpis.visitors.current, prev: kpis.visitors.previous, fmt: String, metric: "visitors" as const, icon: Users },
    { label: "Pageviews", value: kpis.pageviews.current, prev: kpis.pageviews.previous, fmt: String, metric: "pageviews" as const, icon: Eye },
    { label: "Views / Visit", value: kpis.viewsPerVisit.current, prev: kpis.viewsPerVisit.previous, fmt: (v: number) => v.toFixed(2), icon: MousePointerClick },
    { label: "Avg. Duration", value: kpis.duration.current, prev: kpis.duration.previous, fmt: formatDuration, icon: Timer },
    { label: "Bounce Rate", value: kpis.bounceRate.current, prev: kpis.bounceRate.previous, fmt: (v: number) => `${v}%`, inverse: true, icon: TrendingDown },
  ];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-foreground font-semibold">Website Analytics</h2>
        <div className="flex items-center gap-3">
          {/* Date range toggle */}
          <div className="flex items-center rounded-lg border border-border overflow-hidden">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors ${
                  dateRange === d
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Updated {ANALYTICS_UPDATED}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {kpiCards.map((c) => (
          <button
            key={c.label}
            onClick={"metric" in c && c.metric ? () => setChartMetric(c.metric!) : undefined}
            className={`rounded-xl border p-3 text-left transition-colors ${
              "metric" in c && chartMetric === c.metric
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-muted-foreground/30"
            }`}
          >
            <p className="text-xs text-primary font-medium mb-1">{c.label}</p>
            <p className="text-xl font-bold text-foreground">{c.fmt(c.value)}</p>
            <div className="mt-1">
              <TrendBadge current={c.value} previous={c.prev} inverse={"inverse" in c && c.inverse} />
            </div>
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex items-center gap-3 mb-3">
        {(["visitors", "pageviews"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setChartMetric(m)}
            className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
              chartMetric === m ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m === "visitors" ? "Visitors" : "Pageviews"}
          </button>
        ))}
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredDaily}>
            <defs>
              <linearGradient id="webAnalyticsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip {...chartTooltipStyle} />
            <Area
              type="monotone"
              dataKey={chartMetric}
              stroke="hsl(var(--primary))"
              fill="url(#webAnalyticsGradient)"
              strokeWidth={2}
              dot={{ r: 3, fill: "hsl(var(--primary))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 pt-4 border-t border-border">
        {/* Top Pages */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Top Pages</p>
          {TOP_PAGES.map((p) => (
            <div key={p.path} className="flex items-center justify-between text-sm py-1">
              <span className="text-foreground truncate">{p.path}</span>
              <span className="text-muted-foreground text-xs">{p.visitors}</span>
            </div>
          ))}
          {TOP_PAGES.length === 0 && <p className="text-xs text-muted-foreground">No data yet</p>}
        </div>

        {/* Sources */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Sources</p>
          {SOURCES.map((s) => (
            <div key={s.name} className="flex items-center justify-between text-sm py-1">
              <span className="text-foreground">{s.name}</span>
              <span className="text-muted-foreground text-xs">{s.visitors} ({s.pct}%)</span>
            </div>
          ))}
        </div>

        {/* Countries & Devices */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Countries</p>
          {COUNTRIES.map((c) => (
            <div key={c.code} className="flex items-center justify-between text-sm py-1">
              <span className="text-foreground">{c.name}</span>
              <span className="text-muted-foreground text-xs">{c.visitors}</span>
            </div>
          ))}
          <p className="text-xs font-medium text-muted-foreground mb-2 mt-3">Devices</p>
          {DEVICES.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-sm py-1">
              <span className="text-foreground">{d.name}</span>
              <span className="text-muted-foreground text-xs">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
