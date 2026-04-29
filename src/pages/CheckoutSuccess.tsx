import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, AlertTriangle, XCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { trackCommerce } from "@/lib/analytics-tracker";

type Status = "loading" | "paid" | "pending" | "failed" | "missing";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<Status>(sessionId ? "loading" : "missing");

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-checkout-session", {
          body: { sessionId },
        });
        if (cancelled) return;
        if (error || data?.error) {
          setStatus("failed");
          return;
        }
        if (data?.paymentStatus === "paid" || data?.paymentStatus === "no_payment_required") {
          trackCommerce("purchased", {
            order_id: data?.orderId,
            amount: typeof data?.amountTotal === "number" ? data.amountTotal / 100 : undefined,
          });
          clearCart();
          setStatus("paid");
        } else if (data?.status === "complete") {
          // Async payment method (e.g. bank debit) — payment confirmed later.
          trackCommerce("purchased", {
            order_id: data?.orderId,
            amount: typeof data?.amountTotal === "number" ? data.amountTotal / 100 : undefined,
          });
          clearCart();
          setStatus("pending");
        } else {
          setStatus("failed");
        }
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 py-20 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-primary mb-6 animate-spin" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground font-montserrat mb-2">
                Confirming your payment…
              </h1>
              <p className="text-muted-foreground">This usually takes just a moment.</p>
            </>
          )}

          {status === "paid" && (
            <>
              <CheckCircle2 className="w-20 h-20 mx-auto text-primary mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
                Thank you for your order!
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                Your payment was successful. You'll receive a confirmation email shortly, and our team
                will be in touch with any next steps.
              </p>
            </>
          )}

          {status === "pending" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto text-secondary mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
                Payment processing
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                Your order has been placed and your payment is being processed. We'll email you as
                soon as it's confirmed.
              </p>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="w-20 h-20 mx-auto text-destructive mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
                We couldn't confirm your payment
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                If you were charged, please contact us with the reference below and we'll sort it out.
              </p>
            </>
          )}

          {status === "missing" && (
            <>
              <AlertTriangle className="w-20 h-20 mx-auto text-secondary mb-6" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
                No order information
              </h1>
              <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
                We couldn't find a checkout session in this URL.
              </p>
            </>
          )}

          {sessionId && (
            <p className="text-xs text-muted-foreground mb-8 font-mono break-all">
              Reference: {sessionId}
            </p>
          )}
          <Link
            to="/#Products"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold transition-colors rounded-md"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
