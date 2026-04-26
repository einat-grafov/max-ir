import LegalPage from "@/components/LegalPage";

const ShippingPolicy = () => (
  <LegalPage
    page="shipping-policy"
    seo={{
      title: "Shipping & Delivery Policy | Max-IR Labs",
      description:
        "Max-IR Labs shipping terms, delivery timelines, export compliance, and international duties. FCA Dallas, Incoterms 2020.",
      canonicalPath: "/shipping-policy",
    }}
    fallback={{
      layout: "legal_document",
      title: "Shipping & Delivery Policy",
      effective_date: "Effective Date: March 25, 2026",
      intro: "",
      sections: [
        { heading: "1. Delivery Timelines", body: "<p>Max-IR Labs will use reasonable endeavors to meet estimated delivery dates. Buyer acknowledges these dates are estimates; Seller is not liable for any damages (including research delays or business interruption) resulting from early or late delivery.</p>" },
        { heading: "2. Commencement of Lead Time", body: '<p>Lead times commence only after all "Clearance Conditions" are met:</p><ul><li>Receipt of full payment (or down payment as specified in the quote).</li><li>Settlement of all technical specifications.</li><li>Receipt of all required export documentation and end-user certificates.</li></ul>' },
        { heading: "3. Partial Shipments & Storage", body: "<p>Seller is authorized to make partial shipments, each invoiced separately. If a shipment is delayed at the Buyer's request, Seller may invoice immediately and charge for storage, insurance, and handling at the Buyer's expense.</p>" },
        { heading: "4. Shipping Terms (FCA Dallas)", body: "<p>In accordance with FCA Dallas, Texas (Incoterms 2020):</p><ul><li><strong>Transfer of Title:</strong> Title and risk of loss pass to the Buyer the moment the Product is handed to the first carrier.</li><li><strong>Damage in Transit:</strong> Responsibility for loss or damage in transit lies with the Buyer. We strongly recommend that Buyers maintain adequate shipping insurance.</li></ul>" },
        { heading: "5. Export Declarations & Compliance", body: "<p>Max-IR Labs complies with all U.S. Export Administration Regulations (EAR).</p><ul><li><strong>Responsibility for Filing:</strong> Unless otherwise agreed in writing, the Buyer or the Buyer's designated freight forwarder shall be responsible for filing all required U.S. export declarations (including Automated Export System / AES entries).</li><li><strong>Accuracy of Information:</strong> Seller will provide the necessary technical information (e.g., ECCN, HTS codes) to facilitate such filings. However, the Buyer warrants that all filings made by its agents will be accurate and in full compliance with U.S. law.</li><li><strong>Indemnification:</strong> Buyer shall defend, indemnify, and hold Max-IR Labs harmless from any fines, penalties, or legal costs arising from the Buyer's (or its agent's) failure to file correctly or comply with U.S. export/import regulations.</li><li><strong>Licensing:</strong> Some Products may require a specific U.S. export license. Buyer is responsible for providing all end-user information required to secure such licenses.</li></ul>" },
        { heading: "6. International Duties & Taxes", body: '<p>Buyer is the "Importer of Record" and is solely responsible for all import duties, customs clearance fees, and local taxes.</p>' },
      ],
    }}
  />
);

export default ShippingPolicy;
