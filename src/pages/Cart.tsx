import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { Minus, Plus, Trash2, ShoppingCart, ArrowLeft, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/countries";
import { useShippingRates, type ShippingRate } from "@/hooks/useShippingRates";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckoutInline } from "@/components/StripeEmbeddedCheckout";

const Cart = () => {
  const { items, updateQuantity, removeItem, clearCart, totalItems, totalPrice } = useCart();
  const [checkFinal, setCheckFinal] = useState(false);
  const [checkBundled, setCheckBundled] = useState(false);
  const [checkTerms, setCheckTerms] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerEmail, setCustomerEmail] = useState("");

  // Shipping address state
  const [shipCountry, setShipCountry] = useState("US");
  const [shipPostal, setShipPostal] = useState("");
  const [shipCity, setShipCity] = useState("");
  const [shipState, setShipState] = useState("");
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);

  const { rates, loading: ratesLoading, error: ratesError, fetchRates } = useShippingRates();

  // Look up Stripe price IDs for the products in the cart
  const productIds = useMemo(() => Array.from(new Set(items.map((i) => i.productId))), [items]);
  const { data: priceMap } = useQuery({
    queryKey: ["cart-stripe-prices", productIds],
    enabled: productIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, stripe_price_id")
        .in("id", productIds);
      if (error) throw error;
      const map: Record<string, string | null> = {};
      for (const row of data ?? []) {
        map[row.id as string] = (row as { stripe_price_id: string | null }).stripe_price_id;
      }
      return map;
    },
  });
                  {/* Email capture */}
                  <div className="mb-5">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Email *</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">We'll send your order confirmation here.</p>
                  </div>


  const handleFetchRates = () => {
    if (!shipPostal) {
      toast.error("Please enter a postal code");
      return;
    }
    setSelectedRate(null);
    fetchRates(
      { postalCode: shipPostal, country: shipCountry, city: shipCity || undefined, state: shipState || undefined },
      [{ weight: 1 }]
    );
  };

  const shippingCost = selectedRate?.price ?? 0;
  const orderTotal = totalPrice + shippingCost;

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);

  const allChecked = useMemo(
    () => checkFinal && checkBundled && checkTerms && selectedRate !== null && isValidEmail,
    [checkFinal, checkBundled, checkTerms, selectedRate, isValidEmail]
  );

  const handleCheckout = () => {
    if (!selectedRate) {
      toast.error("Please select a shipping option");
      return;
    }
    if (!isValidEmail) {
      toast.error("Please enter a valid email address");
      return;
    }
    const missing = items.find((i) => !priceMap?.[i.productId]);
    if (missing) {
      toast.error(`"${missing.productName}" is not available for online checkout. Please contact us for a quote.`);
      return;
    }
    setShowCheckout(true);
  };

  const checkoutItems = useMemo(
    () =>
      items.map((i) => ({
        ...i,
        stripePriceId: priceMap?.[i.productId] ?? "",
      })),
    [items, priceMap],
  );

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
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
                      <span className="text-foreground font-medium">
                        {selectedRate ? formatPrice(shippingCost) : "Select below"}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span className="text-foreground font-medium">Calculated later</span>
                    </div>
                  </div>

                  <div className="border-t border-border my-5" />

                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-base font-bold text-foreground">Total</span>
                    <span className="text-xl font-bold text-foreground">{formatPrice(orderTotal)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    <span className="font-semibold text-foreground">Sales tax:</span> Calculated automatically at checkout based on your billing address.
                  </p>

                  {/* Shipping address */}
                  <div className="mb-5 border border-border rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Shipping Address
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Country</label>
                        <select
                          value={shipCountry}
                          onChange={(e) => { setShipCountry(e.target.value); setSelectedRate(null); }}
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Postal Code *</label>
                          <input
                            value={shipPostal}
                            onChange={(e) => { setShipPostal(e.target.value); setSelectedRate(null); }}
                            placeholder="e.g. 10001"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">City</label>
                          <input
                            value={shipCity}
                            onChange={(e) => setShipCity(e.target.value)}
                            placeholder="Optional"
                            className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">State / Province</label>
                        <input
                          value={shipState}
                          onChange={(e) => setShipState(e.target.value)}
                          placeholder="Optional"
                          className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <button
                        onClick={handleFetchRates}
                        disabled={ratesLoading || !shipPostal}
                        className="w-full bg-muted hover:bg-muted/80 text-foreground py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {ratesLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Calculating…
                          </>
                        ) : (
                          "Calculate Shipping"
                        )}
                      </button>
                      {ratesError && (
                        <p className="text-xs text-destructive">{ratesError}</p>
                      )}
                      {rates.length > 0 && (
                        <div className="space-y-1.5 mt-2">
                          {rates.map((rate, i) => (
                            <label
                              key={`${rate.carrier}-${rate.service}-${i}`}
                              className={`flex items-center gap-2 p-2.5 rounded-md border cursor-pointer transition-colors text-sm ${
                                selectedRate?.carrier === rate.carrier && selectedRate?.service === rate.service
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:bg-muted/50"
                              }`}
                            >
                              <input
                                type="radio"
                                name="cart-shipping"
                                checked={selectedRate?.carrier === rate.carrier && selectedRate?.service === rate.service}
                                onChange={() => setSelectedRate(rate)}
                                className="accent-primary"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground">{rate.carrier}</span>
                                <span className="text-muted-foreground"> — {rate.service}</span>
                                {rate.transitDays != null && (
                                  <span className="text-muted-foreground text-xs ml-1">
                                    ({rate.transitDays}d)
                                  </span>
                                )}
                              </div>
                              <span className="font-semibold text-foreground shrink-0">
                                {formatPrice(rate.price)}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

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

                  {showCheckout ? (
                    <div className="border-t border-border pt-5 -mx-6 px-6 -mb-6 pb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-foreground">Payment</h3>
                        <button
                          onClick={() => setShowCheckout(false)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                      <StripeEmbeddedCheckoutInline
                        items={checkoutItems}
                        shippingRate={selectedRate!}
                        shippingAddress={{
                          postalCode: shipPostal,
                          country: shipCountry,
                          city: shipCity || undefined,
                          state: shipState || undefined,
                        }}
                        customerEmail={customerEmail}
                        returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
                      />
                    </div>
                  ) : (
                    <button
                      onClick={handleCheckout}
                      disabled={!allChecked}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Check out
                    </button>
                  )}

                  <p className="text-xs text-muted-foreground text-center mt-3">
                    Our team will contact you with a final quote including applicable taxes.
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
