import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "flag-icons/css/flag-icons.min.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Trash2, MailX, Plus } from "lucide-react";
import { format } from "date-fns";
import InquiryTimeline from "@/components/admin/InquiryTimeline";
import { COUNTRIES, US_STATES, getCountryCode } from "@/lib/countries";

type InquiryForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  country: string;
  state: string;
  address: string;
  apartment: string;
  city: string;
  postal_code: string;
  accepts_info_emails: boolean;
  accepts_marketing: boolean;
};

const emptyForm = (): InquiryForm => ({
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company_name: "",
  country: "",
  state: "",
  address: "",
  apartment: "",
  city: "",
  postal_code: "",
  accepts_info_emails: false,
  accepts_marketing: false,
});

const InquiryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<InquiryForm>(emptyForm());

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

  // Hydrate form when inquiry loads
  useEffect(() => {
    if (!inquiry) return;
    const fallbackFirst =
      inquiry.first_name ||
      (inquiry.name ? String(inquiry.name).split(" ")[0] : "") ||
      "";
    const fallbackLast =
      inquiry.last_name ||
      (inquiry.name ? String(inquiry.name).split(" ").slice(1).join(" ") : "") ||
      "";
    setForm({
      first_name: fallbackFirst,
      last_name: fallbackLast,
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      company_name: inquiry.company_name || "",
      country: inquiry.country || "",
      state: inquiry.state || "",
      address: inquiry.address || "",
      apartment: inquiry.apartment || "",
      city: inquiry.city || "",
      postal_code: inquiry.postal_code || "",
      accepts_info_emails: !!inquiry.accepts_info_emails,
      accepts_marketing: !!inquiry.accepts_marketing,
    });
  }, [inquiry]);

  // Mark as read on view
  useEffect(() => {
    if (inquiry && inquiry.read === false) {
      supabase.from("inquiries").update({ read: true }).eq("id", id!).then(() => {
        queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
        queryClient.invalidateQueries({ queryKey: ["sidebar-unread-inquiries"] });
      });
    }
  }, [inquiry, id, queryClient]);

  const update = <K extends keyof InquiryForm>(key: K, value: InquiryForm[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "country" && value !== "United States") {
        next.state = "";
      }
      return next;
    });
  };

  const hasUnsavedChanges = useMemo(() => {
    if (!inquiry) return false;
    const fallbackFirst =
      inquiry.first_name ||
      (inquiry.name ? String(inquiry.name).split(" ")[0] : "") ||
      "";
    const fallbackLast =
      inquiry.last_name ||
      (inquiry.name ? String(inquiry.name).split(" ").slice(1).join(" ") : "") ||
      "";
    const original: InquiryForm = {
      first_name: fallbackFirst,
      last_name: fallbackLast,
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      company_name: inquiry.company_name || "",
      country: inquiry.country || "",
      state: inquiry.state || "",
      address: inquiry.address || "",
      apartment: inquiry.apartment || "",
      city: inquiry.city || "",
      postal_code: inquiry.postal_code || "",
      accepts_info_emails: !!inquiry.accepts_info_emails,
      accepts_marketing: !!inquiry.accepts_marketing,
    };
    return (Object.keys(original) as (keyof InquiryForm)[]).some(
      (k) => original[k] !== form[k]
    );
  }, [inquiry, form]);

  const handleDiscard = () => {
    if (!inquiry) return;
    const fallbackFirst =
      inquiry.first_name ||
      (inquiry.name ? String(inquiry.name).split(" ")[0] : "") ||
      "";
    const fallbackLast =
      inquiry.last_name ||
      (inquiry.name ? String(inquiry.name).split(" ").slice(1).join(" ") : "") ||
      "";
    setForm({
      first_name: fallbackFirst,
      last_name: fallbackLast,
      email: inquiry.email || "",
      phone: inquiry.phone || "",
      company_name: inquiry.company_name || "",
      country: inquiry.country || "",
      state: inquiry.state || "",
      address: inquiry.address || "",
      apartment: inquiry.apartment || "",
      city: inquiry.city || "",
      postal_code: inquiry.postal_code || "",
      accepts_info_emails: !!inquiry.accepts_info_emails,
      accepts_marketing: !!inquiry.accepts_marketing,
    });
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const trimmed = {
        first_name: form.first_name.trim() || null,
        last_name: form.last_name.trim() || null,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        company_name: form.company_name.trim() || null,
        country: form.country.trim() || null,
        state: form.country === "United States" ? form.state.trim() || null : null,
        address: form.address.trim() || null,
        apartment: form.apartment.trim() || null,
        city: form.city.trim() || null,
        postal_code: form.postal_code.trim() || null,
        accepts_info_emails: form.accepts_info_emails,
        accepts_marketing: form.accepts_marketing,
        // Keep `name` in sync with first/last for legacy callers
        name: `${form.first_name.trim()} ${form.last_name.trim()}`.trim() || inquiry?.name,
      };
      const { error } = await supabase
        .from("inquiries")
        .update(trimmed as any)
        .eq("id", id);
      if (error) throw error;
      toast.success("Inquiry updated");
      queryClient.invalidateQueries({ queryKey: ["inquiry", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-inquiries"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update inquiry");
    } finally {
      setSaving(false);
    }
  };

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

  const headerName =
    `${form.first_name} ${form.last_name}`.trim() || inquiry.name || "Inquiry";

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
                <BreadcrumbPage>{headerName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3 leading-none">
            {headerName}
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
          {hasUnsavedChanges && (
            <span className="text-sm text-amber-600 font-medium animate-in fade-in">Unsaved changes</span>
          )}
          <Button
            variant="outline"
            disabled={!hasUnsavedChanges}
            onClick={handleDiscard}
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
          {/* Contact details */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Contact details</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">First name</Label>
                  <Input
                    value={form.first_name}
                    onChange={(e) => update("first_name", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Last name</Label>
                  <Input
                    value={form.last_name}
                    onChange={(e) => update("last_name", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">Phone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Company</Label>
                <Input
                  value={form.company_name}
                  onChange={(e) => update("company_name", e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.accepts_info_emails}
                    onCheckedChange={(v) => update("accepts_info_emails", v === true)}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Accepts product information emails</p>
                    <p className="text-xs text-muted-foreground">
                      Allow sending information about products, technical updates, and follow-ups.
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <Checkbox
                    checked={form.accepts_marketing}
                    onCheckedChange={(v) => update("accepts_marketing", v === true)}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Accepts marketing emails</p>
                    <p className="text-xs text-muted-foreground">
                      Allow sending newsletters, promotions, and announcements.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-2 border-t border-border">
                <span>
                  Submitted {format(new Date(inquiry.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
                {customerLabel && (
                  <span>
                    Customer:{" "}
                    <Link to={`/admin/customers/${inquiry.customers.id}`} className="text-primary hover:underline">
                      {customerLabel}
                    </Link>
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* Inquiry message */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-4">Inquiry message</h2>
            <div className="bg-muted/50 border border-border rounded-md p-4 text-sm text-foreground whitespace-pre-wrap">
              {inquiry.message}
            </div>
          </Card>

          {/* Shipping address */}
          <Card className="p-6">
            <h2 className="text-base font-semibold text-foreground mb-1">Shipping address</h2>
            <p className="text-sm text-muted-foreground mb-4">
              These fields are required to create an order for this lead.
            </p>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Country / region</Label>
                <Select value={form.country} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a country">
                      <span className="inline-flex items-center gap-2">
                        {getCountryCode(form.country) && (
                          <span className={`fi fi-${getCountryCode(form.country)} rounded-sm`} />
                        )}
                        {form.country}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        <span className="inline-flex items-center gap-2">
                          <span className={`fi fi-${c.code} rounded-sm`} />
                          {c.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {form.country === "United States" && (
                <div>
                  <Label className="text-sm font-medium text-foreground">State</Label>
                  <Select value={form.state} onValueChange={(v) => update("state", v)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="text-sm font-medium text-foreground">Address</Label>
                <Input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-foreground">Apartment, suite, etc</Label>
                <Input
                  value={form.apartment}
                  onChange={(e) => update("apartment", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-foreground">Postal code</Label>
                  <Input
                    value={form.postal_code}
                    onChange={(e) => update("postal_code", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-foreground">City</Label>
                  <Input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <InquiryTimeline
            inquiryId={id!}
            inquiryCreatedAt={inquiry.created_at}
            productName={inquiry.product_name}
            defaultContact={headerName}
          />
        </div>
      </div>
    </div>
  );
};

export default InquiryDetail;
