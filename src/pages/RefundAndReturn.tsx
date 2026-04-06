import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundAndReturn = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Refund & Return Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective Date: March 25, 2026</p>

        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-8">
          <p>
            Max-IR Labs is committed to providing high-performance optical solutions. We understand that technical requirements may change, and we strive to make our return process as transparent as possible for our global customers.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Return Authorization (RMA)</h2>
            <p>No returns will be accepted without a Return Material Authorization (RMA) number.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>To Request:</strong> Contact <a href="mailto:sales@max-ir-labs.com" className="text-primary hover:underline">sales@max-ir-labs.com</a> with your original Purchase Order or Sales Order number as proof of purchase.</li>
              <li><strong>Deadline:</strong> Approved RMA numbers are valid for 30 days from the date of issue. Products must be received at our Dallas facility within this window.</li>
              <li><strong>Labeling:</strong> The RMA number must be clearly marked on the outside of the shipping package for immediate identification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">2. Standard Products & Consumables</h2>
            <p>Standard catalog items are eligible for a refund within 30 days of purchase, subject to the following technical requirements:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Sealed Condition:</strong> Products must be returned unopened, in their original vacuum-sealed or protective packaging, with all paperwork intact.</li>
              <li><strong>Opened Items:</strong> Due to the risk of environmental degradation and contamination, returns are not accepted for any optical components or consumables once the protective packaging has been opened.</li>
              <li><strong>Restocking Fee:</strong> Approved returns for credit may be subject to a 15% restocking fee to cover technical inspection and re-certification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. Custom and Special Orders</h2>
            <p><strong>Final Sale:</strong> Any custom-configured products, modified items, or "specials" built to Buyer specifications are not eligible for return or refund.</p>
            <p><strong>Warranty:</strong> These items are covered strictly under the repair/replacement terms found in our Terms & Conditions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Health and Safety Restrictions</h2>
            <p><strong>Strict Non-Return Policy:</strong> Any products that have come into contact with biological specimens, radioactive materials, or hazardous chemicals cannot be returned under any circumstances. Customers may be required to sign a decontamination declaration before an RMA is issued for equipment that has been utilized in a laboratory environment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Shipping and Costs</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Responsibility:</strong> The Buyer is responsible for all return shipping charges, including international customs, duties, and insurance.</li>
              <li><strong>Risk:</strong> Risk of loss for returned items remains with the Buyer until the package is physically received and signed for by Max-IR Labs.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Processing</h2>
            <p>Refunds are processed to the original payment method within 10 business days of receipt and successful technical inspection.</p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RefundAndReturn;
