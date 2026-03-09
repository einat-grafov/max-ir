import { useState } from "react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Package, User, MapPin, FileText, Info, Trash2, ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import OrderTimeline from "@/components/admin/OrderTimeline";

const fmt = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
    " at " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
};

const statusBadge = (status: string, paymentStatus: string) => {
  if (status === "completed" || paymentStatus === "paid")
    return { text: "Completed", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  if (status === "invoice_sent")
    return { text: "Invoice sent", className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
  return { text: "Open", className: "bg-muted text-muted-foreground" };
};

const paymentBadge = (paymentStatus: string) => {
  if (paymentStatus === "paid")
    return { text: "Paid", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  return { text: "Pending", className: "bg-amber-100 text-amber-800 border-amber-200" };
};

const fulfillmentBadge = (status: string) => {
  if (status === "fulfilled")
    return { text: "Fulfilled", className: "bg-emerald-100 text-emerald-800 border-emerald-200" };
  return { text: "Unfulfilled", className: "bg-muted text-muted-foreground" };
};

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const fromCustomer = searchParams.get("from") === "customer";
  const fromCustomerId = searchParams.get("customerId");

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: items = [] } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: customer } = useQuery({
    queryKey: ["order-customer", order?.customer_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", order!.customer_id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!order?.customer_id,
  });

  const updateOrderMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      const { error } = await supabase
        .from("orders")
        .update(updates)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-detail", id] });
      toast.success("Order updated");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update order");
    },
  });

  // Timeline events
  const timelineEvents = [
    {
      id: "created",
      message: order ? `Order #D${order.order_number} was created.` : "Order created.",
      timestamp: order ? formatDate(order.created_at) : "",
    },
    ...(order?.payment_status === "paid"
      ? [{ id: "paid", message: "Payment received.", timestamp: order.updated_at !== order.created_at ? formatDate(order.updated_at) : formatDate(order.created_at) }]
      : []),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-muted-foreground">Loading order...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <p className="text-sm text-muted-foreground mb-4">Order not found</p>
        <Button variant="outline" asChild>
          <Link to="/admin/orders">Back to orders</Link>
        </Button>
      </div>
    );
  }

  const s = statusBadge(order.status, order.payment_status);
  const p = paymentBadge(order.payment_status);
  const f = fulfillmentBadge(order.fulfillment_status);
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>#D{order.order_number}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">#D{order.order_number}</h1>
          <Badge variant="outline" className={s.className}>{s.text}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-destructive hover:text-white">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete order?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this order and all its items. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={async () => {
                    const { error } = await supabase.from("orders").delete().eq("id", id!);
                    if (error) {
                      toast.error("Failed to delete order");
                      return;
                    }
                    toast.success("Order deleted");
                    navigate("/admin/orders");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {order.payment_status !== "paid" && (
            <Button
              onClick={() => updateOrderMutation.mutate({ payment_status: "paid" })}
              disabled={updateOrderMutation.isPending}
            >
              Mark as paid
            </Button>
          )}
          {order.fulfillment_status !== "fulfilled" && (
            <Button
              variant="outline"
              onClick={() => updateOrderMutation.mutate({ fulfillment_status: "fulfilled" })}
              disabled={updateOrderMutation.isPending}
            >
              Mark as fulfilled
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Items</h2>
              <Badge variant="outline" className={f.className}>{f.text}</Badge>
            </div>

            <div className="border border-border rounded-lg divide-y divide-border">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.product_id ? (
                        <Link to={`/admin/products/${item.product_id}`} className="hover:underline">
                          {item.product_name}
                        </Link>
                      ) : (
                        item.product_name
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {fmt(Number(item.price))} × {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {fmt(Number(item.total))}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment summary */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Payment</h2>
              <Badge variant="outline" className={p.className}>{p.text}</Badge>
            </div>
            <div className="border border-border rounded-lg divide-y divide-border">
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span className="text-foreground">Subtotal</span>
                <span className="text-muted-foreground">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
                <span className="text-right text-foreground">{fmt(Number(order.subtotal))}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                  <span className="text-foreground">Discount</span>
                  <span className="text-muted-foreground">—</span>
                  <span className="text-right text-foreground">-{fmt(Number(order.discount_amount))}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span className="text-foreground flex items-center gap-1">
                  Tax <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="text-muted-foreground">VAT 18%</span>
                <span className="text-right text-foreground">{fmt(Number(order.tax))}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span />
                <span className="text-right text-foreground">{fmt(Number(order.total))}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          {order.notes && (
            <Card className="p-5">
              <h2 className="text-base font-semibold text-foreground mb-3">Notes</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{order.notes}</p>
            </Card>
          )}

          {/* Customer */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Customer</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {customer ? (
                  <Link to={`/admin/customers/${customer.id}`} className="text-sm text-foreground hover:underline font-medium">
                    {order.customer_name}
                  </Link>
                ) : (
                  <span className="text-sm text-foreground font-medium">{order.customer_name}</span>
                )}
              </div>
              {order.customer_email && (
                <p className="text-sm text-muted-foreground ml-6">{order.customer_email}</p>
              )}
              {customer && (customer.address || customer.city || customer.country) && (
                <div className="flex items-start gap-2 mt-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    {customer.address && <p>{customer.address}{customer.apartment ? `, ${customer.apartment}` : ""}</p>}
                    {(customer.city || customer.postal_code) && (
                      <p>{[customer.city, customer.postal_code].filter(Boolean).join(", ")}</p>
                    )}
                    {customer.country && <p>{customer.country}</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <OrderTimeline events={timelineEvents} />
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
