import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

type MainMenuItem = "home" | "team" | "store";

const anchorLinks: Record<MainMenuItem, { label: string; id: string }[]> = {
  home: [
    { label: "Technology", id: "Technology" },
    { label: "The Sensor", id: "Sensor" },
    { label: "Applications", id: "Applications" },
    { label: "Awards & Patents", id: "Awards" },
  ],
  team: [
    { label: "Publications", id: "Publications" },
    { label: "FCOI", id: "FCOI" },
  ],
  store: [],
};

const mainMenuRoutes: Record<MainMenuItem, string> = {
  home: "/",
  team: "/team",
  store: "/store",
};

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const activeMain: MainMenuItem = useMemo(() => {
    if (location.pathname.startsWith("/team")) return "team";
    if (location.pathname.startsWith("/store")) return "store";
    return "home";
  }, [location.pathname]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
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
    { key: "team", label: "Team" },
    { key: "store", label: "Store" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-maxir-dark/90 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 flex items-center justify-between h-[70px]">
        {/* Logo */}
        <Link to="/" className="shrink-0">
          <img src="/images/maxir-logo.svg" alt="MAX-IR Labs" className="h-[28px] w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-6">
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
                        className="px-3 py-1.5 text-sm font-medium text-maxir-white/60 hover:text-maxir-white transition-colors"
                      >
                        {anchor.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Us button */}
          <button
            onClick={() => scrollTo("Contact")}
            className="bg-primary hover:bg-maxir-red-hover text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold transition-colors"
          >
            Contact Us
          </button>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-maxir-white">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
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
