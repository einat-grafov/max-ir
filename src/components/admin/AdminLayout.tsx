import { useEffect, useState } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";

const AdminLayout = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin");

      if (!roles || roles.length === 0) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/admin/login");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="admin-scope min-h-screen flex w-full bg-muted">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Mobile header */}
          <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 h-12 px-3 bg-maxir-dark border-b border-white/10">
            <SidebarTrigger className="text-maxir-gray hover:text-maxir-white h-8 w-8" />
            <Link to="/admin/home" className="flex items-center">
              <img src="/images/maxir-logo.svg" alt="MAX-IR Labs" className="h-6 w-auto" />
            </Link>
            <span className="w-8" />
          </header>
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
