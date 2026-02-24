import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Search, X, Package, ChevronUp, ChevronDown, Pen, Link2, Info } from "lucide-react";
import ProductSearchModal from "@/components/admin/ProductSearchModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
  const [browseModalOpen, setBrowseModalOpen] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [tempNotes, setTempNotes] = useState("");

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
  const tax = Math.round(subtotal * 0.18 * 100) / 100;
  const total = subtotal + tax;

  const fmt = (n: number) => "₪" + n.toLocaleString("en-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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
            <BreadcrumbPage>Create order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-2xl font-bold text-foreground mb-6">Create order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Products */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">Products</h2>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" onClick={() => setBrowseModalOpen(true)}>Browse</Button>
              <Button variant="outline">Add custom item</Button>
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
                <span className="text-primary cursor-pointer hover:underline">Add discount</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-right text-foreground">₪0.00</span>
              </div>
              <div className="grid grid-cols-3 gap-4 px-4 py-3 text-sm">
                <span className="text-primary cursor-pointer hover:underline">Add shipping or delivery</span>
                <span className="text-muted-foreground">—</span>
                <span className="text-right text-foreground">₪0.00</span>
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
                  <p className="text-sm text-muted-foreground mt-2">
                    To comment on a draft order or mention a staff member, use Timeline instead
                  </p>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setNotesModalOpen(false)}>Cancel</Button>
                  <Button onClick={() => { setNotes(tempNotes); setNotesModalOpen(false); }}>Done</Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          {/* Customer */}
          <Card className="p-5">
            <h2 className="text-base font-semibold text-foreground mb-3">Customer</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search or create a customer" className="pl-9" />
            </div>
          </Card>

          {/* Markets */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Markets</h2>
              <button className="text-muted-foreground hover:text-foreground">
                <Link2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-border text-sm text-foreground">
                🌐 Israel
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1.5">Currency</p>
              <Select defaultValue="ils">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ils">Israeli New Shekel (ILS ₪)</SelectItem>
                  <SelectItem value="usd">US Dollar (USD $)</SelectItem>
                  <SelectItem value="eur">Euro (EUR €)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-foreground">Tags</h2>
              <button className="text-muted-foreground hover:text-foreground">
                <Pen className="h-4 w-4" />
              </button>
            </div>
            <Input placeholder="" className="h-9" />
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
        <Button variant="outline">Send invoice</Button>
        <Button>Create order</Button>
      </div>
    </div>
  );
};

export default CreateOrder;
