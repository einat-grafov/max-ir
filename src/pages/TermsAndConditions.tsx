import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Terms & Conditions of Sale</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective Date: March 25, 2026</p>

        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p>All sales by Max-IR Labs ("Seller") to any person or entity ("Buyer") are governed exclusively by these Terms and Conditions. Any additional or different terms proposed by Buyer in a purchase order are hereby rejected.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Pricing and Payment</h2>
            <p>Proposals are valid for 30 days. For direct online sales, payment is due at checkout. For quote-based sales, payment terms are as specified in the individual quote; if no terms are specified, payment is due within thirty (30) days from the date of invoice. Seller reserves the right to require 100% prepayment (Cash in Advance) for any order. Late payments are subject to a 1.5% monthly charge plus collection costs and reasonable attorney fees.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Delivery (FCA)</h2>
            <p>All Products are delivered FCA Seller's Facility (Incoterms 2020). Title and risk of loss pass to Buyer upon delivery to the carrier. Delivery dates are estimates; Seller is not liable for shipping delays.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Limited Warranty & Consumables</h2>
            <p>Seller warrants Products will meet published specifications at shipment. Warranty does not apply to parts consumed in normal operation (e.g., used waveguides) or products subjected to misuse, neglect, or improper storage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Limitation of Liability</h2>
            <p className="uppercase text-sm">Seller's total liability shall not exceed the purchase price paid for the product. In no event shall seller be liable for loss of profits, data, or any consequential or incidental damages. Any legal action arising from a transaction must be commenced within one (1) year from the date of the alleged loss.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property & Reverse Engineering</h2>
            <p>Seller retains all rights to patents, designs, and trade secrets. Buyer shall not copy, adapt, or reverse engineer any Product or software provided by Seller.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Export & Regulatory Compliance</h2>
            <p>Buyer must comply with U.S. Export Administration Regulations. Seller makes no representation that Products conform to local ordinances or environmental regulations in the Buyer's jurisdiction; compliance and any associated environmental costs are the sole responsibility of the Buyer.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">8. Returns & Cancellation</h2>
            <p>Custom or modified orders cannot be canceled. Standard returns require a Return Material Authorization (RMA) number. Buyer is responsible for return shipping costs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">9. Governing Law</h2>
            <p>This agreement is governed by the laws of the State of Texas. Any disputes shall be resolved exclusively in the courts of Dallas County, Texas. The UN Convention on Contracts for the International Sale of Goods is expressly excluded.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">10. Force Majeure</h2>
            <p>Seller is not liable for failures to perform caused by events beyond its reasonable control, including natural disasters, supply chain shortages, or government actions.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsAndConditions;
