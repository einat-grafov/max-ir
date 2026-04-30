import { useEffect, useState } from "react";
import { UserCog, Plus, Users, KeyRound, Loader2, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import InviteUserModal from "@/components/admin/InviteUserModal";
import RolePermissionsMatrix from "@/components/admin/RolePermissionsMatrix";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import IconTooltipButton from "@/components/admin/IconTooltipButton";

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user.id ?? null);
    });
  }, []);

  const handleInviteClose = (open: boolean) => {
    setInviteOpen(open);
    if (!open) fetchUsers();
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("delete-user", {
        body: { user_id: userToDelete.id },
      });
      if (error || (data as any)?.error) {
        throw new Error((data as any)?.error || error?.message || "Failed to delete user");
      }
      toast({ title: "User deleted", description: `${userToDelete.email ?? "User"} has been removed.` });
      setUserToDelete(null);
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
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
                  <th className="text-left text-muted-foreground font-medium px-6 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3 hidden sm:table-cell">Role</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3">Status</th>
                  <th className="text-left text-muted-foreground font-medium px-6 py-3 hidden lg:table-cell">Last sign in</th>
                  <th className="text-right text-muted-foreground font-medium px-6 py-3 w-16">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin inline-block" />
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No users yet. Invite team members to collaborate.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const fullName = [u.first_name, u.last_name].filter(Boolean).join(" ") || "—";
                    const initials =
                      (u.first_name?.[0] ?? u.email?.[0] ?? "?").toUpperCase() +
                      (u.last_name?.[0] ?? "").toUpperCase();
                    const isPending = !u.email_confirmed_at && !u.last_sign_in_at;
                    return (
                      <tr key={u.id} className="border-b border-border/50 last:border-0">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
                              {initials}
                            </div>
                            <span className="font-medium text-foreground">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">{u.email ?? "—"}</td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {u.roles.length === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              u.roles.map((r) => (
                                <span
                                  key={r}
                                  className={cn(
                                    "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                                    roleBadgeClass(r)
                                  )}
                                >
                                  {r}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              isPending
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            )}
                          >
                            {isPending ? "Pending" : "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground hidden lg:table-cell">
                          {u.last_sign_in_at
                            ? new Date(u.last_sign_in_at).toLocaleString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {u.id !== currentUserId && (
                            <IconTooltipButton
                              label="Delete user"
                              variant="ghost"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setUserToDelete(u)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconTooltipButton>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="roles">
          <RolePermissionsMatrix />
        </TabsContent>
      </Tabs>

      <InviteUserModal open={inviteOpen} onOpenChange={handleInviteClose} />

      <AlertDialog open={!!userToDelete} onOpenChange={(o) => !o && !deleting && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{userToDelete?.email ?? "this user"}</strong> and revoke all their access. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete(); }}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UsersSettings;
