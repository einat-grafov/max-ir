import { Link } from "react-router-dom";
import ContactForm from "./ContactForm";

const Footer = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

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
            d="M0,90 C200,130 400,170 600,160 C800,150 950,20 1100,10 C1250,0 1380,40 1440,70 L1440,180 L0,180 Z"
            fill="#000000"
          />
        </svg>
      </div>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left - Links & Address */}
          <div>
            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col gap-3">
                <Link to="/" className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors">Home</Link>
                <button onClick={() => scrollTo("Technology")} className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors text-left">Technology</button>
                <button onClick={() => scrollTo("Sensor")} className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors text-left">The Sensor</button>
              </div>
              <div className="flex flex-col gap-3">
                <button onClick={() => scrollTo("Applications")} className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors text-left">Applications</button>
                <button onClick={() => scrollTo("Awards")} className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors text-left">Awards & Patents</button>
                <Link to="/team" className="text-maxir-white/80 hover:text-maxir-white text-sm transition-colors">The Team</Link>
              </div>
            </div>
            <div className="text-maxir-white/60 text-sm leading-relaxed">
              <p className="font-semibold text-maxir-white mb-2">Max-IR Labs, Inc.</p>
              <p>17217 Waterview Parkway</p>
              <p>Suite 1.202</p>
              <p>Dallas TX 75252,</p>
              <p className="mt-2">+1-214-228-7213</p>
            </div>
            <p className="text-maxir-white/40 text-xs mt-8">© 2020 MaxIR Labs. All rights reserved.</p>
          </div>

          {/* Right - Contact Form */}
          <div>
            <p className="text-maxir-white/80 text-sm mb-6">For more information, please fill out the form and we will reply promptly:</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
