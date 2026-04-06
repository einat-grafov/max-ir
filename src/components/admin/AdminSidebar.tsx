import {
  ShoppingCart,
  Package,
  Users,
  Settings,
  UserCog,
  CreditCard,
  Truck,
  LogOut,
  ChevronDown,
  Home,
  Globe,
  PanelLeft,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

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
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Home", url: "/admin/home", icon: Home },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Customers", url: "/admin/customers", icon: Users },
  { title: "Website", url: "/admin/website", icon: Globe },
];

const settingsItems = [
  { title: "Users", url: "/admin/settings/users", icon: UserCog },
  { title: "Billing", url: "/admin/settings/billing", icon: CreditCard },
  { title: "Shipping", url: "/admin/settings/shipping", icon: Truck },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname.startsWith("/admin/settings")
  );

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
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="flex items-center justify-between px-4 py-2 mx-2 text-maxir-gray hover:text-maxir-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-xs uppercase tracking-wider font-medium">Settings</span>}
            </div>
            {!collapsed && (
              <ChevronDown
                className={`h-3 w-3 transition-transform ${settingsOpen ? "rotate-180" : ""}`}
              />
            )}
          </button>
          {settingsOpen && (
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm rounded-md transition-colors mx-2 ${
                          collapsed ? "" : "pl-11"
                        } ${
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
          )}
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
