import { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, MailX } from "lucide-react";
import { format } from "date-fns";
import InquiryTimeline from "@/components/admin/InquiryTimeline";

const InquiryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: inquiry, isLoading } = useQuery({
    queryKey: ["inquiry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*, customers:customer_id(id, first_name, last_name, company)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: suppressedEmails = [] } = useQuery({
    queryKey: ["suppressed-emails"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppressed_emails").select("email");
      if (error) throw error;
      return data.map((s) => s.email.toLowerCase());
    },
  });

  const isUnsubscribed = useMemo(() => {
    if (!inquiry?.email) return false;
    return suppressedEmails.includes(inquiry.email.toLowerCase());
  }, [inquiry, suppressedEmails]);

  // Mark as read on view
  useEffect(() => {
    if (inquiry && inquiry.read === false) {
      supabase.from("inquiries").update({ read: true }).eq("id", id!).then(() => {
        queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
        queryClient.invalidateQueries({ queryKey: ["sidebar-unread-inquiries"] });
      });
    }
  }, [inquiry, id, queryClient]);

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("inquiries").delete().eq("id", id!);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
      toast.success("Inquiry deleted");
      navigate("/admin/inquiries");
    } catch {
      toast.error("Failed to delete inquiry");
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm p-6">Loading...</div>;
  }

  if (!inquiry) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Inquiry not found.</p>
      </div>
    );
  }

  const customerLabel = inquiry.customers
    ? inquiry.customers.company || `${inquiry.customers.first_name} ${inquiry.customers.last_name || ""}`.trim()
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/inquiries">Inquiries</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{inquiry.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 leading-none">
            {inquiry.name}
            <Badge variant="secondary" className="text-xs">{inquiry.product_name}</Badge>
            {isUnsubscribed && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
                <MailX className="h-3 w-3" />
                Unsubscribed
              </Badge>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:bg-destructive hover:text-white">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete inquiry?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this inquiry and all its interaction notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Contact details</h2>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="text-foreground">{inquiry.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <a href={`mailto:${inquiry.email}`} className="text-primary hover:underline break-all">
                  {inquiry.email}
                </a>
              </div>
              {inquiry.phone && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Phone</p>
                  <p className="text-foreground">{inquiry.phone}</p>
                </div>
              )}
              {inquiry.company_name && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Company</p>
                  <p className="text-foreground">{inquiry.company_name}</p>
                </div>
              )}
              {(inquiry.country || inquiry.state) && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <p className="text-foreground">
                    {[inquiry.state, inquiry.country].filter(Boolean).join(", ")}
                  </p>
                </div>
              )}
              {customerLabel && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Customer</p>
                  <Link to={`/admin/customers/${inquiry.customers.id}`} className="text-primary hover:underline">
                    {customerLabel}
                  </Link>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Submitted</p>
                <p className="text-foreground">
                  {format(new Date(inquiry.created_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Inquiry message</h2>
            <div className="bg-muted/50 border border-border rounded-md p-4 text-sm text-foreground whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <InquiryTimeline
            inquiryId={id!}
            inquiryCreatedAt={inquiry.created_at}
            productName={inquiry.product_name}
            defaultContact={inquiry.name}
          />
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;
