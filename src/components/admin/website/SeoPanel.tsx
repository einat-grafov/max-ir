import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Save, ChevronDown, Globe, Share2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoRow {
  id: string;
  page: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
}

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  about: "About Us Page",
  team: "Team Page",
  store: "Store Page",
};

const SeoPageEditor = ({ seo, onSaved }: { seo: SeoRow; onSaved: () => void }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(seo);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof SeoRow, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("seo_settings")
      .update({
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        og_title: form.og_title,
        og_description: form.og_description,
        og_image: form.og_image,
        canonical_url: form.canonical_url,
      } as any)
      .eq("id", seo.id);
    setSaving(false);
    if (error) {
      toast.error("Failed to save SEO settings");
      return;
    }
    toast.success(`SEO for ${PAGE_LABELS[seo.page] || seo.page} saved`);
    onSaved();
  };

  const metaDescLength = (form.meta_description || "").length;
  const metaTitleLength = (form.meta_title || "").length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground/40" />
              <span className="font-semibold text-sm text-foreground">
                {PAGE_LABELS[seo.page] || seo.page}
              </span>
              {form.meta_title && (
                <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                  — {form.meta_title}
                </span>
              )}
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border p-4 space-y-6">
            {/* Meta Tags */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                Meta Tags
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Meta Title
                  <span className={cn("ml-2 text-xs font-normal", metaTitleLength > 60 ? "text-destructive" : "text-muted-foreground")}>
                    {metaTitleLength}/60
                  </span>
                </Label>
                <Input
                  value={form.meta_title}
                  onChange={(e) => update("meta_title", e.target.value)}
                  placeholder="Page title for search engines"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  Meta Description
                  <span className={cn("ml-2 text-xs font-normal", metaDescLength > 160 ? "text-destructive" : "text-muted-foreground")}>
                    {metaDescLength}/160
                  </span>
                </Label>
                <Textarea
                  value={form.meta_description}
                  onChange={(e) => update("meta_description", e.target.value)}
                  placeholder="Brief description for search engine results"
                  rows={3}
                />
              </div>
            </div>

            {/* Open Graph */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Share2 className="h-3.5 w-3.5" />
                Open Graph (Social Sharing)
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">OG Title</Label>
                <Input
                  value={form.og_title}
                  onChange={(e) => update("og_title", e.target.value)}
                  placeholder="Defaults to meta title if empty"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">OG Description</Label>
                <Textarea
                  value={form.og_description}
                  onChange={(e) => update("og_description", e.target.value)}
                  placeholder="Defaults to meta description if empty"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">OG Image URL</Label>
                <Input
                  value={form.og_image}
                  onChange={(e) => update("og_image", e.target.value)}
                  placeholder="https://example.com/og-image.jpg"
                />
                {form.og_image && (
                  <div className="mt-2 rounded-md overflow-hidden border border-border bg-muted/30 max-w-[320px]">
                    <img
                      src={form.og_image}
                      alt="OG Preview"
                      className="w-full h-auto object-cover aspect-[1.91/1]"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Canonical */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Link2 className="h-3.5 w-3.5" />
                Canonical URL
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Canonical URL</Label>
                <Input
                  value={form.canonical_url}
                  onChange={(e) => update("canonical_url", e.target.value)}
                  placeholder="https://max-ir.com/page (optional)"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
              <Button onClick={handleSave} disabled={saving} size="sm">
                <Save className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

const SeoPanel = () => {
  const queryClient = useQueryClient();

  const { data: seoSettings, isLoading } = useQuery({
    queryKey: ["seo-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .order("page");
      if (error) throw error;
      return data as unknown as SeoRow[];
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["seo-settings"] });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading...</p>;

  if (!seoSettings || seoSettings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
        <Globe className="h-10 w-10 mx-auto mb-3 opacity-40" />
        <h3 className="font-semibold text-foreground mb-1">No SEO Settings</h3>
        <p className="text-sm">SEO settings will appear here once pages are configured.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {seoSettings.map((seo) => (
        <SeoPageEditor key={seo.id} seo={seo} onSaved={invalidate} />
      ))}
    </div>
  );
};

export default SeoPanel;
