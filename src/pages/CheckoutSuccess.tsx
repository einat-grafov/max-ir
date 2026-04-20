import { useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/contexts/CartContext";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 py-20 text-center">
          <CheckCircle2 className="w-20 h-20 mx-auto text-primary mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
            Thank you for your order!
          </h1>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            Your payment was successful. Our team will be in touch shortly with confirmation details and any next steps.
          </p>
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
