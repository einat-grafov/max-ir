import LegalPage from "@/components/LegalPage";

const TermsAndConditions = () => (
  <LegalPage
    page="terms-and-conditions"
    seo={{
      title: "Terms & Conditions | Max-IR Labs",
      description:
        "Terms and conditions of sale for Max-IR Labs products. Covers pricing, warranty, liability, export compliance, and governing law.",
      canonicalPath: "/terms-and-conditions",
    }}
    fallback={{
      layout: "legal_document",
      title: "Terms & Conditions of Sale",
      effective_date: "Effective Date: March 25, 2026",
      intro: "",
      sections: [
        { heading: "1. Acceptance of Terms", body: '<p>All sales by Max-IR Labs ("Seller") to any person or entity ("Buyer") are governed exclusively by these Terms and Conditions. Any additional or different terms proposed by Buyer in a purchase order are hereby rejected.</p>' },
        { heading: "2. Pricing and Payment", body: "<p>Proposals are valid for 30 days. For direct online sales, payment is due at checkout. For quote-based sales, payment terms are as specified in the individual quote; if no terms are specified, payment is due within thirty (30) days from the date of invoice. Seller reserves the right to require 100% prepayment (Cash in Advance) for any order. Late payments are subject to a 1.5% monthly charge plus collection costs and reasonable attorney fees.</p>" },
        { heading: "3. Delivery (FCA)", body: "<p>All Products are delivered FCA Seller's Facility (Incoterms 2020). Title and risk of loss pass to Buyer upon delivery to the carrier. Delivery dates are estimates; Seller is not liable for shipping delays.</p>" },
        { heading: "4. Limited Warranty & Consumables", body: "<p>Seller warrants Products will meet published specifications at shipment. Warranty does not apply to parts consumed in normal operation (e.g., used waveguides) or products subjected to misuse, neglect, or improper storage.</p>" },
        { heading: "5. Limitation of Liability", body: '<p class="uppercase">Seller\'s total liability shall not exceed the purchase price paid for the product. In no event shall seller be liable for loss of profits, data, or any consequential or incidental damages. Any legal action arising from a transaction must be commenced within one (1) year from the date of the alleged loss.</p>' },
        { heading: "6. Intellectual Property & Reverse Engineering", body: "<p>Seller retains all rights to patents, designs, and trade secrets. Buyer shall not copy, adapt, or reverse engineer any Product or software provided by Seller.</p>" },
        { heading: "7. Export & Regulatory Compliance", body: "<p>Buyer must comply with U.S. Export Administration Regulations. Seller makes no representation that Products conform to local ordinances or environmental regulations in the Buyer's jurisdiction; compliance and any associated environmental costs are the sole responsibility of the Buyer.</p>" },
        { heading: "8. Returns & Cancellation", body: "<p>Custom or modified orders cannot be canceled. Standard returns require a Return Material Authorization (RMA) number. Buyer is responsible for return shipping costs.</p>" },
        { heading: "9. Governing Law", body: "<p>This agreement is governed by the laws of the State of Texas. Any disputes shall be resolved exclusively in the courts of Dallas County, Texas. The UN Convention on Contracts for the International Sale of Goods is expressly excluded.</p>" },
        { heading: "10. Force Majeure", body: "<p>Seller is not liable for failures to perform caused by events beyond its reasonable control, including natural disasters, supply chain shortages, or government actions.</p>" },
      ],
    }}
  />
);

export default TermsAndConditions;
