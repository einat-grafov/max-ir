import { Link } from "react-router-dom";
import ContactForm from "./ContactForm";

const Footer = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer id="Contact" className="section-dark relative" style={{ backgroundImage: 'url(/images/footer-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom' }}>
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
