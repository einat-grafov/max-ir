import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Zap,
  ContactRound,
  Download,
  ArrowRight,
  Users,
  Eye,
  Newspaper,
  FileText,
} from "lucide-react";

/* ─── Static analytics snapshot from Lovable (2026-04-20) ─── */
const ANALYTICS_UPDATED = "2026-04-20";

const DAILY_DATA = [
  { date: "Mar 22", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 23", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 24", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 25", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 26", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 27", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 28", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 29", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 30", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Mar 31", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 1", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 2", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 3", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 4", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 5", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 6", visitors: 1, pageviews: 2, sessions: 1, bounceRate: 0, duration: 172 },
  { date: "Apr 7", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 8", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 9", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 10", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 11", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 12", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 13", visitors: 23, pageviews: 74, sessions: 23, bounceRate: 48, duration: 115 },
  { date: "Apr 14", visitors: 25, pageviews: 120, sessions: 25, bounceRate: 40, duration: 169 },
  { date: "Apr 15", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 16", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 17", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 18", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 19", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
  { date: "Apr 20", visitors: 0, pageviews: 0, sessions: 0, bounceRate: 0, duration: 0 },
];

type PageData = {
  path: string;
  visitors: number;
  avgTime: number;
  bounceRate: number;
  group: string;
};

const TOP_PAGES: PageData[] = [
  { path: "/", visitors: 38, avgTime: 42, bounceRate: 38, group: "Main" },
  { path: "/resources", visitors: 12, avgTime: 68, bounceRate: 32, group: "Science" },
  { path: "/company", visitors: 8, avgTime: 55, bounceRate: 45, group: "Company" },
  { path: "/careers", visitors: 7, avgTime: 35, bounceRate: 52, group: "Careers" },
  { path: "/pipeline", visitors: 7, avgTime: 72, bounceRate: 28, group: "Science" },
  { path: "/platform", visitors: 6, avgTime: 85, bounceRate: 22, group: "Science" },
  { path: "/admin", visitors: 1, avgTime: 5, bounceRate: 100, group: "Other" },
  { path: "/admin/login", visitors: 1, avgTime: 12, bounceRate: 100, group: "Other" },
];

const SOURCES = [
  { name: "Direct", visitors: 47, pct: 97.9 },
  { name: "google.com", visitors: 2, pct: 2.1 },
];

const COUNTRIES = [
  { name: "United States", code: "US", visitors: 24 },
  { name: "Israel", code: "IL", visitors: 10 },
  { name: "Unknown", code: "??", visitors: 5 },
  { name: "China", code: "CN", visitors: 2 },
  { name: "Germany", code: "DE", visitors: 2 },
  { name: "Spain", code: "ES", visitors: 2 },
  { name: "Lithuania", code: "LT", visitors: 2 },
  { name: "South Korea", code: "KR", visitors: 1 },
];

const DEVICES = [
  { name: "Desktop", visitors: 34, pct: 70.8 },
  { name: "Mobile", visitors: 14, pct: 29.2 },
];

const PAGE_GROUPS = ["All", "Science", "Company", "Careers", "Main", "Other"] as const;

const CHART_PRIMARY = "hsl(var(--primary))";
const CHART_ACCENT = "hsl(var(--accent))";
const CHART_MUTED = "hsl(var(--muted-foreground) / 0.3)";

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

type SortKey = "visitors" | "avgTime" | "bounceRate";
type SortDir = "asc" | "desc";

interface RecentLead {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  type: "inquiry" | "career";
}

export default function WebsiteAnalytics() {
  const [counts, setCounts] = useState({
    inquiries: 0,
    careers: 0,
    products: 0,
    contentSections: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);

  const [dateRange, setDateRange] = useState<7 | 30 | 90>(30);
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [countryFilter, setCountryFilter] = useState<string>("All");

  const [chartMetric, setChartMetric] = useState<"visitors" | "pageviews" | "sessions">("visitors");

  const [pageSortKey, setPageSortKey] = useState<SortKey>("visitors");
  const [pageSortDir, setPageSortDir] = useState<SortDir>("desc");
  const [pageGroupFilter, setPageGroupFilter] = useState<string>("All");

  const [activeSource, setActiveSource] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [inqCountRes, careerCountRes, productsRes, contentRes, recentInqRes, recentCareerRes] = await Promise.all([
        supabase.from("inquiries").select("id", { count: "exact", head: true }),
        supabase.from("career_applications").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("website_content").select("id", { count: "exact", head: true }),
        supabase.from("inquiries").select("id, name, email, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("career_applications").select("id, full_name, email, created_at").order("created_at", { ascending: false }).limit(5),
      ]);

      setCounts({
        inquiries: inqCountRes.count ?? 0,
        careers: careerCountRes.count ?? 0,
        products: productsRes.count ?? 0,
        contentSections: contentRes.count ?? 0,
      });

      const merged: RecentLead[] = [
        ...(recentInqRes.data ?? []).map((l: any) => ({
          id: l.id,
          full_name: l.name,
          email: l.email,
          created_at: l.created_at,
          type: "inquiry" as const,
        })),
        ...(recentCareerRes.data ?? []).map((l: any) => ({
          id: l.id,
          full_name: l.full_name,
          email: l.email,
          created_at: l.created_at,
          type: "career" as const,
        })),
      ]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 8);

      setRecentLeads(merged);
    };
    fetchData();
  }, []);

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
  }, [filteredDaily, dateRange]);

  const sortedPages = useMemo(() => {
    let pages = [...TOP_PAGES];
    if (pageGroupFilter !== "All") pages = pages.filter((p) => p.group === pageGroupFilter);
    pages.sort((a, b) => {
      const aVal = a[pageSortKey];
      const bVal = b[pageSortKey];
      return pageSortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    return pages;
  }, [pageSortKey, pageSortDir, pageGroupFilter]);

  const totalVisitors = kpis.visitors.current;
  const totalLeads = counts.inquiries + counts.careers;
  const keyPageVisitors = TOP_PAGES.filter((p) => ["/platform", "/pipeline", "/resources"].includes(p.path))
    .reduce((a, b) => a + b.visitors, 0);

  const funnelData = [
    { name: "Visitors", value: totalVisitors, fill: CHART_PRIMARY },
    { name: "Key Pages", value: keyPageVisitors, fill: CHART_ACCENT },
    { name: "Conversions", value: totalLeads, fill: "hsl(var(--primary) / 0.6)" },
  ];

  const insights = useMemo(() => {
    const result: { icon: typeof Lightbulb; text: string; type: "info" | "warning" | "success" }[] = [];

    if (kpis.visitors.current > 0 && kpis.visitors.previous === 0) {
      result.push({ icon: Zap, text: `Site launched with ${kpis.visitors.current} visitors in the first period. Monitor growth trajectory closely.`, type: "success" });
    }

    const bestPage = TOP_PAGES.reduce((a, b) => (a.visitors > b.visitors ? a : b));
    result.push({ icon: TrendingUp, text: `"${bestPage.path}" is your top page with ${bestPage.visitors} visitors. Consider adding CTAs or conversion points.`, type: "info" });

    const highBounce = TOP_PAGES.filter((p) => p.bounceRate > 50 && p.visitors > 3);
    if (highBounce.length > 0) {
      result.push({ icon: TrendingDown, text: `${highBounce.map((p) => p.path).join(", ")} have bounce rates above 50%. Review content engagement.`, type: "warning" });
    }

    const sciencePages = TOP_PAGES.filter((p) => p.group === "Science");
    const avgScienceTime = sciencePages.reduce((a, b) => a + b.avgTime, 0) / sciencePages.length;
    if (avgScienceTime > 60) {
      result.push({ icon: Lightbulb, text: `Science pages average ${Math.round(avgScienceTime)}s time on page — strong engagement. Consider expanding this content.`, type: "success" });
    }

    return result.slice(0, 4);
  }, [kpis]);

  const handlePageSort = (key: SortKey) => {
    if (pageSortKey === key) {
      setPageSortDir(pageSortDir === "desc" ? "asc" : "desc");
    } else {
      setPageSortKey(key);
      setPageSortDir("desc");
    }
  };

  const SortIcon = ({ sortKey }: { sortKey: SortKey }) => {
    if (pageSortKey !== sortKey) return null;
    return pageSortDir === "desc" ? <ChevronDown className="h-3 w-3 inline" /> : <ChevronUp className="h-3 w-3 inline" />;
  };

  const maxSourceVisitors = Math.max(...SOURCES.map((s) => s.visitors));

  const kpiCards = [
    { label: "Visitors", value: kpis.visitors.current, prev: kpis.visitors.previous, fmt: String, clickable: true, metric: "visitors" as const },
    { label: "Pageviews", value: kpis.pageviews.current, prev: kpis.pageviews.previous, fmt: String, clickable: true, metric: "pageviews" as const },
    { label: "Views / Visit", value: kpis.viewsPerVisit.current, prev: kpis.viewsPerVisit.previous, fmt: (v: number) => v.toFixed(2) },
    { label: "Avg. Duration", value: kpis.duration.current, prev: kpis.duration.previous, fmt: formatDuration },
    { label: "Bounce Rate", value: kpis.bounceRate.current, prev: kpis.bounceRate.previous, fmt: (v: number) => `${v}%`, inverse: true },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-foreground font-semibold text-lg">Website Analytics</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Updated {ANALYTICS_UPDATED}</span>
        </div>
      </div>

      {/* ═══ GLOBAL FILTERS ═══ */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border bg-card">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground mr-1">Filters</span>

        <div className="flex items-center rounded-lg border border-border overflow-hidden">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                dateRange === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value);
            setActiveSource(e.target.value === "All" ? null : e.target.value);
          }}
          className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground"
        >
          <option value="All">All sources</option>
          {SOURCES.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          className="text-xs border border-border rounded-lg px-2.5 py-1.5 bg-card text-foreground"
        >
          <option value="All">All countries</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>{c.name}</option>
          ))}
        </select>

        {(sourceFilter !== "All" || countryFilter !== "All") && (
          <button
            onClick={() => { setSourceFilter("All"); setCountryFilter("All"); setActiveSource(null); }}
            className="text-xs text-primary hover:underline ml-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpiCards.map((c) => (
          <button
            key={c.label}
            onClick={"metric" in c && c.clickable ? () => setChartMetric(c.metric!) : undefined}
            className={`rounded-xl border p-4 text-left transition-colors ${
              "metric" in c && chartMetric === c.metric
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:bg-muted/50"
            } ${"metric" in c && c.clickable ? "cursor-pointer" : "cursor-default"}`}
          >
            <p className={`text-xs font-medium ${"metric" in c && chartMetric === c.metric ? "text-primary" : "text-muted-foreground"}`}>
              {c.label}
            </p>
            <p className="text-2xl font-semibold text-foreground mt-1">{c.fmt(c.value)}</p>
            <div className="mt-1">
              <TrendBadge current={c.value} previous={c.prev} inverse={"inverse" in c && c.inverse} />
            </div>
          </button>
        ))}
      </div>

      {/* ═══ TRAFFIC CHART ═══ */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {(["visitors", "pageviews", "sessions"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setChartMetric(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                  chartMetric === m
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredDaily}>
              <defs>
                <linearGradient id="webAnalyticsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_PRIMARY} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_PRIMARY} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <RechartsTooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(var(--foreground))",
                }}
                formatter={(value: number) => [value, chartMetric.charAt(0).toUpperCase() + chartMetric.slice(1)]}
              />
              <Area
                type="monotone"
                dataKey={chartMetric}
                stroke={CHART_PRIMARY}
                strokeWidth={2}
                fill="url(#webAnalyticsGradient)"
                dot={{ r: 3, fill: CHART_PRIMARY }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ═══ SOURCES + COUNTRIES + DEVICES ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sources */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Sources</p>
          <div className="space-y-2">
            {SOURCES.map((s) => (
              <button
                key={s.name}
                onClick={() => {
                  const next = activeSource === s.name ? null : s.name;
                  setActiveSource(next);
                  setSourceFilter(next ?? "All");
                }}
                className={`w-full flex items-center gap-3 rounded-lg p-1.5 transition-colors text-left ${
                  activeSource === s.name ? "bg-primary/10" : "hover:bg-muted/50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="relative h-7 flex items-center">
                    <div
                      className="absolute inset-y-0 left-0 rounded bg-primary/15"
                      style={{ width: `${(s.visitors / maxSourceVisitors) * 100}%` }}
                    />
                    <span className="relative text-sm text-foreground pl-2 truncate">{s.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-medium text-foreground">{s.visitors}</span>
                  <span className="text-xs text-muted-foreground ml-1">({s.pct}%)</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Countries */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Countries</p>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
            {COUNTRIES.map((c) => {
              const maxC = COUNTRIES[0].visitors;
              return (
                <div key={c.code} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="relative h-6 flex items-center">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-primary/15"
                        style={{ width: `${(c.visitors / maxC) * 100}%` }}
                      />
                      <span className="relative text-xs text-foreground pl-2 truncate">{c.name}</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-foreground w-8 text-right">{c.visitors}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Devices */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Devices</p>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEVICES}
                    dataKey="pct"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={24}
                    outerRadius={42}
                    strokeWidth={0}
                  >
                    {DEVICES.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? CHART_PRIMARY : CHART_MUTED} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {DEVICES.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: i === 0 ? CHART_PRIMARY : CHART_MUTED }} />
                  <span className="text-sm text-foreground">{d.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">{d.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ PAGES TABLE ═══ */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-sm font-medium text-foreground">Pages</p>
          <div className="flex items-center gap-1">
            {PAGE_GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setPageGroupFilter(g)}
                className={`px-2 py-1 text-xs rounded-md font-medium transition-colors ${
                  pageGroupFilter === g
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 font-medium text-muted-foreground text-xs pr-4">Page</th>
                <th
                  className="pb-2 font-medium text-muted-foreground text-xs text-right cursor-pointer hover:text-foreground pr-4"
                  onClick={() => handlePageSort("visitors")}
                >
                  Views <SortIcon sortKey="visitors" />
                </th>
                <th
                  className="pb-2 font-medium text-muted-foreground text-xs text-right cursor-pointer hover:text-foreground pr-4"
                  onClick={() => handlePageSort("avgTime")}
                >
                  Avg Time <SortIcon sortKey="avgTime" />
                </th>
                <th
                  className="pb-2 font-medium text-muted-foreground text-xs text-right cursor-pointer hover:text-foreground"
                  onClick={() => handlePageSort("bounceRate")}
                >
                  Bounce <SortIcon sortKey="bounceRate" />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPages.map((p, i) => {
                const isTop = i === 0 && pageSortKey === "visitors" && pageSortDir === "desc";
                return (
                  <tr key={p.path} className={`border-b border-border/50 last:border-0 ${isTop ? "bg-primary/5" : ""}`}>
                    <td className="py-2 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">{p.path}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{p.group}</span>
                      </div>
                    </td>
                    <td className="py-2 text-right font-medium text-foreground pr-4">{p.visitors}</td>
                    <td className="py-2 text-right text-muted-foreground pr-4">{p.avgTime}s</td>
                    <td className={`py-2 text-right ${p.bounceRate > 50 ? "text-red-500" : "text-muted-foreground"}`}>
                      {p.bounceRate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ CONVERSIONS + FUNNEL ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Conversions */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Conversions</p>
          <div className="space-y-3">
            {[
              { label: "Product Inquiries", value: counts.inquiries, icon: ContactRound, rate: totalVisitors > 0 ? ((counts.inquiries / totalVisitors) * 100).toFixed(1) : "0" },
              { label: "Career Applications", value: counts.careers, icon: Download, rate: totalVisitors > 0 ? ((counts.careers / totalVisitors) * 100).toFixed(1) : "0" },
              { label: "Total Conversions", value: totalLeads, icon: Target, rate: totalVisitors > 0 ? ((totalLeads / totalVisitors) * 100).toFixed(1) : "0" },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="p-2 rounded-lg bg-primary/10">
                  <c.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
                <span className="text-sm font-medium text-primary">{c.rate}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funnel */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <p className="text-sm font-medium text-foreground">Conversion Funnel</p>
          <div className="space-y-2">
            {funnelData.map((stage, i) => {
              const widthPct = totalVisitors > 0 ? Math.max((stage.value / totalVisitors) * 100, 8) : 8;
              const dropOff = i > 0 && funnelData[i - 1].value > 0
                ? Math.round((1 - stage.value / funnelData[i - 1].value) * 100)
                : 0;
              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{stage.value}</span>
                      {i > 0 && (
                        <span className="text-red-500 text-[10px]">{dropOff > 0 ? "-" : ""}{dropOff}% drop</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all flex items-center justify-center"
                      style={{ width: `${widthPct}%`, backgroundColor: stage.fill }}
                    >
                      {widthPct > 20 && (
                        <span className="text-[10px] font-medium text-primary-foreground">{stage.value}</span>
                      )}
                    </div>
                  </div>
                  {i < funnelData.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <ArrowRight className="h-3 w-3 text-muted-foreground rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══ INSIGHTS ═══ */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium text-foreground">Insights</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                insight.type === "warning"
                  ? "bg-amber-50 border border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                  : insight.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800"
                  : "bg-muted/50 border border-border"
              }`}
            >
              <insight.icon className={`h-4 w-4 mt-0.5 shrink-0 ${
                insight.type === "warning" ? "text-amber-600" : insight.type === "success" ? "text-emerald-600" : "text-primary"
              }`} />
              <p className="text-foreground leading-relaxed text-xs">{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CONTENT & LEADS ═══ */}
      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Content & Leads</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Total Leads", value: totalLeads, icon: ContactRound, color: "text-primary", bg: "bg-primary/10" },
            { label: "Inquiries", value: counts.inquiries, icon: Users, color: "text-accent", bg: "bg-accent/10" },
            { label: "Career Applications", value: counts.careers, icon: Eye, color: "text-primary", bg: "bg-primary/10" },
            { label: "Products", value: counts.products, icon: Newspaper, color: "text-foreground", bg: "bg-muted" },
            { label: "Content Sections", value: counts.contentSections, icon: FileText, color: "text-foreground", bg: "bg-muted" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className={`p-2 rounded-lg w-fit ${c.bg}`}>
                <c.icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-semibold text-foreground">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Leads */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Recent Leads</p>
            <span className="text-xs text-muted-foreground">{totalLeads} total</span>
          </div>
          {recentLeads.length > 0 ? (
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <div key={`${lead.type}-${lead.id}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{lead.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${lead.type === "inquiry" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                      {lead.type === "inquiry" ? "Inquiry" : "Career"}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
