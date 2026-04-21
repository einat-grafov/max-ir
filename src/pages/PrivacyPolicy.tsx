import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import usePageSeo from "@/hooks/usePageSeo";

const PrivacyPolicy = () => {
  usePageSeo({
    title: "Privacy Policy | Max-IR Labs",
    description: "Learn how Max-IR Labs collects, uses, and protects your personal information. Read our full privacy policy.",
    canonicalPath: "/privacy-policy",
  });
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 lg:px-10 py-24 lg:py-32">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy — Max-IR Labs</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective Date: March 25, 2026 · Last Updated: April 21, 2026</p>

        <div className="prose prose-neutral max-w-none text-foreground/90 space-y-8">
          <p>
            Max-IR Labs ("we," "us," or "our"), incorporated in Texas, USA, is committed to protecting the privacy of users of our website. This Privacy Statement applies to our online services and describes the information we collect about users and how that information may be used to facilitate the purchase of products, provide requested technical information, or fulfill service requests.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-foreground">1. Information Collection</h2>
            <p>We collect two types of information to provide our services:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personally Identifiable Information (PII):</strong> This includes information you voluntarily provide, such as your name, email address, professional affiliation, shipping/billing address, and phone number when placing an order or requesting a quote.</li>
              <li><strong>Aggregate Information:</strong> This is non-identifying, anonymous data (such as IP addresses, browser types, and page visit frequency) automatically logged by our website hosting and payment platforms (e.g., Squarespace, Stripe). This data is used in a collective manner to analyze site performance and cannot be used to identify you individually.</li>
            </ul>
          </section>

          <section id="cookies">
            <h2 className="text-xl font-semibold text-foreground">2. Cookies and Similar Technologies</h2>
            <p>
              This section describes the cookies and similar device-storage technologies (such as localStorage) used on this website, and how you can manage them. You can change your choices at any time by clicking "Cookie Settings" in the footer.
            </p>
            <h3 className="text-lg font-semibold text-foreground mt-6">2.1 Categories of cookies we use</h3>
            <p><strong>Strictly Necessary (always active).</strong> These cookies are required for core functionality — authentication, shopping cart, secure checkout, and remembering your cookie choices. The site cannot function without them, and they do not require consent under applicable law.</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Authentication (Supabase):</strong> <code>sb-access-token</code>, <code>sb-refresh-token</code> — keep you signed in during a session.</li>
              <li><strong>Shopping cart (Max-IR Labs):</strong> <code>cart_state</code> — remembers items in your cart.</li>
              <li><strong>Checkout security (Stripe):</strong> <code>__stripe_mid</code>, <code>__stripe_sid</code> — fraud prevention during payment.</li>
              <li><strong>Consent preferences (Max-IR Labs):</strong> <code>consent_state</code> — remembers the cookie choices you have made.</li>
            </ul>
            <p className="mt-4"><strong>Functional, Analytics, and Advertising cookies.</strong> We do not currently use any functional, analytics, or advertising cookies. If this changes in the future, those cookies will only be set after you have given explicit consent through the cookie settings. You can review the current list of cookies by category at any time via "Cookie Settings".</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">2.2 Your choices</h3>
            <p>On your first visit from the EU, UK, or European Economic Area, a cookie banner lets you accept, reject, or customize non-essential cookies. Visitors from other regions can manage the same choices at any time via the "Cookie Settings" link in the footer. You can also control cookies through your browser settings, though disabling strictly necessary cookies may prevent parts of the site (such as the shopping cart or sign-in) from working.</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">2.3 California residents</h3>
            <p>If you are a California resident, you have the right to opt out of the "sale" or "sharing" of your personal information under the CCPA/CPRA. We currently do not sell or share personal information for cross-context behavioral advertising. If this changes, you will be able to exercise this right via the "Do Not Sell or Share My Personal Information" link in the footer, and we will honor browser-level Global Privacy Control (GPC) signals as valid opt-out requests.</p>
            <h3 className="text-lg font-semibold text-foreground mt-6">2.4 Retention of consent records</h3>
            <p>When you make a cookie choice, we log a record consisting of a timestamp, the choices you made, and the version of this policy in effect at that time. This record is kept to demonstrate compliance with data protection law, as required by GDPR Article 7(1). Your consent is valid for 12 months, after which we will ask you again.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">3. How We Use Your Information</h2>
            <p>We use your data strictly for business-related purposes, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Fulfilling and shipping orders for our products.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">4. Onward Transfer to Third Parties</h2>
            <p>Max-IR Labs does not sell, rent, or lease your personal information. We only share data with essential third-party service providers to complete your transactions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Shipping Carriers:</strong> (e.g., FedEx, UPS) to deliver products to your location.</li>
              <li><strong>Payment Processors:</strong> (e.g., Stripe, Square) to securely handle credit card data.</li>
              <li><strong>Compliance:</strong> We may disclose information to government officials if required by legal obligations, including subpoenas, court orders, or to meet national security and export control requirements.</li>
            </ul>
            <p>These third parties are prohibited from using your information for any purpose other than providing these specific services to Max-IR Labs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">5. Data Security</h2>
            <p>We implement physical, electronic, and managerial procedures to safeguard your information. All sensitive transaction data is encrypted during transfer. While we take commercially reasonable efforts to secure your data, please be aware that no transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">6. Your Rights & Access</h2>
            <p>Regardless of your global location, you have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Request the correction of inaccurate information.</li>
              <li>Request the deletion of your data, subject to our legal requirements for tax and trade record retention.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">7. Contact Us</h2>
            <p>For questions regarding this Privacy Policy or to exercise your data rights, please contact:</p>
            <address className="not-italic">
              <p>Max-IR Labs</p>
              <p>17217 Waterview Pkwy</p>
              <p>Suite 1.202</p>
              <p>Dallas, TX, 75252</p>
              <p>Email: <a href="mailto:privacy@max-ir-labs.com" className="text-primary hover:underline">privacy@max-ir-labs.com</a></p>
            </address>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
