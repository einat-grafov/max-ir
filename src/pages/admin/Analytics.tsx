import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from "date-fns";
import { BarChart3, DollarSign, ShoppingCart, Users, TrendingUp, CalendarIcon, Download, ArrowUpDown, ExternalLink, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLastComplianceReport, type ComplianceReport } from "@/lib/compliance-scanner";

function ComplianceStatusCard() {
  const [report, setReport] = useState<ComplianceReport | null>(null);

  useEffect(() => {
    setReport(getLastComplianceReport());
  }, []);

  if (!report) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4 text-muted-foreground" />
            Cookie Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent scan. Visit a public page of the site to run the
            compliance scanner, then return here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const unregistered = report.findings.filter((f) => !f.registered);
  const registered = report.findings.filter((f) => f.registered);
  const ok = unregistered.length === 0;

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          {ok ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          )}
          Cookie Compliance Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Last scan:{" "}
          <span className="font-mono">
            {new Date(report.timestamp).toLocaleString()}
          </span>
        </p>
        {ok ? (
          <p className="text-sm text-foreground">
            ✓ All third-party scripts on the site are properly gated by the
            cookie consent system.{" "}
            {registered.length > 0 && (
              <span className="text-muted-foreground">
                ({registered.length} registered third-party script
                {registered.length === 1 ? "" : "s"} found.)
              </span>
            )}
          </p>
        ) : (
          <>
            <p className="text-sm text-foreground">
              ⚠ <strong>{unregistered.length} third-party script
              {unregistered.length === 1 ? "" : "s"}</strong> detected that
              {unregistered.length === 1 ? " is" : " are"} NOT gated by the
              consent banner. These may fire before visitors consent, which
              can violate GDPR.
            </p>
            <ul className="space-y-1 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2">
              {unregistered.map((f, i) => (
                <li key={i} className="font-mono text-xs break-all text-yellow-900 dark:text-yellow-200">
                  {f.src}
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              If you recognize these, re-add them through Settings →
              Integrations so they're properly gated by consent. If you
              don't recognize them, investigate immediately.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import WebsiteAnalytics from "@/components/admin/WebsiteAnalytics";
import type { DateRange } from "react-day-picker";

const PERIOD_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

const Analytics = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [customOpen, setCustomOpen] = useState(false);

  const dateRange = useMemo(() => {
    if (period === "custom" && customRange?.from && customRange?.to) {
      return { start: startOfDay(customRange.from), end: endOfDay(customRange.to) };
    }
    const days = parseInt(period) || 30;
    return { start: startOfDay(subDays(new Date(), days)), end: endOfDay(new Date()) };
  }, [period, customRange]);

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ["analytics-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, total, created_at, status, payment_status")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ["analytics-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, created_at")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch inquiries with customer matching
  const { data: inquiries = [] } = useQuery({
    queryKey: ["analytics-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("id, name, email, product_name, message, created_at, company_name, first_name, last_name")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Match inquiries to existing customers by company name, full name, then email
  const { data: customerLookup } = useQuery({
    queryKey: ["analytics-customer-lookup"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, email, company, first_name, last_name");
      if (error) throw error;
      const emailMap = new Map<string, string>();
      const companyMap = new Map<string, string>();
      const nameMap = new Map<string, string>();
      data.forEach((c) => {
        if (c.email) emailMap.set(c.email.toLowerCase(), c.id);
        if (c.company) companyMap.set(c.company.toLowerCase(), c.id);
        const fullName = [c.first_name, c.last_name].filter(Boolean).join(" ").toLowerCase();
        if (fullName) nameMap.set(fullName, c.id);
      });
      return { emailMap, companyMap, nameMap };
    },
  });

  const [inquirySortField, setInquirySortField] = useState<"name" | "email" | "product_name" | "created_at">("created_at");
  const [inquirySortDir, setInquirySortDir] = useState<"asc" | "desc">("desc");

  const toggleInquirySort = (field: typeof inquirySortField) => {
    if (inquirySortField === field) {
      setInquirySortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setInquirySortField(field);
      setInquirySortDir("asc");
    }
  };

  const filteredInquiries = useMemo(() => {
    const filtered = inquiries.filter((i) =>
      isWithinInterval(new Date(i.created_at), dateRange)
    );
    return filtered.sort((a, b) => {
      const aVal = a[inquirySortField] || "";
      const bVal = b[inquirySortField] || "";
      const cmp = String(aVal).localeCompare(String(bVal));
      return inquirySortDir === "asc" ? cmp : -cmp;
    });
  }, [inquiries, dateRange, inquirySortField, inquirySortDir]);

  // Filter data by date range
  const filteredOrders = useMemo(() =>
    orders.filter((o) => isWithinInterval(new Date(o.created_at), dateRange)),
    [orders, dateRange]
  );

  const filteredCustomers = useMemo(() =>
    customers.filter((c) => isWithinInterval(new Date(c.created_at), dateRange)),
    [customers, dateRange]
  );

  // Determine granularity based on range span
  const daySpan = useMemo(() => {
    return Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
  }, [dateRange]);

  const granularity = daySpan <= 31 ? "day" : daySpan <= 120 ? "week" : "month";

  // Build time buckets
  const buckets = useMemo(() => {
    if (granularity === "day") {
      return eachDayOfInterval(dateRange).map((d) => ({
        start: startOfDay(d),
        end: endOfDay(d),
        label: format(d, "MMM d"),
      }));
    } else if (granularity === "week") {
      return eachWeekOfInterval(dateRange, { weekStartsOn: 1 }).map((d) => ({
        start: startOfWeek(d, { weekStartsOn: 1 }),
        end: endOfWeek(d, { weekStartsOn: 1 }),
        label: format(d, "MMM d"),
      }));
    } else {
      return eachMonthOfInterval(dateRange).map((d) => ({
        start: startOfMonth(d),
        end: endOfMonth(d),
        label: format(d, "MMM yyyy"),
      }));
    }
  }, [dateRange, granularity]);

  // Revenue data
  const revenueData = useMemo(() =>
    buckets.map((b) => {
      const revenue = orders
        .filter((o) => isWithinInterval(new Date(o.created_at), { start: b.start, end: b.end }))
        .reduce((sum, o) => sum + Number(o.total), 0);
      return { name: b.label, revenue: parseFloat(revenue.toFixed(2)) };
    }),
    [buckets, orders]
  );

  // Orders data
  const ordersData = useMemo(() =>
    buckets.map((b) => {
      const count = orders.filter((o) =>
        isWithinInterval(new Date(o.created_at), { start: b.start, end: b.end })
      ).length;
      return { name: b.label, orders: count };
    }),
    [buckets, orders]
  );

  // Customer growth (cumulative)
  const customerGrowthData = useMemo(() => {
    const allBefore = customers.filter((c) => new Date(c.created_at) < dateRange.start).length;
    let cumulative = allBefore;
    return buckets.map((b) => {
      const added = customers.filter((c) =>
        isWithinInterval(new Date(c.created_at), { start: b.start, end: b.end })
      ).length;
      cumulative += added;
      return { name: b.label, customers: cumulative, new: added };
    });
  }, [buckets, customers, dateRange]);

  // KPI values
  const totalRevenue = filteredOrders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = filteredOrders.length;
  const totalCustomers = filteredCustomers.length;

  const statCards = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: DollarSign },
    { label: "Orders", value: totalOrders.toString(), icon: ShoppingCart },
    { label: "New Customers", value: totalCustomers.toString(), icon: Users },
    { label: "Avg. Order Value", value: totalOrders > 0 ? `$${(totalRevenue / totalOrders).toFixed(2)}` : "$0.00", icon: TrendingUp },
  ];

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    if (value === "custom") {
      setCustomOpen(true);
    }
  };

  const exportCSV = () => {
    const rows = buckets.map((b, i) => ({
      Period: b.label,
      Revenue: revenueData[i].revenue,
      Orders: ordersData[i].orders,
      "Total Customers": customerGrowthData[i].customers,
      "New Customers": customerGrowthData[i].new,
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => r[h as keyof typeof r]).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${format(dateRange.start, "yyyy-MM-dd")}-to-${format(dateRange.end, "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartTooltipStyle = {
    contentStyle: {
      backgroundColor: "hsl(var(--popover))",
      border: "1px solid hsl(var(--border))",
      borderRadius: "10px",
      fontSize: "12px",
      color: "hsl(var(--foreground))",
    },
  };

  return (
    <div>
      <ComplianceStatusCard />
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Home</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {period === "custom" && (
            <Popover open={customOpen} onOpenChange={setCustomOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start text-left font-normal", !customRange?.from && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {customRange?.from ? (
                    customRange.to ? `${format(customRange.from, "MMM d")} – ${format(customRange.to, "MMM d, yyyy")}` : format(customRange.from, "MMM d, yyyy")
                  ) : "Pick dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={customRange}
                  onSelect={setCustomRange}
                  numberOfMonths={2}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-muted-foreground text-sm">{card.label}</span>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{card.value}</p>
          </Card>
        ))}
      </div>

      {/* Website Analytics */}
      <div className="mb-8">
        <WebsiteAnalytics />
      </div>

      {/* Inquiries Table */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-semibold">Recent Inquiries</h2>
          <span className="text-sm text-muted-foreground">{filteredInquiries.length} inquiries</span>
        </div>
        {filteredInquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No inquiries in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs font-medium" onClick={() => toggleInquirySort("name")}>
                      Name <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs font-medium" onClick={() => toggleInquirySort("email")}>
                      Email <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs font-medium" onClick={() => toggleInquirySort("product_name")}>
                      Product <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                  <TableHead className="max-w-[240px]">Message</TableHead>
                  <TableHead>Lead Status</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" className="h-7 -ml-2 text-xs font-medium" onClick={() => toggleInquirySort("created_at")}>
                      Date <ArrowUpDown className="h-3 w-3 ml-1" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInquiries.map((inquiry) => {
                  const displayName = inquiry.company_name || [inquiry.first_name, inquiry.last_name].filter(Boolean).join(" ") || inquiry.name;
                  const customerId = 
                    (inquiry.company_name && customerLookup?.companyMap.get(inquiry.company_name.toLowerCase())) ||
                    customerLookup?.nameMap.get(inquiry.name?.toLowerCase()) ||
                    (inquiry.email && customerLookup?.emailMap.get(inquiry.email.toLowerCase()));
                  const isExisting = !!customerId;
                  return (
                    <TableRow
                      key={inquiry.id}
                      className={isExisting ? "cursor-pointer" : ""}
                      onClick={() => isExisting && navigate(`/admin/customers/${customerId}`)}
                    >
                      <TableCell className="font-medium text-sm">
                        <span className="flex items-center gap-1.5">
                          {displayName}
                          {isExisting && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{inquiry.email}</TableCell>
                      <TableCell className="text-sm">{inquiry.product_name}</TableCell>
                      <TableCell className="text-sm max-w-[240px] truncate">{inquiry.message}</TableCell>
                      <TableCell>
                        <Badge variant={isExisting ? "default" : "secondary"} className="text-xs whitespace-nowrap">
                          {isExisting ? "Existing Customer" : "New Lead"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(inquiry.created_at), "MMM d, yyyy")}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Overview */}
        <Card className="p-6 lg:col-span-2">
          <h2 className="text-foreground font-semibold mb-4">Revenue Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${v}`} />
                <Tooltip {...chartTooltipStyle} formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revenueGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders Over Time */}
        <Card className="p-6">
          <h2 className="text-foreground font-semibold mb-4">Orders Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Customer Growth */}
        <Card className="p-6">
          <h2 className="text-foreground font-semibold mb-4">Customer Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="customers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Total" />
                <Line type="monotone" dataKey="new" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} name="New" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
