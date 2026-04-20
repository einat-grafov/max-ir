import { Link } from "react-router-dom";
import { XCircle, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const CheckoutCancel = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[70px]">
        <div className="max-w-[800px] mx-auto px-6 lg:px-10 py-20 text-center">
          <XCircle className="w-20 h-20 mx-auto text-muted-foreground mb-6" />
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-montserrat mb-4">
            Checkout cancelled
          </h1>
          <p className="text-base text-muted-foreground mb-8 max-w-md mx-auto">
            Your payment was not processed. Your cart is still saved — you can return and complete your purchase whenever you're ready.
          </p>
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-sm font-semibold transition-colors rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Cart
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutCancel;
