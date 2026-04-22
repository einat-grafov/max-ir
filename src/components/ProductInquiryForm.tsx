import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import "flag-icons/css/flag-icons.min.css";
import { supabase } from "@/integrations/supabase/client";
import { COUNTRIES_WITH_OTHER as COUNTRIES, US_STATES } from "@/lib/countries";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, X } from "lucide-react";

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

interface ProductOption {
  id: string;
  name: string;
}

interface ProductInquiryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productId?: string;
  selectedVariants?: SelectedVariantItem[];
}

const ProductInquiryForm = ({ open, onOpenChange, productName, productId, selectedVariants = [] }: ProductInquiryFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Fetch all active products
  useEffect(() => {
    if (!open) return;
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name")
        .eq("status", "active")
        .order("name");
      if (data) setAllProducts(data);
    };
    fetchProducts();
  }, [open]);

  const buildMessage = useCallback((productIds: string[], products: ProductOption[], variants: SelectedVariantItem[], currentProductName: string) => {
    const selectedNames = products.filter(p => productIds.includes(p.id)).map(p => p.name);
    
    if (variants.length > 0 && productIds.length <= 1) {
      const lines = variants.map(
        (v) => `- ${v.name}${v.sku ? ` (${v.sku})` : ""} × ${v.quantity}`
      );
      return `I'd like to request a quote for ${currentProductName}:\n${lines.join("\n")}`;
    }
    
    if (selectedNames.length === 0) {
      return `I'm interested in learning more about ${currentProductName}.`;
    }
    if (selectedNames.length === 1) {
      return `I'm interested in learning more about ${selectedNames[0]}.`;
    }
    const productList = selectedNames.map(n => `- ${n}`).join("\n");
    return `I'm interested in learning more about the following products:\n${productList}`;
  }, []);

  const [formData, setFormData] = useState({
    companyName: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    country: "",
    state: "",
    message: "",
  });

  // Initialize selected products and message when dialog opens
  useEffect(() => {
    if (open && productId) {
      setSelectedProductIds([productId]);
    }
  }, [open, productId]);

  // Update message when selected products change
  useEffect(() => {
    if (!open) return;
    const msg = buildMessage(selectedProductIds, allProducts, selectedVariants, productName);
    setFormData(prev => ({ ...prev, message: msg }));
  }, [selectedProductIds, allProducts, open, selectedVariants, productName, buildMessage]);

  const handleProductToggle = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const removeProduct = (id: string) => {
    setSelectedProductIds(prev => prev.filter(p => p !== id));
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "country" && value !== "United States") {
        updated.state = "";
      }
      return updated;
    });
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
        state: "",
        message: "",
      });
      setErrors({});
      setSubmitted(false);
      setSelectedProductIds(productId ? [productId] : []);
    }
    onOpenChange(newOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = inquirySchema.safeParse(formData);
    const fieldErrors: Record<string, string> = {};
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
    }
    if (formData.country === "United States" && !formData.state.trim()) {
      fieldErrors.state = "State is required";
    }
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    try {
      const displayName = result.data!.companyName || `${result.data!.firstName} ${result.data!.lastName ?? ""}`.trim();
      const selectedNames = allProducts.filter(p => selectedProductIds.includes(p.id)).map(p => p.name);
      const productNameForDb = selectedNames.length > 0 ? selectedNames.join(", ") : productName;

      const inquiryId = crypto.randomUUID();
      const { error } = await supabase.from("inquiries").insert({
        id: inquiryId,
        product_id: productId ?? null,
        product_name: productNameForDb,
        name: displayName,
        email: result.data!.email,
        message: result.data!.message,
        company_name: result.data!.companyName,
        first_name: result.data!.firstName,
        last_name: result.data!.lastName || null,
        phone: result.data!.phone || null,
        country: result.data!.country,
        state: formData.country === "United States" ? formData.state : null,
      } as any);
      if (error) throw error;

      await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "inquiry-confirmation",
          recipientEmail: result.data!.email,
          idempotencyKey: `inquiry-confirm-${inquiryId}`,
          templateData: {
            name: result.data!.firstName,
            products: productNameForDb,
          },
        },
      });

      // Notify admin (if a notification email is configured)
      const { data: settings } = await supabase
        .from("notification_settings")
        .select("inquiries_notification_email")
        .eq("singleton", true)
        .maybeSingle();
      const notifyEmail = settings?.inquiries_notification_email?.trim();
      if (notifyEmail) {
        await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "inquiry-admin-notification",
            recipientEmail: notifyEmail,
            idempotencyKey: `inquiry-admin-${inquiryId}`,
            templateData: {
              inquirerName: displayName,
              inquirerEmail: result.data!.email,
              inquirerPhone: result.data!.phone || undefined,
              inquirerCompany: result.data!.companyName,
              inquirerCountry: result.data!.country,
              product: productNameForDb,
              message: result.data!.message,
            },
          },
        });
      }

      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to send inquiry. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const selectedProductNames = allProducts.filter(p => selectedProductIds.includes(p.id));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Product Inquiry</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="text-center py-8">
            <p className="font-semibold text-lg text-foreground">Thank you!</p>
            <p className="text-muted-foreground text-sm mt-2">
              Your inquiry has been received. We'll be in touch soon.
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

            {/* State (US only) */}
            {formData.country === "United States" && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">State</label>
                <Select value={formData.state} onValueChange={(v) => handleChange("state", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && <p className="text-destructive text-xs mt-1">{errors.state}</p>}
              </div>
            )}

            {/* Products of Interest */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Products of interest</label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex min-h-10 w-full items-center justify-between rounded-[10px] border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <span className="text-muted-foreground">
                      {selectedProductIds.length === 0
                        ? "Select products..."
                        : `${selectedProductIds.length} product${selectedProductIds.length > 1 ? "s" : ""} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {allProducts.map((product) => (
                      <label
                        key={product.id}
                        className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                      >
                        <Checkbox
                          checked={selectedProductIds.includes(product.id)}
                          onCheckedChange={() => handleProductToggle(product.id)}
                        />
                        <span>{product.name}</span>
                      </label>
                    ))}
                    {allProducts.length === 0 && (
                      <p className="px-2 py-1.5 text-sm text-muted-foreground">No products available</p>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              {/* Selected product chips */}
              {selectedProductNames.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedProductNames.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-medium"
                    >
                      {p.name}
                      <button
                        type="button"
                        onClick={() => removeProduct(p.id)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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
