import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";

const CreateProduct = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: ProductFormData, imageUrl: string | null, allImageUrls: string[]) => {
    const { error } = await supabase.from("products").insert({
      name: data.title.trim(),
      description: data.description || "",
      category: data.category || null,
      price: parseFloat(data.price) || 0,
      sku: data.sku || null,
      stock: parseInt(data.stock) || 0,
      requires_shipping: data.requiresShipping,
      tax_exempt: data.taxExempt,
      image_url: imageUrl,
      images: allImageUrls as unknown as Json,
      specifications: (data.specifications.length > 0 ? data.specifications : []) as unknown as Json,
    });
    if (error) throw error;
    toast.success("Product created successfully");
    navigate("/admin/products");
  };

  return (
    <ProductForm
      pageTitle="Add product"
      breadcrumbLabel="Add product"
      submitLabel="Save product"
      savingLabel="Saving..."
      onSubmit={handleSubmit}
    />
  );
};

export default CreateProduct;
