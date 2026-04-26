import LegalPage from "@/components/LegalPage";

const RefundAndReturn = () => (
  <LegalPage
    page="refund-and-return"
    seo={{
      title: "Refund & Return Policy | Max-IR Labs",
      description:
        "Max-IR Labs refund and return policy for optical products. Learn about RMA process, restocking fees, and eligibility.",
      canonicalPath: "/refund-and-return",
    }}
    fallback={{
      layout: "legal_document",
      title: "Refund & Return Policy",
      effective_date: "Effective Date: March 25, 2026",
      intro:
        "Max-IR Labs is committed to providing high-performance optical solutions. We understand that technical requirements may change, and we strive to make our return process as transparent as possible for our global customers.",
      sections: [
        { heading: "1. Return Authorization (RMA)", body: '<p>No returns will be accepted without a Return Material Authorization (RMA) number.</p><ul><li><strong>To Request:</strong> Contact <a href="mailto:sales@max-ir-labs.com">sales@max-ir-labs.com</a> with your original Purchase Order or Sales Order number as proof of purchase.</li><li><strong>Deadline:</strong> Approved RMA numbers are valid for 30 days from the date of issue. Products must be received at our Dallas facility within this window.</li><li><strong>Labeling:</strong> The RMA number must be clearly marked on the outside of the shipping package for immediate identification.</li></ul>' },
        { heading: "2. Standard Products & Consumables", body: "<p>Standard catalog items are eligible for a refund within 30 days of purchase, subject to the following technical requirements:</p><ul><li><strong>Sealed Condition:</strong> Products must be returned unopened, in their original vacuum-sealed or protective packaging, with all paperwork intact.</li><li><strong>Opened Items:</strong> Due to the risk of environmental degradation and contamination, returns are not accepted for any optical components or consumables once the protective packaging has been opened.</li><li><strong>Restocking Fee:</strong> Approved returns for credit may be subject to a 15% restocking fee to cover technical inspection and re-certification.</li></ul>" },
        { heading: "3. Custom and Special Orders", body: '<p><strong>Final Sale:</strong> Any custom-configured products, modified items, or "specials" built to Buyer specifications are not eligible for return or refund.</p><p><strong>Warranty:</strong> These items are covered strictly under the repair/replacement terms found in our Terms & Conditions.</p>' },
        { heading: "4. Health and Safety Restrictions", body: "<p><strong>Strict Non-Return Policy:</strong> Any products that have come into contact with biological specimens, radioactive materials, or hazardous chemicals cannot be returned under any circumstances. Customers may be required to sign a decontamination declaration before an RMA is issued for equipment that has been utilized in a laboratory environment.</p>" },
        { heading: "5. Shipping and Costs", body: "<ul><li><strong>Responsibility:</strong> The Buyer is responsible for all return shipping charges, including international customs, duties, and insurance.</li><li><strong>Risk:</strong> Risk of loss for returned items remains with the Buyer until the package is physically received and signed for by Max-IR Labs.</li></ul>" },
        { heading: "6. Processing", body: "<p>Refunds are processed to the original payment method within 10 business days of receipt and successful technical inspection.</p>" },
      ],
    }}
  />
);

export default RefundAndReturn;
