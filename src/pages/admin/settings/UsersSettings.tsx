import { UserCog, Plus } from "lucide-react";

const UsersSettings = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserCog className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-maxir-red-hover text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold transition-colors">
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
    </div>
  );
};

export default UsersSettings;
