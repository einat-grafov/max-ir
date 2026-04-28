import { useState } from "react";
import { UserCog, Plus, Shield, Eye, Pencil } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import InviteUserModal from "@/components/admin/InviteUserModal";

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
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

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
          <div className="grid gap-4 md:grid-cols-3">
            {ROLES.map(({ key, name, icon: Icon, description, permissions }) => (
              <div
                key={key}
                className="bg-background border border-border rounded-2xl p-5 shadow-sm flex flex-col"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{description}</p>
                <ul className="space-y-2 text-sm text-foreground">
                  {permissions.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <InviteUserModal open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
  );
};

export default UsersSettings;
