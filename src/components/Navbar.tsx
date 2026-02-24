import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === "/";

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-maxir-dark/90 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[70px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M5 35L20 5L25 15L15 35H5Z" fill="hsl(348,100%,61%)" />
            <path d="M15 35L25 15L35 35H15Z" fill="hsl(348,100%,61%)" opacity="0.7" />
          </svg>
          <span className="text-maxir-white font-bold text-lg tracking-wide">
            MAX-IR <span className="font-light">LABS</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-6">
            <button onClick={() => scrollTo("Technology")} className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Technology</button>
            <button onClick={() => scrollTo("Sensor")} className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">The Sensor</button>
            <button onClick={() => scrollTo("Applications")} className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Applications</button>
            <button onClick={() => scrollTo("Awards")} className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Awards & Patents</button>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/team" className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Team</Link>
            <Link to="/team#Publications" className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Publications</Link>
            <Link to="/team#FCOI" className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">FCOI</Link>
            <button onClick={() => scrollTo("Contact")} className="text-maxir-white/80 hover:text-maxir-white text-sm font-medium transition-colors">Careers</button>
            <button
              onClick={() => scrollTo("Contact")}
              className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-maxir-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-maxir-dark border-t border-maxir-white/10 px-6 pb-6 pt-4 flex flex-col gap-4">
          <button onClick={() => scrollTo("Technology")} className="text-maxir-white/80 text-left text-sm">Technology</button>
          <button onClick={() => scrollTo("Sensor")} className="text-maxir-white/80 text-left text-sm">The Sensor</button>
          <button onClick={() => scrollTo("Applications")} className="text-maxir-white/80 text-left text-sm">Applications</button>
          <button onClick={() => scrollTo("Awards")} className="text-maxir-white/80 text-left text-sm">Awards & Patents</button>
          <Link to="/team" onClick={() => setMobileOpen(false)} className="text-maxir-white/80 text-sm">Team</Link>
          <Link to="/team#Publications" onClick={() => setMobileOpen(false)} className="text-maxir-white/80 text-sm">Publications</Link>
          <Link to="/team#FCOI" onClick={() => setMobileOpen(false)} className="text-maxir-white/80 text-sm">FCOI</Link>
          <button
            onClick={() => scrollTo("Contact")}
            className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold w-fit"
          >
            Contact Us
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
