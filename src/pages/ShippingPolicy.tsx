import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageSeo from "@/hooks/usePageSeo";

const ShippingPolicy = () => {
  usePageSeo({
    title: "Shipping & Delivery Policy | Max-IR Labs",
    description: "Max-IR Labs shipping terms, delivery timelines, export compliance, and international duties. FCA Dallas, Incoterms 2020.",
    canonicalPath: "/shipping-policy",
  });
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Shipping & Delivery Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective Date: March 25, 2026</p>

        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Delivery Timelines</h2>
            <p>Max-IR Labs will use reasonable endeavors to meet estimated delivery dates. Buyer acknowledges these dates are estimates; Seller is not liable for any damages (including research delays or business interruption) resulting from early or late delivery.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Commencement of Lead Time</h2>
            <p>Lead times commence only after all "Clearance Conditions" are met:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Receipt of full payment (or down payment as specified in the quote).</li>
              <li>Settlement of all technical specifications.</li>
              <li>Receipt of all required export documentation and end-user certificates.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Partial Shipments & Storage</h2>
            <p>Seller is authorized to make partial shipments, each invoiced separately. If a shipment is delayed at the Buyer's request, Seller may invoice immediately and charge for storage, insurance, and handling at the Buyer's expense.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Shipping Terms (FCA Dallas)</h2>
            <p>In accordance with FCA Dallas, Texas (Incoterms 2020):</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Transfer of Title:</strong> Title and risk of loss pass to the Buyer the moment the Product is handed to the first carrier.</li>
              <li><strong>Damage in Transit:</strong> Responsibility for loss or damage in transit lies with the Buyer. We strongly recommend that Buyers maintain adequate shipping insurance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Export Declarations & Compliance</h2>
            <p>Max-IR Labs complies with all U.S. Export Administration Regulations (EAR).</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Responsibility for Filing:</strong> Unless otherwise agreed in writing, the Buyer or the Buyer's designated freight forwarder shall be responsible for filing all required U.S. export declarations (including Automated Export System / AES entries).</li>
              <li><strong>Accuracy of Information:</strong> Seller will provide the necessary technical information (e.g., ECCN, HTS codes) to facilitate such filings. However, the Buyer warrants that all filings made by its agents will be accurate and in full compliance with U.S. law.</li>
              <li><strong>Indemnification:</strong> Buyer shall defend, indemnify, and hold Max-IR Labs harmless from any fines, penalties, or legal costs arising from the Buyer's (or its agent's) failure to file correctly or comply with U.S. export/import regulations.</li>
              <li><strong>Licensing:</strong> Some Products may require a specific U.S. export license. Buyer is responsible for providing all end-user information required to secure such licenses.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. International Duties & Taxes</h2>
            <p>Buyer is the "Importer of Record" and is solely responsible for all import duties, customs clearance fees, and local taxes.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicy;
