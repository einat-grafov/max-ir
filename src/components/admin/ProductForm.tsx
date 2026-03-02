import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, X, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface ProductSpecification {
  label: string;
  value: string;
}

export interface ProductFormData {
  title: string;
  overview: string;
  description: string;
  category: string;
  price: string;
  sku: string;
  stock: string;
  trackInventory: boolean;
  requiresShipping: boolean;
  taxExempt: boolean;
  status: string;
  existingImageUrl: string | null;
  existingImages: string[];
  specifications: ProductSpecification[];
  variants: string[];
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  pageTitle: string;
  breadcrumbLabel: string;
  submitLabel: string;
  savingLabel: string;
  onSubmit: (data: ProductFormData, imageUrl: string | null, allImageUrls: string[]) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const ProductForm = ({
  initialData,
  pageTitle,
  breadcrumbLabel,
  submitLabel,
  savingLabel,
  onSubmit,
  onDelete,
}: ProductFormProps) => {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [overview, setOverview] = useState(initialData?.overview ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [price, setPrice] = useState(initialData?.price ?? "");
  const [sku, setSku] = useState(initialData?.sku ?? "");
  const [stock, setStock] = useState(initialData?.stock ?? "0");
  const [trackInventory, setTrackInventory] = useState(initialData?.trackInventory ?? true);
  const [requiresShipping, setRequiresShipping] = useState(initialData?.requiresShipping ?? true);
  const [taxExempt, setTaxExempt] = useState(initialData?.taxExempt ?? false);
  const [status, setStatus] = useState(initialData?.status ?? "active");
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    initialData?.specifications ?? [{ label: "", value: "" }]
  );
  const [variants, setVariants] = useState<string[]>(
    initialData?.variants ?? [""]
  );

  // Multiple images support
  const [images, setImages] = useState<{ file?: File; url: string; isExisting: boolean }[]>(
    () => {
      const existing = initialData?.existingImages ?? [];
      if (existing.length > 0) {
        return existing.map(url => ({ url, isExisting: true }));
      }
      if (initialData?.existingImageUrl) {
        return [{ url: initialData.existingImageUrl, isExisting: true }];
      }
      return [];
    }
  );
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length > 0;

  const handleFilesSelect = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const valid: { file: File; url: string; isExisting: boolean }[] = [];
    for (const file of fileArray) {
      if (!file.type.startsWith("image/")) {
        toast.error(`"${file.name}" is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 5MB`);
        continue;
      }
      valid.push({ file, url: URL.createObjectURL(file), isExisting: false });
    }
    if (valid.length > 0) setImages(prev => [...prev, ...valid]);
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const item = prev[index];
      if (!item.isExisting && item.url.startsWith("blob:")) URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!canSubmit) return;
    setSaving(true);
    try {
      // Upload any new image files
      const allImageUrls: string[] = [];
      for (const img of images) {
        if (img.isExisting) {
          allImageUrls.push(img.url);
        } else if (img.file) {
          const ext = img.file.name.split(".").pop();
          const filePath = `${crypto.randomUUID()}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("product-images")
            .upload(filePath, img.file);
          if (uploadError) throw uploadError;
          const { data: urlData } = supabase.storage
            .from("product-images")
            .getPublicUrl(filePath);
          allImageUrls.push(urlData.publicUrl);
        }
      }

      const primaryImageUrl = allImageUrls.length > 0 ? allImageUrls[0] : null;

      await onSubmit(
        { title, overview, description, category, price, sku, stock, trackInventory, requiresShipping, taxExempt, status, existingImageUrl: null, existingImages: [], specifications: specifications.filter(s => s.label.trim() && s.value.trim()), variants: variants.filter(v => v.trim()) },
        primaryImageUrl,
        allImageUrls
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/products">Products</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{breadcrumbLabel}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
        <div className="flex gap-3">
          {onDelete && (
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <AlertDialog>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="cursor-pointer" disabled={deleting}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this product? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={async () => {
                          setDeleting(true);
                          try {
                            await onDelete();
                          } finally {
                            setDeleting(false);
                          }
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button variant="outline" asChild>
            <Link to="/admin/products">Discard</Link>
          </Button>
          <Button disabled={!canSubmit || saving} onClick={handleSave}>
            {saving ? savingLabel : submitLabel}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Product Name</Label>
              <Input id="title" placeholder="Short sleeve t-shirt" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Product Overview</Label>
              <RichTextEditor value={overview} onChange={setOverview} placeholder="Add a brief overview for this product..." />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <RichTextEditor value={description} onChange={setDescription} placeholder="Add a description for this product..." />
            </div>
          </Card>

          <Card className="p-5">
            <Label className="mb-1 block">Media</Label>
            <p className="text-xs text-muted-foreground mb-3">You can add unlimited images per product. The first image is used as the primary thumbnail in product lists.</p>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) handleFilesSelect(e.target.files); }} />
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <div
                  key={index}
                  draggable
                  onDragStart={() => setDragIndex(index)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(index); }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIndex !== null && dragIndex !== index) {
                      setImages(prev => {
                        const updated = [...prev];
                        const [moved] = updated.splice(dragIndex, 1);
                        updated.splice(index, 0, moved);
                        return updated;
                      });
                    }
                    setDragIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  className={`relative inline-block cursor-grab active:cursor-grabbing transition-all ${
                    dragOverIndex === index ? "ring-2 ring-primary scale-105" : ""
                  } ${dragIndex === index ? "opacity-40" : ""}`}
                >
                  <img src={img.url} alt={`Product image ${index + 1}`} className="h-32 w-32 rounded-lg border border-border object-cover" />
                  {index === 0 && images.length > 1 && (
                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">Primary</span>
                  )}
                  <button onClick={() => removeImage(index)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80 transition-opacity">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div
                className="h-32 w-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files?.length) handleFilesSelect(e.dataTransfer.files); }}
              >
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Add image</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-2">
            <Label>Variants</Label>
            <p className="text-xs text-muted-foreground mb-1">Add product variants such as sizes, colors, or configurations.</p>
            {variants.map((variant, index) => (
              <div key={index} className="flex gap-3 items-center">
                <Input
                  placeholder="e.g. 10 mL, Red, Standard"
                  value={variant}
                  onChange={(e) => {
                    const updated = [...variants];
                    updated[index] = e.target.value;
                    setVariants(updated);
                  }}
                  className="flex-1"
                />
                {variants.length > 1 && (
                  <button
                    onClick={() => setVariants(variants.filter((_, i) => i !== index))}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!variants[variants.length - 1]?.trim()}
                onClick={() => setVariants([...variants, ""])}
              >
                Add another
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-2">
            <Label>Category</Label>
            <Input placeholder="e.g. Sensors, Accessories" value={category} onChange={(e) => setCategory(e.target.value)} />
            <p className="text-xs text-muted-foreground">Determines tax rates and adds metafields to improve search, filters, and cross-channel sales</p>
          </Card>

          <Card className="p-5 space-y-4">
            <Label>Specifications</Label>
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Label (e.g. Weight)"
                    value={spec.label}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index] = { ...updated[index], label: e.target.value };
                      setSpecifications(updated);
                    }}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <Input
                    placeholder="Value (e.g. 2.5 kg)"
                    value={spec.value}
                    onChange={(e) => {
                      const updated = [...specifications];
                      updated[index] = { ...updated[index], value: e.target.value };
                      setSpecifications(updated);
                    }}
                  />
                </div>
                {specifications.length > 1 && (
                  <button
                    onClick={() => setSpecifications(specifications.filter((_, i) => i !== index))}
                    className="mt-2 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={!specifications[specifications.length - 1]?.label.trim() || !specifications[specifications.length - 1]?.value.trim()}
                onClick={() => setSpecifications([...specifications, { label: "", value: "" }])}
              >
                Add another
              </Button>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <Label>Price</Label>
            <div className="relative w-48">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input type="number" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-7" min="0" step="0.01" />
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <span className="text-sm text-muted-foreground">Charge tax</span>
              <Switch checked={!taxExempt} onCheckedChange={(v) => setTaxExempt(!v)} />
              <span className="text-xs text-muted-foreground">{taxExempt ? "No" : "Yes"}</span>
            </div>
          </Card>

          <Card className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Inventory</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Inventory tracked</span>
                <Switch checked={trackInventory} onCheckedChange={setTrackInventory} />
              </div>
            </div>
            {trackInventory && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground">
                  <span>Location</span>
                  <span className="text-right">Quantity</span>
                </div>
                <div className="grid grid-cols-2 gap-4 px-4 py-3 items-center">
                  <span className="text-sm text-foreground">Default</span>
                  <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="w-24 ml-auto text-right" min="0" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" placeholder="Stock Keeping Unit" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Shipping</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Physical product</span>
                <Switch checked={requiresShipping} onCheckedChange={setRequiresShipping} />
              </div>
            </div>
            {requiresShipping && (
              <p className="text-xs text-muted-foreground mt-3">Customers will need to enter their shipping address at checkout.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5 space-y-3">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-5 space-y-4">
            <h2 className="text-base font-semibold text-foreground">Product organization</h2>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input placeholder="e.g. Sensor, Module" />
            </div>
            <div className="space-y-2">
              <Label>Vendor</Label>
              <Input placeholder="e.g. MAX-IR Labs" />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="Add tags separated by commas" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
