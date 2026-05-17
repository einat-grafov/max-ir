import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type MainMenuItem = "home" | "about" | "team";

const anchorLinks: Record<MainMenuItem, { label: string; id: string; description?: string }[]> = {
  home: [],
  about: [
    { label: "Technology", id: "Technology", description: "Our proprietary infrared sensing platform" },
    { label: "The Sensor", id: "Sensor", description: "How the sensor works in detail" },
    { label: "Applications", id: "Applications", description: "Where our technology is used today" },
    { label: "Awards & Patents", id: "Awards", description: "Recognition and intellectual property" },
  ],
  team: [
    { label: "Our Story", id: "OurStory", description: "The history behind Max-IR Labs" },
    { label: "Our Team", id: "OurTeam", description: "Meet the people driving our mission" },
    { label: "Advisory Board", id: "AdvisoryBoard", description: "Expert guidance and leadership" },
    { label: "Publications", id: "Publications", description: "Peer-reviewed research and papers" },
    { label: "FCOI", id: "FCOI", description: "Financial Conflict of Interest policy" },
    { label: "Careers", id: "Careers", description: "Join the Max-IR Labs team" },
  ],
};

const mainMenuRoutes: Record<MainMenuItem, string> = {
  home: "/",
  about: "/about-us",
  team: "/team",
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeAnchor, setActiveAnchor] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<MainMenuItem | null>(null);
  const closeTimer = useRef<number | null>(null);
  const location = useLocation();
  const { totalItems } = useCart();

  const activeMain: MainMenuItem = useMemo(() => {
    if (location.pathname.startsWith("/about-us")) return "about";
    if (location.pathname.startsWith("/team")) return "team";
    return "home";
  }, [location.pathname]);

  useEffect(() => {
    if (activeMain === "about") {
      setActiveAnchor(anchorLinks.about[0].id);
    } else {
      setActiveAnchor(null);
    }
  }, [activeMain]);

  // Scroll spy
  useEffect(() => {
    const currentAnchors = anchorLinks[activeMain];
    if (currentAnchors.length === 0) return;
    const ids = currentAnchors.map((a) => a.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveAnchor(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeMain, location.pathname]);

  const scrollTo = (id: string, item: MainMenuItem) => {
    setMobileOpen(false);
    setOpenMenu(null);
    setActiveAnchor(id);
    const basePath = mainMenuRoutes[item];
    if (location.pathname !== basePath) {
      window.location.href = `${basePath}#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToContact = () => {
    setMobileOpen(false);
    const el = document.getElementById("Contact");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `${mainMenuRoutes[activeMain]}#Contact`;
    }
  };

  const handleEnter = (key: MainMenuItem) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    if (anchorLinks[key].length > 0) setOpenMenu(key);
  };

  const handleLeave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenMenu(null), 120);
  };

  const mainItems: { key: MainMenuItem; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "about", label: "About Us" },
    { key: "team", label: "Team" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-maxir-dark/90 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center h-[70px]">
        <Link to="/" className="shrink-0 mr-8">
          <img src="/images/maxir-logo.svg" alt="MAX-IR Labs" className="h-[28px] w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center flex-1">
          <div className="flex items-center gap-2">
            {mainItems.map((item) => {
              const hasMenu = anchorLinks[item.key].length > 0;
              const isOpen = openMenu === item.key;
              return (
                <div
                  key={item.key}
                  className="relative"
                  onMouseEnter={() => handleEnter(item.key)}
                  onMouseLeave={handleLeave}
                >
                  <Link
                    to={mainMenuRoutes[item.key]}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold transition-colors ${
                      activeMain === item.key
                        ? "text-primary"
                        : "text-maxir-white/80 hover:text-maxir-white"
                    }`}
                  >
                    {item.label}
                    {hasMenu && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    )}
                  </Link>

                  {/* Mega menu */}
                  {hasMenu && isOpen && (
                    <div
                      className="absolute left-0 top-full pt-3"
                      onMouseEnter={() => handleEnter(item.key)}
                      onMouseLeave={handleLeave}
                    >
                      <div className="w-[460px] bg-maxir-dark/95 backdrop-blur-md border border-maxir-white/10 rounded-2xl shadow-2xl p-3 grid grid-cols-1 gap-1">
                        {anchorLinks[item.key].map((anchor) => {
                          const isActive = activeMain === item.key && activeAnchor === anchor.id;
                          return (
                            <button
                              key={anchor.id}
                              onClick={() => scrollTo(anchor.id, item.key)}
                              className={`group text-left px-4 py-3 rounded-xl transition-colors ${
                                isActive
                                  ? "bg-primary/10"
                                  : "hover:bg-maxir-white/5"
                              }`}
                            >
                              <div
                                className={`text-sm font-semibold ${
                                  isActive ? "text-primary" : "text-maxir-white group-hover:text-primary"
                                }`}
                              >
                                {anchor.label}
                              </div>
                              {anchor.description && (
                                <div className="text-xs text-maxir-white/60 mt-0.5">
                                  {anchor.description}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link to="/cart" className="relative text-maxir-white/80 hover:text-maxir-white transition-colors p-2">
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={scrollToContact}
              className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="lg:hidden flex items-center gap-2 ml-auto">
          <Link to="/cart" className="relative text-maxir-white/80 hover:text-maxir-white transition-colors p-2">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-[18px] h-[18px] flex items-center justify-center">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-maxir-white">
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-maxir-dark border-t border-maxir-white/10 px-6 pb-6 pt-4 flex flex-col gap-4">
          {mainItems.map((item) => (
            <div key={item.key} className="flex flex-col gap-2">
              <Link
                to={mainMenuRoutes[item.key]}
                onClick={() => setMobileOpen(false)}
                className={`text-sm font-semibold ${
                  activeMain === item.key ? "text-primary" : "text-maxir-white/80"
                }`}
              >
                {item.label}
              </Link>
              {anchorLinks[item.key].map((anchor) => (
                <button
                  key={anchor.id}
                  onClick={() => scrollTo(anchor.id, item.key)}
                  className="text-maxir-white/60 text-left text-sm pl-4"
                >
                  {anchor.label}
                </button>
              ))}
            </div>
          ))}
          <button
            onClick={scrollToContact}
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
