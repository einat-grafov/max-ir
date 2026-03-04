import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isWithinInterval, startOfWeek, startOfMonth, endOfWeek, endOfMonth } from "date-fns";
import { BarChart3, DollarSign, ShoppingCart, Users, TrendingUp, CalendarIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import type { DateRange } from "react-day-picker";

const PERIOD_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

const Analytics = () => {
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2">
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
