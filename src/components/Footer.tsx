import { Link, useLocation } from "react-router-dom";
import ContactForm from "./ContactForm";
import CookieFooterLinks from "@/components/cookies/CookieFooterLinks";

const Footer = () => {
  const location = useLocation();
  const hideContactForm = location.pathname === "/customer-service";

  return (
    <footer id="Contact" className="section-dark relative mt-[120px] md:mt-[180px]" style={{ backgroundImage: 'url(/images/footer-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>
      {/* Wave divider at top */}
      <div className="absolute top-0 left-0 right-0 z-10 h-[120px] md:h-[180px] -translate-y-[calc(100%-1px)]">
        <svg
          viewBox="0 0 1440 180"
          preserveAspectRatio="none"
          className="absolute bottom-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,108 C200,140 400,162 600,154 C800,146 950,52 1100,44 C1250,36 1380,68 1440,92 L1440,180 L0,180 Z"
            fill="#000000"
          />
        </svg>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className={`grid grid-cols-1 ${hideContactForm ? "" : "lg:grid-cols-2"} gap-16`}>
          {/* Left - Links & Address */}
          <div>
            <div className="grid grid-cols-3 gap-8 mb-12">
              <div className="flex flex-col gap-3">
                <h4 className="text-maxir-white text-[18px] leading-[25px] font-bold mb-1">Products</h4>
                <Link to="/" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Home</Link>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-maxir-white text-[18px] leading-[25px] font-bold mb-1">About Us</h4>
                <Link to="/about-us#Technology" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Technology</Link>
                <Link to="/about-us#Sensor" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">The Sensor</Link>
                <Link to="/about-us#Applications" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Applications</Link>
                <Link to="/about-us#Awards" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Awards & Patents</Link>
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-maxir-white text-[18px] leading-[25px] font-bold mb-1">Team</h4>
                <Link to="/team#OurStory" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Our Story</Link>
                <Link to="/team#OurTeam" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Our Team</Link>
                <Link to="/team#AdvisoryBoard" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Advisory Board</Link>
                <Link to="/team#Publications" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Publications</Link>
                <Link to="/team#FCOI" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">FCOI</Link>
                <Link to="/team#Careers" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Careers</Link>
              </div>
            </div>
            <div className="text-maxir-white text-[14px] leading-[20px] font-normal">
              <p className="mb-1">Max-IR Labs, Inc.</p>
              <p>17217 Waterview Parkway</p>
              <p>Suite 1.202</p>
              <p>Dallas TX 75252,</p>
              <p>+1-214-228-7213</p>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <Link to="/privacy-policy" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Privacy Policy</Link>
              <Link to="/refund-and-return" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Refund & Return</Link>
              <Link to="/shipping-policy" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Shipping Policy</Link>
              <Link to="/terms-and-conditions" className="text-maxir-white hover:text-primary transition-colors text-[14px] leading-[20px] font-normal">Terms & Conditions</Link>
              <CookieFooterLinks />
            </div>
            <div className="h-[2px] bg-primary mt-8 mb-4" />
            <p className="text-maxir-white text-[14px] leading-[20px] font-normal">© {new Date().getFullYear()} MaxIR Labs. All rights reserved.</p>
          </div>

          {/* Right - Contact Form */}
          {!hideContactForm && (
            <div>
              <p className="text-maxir-white text-sm mb-6">For more information, please fill out the form and we will reply promptly:</p>
              <ContactForm />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
