import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, MailX } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CareerApplicationTimeline from "@/components/admin/CareerApplicationTimeline";
import CareerApplicationFiles from "@/components/admin/CareerApplicationFiles";

const statusConfig: Record<string, { label: string; className: string }> = {
  applied: { label: "Applied", className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer" },
  under_review: { label: "Under Review", className: "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 cursor-pointer" },
  interview: { label: "Interview Stage", className: "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 cursor-pointer" },
  offer_extended: { label: "Offer Extended", className: "bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 cursor-pointer" },
  offer_accepted: { label: "Offer Accepted", className: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-200 cursor-pointer" },
  hired: { label: "Hired", className: "bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 cursor-pointer" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 cursor-pointer" },
};

// Map legacy status values to new keys
const legacyStatusMap: Record<string, string> = {
  new: "applied",
  reviewing: "under_review",
  interviewing: "interview",
};

const CareerApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [education, setEducation] = useState("");
  const [position, setPosition] = useState("");
  const [about, setAbout] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const { data: application, isLoading } = useQuery({
    queryKey: ["career-application", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("career_applications")
        .select("*")
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
    if (!application?.email) return false;
    return suppressedEmails.includes(application.email.toLowerCase());
  }, [application, suppressedEmails]);

  useEffect(() => {
    if (application) {
      setFullName(application.full_name || "");
      setEmail(application.email || "");
      setPhone(application.phone || "");
      setCountry(application.country || "");
      setEducation(application.education || "");
      setPosition(application.position || "");
      setAbout(application.about || "");
      setInternalNotes(application.notes || "");
      // Mark as read on view
      if (application.read === false) {
        supabase.from("career_applications").update({ read: true }).eq("id", id!).then(() => {
          queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
        });
      }
    }
  }, [application, id, queryClient]);

  const hasUnsavedChanges = useMemo(() => {
    if (!application) return false;
    return (
      fullName !== (application.full_name || "") ||
      email !== (application.email || "") ||
      phone !== (application.phone || "") ||
      country !== (application.country || "") ||
      education !== (application.education || "") ||
      position !== (application.position || "") ||
      about !== (application.about || "") ||
      internalNotes !== (application.notes || "")
    );
  }, [application, fullName, email, phone, country, education, position, about, internalNotes]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasUnsavedChanges]);

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("career_applications")
        .update({ status: newStatus } as any)
        .eq("id", id!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["career-application", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
      toast.success("Status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("career_applications")
        .update({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          country: country.trim() || null,
          education: education.trim() || null,
          position: position.trim() || null,
          about: about.trim() || null,
          notes: internalNotes.trim() || null,
        } as any)
        .eq("id", id!);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["career-application", id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
      toast.success("Application updated");
    } catch {
      toast.error("Failed to update application");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("career_applications").delete().eq("id", id!);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["admin-career-applications"] });
      toast.success("Application deleted");
      navigate("/admin/careers");
    } catch {
      toast.error("Failed to delete application");
    }
  };

  if (isLoading) {
    return <div className="text-muted-foreground text-sm p-6">Loading...</div>;
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  const currentStatus = (application.status as string) || "new";
  const config = statusConfig[currentStatus] || statusConfig.new;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Breadcrumb className="mb-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/admin/careers">Career Applications</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{application.full_name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 leading-none">
            {application.full_name}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Badge variant="outline" className={config.className}>{config.label}</Badge>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.entries(statusConfig).map(([key, c]) => (
                  <DropdownMenuItem key={key} onClick={() => updateStatusMutation.mutate(key)} className="gap-2">
                    <Badge variant="outline" className={c.className.replace(/hover:bg-\S+\s?/g, "").replace("cursor-pointer", "")}>
                      {c.label}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
                <AlertDialogTitle>Delete application?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this application and all its interaction notes. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium animate-in fade-in">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            disabled={!hasUnsavedChanges}
            onClick={() => {
              if (application) {
                setFullName(application.full_name || "");
                setEmail(application.email || "");
                setPhone(application.phone || "");
                setCountry(application.country || "");
                setEducation(application.education || "");
                setPosition(application.position || "");
                setAbout(application.about || "");
                setInternalNotes(application.notes || "");
              }
            }}
          >
            Discard
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Applicant details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Full name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Country</Label>
                <Input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Education</Label>
                <Input value={education} onChange={(e) => setEducation(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Position applied for</Label>
                <Input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Software Engineer" className="mt-1.5" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">About the applicant</h2>
            <Textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Applicant's submitted message"
              className="min-h-[140px] resize-none"
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Internal notes</h2>
            <Textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add private notes about this applicant (only visible to admins)."
              className="min-h-[120px] resize-none"
            />
          </Card>

          <CareerApplicationFiles applicationId={id!} />
        </div>

        <div className="space-y-6">
          <CareerApplicationTimeline
            applicationId={id!}
            applicantName={application.full_name}
            applicationCreatedAt={application.created_at}
          />
        </div>
      </div>
    </div>
  );
};

export default CareerApplicationDetail;
