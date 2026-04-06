import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { format } from "date-fns";
import { Mail, MailOpen } from "lucide-react";

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
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-maxir-white">Career Applications</h1>
          <p className="text-maxir-gray text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
      </div>

      <div className="bg-maxir-dark-surface border border-white/10 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-maxir-gray w-10"></TableHead>
              <TableHead className="text-maxir-gray">Full Name</TableHead>
              <TableHead className="text-maxir-gray">Email</TableHead>
              <TableHead className="text-maxir-gray">Country</TableHead>
              <TableHead className="text-maxir-gray">Education</TableHead>
              <TableHead className="text-maxir-gray">About</TableHead>
              <TableHead className="text-maxir-gray">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="text-center text-maxir-gray py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !applications?.length ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={7} className="text-center text-maxir-gray py-12">
                  No career applications yet
                </TableCell>
              </TableRow>
            ) : (
              applications.map((app) => (
                <TableRow
                  key={app.id}
                  className={`border-white/10 cursor-pointer ${!app.read ? "bg-primary/5" : ""}`}
                  onClick={() => toggleRead.mutate({ id: app.id, read: app.read })}
                >
                  <TableCell>
                    {app.read ? (
                      <MailOpen className="w-4 h-4 text-maxir-gray" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell className={`${!app.read ? "text-maxir-white font-semibold" : "text-maxir-gray"}`}>
                    {app.full_name}
                  </TableCell>
                  <TableCell className="text-maxir-gray">{app.email}</TableCell>
                  <TableCell className="text-maxir-gray">{app.country || "—"}</TableCell>
                  <TableCell className="text-maxir-gray">{app.education || "—"}</TableCell>
                  <TableCell className="text-maxir-gray max-w-[300px] truncate">
                    {app.about || "—"}
                  </TableCell>
                  <TableCell className="text-maxir-gray text-sm whitespace-nowrap">
                    {format(new Date(app.created_at), "MMM d, yyyy")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CareerApplications;
