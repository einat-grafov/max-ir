import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MailOpen } from "lucide-react";

const Inquiries = () => {
  const queryClient = useQueryClient();

  const { data: inquiries, isLoading } = useQuery({
    queryKey: ["admin-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleRead = useMutation({
    mutationFn: async ({ id, read }: { id: string; read: boolean }) => {
      const { error } = await supabase
        .from("inquiries")
        .update({ read: !read })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] }),
  });

  const unreadCount = inquiries?.filter((i) => !i.read).length ?? 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-maxir-white">Inquiries</h1>
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
              <TableHead className="text-maxir-gray">Name</TableHead>
              <TableHead className="text-maxir-gray">Email</TableHead>
              <TableHead className="text-maxir-gray">Product</TableHead>
              <TableHead className="text-maxir-gray">Message</TableHead>
              <TableHead className="text-maxir-gray">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-maxir-gray py-12">
                  Loading…
                </TableCell>
              </TableRow>
            ) : !inquiries?.length ? (
              <TableRow className="border-white/10">
                <TableCell colSpan={6} className="text-center text-maxir-gray py-12">
                  No inquiries yet
                </TableCell>
              </TableRow>
            ) : (
              inquiries.map((inq) => (
                <TableRow
                  key={inq.id}
                  className={`border-white/10 cursor-pointer ${!inq.read ? "bg-primary/5" : ""}`}
                  onClick={() => toggleRead.mutate({ id: inq.id, read: inq.read })}
                >
                  <TableCell>
                    {inq.read ? (
                      <MailOpen className="w-4 h-4 text-maxir-gray" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </TableCell>
                  <TableCell className={`${!inq.read ? "text-maxir-white font-semibold" : "text-maxir-gray"}`}>
                    {inq.name}
                  </TableCell>
                  <TableCell className="text-maxir-gray">{inq.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-white/10 text-maxir-white border-0 text-xs">
                      {inq.product_name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-maxir-gray max-w-[300px] truncate">
                    {inq.message}
                  </TableCell>
                  <TableCell className="text-maxir-gray text-sm whitespace-nowrap">
                    {format(new Date(inq.created_at), "MMM d, yyyy")}
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

export default Inquiries;
