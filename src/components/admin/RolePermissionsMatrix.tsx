import { useEffect, useMemo, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Role = "admin" | "editor" | "viewer";

const ROLES: { key: Role; label: string }[] = [
  { key: "admin", label: "Admin" },
  { key: "editor", label: "Editor" },
  { key: "viewer", label: "Viewer" },
];

const PERMISSION_GROUPS: { name: string; permissions: { key: string; label: string }[] }[] = [
  {
    name: "Dashboard",
    permissions: [
      { key: "dashboard.view", label: "View Dashboard" },
      { key: "dashboard.analytics", label: "View Analytics" },
      { key: "dashboard.export", label: "Export Data" },
    ],
  },
  {
    name: "Orders",
    permissions: [
      { key: "orders.view", label: "View Orders" },
      { key: "orders.create", label: "Create Orders" },
      { key: "orders.edit", label: "Edit Orders" },
      { key: "orders.delete", label: "Delete Orders" },
    ],
  },
  {
    name: "Products",
    permissions: [
      { key: "products.view", label: "View Products" },
      { key: "products.create", label: "Create Products" },
      { key: "products.edit", label: "Edit Products" },
      { key: "products.delete", label: "Delete Products" },
    ],
  },
  {
    name: "Customers",
    permissions: [
      { key: "customers.view", label: "View Customers" },
      { key: "customers.create", label: "Create Customers" },
      { key: "customers.edit", label: "Edit Customers" },
      { key: "customers.delete", label: "Delete Customers" },
    ],
  },
  {
    name: "Website",
    permissions: [
      { key: "website.view", label: "View Content" },
      { key: "website.edit", label: "Edit Content" },
      { key: "website.publish", label: "Publish Changes" },
    ],
  },
  {
    name: "Settings",
    permissions: [
      { key: "settings.users", label: "Manage Users" },
      { key: "settings.integrations", label: "Manage Integrations" },
      { key: "settings.billing", label: "Manage Billing" },
    ],
  },
];

// Sensible defaults for first-time setup
const DEFAULTS: Record<string, Role[]> = {
  "dashboard.view": ["admin", "editor", "viewer"],
  "dashboard.analytics": ["admin", "editor", "viewer"],
  "dashboard.export": ["admin"],
  "orders.view": ["admin", "editor", "viewer"],
  "orders.create": ["admin", "editor"],
  "orders.edit": ["admin", "editor"],
  "orders.delete": ["admin"],
  "products.view": ["admin", "editor", "viewer"],
  "products.create": ["admin", "editor"],
  "products.edit": ["admin", "editor"],
  "products.delete": ["admin"],
  "customers.view": ["admin", "editor", "viewer"],
  "customers.create": ["admin", "editor"],
  "customers.edit": ["admin", "editor"],
  "customers.delete": ["admin"],
  "website.view": ["admin", "editor", "viewer"],
  "website.edit": ["admin", "editor"],
  "website.publish": ["admin"],
  "settings.users": ["admin"],
  "settings.integrations": ["admin"],
  "settings.billing": ["admin"],
};

type PermMap = Record<string, Record<Role, boolean>>;

const buildDefaults = (): PermMap => {
  const map: PermMap = {};
  PERMISSION_GROUPS.forEach((g) =>
    g.permissions.forEach((p) => {
      map[p.key] = {
        admin: DEFAULTS[p.key]?.includes("admin") ?? false,
        editor: DEFAULTS[p.key]?.includes("editor") ?? false,
        viewer: DEFAULTS[p.key]?.includes("viewer") ?? false,
      };
    }),
  );
  return map;
};

const RolePermissionsMatrix = () => {
  const { toast } = useToast();
  const [perms, setPerms] = useState<PermMap>(buildDefaults());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("role_permissions")
        .select("role, permission_key, enabled");
      if (error) {
        toast({ title: "Failed to load permissions", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const map = buildDefaults();
      (data ?? []).forEach((row: any) => {
        if (map[row.permission_key]) {
          map[row.permission_key][row.role as Role] = row.enabled;
        }
      });
      setPerms(map);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (permKey: string, role: Role) => {
    if (role === "admin") return; // admin always full access
    setPerms((prev) => ({
      ...prev,
      [permKey]: { ...prev[permKey], [role]: !prev[permKey][role] },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const rows: { role: Role; permission_key: string; enabled: boolean }[] = [];
    Object.entries(perms).forEach(([permKey, byRole]) => {
      ROLES.forEach(({ key }) => {
        rows.push({ role: key, permission_key: permKey, enabled: byRole[key] });
      });
    });
    const { error } = await supabase
      .from("role_permissions")
      .upsert(rows, { onConflict: "role,permission_key" });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save", description: error.message, variant: "destructive" });
      return;
    }
    setDirty(false);
    toast({ title: "Permissions saved", description: "Role permissions updated successfully." });
  };

  const groups = useMemo(() => PERMISSION_GROUPS, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading permissions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      {groups.map((group) => (
        <div key={group.name} className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="grid items-center bg-muted/30 px-6 py-3 border-b border-border" style={{ gridTemplateColumns: `200px repeat(${group.permissions.length}, minmax(0, 1fr))` }}>
            <div className="text-sm font-semibold text-foreground">{group.name}</div>
            {group.permissions.map((p) => (
              <div key={p.key} className="text-xs font-medium text-muted-foreground text-center">
                {p.label}
              </div>
            ))}
          </div>
          {ROLES.map(({ key: role, label }) => (
            <div
              key={role}
              className="grid items-center px-6 py-4 border-b border-border/50 last:border-b-0"
              style={{ gridTemplateColumns: `200px repeat(${group.permissions.length}, minmax(0, 1fr))` }}
            >
              <div className="text-sm text-foreground">{label}</div>
              {group.permissions.map((p) => {
                const checked = perms[p.key]?.[role] ?? false;
                const isAdmin = role === "admin";
                return (
                  <div key={p.key} className="flex justify-center">
                    <Checkbox
                      checked={isAdmin ? true : checked}
                      onCheckedChange={() => toggle(p.key, role)}
                      disabled={isAdmin}
                      className={cn(
                        "h-5 w-5 rounded-md",
                        (isAdmin || checked) && "data-[state=checked]:bg-primary data-[state=checked]:border-primary",
                      )}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      ))}

      <p className="text-xs text-muted-foreground">
        Admin role always has full access and cannot be modified.
      </p>
    </div>
  );
};

export default RolePermissionsMatrix;
