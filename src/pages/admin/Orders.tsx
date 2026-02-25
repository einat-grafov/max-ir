import { useState, useEffect, useMemo, useRef } from "react";
import { FileText, Search, Filter, ArrowUpDown, CalendarIcon, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_email: string | null;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

const tabs = ["All", "Open and invoice sent", "Open", "Invoice sent", "Completed"];

const statusLabel = (status: string, paymentStatus: string) => {
  if (status === "completed") return { text: "Completed", style: "bg-muted text-muted-foreground" };
  if (paymentStatus === "paid") return { text: "Completed", style: "bg-muted text-muted-foreground" };
  if (status === "invoice_sent") return { text: "Invoice sent", style: "bg-yellow-100 text-yellow-800 border border-yellow-300" };
  return { text: "Open", style: "bg-muted text-muted-foreground" };
};

const matchesTab = (tab: string, order: Order) => {
  if (tab === "All") return true;
  const s = statusLabel(order.status, order.payment_status);
  if (tab === "Open") return s.text === "Open";
  if (tab === "Invoice sent") return s.text === "Invoice sent";
  if (tab === "Completed") return s.text === "Completed";
  if (tab === "Open and invoice sent") return s.text === "Open" || s.text === "Invoice sent";
  return true;
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();

  if (isToday) return `Today at ${time}`;
  if (isYesterday) return `Yesterday at ${time}`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ` at ${time}`;
};

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) setOrders(data as Order[]);
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (!matchesTab(activeTab, o)) return false;
    if (search && !o.customer_name.toLowerCase().includes(search.toLowerCase()) && !`#D${o.order_number}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allSelected = filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const hasOrders = orders.length > 0;

  const timeRanges = ["All", "Today", "Last 7 days", "Last 30 days", "Custom"] as const;
  type TimeRange = typeof timeRanges[number];
  const [timeRange, setTimeRange] = useState<TimeRange>("All");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowTimeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredByTime = useMemo(() => {
    if (timeRange === "All") return orders;
    const now = new Date();
    let start: Date;
    if (timeRange === "Today") {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeRange === "Last 7 days") {
      start = new Date(now); start.setDate(now.getDate() - 7);
    } else if (timeRange === "Last 30 days") {
      start = new Date(now); start.setDate(now.getDate() - 30);
    } else if (timeRange === "Custom") {
      if (!customFrom) return orders;
      const from = new Date(customFrom.getFullYear(), customFrom.getMonth(), customFrom.getDate());
      const to = customTo ? new Date(customTo.getFullYear(), customTo.getMonth(), customTo.getDate(), 23, 59, 59) : now;
      return orders.filter((o) => { const d = new Date(o.created_at); return d >= from && d <= to; });
    } else {
      return orders;
    }
    return orders.filter((o) => new Date(o.created_at) >= start);
  }, [orders, timeRange, customFrom, customTo]);

  const stats = useMemo(() => {
    const src = filteredByTime;
    const totalOrders = src.length;
    const openOrders = src.filter((o) => statusLabel(o.status, o.payment_status).text === "Open").length;
    const invoiceSent = src.filter((o) => statusLabel(o.status, o.payment_status).text === "Invoice sent").length;
    const completed = src.filter((o) => statusLabel(o.status, o.payment_status).text === "Completed").length;
    const totalRevenue = src.reduce((sum, o) => sum + Number(o.total), 0);
    return [
      { label: "Orders", value: String(totalOrders) },
      { label: "Revenue", value: fmt(totalRevenue) },
      { label: "Open", value: String(openOrders) },
      { label: "Invoice sent", value: String(invoiceSent) },
      { label: "Completed", value: String(completed) },
    ];
  }, [filteredByTime]);

  const timeLabel = timeRange === "Custom" && customFrom
    ? `${format(customFrom, "MMM d")}${customTo ? ` – ${format(customTo, "MMM d")}` : ""}`
    : timeRange;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        </div>
        <div className="flex gap-3">
          {hasOrders && (
            <>
              <Button variant="outline">Export</Button>
              <Button onClick={() => navigate("/admin/orders/create")}>Create order</Button>
            </>
          )}
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="flex items-stretch border border-border rounded-lg mb-6 bg-background">
        {/* Time filter */}
        <div className="relative flex-shrink-0 border-r border-border" ref={dropdownRef}>
          <button
            onClick={() => setShowTimeDropdown((v) => !v)}
            className="flex items-center gap-2 px-4 h-full text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {timeLabel}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          {showTimeDropdown && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border border-border rounded-lg shadow-lg min-w-[160px]">
              {timeRanges.filter((t) => t !== "Custom").map((t) => (
                <button
                  key={t}
                  onClick={() => { setTimeRange(t); setShowTimeDropdown(false); }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${timeRange === t ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                >
                  {t}
                </button>
              ))}
              <button
                onClick={() => setShowCustomPicker((v) => !v)}
                className={`block w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${timeRange === "Custom" ? "font-semibold text-foreground" : "text-muted-foreground"}`}
              >
                Custom range…
              </button>
              {showCustomPicker && (
                <div className="border-t border-border p-4">
                  {/* Date display header */}
                  <div className="flex items-center gap-3 mb-4 text-sm">
                    <div className="border border-border rounded-md px-3 py-1.5 min-w-[140px] text-foreground">
                      {customFrom ? format(customFrom, "d MMMM yyyy") : "Start date"}
                    </div>
                    <span className="text-muted-foreground">—</span>
                    <div className="border border-border rounded-md px-3 py-1.5 min-w-[140px] text-foreground">
                      {customTo ? format(customTo, "d MMMM yyyy") : "End date"}
                    </div>
                    <button
                      onClick={() => { setCustomFrom(undefined); setCustomTo(undefined); }}
                      className="text-sm text-primary hover:underline ml-2"
                    >
                      Clear
                    </button>
                  </div>
                  {/* Side-by-side calendars */}
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">From</p>
                      <Calendar
                        mode="single"
                        selected={customFrom}
                        onSelect={(day) => setCustomFrom(day)}
                        classNames={{ day_today: customFrom ? "" : undefined }}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">To</p>
                      <Calendar
                        mode="single"
                        selected={customTo}
                        onSelect={(day) => setCustomTo(day)}
                        disabled={(date) => customFrom ? date < customFrom : false}
                        classNames={{ day_today: customTo ? "" : undefined }}
                      />
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                    <Button variant="outline" size="sm" onClick={() => setShowCustomPicker(false)}>Cancel</Button>
                    <Button
                      size="sm"
                      disabled={!customFrom || !customTo}
                      onClick={() => { setTimeRange("Custom"); setShowTimeDropdown(false); setShowCustomPicker(false); }}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Stat cells */}
        {stats.map((card, i) => (
          <div
            key={card.label}
            className={`flex-1 px-5 py-3 ${i < stats.length - 1 ? "border-r border-border" : ""}`}
          >
            <span className="text-xs text-muted-foreground">{card.label}</span>
            <p className="text-base font-semibold text-foreground mt-0.5">{card.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-background border border-border rounded-lg flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      ) : hasOrders ? (
        <div className="bg-background border border-border rounded-lg">
          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-border px-1">
            <div className="flex items-center gap-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelectedIds(new Set()); }}
                  className={`px-3 py-2.5 text-sm font-medium transition-colors rounded-t-md ${
                    activeTab === tab
                      ? "text-foreground border-b-2 border-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
              <button className="px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground">+</button>
            </div>
            <div className="flex items-center gap-1 pr-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <Filter className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Search row */}
          {showSearch && (
            <div className="px-4 py-2 border-b border-border">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search orders..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-transparent border border-border rounded-md outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
          )}

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-5">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const s = statusLabel(order.status, order.payment_status);
                return (
                  <TableRow key={order.id} className="cursor-pointer" onClick={() => {}}>
                    <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleOne(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">#D{order.order_number}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(order.created_at)}</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.style}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${s.text === "Invoice sent" ? "bg-yellow-600" : "bg-muted-foreground/60"}`} />
                        {s.text}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-5 font-medium">{fmt(Number(order.total))}</TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders match this filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
            <button disabled className="p-1 rounded text-muted-foreground/40">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button disabled className="p-1 rounded text-muted-foreground/40">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
            <span className="text-sm text-muted-foreground ml-1">1-{filtered.length}</span>
          </div>

        </div>
      ) : (
        /* Empty state */
        <div className="bg-background border border-border rounded-lg flex flex-col items-center justify-center py-24 px-6">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center">
              <FileText className="h-14 w-14 text-muted-foreground/50" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Your orders will show here</h2>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
            This is where you'll fulfill orders, collect payments, and track order progress.
          </p>
          <Button variant="default" className="bg-foreground text-background hover:bg-foreground/90" onClick={() => navigate("/admin/orders/create")}>
            Create order
          </Button>
        </div>
      )}
    </div>
  );
};

export default Orders;
