import { useState } from "react";
import { z } from "zod";
import "flag-icons/css/flag-icons.min.css";
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

const COUNTRIES: { name: string; code: string }[] = [
  { name: "Afghanistan", code: "af" },
  { name: "Albania", code: "al" },
  { name: "Algeria", code: "dz" },
  { name: "Argentina", code: "ar" },
  { name: "Armenia", code: "am" },
  { name: "Australia", code: "au" },
  { name: "Austria", code: "at" },
  { name: "Azerbaijan", code: "az" },
  { name: "Bahrain", code: "bh" },
  { name: "Bangladesh", code: "bd" },
  { name: "Belarus", code: "by" },
  { name: "Belgium", code: "be" },
  { name: "Bolivia", code: "bo" },
  { name: "Bosnia and Herzegovina", code: "ba" },
  { name: "Brazil", code: "br" },
  { name: "Bulgaria", code: "bg" },
  { name: "Cambodia", code: "kh" },
  { name: "Canada", code: "ca" },
  { name: "Chile", code: "cl" },
  { name: "China", code: "cn" },
  { name: "Colombia", code: "co" },
  { name: "Costa Rica", code: "cr" },
  { name: "Croatia", code: "hr" },
  { name: "Cyprus", code: "cy" },
  { name: "Czech Republic", code: "cz" },
  { name: "Denmark", code: "dk" },
  { name: "Dominican Republic", code: "do" },
  { name: "Ecuador", code: "ec" },
  { name: "Egypt", code: "eg" },
  { name: "Estonia", code: "ee" },
  { name: "Ethiopia", code: "et" },
  { name: "Finland", code: "fi" },
  { name: "France", code: "fr" },
  { name: "Georgia", code: "ge" },
  { name: "Germany", code: "de" },
  { name: "Ghana", code: "gh" },
  { name: "Greece", code: "gr" },
  { name: "Guatemala", code: "gt" },
  { name: "Hong Kong", code: "hk" },
  { name: "Hungary", code: "hu" },
  { name: "Iceland", code: "is" },
  { name: "India", code: "in" },
  { name: "Indonesia", code: "id" },
  { name: "Iraq", code: "iq" },
  { name: "Ireland", code: "ie" },
  { name: "Israel", code: "il" },
  { name: "Italy", code: "it" },
  { name: "Jamaica", code: "jm" },
  { name: "Japan", code: "jp" },
  { name: "Jordan", code: "jo" },
  { name: "Kazakhstan", code: "kz" },
  { name: "Kenya", code: "ke" },
  { name: "Kuwait", code: "kw" },
  { name: "Latvia", code: "lv" },
  { name: "Lebanon", code: "lb" },
  { name: "Lithuania", code: "lt" },
  { name: "Luxembourg", code: "lu" },
  { name: "Malaysia", code: "my" },
  { name: "Malta", code: "mt" },
  { name: "Mexico", code: "mx" },
  { name: "Moldova", code: "md" },
  { name: "Mongolia", code: "mn" },
  { name: "Morocco", code: "ma" },
  { name: "Myanmar", code: "mm" },
  { name: "Nepal", code: "np" },
  { name: "Netherlands", code: "nl" },
  { name: "New Zealand", code: "nz" },
  { name: "Nigeria", code: "ng" },
  { name: "North Macedonia", code: "mk" },
  { name: "Norway", code: "no" },
  { name: "Oman", code: "om" },
  { name: "Pakistan", code: "pk" },
  { name: "Panama", code: "pa" },
  { name: "Paraguay", code: "py" },
  { name: "Peru", code: "pe" },
  { name: "Philippines", code: "ph" },
  { name: "Poland", code: "pl" },
  { name: "Portugal", code: "pt" },
  { name: "Qatar", code: "qa" },
  { name: "Romania", code: "ro" },
  { name: "Russia", code: "ru" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "Serbia", code: "rs" },
  { name: "Singapore", code: "sg" },
  { name: "Slovakia", code: "sk" },
  { name: "Slovenia", code: "si" },
  { name: "South Africa", code: "za" },
  { name: "South Korea", code: "kr" },
  { name: "Spain", code: "es" },
  { name: "Sri Lanka", code: "lk" },
  { name: "Sweden", code: "se" },
  { name: "Switzerland", code: "ch" },
  { name: "Taiwan", code: "tw" },
  { name: "Tanzania", code: "tz" },
  { name: "Thailand", code: "th" },
  { name: "Tunisia", code: "tn" },
  { name: "Turkey", code: "tr" },
  { name: "Ukraine", code: "ua" },
  { name: "United Arab Emirates", code: "ae" },
  { name: "United Kingdom", code: "gb" },
  { name: "United States", code: "us" },
  { name: "Uruguay", code: "uy" },
  { name: "Uzbekistan", code: "uz" },
  { name: "Venezuela", code: "ve" },
  { name: "Vietnam", code: "vn" },
  { name: "Other", code: "" },
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
                        {c.code ? (
                          <span className={`fi fi-${c.code} rounded-sm`} style={{ fontSize: '1rem', lineHeight: 1 }} />
                        ) : (
                          <span className="inline-block w-4 h-3 rounded-sm bg-muted" />
                        )}
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
