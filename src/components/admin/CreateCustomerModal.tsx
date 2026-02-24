import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated?: () => void;
}

const CreateCustomerModal = ({ open, onOpenChange, onCustomerCreated }: CreateCustomerModalProps) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    language: "English",
    email: "",
    accepts_marketing: false,
    tax_exempt: false,
    country: "Israel",
    company: "",
    address: "",
    apartment: "",
    postal_code: "",
    city: "",
    phone: "",
  });

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const resetForm = () =>
    setForm({
      first_name: "",
      last_name: "",
      language: "English",
      email: "",
      accepts_marketing: false,
      tax_exempt: false,
      country: "Israel",
      company: "",
      address: "",
      apartment: "",
      postal_code: "",
      city: "",
      phone: "",
    });

  const handleSave = async () => {
    if (!form.first_name.trim()) {
      toast.error("First name is required");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("customers").insert({
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim() || null,
      language: form.language,
      email: form.email.trim() || null,
      accepts_marketing: form.accepts_marketing,
      tax_exempt: form.tax_exempt,
      country: form.country,
      company: form.company.trim() || null,
      address: form.address.trim() || null,
      apartment: form.apartment.trim() || null,
      postal_code: form.postal_code.trim() || null,
      city: form.city.trim() || null,
      phone: form.phone.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error("Failed to create customer");
      return;
    }
    toast.success("Customer created");
    resetForm();
    onOpenChange(false);
    onCustomerCreated?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <DialogTitle>Create a new customer</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">First name</Label>
              <Input value={form.first_name} onChange={(e) => update("first_name", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">Last name</Label>
              <Input value={form.last_name} onChange={(e) => update("last_name", e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {/* Language */}
          <div>
            <Label className="text-sm font-medium text-foreground">Language</Label>
            <Select value={form.language} onValueChange={(v) => update("language", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English [Default]</SelectItem>
                <SelectItem value="Hebrew">Hebrew</SelectItem>
                <SelectItem value="Arabic">Arabic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">This customer will receive notifications in this language.</p>
          </div>

          {/* Email */}
          <div>
            <Label className="text-sm font-medium text-foreground">Email</Label>
            <Input value={form.email} onChange={(e) => update("email", e.target.value)} type="email" className="mt-1.5" />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox id="accepts-marketing" checked={form.accepts_marketing} onCheckedChange={(c) => update("accepts_marketing", c as boolean)} />
              <label htmlFor="accepts-marketing" className="text-sm text-foreground cursor-pointer">Customer accepts email marketing</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="tax-exempt" checked={form.tax_exempt} onCheckedChange={(c) => update("tax_exempt", c as boolean)} />
              <label htmlFor="tax-exempt" className="text-sm text-foreground cursor-pointer">Customer is tax exempt</label>
            </div>
          </div>

          {/* Country */}
          <div>
            <Label className="text-sm font-medium text-foreground">Country/region</Label>
            <Select value={form.country} onValueChange={(v) => update("country", v)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Israel">Israel</SelectItem>
                <SelectItem value="United States">United States</SelectItem>
                <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                <SelectItem value="Germany">Germany</SelectItem>
                <SelectItem value="France">France</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Company */}
          <div>
            <Label className="text-sm font-medium text-foreground">Company</Label>
            <Input value={form.company} onChange={(e) => update("company", e.target.value)} className="mt-1.5" />
          </div>

          {/* Address */}
          <div>
            <Label className="text-sm font-medium text-foreground">Address</Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={form.address} onChange={(e) => update("address", e.target.value)} className="pl-9" />
            </div>
          </div>

          {/* Apartment */}
          <div>
            <Label className="text-sm font-medium text-foreground">Apartment, suite, etc</Label>
            <Input value={form.apartment} onChange={(e) => update("apartment", e.target.value)} className="mt-1.5" />
          </div>

          {/* Postal / City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-foreground">Postal code</Label>
              <Input value={form.postal_code} onChange={(e) => update("postal_code", e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium text-foreground">City</Label>
              <Input value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1.5" />
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label className="text-sm font-medium text-foreground">Phone</Label>
            <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className="mt-1.5" />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerModal;
