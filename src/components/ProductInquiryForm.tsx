import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const inquirySchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required").max(200),
  firstName: z.string().trim().min(1, "First name is required").max(100),
  lastName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(50).optional(),
  email: z.string().trim().email("Invalid email address").max(255),
  country: z.string().trim().min(1, "Country is required"),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export interface SelectedVariantItem {
  name: string;
  sku?: string;
  price?: string;
  quantity: number;
}

interface ProductInquiryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId?: string;
  selectedVariants?: SelectedVariantItem[];
}

const COUNTRIES: { name: string; flag: string }[] = [
  { name: "United States", flag: "🇺🇸" },
  { name: "Canada", flag: "🇨🇦" },
  { name: "United Kingdom", flag: "🇬🇧" },
  { name: "Germany", flag: "🇩🇪" },
  { name: "France", flag: "🇫🇷" },
  { name: "Australia", flag: "🇦🇺" },
  { name: "Japan", flag: "🇯🇵" },
  { name: "China", flag: "🇨🇳" },
  { name: "India", flag: "🇮🇳" },
  { name: "Brazil", flag: "🇧🇷" },
  { name: "Mexico", flag: "🇲🇽" },
  { name: "South Korea", flag: "🇰🇷" },
  { name: "Israel", flag: "🇮🇱" },
  { name: "Italy", flag: "🇮🇹" },
  { name: "Spain", flag: "🇪🇸" },
  { name: "Netherlands", flag: "🇳🇱" },
  { name: "Sweden", flag: "🇸🇪" },
  { name: "Switzerland", flag: "🇨🇭" },
  { name: "Norway", flag: "🇳🇴" },
  { name: "Denmark", flag: "🇩🇰" },
  { name: "Finland", flag: "🇫🇮" },
  { name: "Belgium", flag: "🇧🇪" },
  { name: "Austria", flag: "🇦🇹" },
  { name: "Poland", flag: "🇵🇱" },
  { name: "Czech Republic", flag: "🇨🇿" },
  { name: "Ireland", flag: "🇮🇪" },
  { name: "Portugal", flag: "🇵🇹" },
  { name: "Singapore", flag: "🇸🇬" },
  { name: "Taiwan", flag: "🇹🇼" },
  { name: "New Zealand", flag: "🇳🇿" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Other", flag: "🌍" },
];

const ProductInquiryForm = ({ open, onOpenChange, productName, productId, selectedVariants = [] }: ProductInquiryFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const buildDefaultMessage = () => {
    if (selectedVariants.length === 0) {
      return `I'm interested in learning more about ${productName}.`;
    }
    const lines = selectedVariants.map(
      (v) => `- ${v.name}${v.sku ? ` (${v.sku})` : ""} × ${v.quantity}`
    );
    return `I'd like to request a quote for ${productName}:\n${lines.join("\n")}`;
  };

  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "",
    message: buildDefaultMessage(),
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setFormData({
        companyName: "",
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        country: "",
        message: buildDefaultMessage(),
      });
      setErrors({});
      setSubmitted(false);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = inquirySchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const displayName = result.data.companyName || `${result.data.firstName} ${result.data.lastName ?? ""}`.trim();
      const { error } = await supabase.from("inquiries").insert({
        product_id: productId ?? null,
        product_name: productName,
        name: displayName,
        email: result.data.email,
        message: result.data.message,
        company_name: result.data.companyName,
        first_name: result.data.firstName,
        last_name: result.data.lastName || null,
        phone: result.data.phone || null,
        country: result.data.country,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to send inquiry. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Inquire About {productName}</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <p className="font-semibold text-lg text-foreground">Thank you!</p>
            <p className="text-muted-foreground text-sm mt-2">
              Your inquiry about {productName} has been received. We'll be in touch soon.
            </p>
            <div className="flex justify-end pt-4">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Company Name */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Company name</label>
              <Input
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                placeholder="Company name"
              />
              {errors.companyName && <p className="text-destructive text-xs mt-1">{errors.companyName}</p>}
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">First name</label>
                <Input
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  placeholder="First name"
                />
                {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Last name</label>
                <Input
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Phone number</label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="Email address"
                />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Country (for shipment)</label>
              <Select value={formData.country} onValueChange={(v) => handleChange("country", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>
                      <span className="inline-flex items-center gap-2">
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-destructive text-xs mt-1">{errors.country}</p>}
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
              <Textarea
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="min-h-[100px] resize-none"
              />
              {errors.message && <p className="text-destructive text-xs mt-1">{errors.message}</p>}
            </div>

            {/* Footer buttons */}
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Inquiry"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductInquiryForm;
