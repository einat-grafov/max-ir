import { useState } from "react";
import { UserCog, Plus, Shield, Eye, Pencil, Users, KeyRound } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import InviteUserModal from "@/components/admin/InviteUserModal";
import RolePermissionsMatrix from "@/components/admin/RolePermissionsMatrix";

const ROLES = [
  {
    key: "admin",
    name: "Admin",
    icon: Shield,
    description: "Full access to all settings, users, content, orders, and integrations.",
    permissions: [
      "Manage users and roles",
      "Manage products, orders, and customers",
      "Edit website content and SEO",
      "Configure integrations and billing",
    ],
  },
  {
    key: "editor",
    name: "Editor",
    icon: Pencil,
    description: "Can create and edit content but cannot manage users or billing.",
    permissions: [
      "Edit website content and SEO",
      "Manage products and inquiries",
      "View orders and customers",
      "Cannot manage users or integrations",
    ],
  },
  {
    key: "viewer",
    name: "Viewer",
    icon: Eye,
    description: "Read-only access to the admin platform.",
    permissions: [
      "View dashboard and analytics",
      "View orders, customers, and inquiries",
      "Cannot create, edit, or delete data",
    ],
  },
];

const UsersSettings = () => {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors"
        >
          <Plus className="h-4 w-4" />
          Invite User
        </button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <div className="border-b border-border mb-6">
          <TabsList className="bg-transparent p-0 h-auto gap-6 rounded-none">
            {[
              { value: "users", label: "Users", icon: Users },
              { value: "roles", label: "Roles & Permissions", icon: KeyRound },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={cn(
                  "flex items-center gap-2 pb-3 px-0 text-sm font-semibold transition-colors border-b-2 -mb-px rounded-none bg-transparent",
                  "border-transparent text-muted-foreground hover:text-foreground",
                  "data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="users">
          <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-muted-foreground font-medium px-6 py-3">User</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3">Email</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3">Role</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3">Status</th>
                  <th className="text-right text-muted-foreground font-medium px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No additional users. Invite team members to collaborate.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RolePermissionsMatrix />
        </TabsContent>
      </Tabs>

      <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
};

export default UsersSettings;
