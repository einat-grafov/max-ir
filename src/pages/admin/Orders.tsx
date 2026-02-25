import { useState, useEffect } from "react";
import { ShoppingCart, Calendar, FileText, ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
  items_count?: number;
}

const timeFilters = [
  { label: "Today", description: "Compared to yesterday up to current hour" },
  { label: "Last 7 days", description: "Compared to the previous 7 days" },
  { label: "Last 30 days", description: "Compared to the previous 30 days" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "fulfilled": return "default";
    case "unfulfilled": return "secondary";
    case "cancelled": return "destructive";
    default: return "outline";
  }
};

const paymentVariant = (status: string) => {
  switch (status) {
    case "paid": return "default";
    case "pending": return "secondary";
    case "refunded": return "destructive";
    default: return "outline";
  }
};

const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Orders = () => {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = !search || o.customer_name.toLowerCase().includes(search.toLowerCase()) || `#${o.order_number}`.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: "Orders", value: String(orders.length), change: "—" },
    { label: "Items ordered", value: "0", change: "—" },
    { label: "Returns", value: "$0", change: "—" },
    { label: "Orders fulfilled", value: String(orders.filter(o => o.status === "fulfilled").length), change: "—" },
    { label: "Orders delivered", value: "0", change: "—" },
  ];

  const hasOrders = orders.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        </div>
        {hasOrders && (
          <Button onClick={() => navigate("/admin/orders/create")}>Create order</Button>
        )}
      </div>

      {/* Stats bar */}
      <div className="bg-background border border-border rounded-lg flex items-center divide-x divide-border mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-5 py-3 hover:bg-muted/50 rounded-l-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground font-medium">{selectedFilter}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-72 bg-background border border-border shadow-lg z-50 p-1">
            {timeFilters.map((filter) => (
              <button
                key={filter.label}
                onClick={() => setSelectedFilter(filter.label)}
                className="w-full flex items-start gap-3 px-3 py-2.5 rounded-md hover:bg-muted/50 transition-colors text-left"
              >
                <div className={`mt-1 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedFilter === filter.label ? "border-foreground" : "border-muted-foreground/40"}`}>
                  {selectedFilter === filter.label && (
                    <div className="h-2 w-2 rounded-full bg-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{filter.label}</p>
                  <p className="text-xs text-muted-foreground">{filter.description}</p>
                </div>
              </button>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {stats.map((stat) => (
          <div key={stat.label} className="flex-1 px-5 py-3">
            <p className="text-sm font-semibold text-foreground">{stat.label}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-foreground">{stat.value}</span>
              <span className="text-sm text-muted-foreground">{stat.change}</span>
              <div className="h-[2px] w-12 bg-primary/40 rounded-full ml-1" />
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="bg-background border border-border rounded-lg flex items-center justify-center py-24">
          <p className="text-sm text-muted-foreground">Loading orders...</p>
        </div>
      ) : hasOrders ? (
        /* Table view */
        <div className="bg-background border border-border rounded-lg">
          {/* Filters row */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="unfulfilled">Unfulfilled</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id} className="cursor-pointer" onClick={() => {}}>
                  <TableCell className="font-medium">#{order.order_number}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </TableCell>
                  <TableCell>{order.customer_name}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(order.status)} className="capitalize">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={paymentVariant(order.payment_status)} className="capitalize">
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{fmt(Number(order.total))}</TableCell>
                </TableRow>
              ))}
              {filteredOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No orders match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
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
