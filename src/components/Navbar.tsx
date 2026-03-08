import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

type MainMenuItem = "home" | "about" | "team";

const anchorLinks: Record<MainMenuItem, { label: string; id: string }[]> = {
  home: [],
  about: [
    { label: "Technology", id: "Technology" },
    { label: "The Sensor", id: "Sensor" },
    { label: "Applications", id: "Applications" },
    { label: "Awards & Patents", id: "Awards" },
  ],
  team: [
    { label: "Publications", id: "Publications" },
    { label: "FCOI", id: "FCOI" },
    { label: "Careers", id: "Careers" },
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
  const location = useLocation();
  const { totalItems } = useCart();

  const activeMain: MainMenuItem = useMemo(() => {
    if (location.pathname.startsWith("/about-us")) return "about";
    if (location.pathname.startsWith("/team")) return "team";
    return "home";
  }, [location.pathname]);

  // Reset active anchor when page changes; default to first anchor only for home
  useEffect(() => {
    if (activeMain === "home" || activeMain === "about") {
      const anchors = anchorLinks[activeMain];
      setActiveAnchor(anchors.length > 0 ? anchors[0].id : null);
    } else {
      setActiveAnchor(null);
    }
  }, [activeMain]);

  // Scroll spy: observe sections and update active anchor
  useEffect(() => {
    const currentAnchors = anchorLinks[activeMain];
    if (currentAnchors.length === 0) return;

    const ids = currentAnchors.map((a) => a.id);
    const elements = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveAnchor(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -40% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeMain, location.pathname]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    setActiveAnchor(id);
    const basePath = mainMenuRoutes[activeMain];
    if (location.pathname !== basePath) {
      window.location.href = `${basePath}#${id}`;
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const currentAnchors = anchorLinks[activeMain];

  const mainItems: { key: MainMenuItem; label: string }[] = [
    { key: "home", label: "Home" },
    { key: "about", label: "About Us" },
    { key: "team", label: "Team" },
    { key: "store", label: "Our Products" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-maxir-dark/90 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center h-[70px]">
        {/* Logo */}
        <Link to="/" className="shrink-0 mr-8">
          <img src="/images/maxir-logo.svg" alt="MAX-IR Labs" className="h-[28px] w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center flex-1">
          {/* Main menu items + contextual anchors */}
          <div className="flex items-center gap-1">
            {mainItems.map((item) => (
              <div key={item.key} className="flex items-center">
                {/* Main menu link */}
                <Link
                  to={mainMenuRoutes[item.key]}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    activeMain === item.key
                      ? "text-primary"
                      : "text-maxir-white/80 hover:text-maxir-white"
                  }`}
                >
                  {item.label}
                </Link>

                {/* Anchor links appear right after the active main item */}
                {activeMain === item.key && currentAnchors.length > 0 && (
                  <div className="flex items-center gap-1 ml-1">
                    {currentAnchors.map((anchor) => (
                      <button
                        key={anchor.id}
                        onClick={() => scrollTo(anchor.id)}
                        className={`relative px-3 py-1.5 text-sm font-medium transition-colors ${
                          activeAnchor === anchor.id
                            ? "text-maxir-white"
                            : "text-maxir-white/60 hover:text-maxir-white"
                        }`}
                      >
                        {anchor.label}
                        {activeAnchor === anchor.id && (
                          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36px] h-[2px] bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Us button - pushed to right */}
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
              onClick={() => scrollTo("Contact")}
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
              {activeMain === item.key &&
                anchorLinks[item.key].map((anchor) => (
                  <button
                    key={anchor.id}
                    onClick={() => scrollTo(anchor.id)}
                    className="text-maxir-white/60 text-left text-sm pl-4"
                  >
                    {anchor.label}
                  </button>
                ))}
            </div>
          ))}
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
