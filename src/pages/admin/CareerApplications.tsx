import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Briefcase, Mail, MailOpen } from "lucide-react";

const CareerApplications = () => {
  const queryClient = useQueryClient();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["admin-career-applications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("career_applications")
        .update({ read: !read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] }),
  });

  const unreadCount = applications?.filter((a) => !a.read).length ?? 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Briefcase className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Career Applications</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-background border border-border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-muted-foreground font-medium px-6 py-3 w-10"></th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Full Name</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Email</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Country</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Education</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">About</th>
                <th className="text-left text-muted-foreground font-medium px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="border-b border-border/50">
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    Loading…
                  </td>
                </tr>
              ) : !applications?.length ? (
                <tr className="border-b border-border/50">
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No career applications yet
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr
                    key={app.id}
                    className={`border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer ${!app.read ? "bg-primary/5" : ""}`}
                    onClick={() => toggleRead.mutate({ id: app.id, read: app.read })}
                  >
                    <td className="px-6 py-3">
                      {app.read ? (
                        <MailOpen className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Mail className="w-4 h-4 text-primary" />
                      )}
                    </td>
                    <td className={`px-6 py-3 ${!app.read ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
                      {app.full_name}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{app.email}</td>
                    <td className="px-6 py-3 text-muted-foreground">{app.country || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground">{app.education || "—"}</td>
                    <td className="px-6 py-3 text-muted-foreground max-w-[300px] truncate">
                      {app.about || "—"}
                    </td>
                    <td className="px-6 py-3 text-muted-foreground text-sm whitespace-nowrap">
                      {format(new Date(app.created_at), "MMM d, yyyy")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CareerApplications;
