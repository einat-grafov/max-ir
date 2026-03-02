import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

export interface SelectedVariantItem {
  name: string;
  sku?: string;
  price?: string;
  quantity: number;
}

interface ProductInquiryFormProps {
  productName: string;
  productId?: string;
  selectedVariants?: SelectedVariantItem[];
}

const ProductInquiryForm = ({ productName, productId, selectedVariants = [] }: ProductInquiryFormProps) => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    name: "",
    email: "",
    message: buildDefaultMessage(),
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
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
    try {
      const { error } = await supabase.from("inquiries").insert({
        product_id: productId ?? null,
        product_name: productName,
        name: result.data.name,
        email: result.data.email,
        message: result.data.message,
      });
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast({ title: "Error", description: "Failed to send inquiry. Please try again.", variant: "destructive" });
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <p className="text-maxir-white font-semibold text-lg">Thank you!</p>
        <p className="text-maxir-white/60 text-sm mt-2">
          Your inquiry about {productName} has been received. We'll be in touch soon.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-maxir-dark-surface border border-maxir-white/20 text-maxir-white px-4 py-3 text-sm placeholder:text-maxir-white/40 focus:outline-none focus:border-primary rounded-md";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <input
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className={inputClass}
        />
        {errors.name && <p className="text-primary text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className={inputClass}
        />
        {errors.email && <p className="text-primary text-xs mt-1">{errors.email}</p>}
      </div>
      <div>
        <textarea
          placeholder="Your Message"
          rows={4}
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className={`${inputClass} resize-none`}
        />
        {errors.message && <p className="text-primary text-xs mt-1">{errors.message}</p>}
      </div>
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-sm font-semibold transition-colors w-fit rounded-md"
      >
        Send Inquiry
      </button>
    </form>
  );
};

export default ProductInquiryForm;
