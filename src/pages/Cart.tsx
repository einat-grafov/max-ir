import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [checkFinal, setCheckFinal] = useState(false);
  const [checkBundled, setCheckBundled] = useState(false);
  const [checkTerms, setCheckTerms] = useState(false);

  const allChecked = useMemo(
    () => checkFinal && checkBundled && checkTerms,
    [checkFinal, checkBundled, checkTerms]
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav className="pt-6 pb-8 text-sm text-muted-foreground">
            <Link to="/#Products" className="hover:text-foreground transition-colors">
              Our products
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-foreground">Cart</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-8">
            Your Cart
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <p className="text-lg text-muted-foreground mb-6">Your cart is empty</p>
              <Link
                to="/#Products"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold transition-colors rounded-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pb-20">
              {/* Items list */}
              <div className="lg:col-span-2">
                {/* Header row – desktop only */}
                <div className="hidden md:grid grid-cols-[1fr_120px_140px_100px_40px] gap-4 pb-3 border-b border-border text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Product</span>
                  <span className="text-right">Price</span>
                  <span className="text-center">Quantity</span>
                  <span className="text-right">Total</span>
                  <span />
                </div>

                <div className="divide-y divide-border">
                  {items.map((item) => {
                    const lineTotal = item.price * item.quantity;
                    const key = `${item.productId}-${item.variantName}`;
                    return (
                      <div
                        key={key}
                        className="py-5 grid grid-cols-1 md:grid-cols-[1fr_120px_140px_100px_40px] gap-4 items-center"
                      >
                        {/* Product info */}
                        <div className="min-w-0">
                          <Link
                            to={`/products/${item.productId}`}
                            className="text-sm font-semibold text-foreground hover:text-primary transition-colors"
                          >
                            {item.productName}
                          </Link>
                          {item.variantName !== item.productName && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.variantName}
                            </p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-muted-foreground font-mono mt-0.5">
                              {item.sku}
                            </p>
                          )}
                        </div>

                        {/* Price */}
                        <span className="text-sm text-foreground md:text-right">
                          <span className="md:hidden text-xs text-muted-foreground mr-1">Price:</span>
                          {formatPrice(item.price)}
                        </span>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-1.5 md:justify-center">
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantName, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-medium text-foreground w-10 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.variantName, item.quantity + 1)}
                            className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-sm font-bold text-foreground md:text-right">
                          <span className="md:hidden text-xs text-muted-foreground font-normal mr-1">Total:</span>
                          {formatPrice(lineTotal)}
                        </span>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.productId, item.variantName)}
                          className="w-8 h-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Cart actions */}
                <div className="flex items-center justify-between pt-6 flex-wrap gap-3">
                  <Link
                    to="/#Products"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                  <button
                    onClick={clearCart}
                    className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="border border-border rounded-lg p-6 sticky top-[90px]">
                  <h2 className="text-lg font-bold text-foreground font-montserrat mb-5">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                      <span className="text-foreground font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-foreground font-medium">Calculated later</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span className="text-foreground font-medium">Calculated later</span>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    <span className="font-semibold text-foreground">Sales tax:</span> Calculated at checkout for U.S. shipping addresses. Not charged for non-U.S. shipping
                  </p>

                  {/* Disclaimer checkboxes */}
                  <div className="mb-5 space-y-3 text-xs text-foreground">
                    <p className="font-semibold text-sm">I acknowledge and agree to the following:</p>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={checkFinal} onChange={() => setCheckFinal(!checkFinal)} className="mt-0.5 accent-primary" />
                      <span>I understand that this purchase is <strong>final and non-refundable</strong>.</span>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={checkBundled} onChange={() => setCheckBundled(!checkBundled)} className="mt-0.5 accent-primary" />
                      <span>I understand that all waveguides require a <strong>bundled ISMIR™ system</strong>, which includes:</span>
                    </label>

                    <div className="pl-6 space-y-1.5">
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>FTIR spectrometer,</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>ISMIR™ Flow module, and</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>ISMIR™ waveguides</span>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={checkTerms} onChange={() => setCheckTerms(!checkTerms)} className="mt-0.5 accent-primary" />
                      <span>By proceeding with this order, I confirm that I have read and accepted these terms</span>
                    </label>
                  </div>

                  <button
                    onClick={() => toast.info("Stripe checkout coming soon!")}
                    disabled={!allChecked}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Check out
                  </button>

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Our team will contact you with a final quote including shipping and applicable taxes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
