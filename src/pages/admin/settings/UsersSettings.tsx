import { useEffect, useState } from "react";
import { UserCog, Plus, Users, KeyRound, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import InviteUserModal from "@/components/admin/InviteUserModal";
import RolePermissionsMatrix from "@/components/admin/RolePermissionsMatrix";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type AdminUser = {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  invited_at: string | null;
  email_confirmed_at: string | null;
  roles: string[];
};

const roleBadgeClass = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-primary/10 text-primary";
    case "editor":
      return "bg-blue-100 text-blue-700";
    case "viewer":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const UsersSettings = () => {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("list-users");
      if (error) throw error;
      setUsers((data as any)?.users ?? []);
    } catch (e: any) {
      toast({
        title: "Failed to load users",
        description: e.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInviteClose = (open: boolean) => {
    setInviteOpen(open);
    if (!open) fetchUsers();
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <UserCog className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
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
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setInviteOpen(true)}
              className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              <Plus className="h-4 w-4" />
              Invite User
            </button>
          </div>
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
