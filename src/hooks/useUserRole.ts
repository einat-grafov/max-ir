import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "editor" | "viewer" | null;

/**
 * Returns the current authenticated user's highest platform role.
 * Priority: admin > editor > viewer.
 * Returns null while loading or if the user has no role.
 */
export const useUserRole = () => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!cancelled) {
          setRole(null);
          setLoading(false);
        }
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      if (cancelled) return;

      const roleSet = new Set((roles ?? []).map((r) => r.role));
      const resolved: UserRole = roleSet.has("admin")
        ? "admin"
        : roleSet.has("editor")
        ? "editor"
        : roleSet.has("viewer")
        ? "viewer"
        : null;

      setRole(resolved);
      setLoading(false);
    };

    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  return {
    role,
    loading,
    isAdmin: role === "admin",
    isEditor: role === "editor",
    isViewer: role === "viewer",
    canEdit: role === "admin" || role === "editor",
    canManage: role === "admin",
    isReadOnly: role === "viewer",
  };
};
