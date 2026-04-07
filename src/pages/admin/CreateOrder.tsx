import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useBlocker, useNavigate, useLocation } from "react-router-dom";
import ShippingRateModal from "@/components/admin/ShippingRateModal";
import type { ShippingRate } from "@/hooks/useShippingRates";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Card } from "@/components/ui/card";
import { Search, X, Package, ChevronUp, ChevronDown, Pen, Info, Plus } from "lucide-react";
import ProductSearchModal from "@/components/admin/ProductSearchModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import CreateCustomerModal from "@/components/admin/CreateCustomerModal";
import CustomerSearchModal from "@/components/admin/CustomerSearchModal";
import SendInvoiceModal from "@/components/admin/SendInvoiceModal";
import OrderTimeline from "@/components/admin/OrderTimeline";

interface OrderProduct {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  quantity: number;
  taxExempt?: boolean;
  outOfStock?: boolean;
}

const CreateOrder = () => {
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [paymentDueLater, setPaymentDueLater] = useState(false);
  const [sendConfirmationEmail, setSendConfirmationEmail] = useState(true);
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");
  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discount, setDiscount] = useState<{ type: "amount" | "percentage"; value: number; reason: string } | null>(null);
  const [tempDiscount, setTempDiscount] = useState<{ type: "amount" | "percentage"; value: number; reason: string }>({ type: "amount", value: 0, reason: "" });
  const [selectedCustomer, setSelectedCustomer] = useState<{
    id: string; first_name: string; last_name: string | null; email: string | null; company?: string | null;
  } | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [invoiceSent, setInvoiceSent] = useState(false);
  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [shippingRate, setShippingRate] = useState<ShippingRate | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<Array<{ id: string; message: string; timestamp: string; attachment?: { name: string; url: string } | null }>>([
    { id: "1", message: "You created this draft order.", timestamp: "Just now" },
  ]);

  const isSavingRef = useRef(false);
  const hasUnsavedChanges = products.length > 0 || selectedCustomer !== null || notes !== "" || discount !== null;

  const blocker = useBlocker(
    useCallback(() => !isSavingRef.current && hasUnsavedChanges, [hasUnsavedChanges])
  );

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const navigate = useNavigate();
  const location = useLocation();
  const [saving, setSaving] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const canSubmit = products.length > 0 && selectedCustomer !== null;

  // Pre-select customer from navigation state (e.g. from customer page)
  const returnToCustomer = (location.state as any)?.preselectedCustomer?.id
    ? `/admin/customers/${(location.state as any).preselectedCustomer.id}`
    : null;

  useEffect(() => {
    const state = location.state as { preselectedCustomer?: { id: string; first_name: string; last_name: string | null; email: string | null; company?: string | null } } | null;
    if (state?.preselectedCustomer && !selectedCustomer) {
      setSelectedCustomer(state.preselectedCustomer);
    }
  }, []);

  const handleCreateOrder = async () => {
    if (!canSubmit || !selectedCustomer) return;
    setSaving(true);
    try {
      const customerName = selectedCustomer.company || `${selectedCustomer.first_name}${selectedCustomer.last_name ? ` ${selectedCustomer.last_name}` : ""}`;
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: selectedCustomer.id,
          customer_name: customerName,
          customer_email: selectedCustomer.email,
          subtotal: subtotal,
          shipping_cost: shippingCost,
          shipping_method: shippingRate ? `${shippingRate.carrier} ${shippingRate.service}` : null,
          discount_amount: discountAmount,
          tax: tax,
          total: total,
          notes: notes || null,
          payment_due_later: paymentDueLater,
          status: "unfulfilled",
          payment_status: paymentDueLater ? "pending" : "paid",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const items = products.map((p) => ({
        order_id: order.id,
        product_id: p.id,
        product_name: p.name,
        price: p.price,
        quantity: p.quantity,
        total: p.price * p.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(items);
      if (itemsError) throw itemsError;

      // Send order confirmation email
      if (sendConfirmationEmail && selectedCustomer.email) {
        const itemsSummary = products.map(p => `${p.name} × ${p.quantity}`).join(", ");
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "order-confirmation",
            recipientEmail: selectedCustomer.email,
            idempotencyKey: `order-confirm-${order.id}`,
            templateData: {
              customerName: customerName,
              orderNumber: order.order_number,
              total: fmt(total),
              items: itemsSummary,
            },
          },
        });
      }

      isSavingRef.current = true;
      toast.success("Order created successfully");
      if (returnToCustomer) {
        navigate(returnToCustomer);
      } else {
        setCreatedOrderId(order.id);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!createdOrderId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", createdOrderId);
      if (error) throw error;
      toast.success("Order marked as paid");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark as paid");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProducts = (newProducts: { id: string; name: string; price: number; stock: number; requires_shipping: boolean; tax_exempt: boolean }[]) => {
    setProducts((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const toAdd = newProducts.filter((p) => !existing.has(p.id)).map((p) => ({
        id: p.id,
        name: p.name,
        subtitle: [p.tax_exempt ? "Tax exempt" : "", p.requires_shipping ? "Requires shipping" : ""].filter(Boolean).join("\n"),
        price: p.price,
        quantity: 1,
        taxExempt: p.tax_exempt,
        outOfStock: p.stock === 0,
      }));
      return [...prev, ...toAdd];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
      )
    );
  };

  const setQuantity = (id: string, val: string) => {
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, quantity: num } : p)));
    }
  };

  const removeProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const totalItems = products.reduce((s, p) => s + p.quantity, 0);
  const subtotal = products.reduce((s, p) => s + p.price * p.quantity, 0);
  const discountAmount = discount
    ? discount.type === "amount"
      ? discount.value
      : Math.round(subtotal * (discount.value / 100) * 100) / 100
    : 0;
  const taxableSubtotal = subtotal - discountAmount;
  const shippingCost = shippingRate?.price ?? 0;
  const tax = Math.round(taxableSubtotal * 0.18 * 100) / 100;
  const total = taxableSubtotal + shippingCost + tax;

  const fmt = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          {returnToCustomer ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={returnToCustomer}>
                    {(location.state as any)?.preselectedCustomer?.company || (location.state as any)?.preselectedCustomer?.first_name}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create order</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/orders">Orders</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Create order</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Create order</h1>
        <div className="flex gap-3">
          <Button variant="outline" disabled={!canSubmit} onClick={() => setInvoiceModalOpen(true)}>{invoiceSent ? "Resend invoice" : "Send invoice"}</Button>
          {createdOrderId ? (
            <Button disabled={saving} onClick={handleMarkAsPaid}>{saving ? "Updating..." : "Mark as paid"}</Button>
          ) : (
            <Button disabled={!canSubmit || saving} onClick={handleCreateOrder}>{saving ? "Creating..." : "Create order"}</Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Customer</h2>
              <Button variant="outline" size="sm" onClick={() => setCustomerModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add new
              </Button>
            </div>
            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedCustomer.company || selectedCustomer.first_name}
                  </p>
                  {selectedCustomer.email && (
                    <p className="text-xs text-muted-foreground">{selectedCustomer.email}</p>
                  )}
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                className="relative cursor-pointer"
                onClick={() => setCustomerSearchOpen(true)}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search or create a customer"
                  className="pl-9 pointer-events-none"
                  readOnly
                />
              </div>
            )}
            <CustomerSearchModal
              open={customerSearchOpen}
              onOpenChange={setCustomerSearchOpen}
              onSelectCustomer={(c) => setSelectedCustomer(c)}
            />
            <CreateCustomerModal
              open={customerModalOpen}
              onOpenChange={setCustomerModalOpen}
            />
          </Card>

          {/* Products */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Products</h2>
              <Button variant="outline" onClick={() => setBrowseModalOpen(true)}>Browse</Button>
            </div>

            <ProductSearchModal
              open={browseModalOpen}
              onOpenChange={setBrowseModalOpen}
              onAddProducts={handleAddProducts}
            />

            {products.length > 0 && (
              <div>
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center text-sm text-muted-foreground border-b border-border pb-2 mb-2">
                  <span>Product</span>
                  <span className="w-24 text-center">Quantity</span>
                  <span className="w-28 text-right">Total</span>
                  <span className="w-8" />
                </div>
                {products.map((product) => (
                  <div key={product.id}>
                    <div
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 items-center py-3 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                          {product.subtitle.split("\n").map((line, i) => (
                            <p key={i} className="text-xs text-muted-foreground">{line}</p>
                          ))}
                          <p className="text-xs text-primary font-medium">{fmt(product.price)}</p>
                        </div>
                      </div>
                      <div className="w-24 flex items-center border border-input rounded-md">
                        <Input
                          value={product.quantity}
                          onChange={(e) => setQuantity(product.id, e.target.value)}
                          className="border-0 text-center h-8 p-0 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          type="number"
                          min={1}
                        />
                        <div className="flex flex-col border-l border-input">
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="px-1.5 py-0.5 hover:bg-muted transition-colors"
                          >
                            <ChevronUp className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="px-1.5 py-0.5 hover:bg-muted transition-colors border-t border-input"
                          >
                            <ChevronDown className="h-3 w-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                      <span className="w-28 text-right text-sm text-foreground">
                        {fmt(product.price * product.quantity)}
                      </span>
                      <button
                        onClick={() => removeProduct(product.id)}
                        className="w-8 flex justify-center text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {product.outOfStock && (
                      <Alert variant="destructive" className="my-1">
                        <AlertDescription className="text-xs">
                          This product is out of stock but can still be added to the order.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            )}

            {products.length === 0 && (
              <div className="border border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Add products to this order by searching above.
                </p>
              </div>
            )}
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Payment</h2>
            <div className="border border-border rounded-lg divide-y divide-border">
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span className="text-foreground">Subtotal</span>
                <span className="text-muted-foreground">{totalItems} items</span>
                <span className="text-right text-foreground">{fmt(subtotal)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => {
                    setTempDiscount(discount ?? { type: "amount", value: 0, reason: "" });
                    setDiscountModalOpen(true);
                  }}
                >
                  {discount ? "Edit discount" : "Add discount"}
                </span>
                <span className="text-muted-foreground">
                  {discount
                    ? discount.type === "percentage"
                      ? `${discount.value}%`
                      : "—"
                    : "—"}
                </span>
                <span className="text-right text-foreground">
                  {discountAmount > 0 ? `-${fmt(discountAmount)}` : "$0.00"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span
                  className="text-primary cursor-pointer hover:underline"
                  onClick={() => setShippingModalOpen(true)}
                >
                  {shippingRate ? "Edit shipping" : "Add shipping or delivery"}
                </span>
                <span className="text-muted-foreground">
                  {shippingRate ? `${shippingRate.carrier} ${shippingRate.service}` : "—"}
                </span>
                <span className="text-right text-foreground">
                  {shippingCost > 0 ? fmt(shippingCost) : "$0.00"}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span className="text-primary cursor-pointer hover:underline flex items-center gap-1">
                  Estimated tax <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
                <span className="text-muted-foreground">VAT 18%</span>
                <span className="text-right text-foreground">{fmt(tax)}</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm font-semibold">
                <span className="text-foreground">Total</span>
                <span />
                <span className="text-right text-foreground">{fmt(total)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
              <Checkbox
                id="payment-due-later"
                checked={paymentDueLater}
                onCheckedChange={(checked) => setPaymentDueLater(checked as boolean)}
              />
              <label htmlFor="payment-due-later" className="text-sm text-foreground cursor-pointer">
                Payment due later
              </label>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Checkbox
                id="send-confirmation-email"
                checked={sendConfirmationEmail}
                onCheckedChange={(checked) => setSendConfirmationEmail(checked as boolean)}
              />
              <label htmlFor="send-confirmation-email" className="text-sm text-foreground cursor-pointer">
                Send confirmation email to customer
              </label>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-semibold text-foreground">Notes</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => { setTempNotes(notes); setNotesModalOpen(true); }}
              >
                <Pen className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{notes || "No notes"}</p>

            <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add note</DialogTitle>
                </DialogHeader>
                <div>
                  <div className="relative">
                    <Textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value.slice(0, 5000))}
                      className="min-h-[120px] resize-none"
                      placeholder=""
                    />
                    <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                      {tempNotes.length}/5000
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setNotesModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setNotes(tempNotes); setNotesModalOpen(false); }}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Timeline */}
          <OrderTimeline
            events={timelineEvents}
            onAddComment={(comment, attachment) => {
              const now = new Date();
              const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
              setTimelineEvents((prev) => [
                {
                  id: String(Date.now()),
                  message: comment || (attachment ? `Attached: ${attachment.name}` : ""),
                  timestamp: time,
                  attachment: attachment ? { name: attachment.name, url: URL.createObjectURL(attachment) } : null,
                },
                ...prev,
              ]);
            }}
          />

          {/* Discount Modal */}
          <Dialog open={discountModalOpen} onOpenChange={setDiscountModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{discount ? "Edit discount" : "Add discount"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Discount type</label>
                    <Select
                      value={tempDiscount.type}
                      onValueChange={(v) => setTempDiscount((d) => ({ ...d, type: v as "amount" | "percentage", value: 0 }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="amount">Amount</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Value</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        {tempDiscount.type === "amount" ? "$" : "%"}
                      </span>
                      <Input
                        type="number"
                        min={0}
                        step={tempDiscount.type === "amount" ? "0.01" : "1"}
                        value={tempDiscount.value || ""}
                        onChange={(e) => setTempDiscount((d) => ({ ...d, value: parseFloat(e.target.value) || 0 }))}
                        className="pl-8"
                        placeholder="0.00"
                      />
                      {tempDiscount.type === "amount" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">USD</span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Reason for discount</label>
                  <Input
                    value={tempDiscount.reason}
                    onChange={(e) => setTempDiscount((d) => ({ ...d, reason: e.target.value }))}
                    placeholder=""
                  />
                  <p className="text-xs text-muted-foreground mt-1">Visible to customer</p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                {discount && (
                  <Button variant="outline" className="mr-auto text-destructive hover:text-destructive" onClick={() => { setDiscount(null); setDiscountModalOpen(false); }}>
                    Remove
                  </Button>
                )}
                <Button variant="outline" onClick={() => setDiscountModalOpen(false)}>Cancel</Button>
                <Button onClick={() => { setDiscount(tempDiscount.value > 0 ? tempDiscount : null); setDiscountModalOpen(false); }}>Apply</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        customerEmail={selectedCustomer?.email}
        customerName={selectedCustomer ? (selectedCustomer.company || `${selectedCustomer.first_name}${selectedCustomer.last_name ? ` ${selectedCustomer.last_name}` : ""}`) : undefined}
        invoiceSent={invoiceSent}
        onInvoiceSent={() => setInvoiceSent(true)}
      />

      <ShippingRateModal
        open={shippingModalOpen}
        onOpenChange={setShippingModalOpen}
        onSelect={(rate) => setShippingRate(rate)}
        defaultCountry={selectedCustomer ? undefined : undefined}
        defaultPostalCode=""
      />

      {/* Leave confirmation */}
      <Dialog open={blocker.state === "blocked"} onOpenChange={(open) => { if (!open) blocker.reset?.(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave this page?</DialogTitle>
            <DialogDescription>
              Your order hasn't been saved. All changes will be lost if you leave now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => blocker.reset?.()}>Stay</Button>
            <Button variant="destructive" onClick={() => blocker.proceed?.()}>Leave</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateOrder;
