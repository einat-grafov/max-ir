import {
  ShoppingCart,
  Package,
  Users,
  UserCog,
  CreditCard,
  Plug,
  LogOut,
  Home,
  Globe,
  Mail,
  MessageSquare,
  Briefcase,
  Search,
  Sparkles,
  Accessibility,
  ArrowRightLeft,
  Palette,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "General", url: "/admin/home", icon: Home },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Website", url: "/admin/website", icon: Globe },
  { title: "Brand", url: "/admin/brand", icon: Palette },
  { title: "Inquiries", url: "/admin/inquiries", icon: MessageSquare },
  { title: "Careers", url: "/admin/careers", icon: Briefcase },
];

const optimizationItems = [
  { title: "SEO", url: "/admin/optimization/seo", icon: Search },
  { title: "AI Search", url: "/admin/optimization/ai-search", icon: Sparkles },
  { title: "Redirects", url: "/admin/optimization/redirects", icon: ArrowRightLeft },
  { title: "Accessibility", url: "/admin/optimization/accessibility", icon: Accessibility },
];

const settingsItems = [
  { title: "Users", url: "/admin/settings/users", icon: UserCog },
  { title: "Emails", url: "/admin/settings/emails", icon: Mail },
  { title: "Billing", url: "/admin/settings/billing", icon: CreditCard },
  { title: "Integrations", url: "/admin/settings/integrations", icon: Plug },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  // Sidebar groups are always expanded — no collapse state.

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-14" : "w-60"} bg-maxir-dark border-r border-white/10`}
      collapsible="icon"
    >
      <div className="p-4 border-b border-white/10 bg-maxir-dark flex items-center justify-between">
        <Link to="/admin/home" className="flex items-center">
          <img src="/images/maxir-logo.svg" alt="MAX-IR Labs" className={collapsed ? "h-6 w-auto" : "h-7 w-auto"} />
        </Link>
        <SidebarTrigger className="text-maxir-gray hover:text-maxir-white h-7 w-7" />
      </div>

      <SidebarContent className="bg-maxir-dark">
        <SidebarGroup>
          <SidebarGroupLabel className="text-maxir-gray text-xs uppercase tracking-wider px-4 mb-1">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors mx-2 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary"
                          : "text-maxir-gray hover:text-maxir-white hover:bg-white/5"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-maxir-gray text-xs uppercase tracking-wider px-4 mb-1">
            Optimization
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {optimizationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors mx-2 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary"
                          : "text-maxir-gray hover:text-maxir-white hover:bg-white/5"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-maxir-gray text-xs uppercase tracking-wider px-4 mb-1">
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors mx-2 ${
                        isActive(item.url)
                          ? "bg-primary/10 text-primary"
                          : "text-maxir-gray hover:text-maxir-white hover:bg-white/5"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-maxir-dark border-t border-white/10 p-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-maxir-gray hover:text-maxir-white hover:bg-white/5 rounded-md transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
