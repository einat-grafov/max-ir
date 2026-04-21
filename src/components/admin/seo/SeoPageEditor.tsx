import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle, Save, Loader2, Sparkles } from "lucide-react";
import SchemaPicker, { type SchemaType, type SchemaData } from "./SchemaPicker";
import SocialPreviews from "./SocialPreviews";
import { getSeoScore, getSeoWarnings } from "@/lib/seoUtils";

export interface SeoItem {
  id: string; // seo_settings.id for pages, product_seo.id (empty if no row yet) for products
  page: string; // page slug for pages, "products/:id" for products
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  og_title: string | null;
  og_description: string | null;
  robots_index: boolean;
  canonical_url: string | null;
  schema_type: string | null;
  schema_data: any;
  kind?: "page" | "product";
  product_id?: string;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-green-600 bg-green-50 border-green-200"
      : score >= 50
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-red-600 bg-red-50 border-red-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      {score}%
    </span>
  );
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = value.length;
  const color = len === 0 ? "text-muted-foreground" : len > max ? "text-red-500" : "text-green-600";
  return <span className={`text-[10px] ${color}`}>{len}/{max}</span>;
}

function buildCanonicalUrl(baseUrl: string, page: string): string {
  let base = (baseUrl || "").trim().replace(/\/+$/, "");
  if (!base) base = "https://max-ir.lovable.app";
  if (!page || page === "home") return base + "/";
  return `${base}/${page}`;
}

interface Props {
  item: SeoItem;
  baseUrl: string;
  onSaved: (updated: SeoItem) => void;
}

const SeoPageEditor = ({ item, baseUrl, onSaved }: Props) => {
  const autoCanonical = buildCanonicalUrl(baseUrl, item.page);
  const [form, setForm] = useState({
    meta_title: item.meta_title || "",
    meta_description: item.meta_description || "",
    og_title: item.og_title || "",
    og_description: item.og_description || "",
    og_image: item.og_image || "",
    canonical_url: item.canonical_url || autoCanonical,
    robots_index: item.robots_index,
    schema_type: (item.schema_type || "auto") as SchemaType,
    schema_data: (item.schema_data && typeof item.schema_data === "object" ? item.schema_data : {}) as SchemaData,
  });
  const [saving, setSaving] = useState(false);
  const [generatingOg, setGeneratingOg] = useState(false);

  useEffect(() => {
    setForm({
      meta_title: item.meta_title || "",
      meta_description: item.meta_description || "",
      og_title: item.og_title || "",
      og_description: item.og_description || "",
      og_image: item.og_image || "",
      canonical_url: item.canonical_url || buildCanonicalUrl(baseUrl, item.page),
      robots_index: item.robots_index,
      schema_type: (item.schema_type || "auto") as SchemaType,
      schema_data: (item.schema_data && typeof item.schema_data === "object" ? item.schema_data : {}) as SchemaData,
    });
  }, [item.id, baseUrl]);

  const generateOg = async () => {
    setGeneratingOg(true);
    try {
      const { data, error } = await supabase.functions.invoke("cms-ai-generate", {
        body: { type: "og", title: item.title, body_content: form.meta_description || form.meta_title || item.title },
      });
      if (error) throw error;
      if (data) {
        setForm((f) => ({
          ...f,
          og_title: data.og_title || f.og_title,
          og_description: data.og_description || f.og_description,
        }));
        toast.success("OG metadata generated");
      }
    } catch (e: any) {
      toast.error(e.message || "OG generation failed");
    }
    setGeneratingOg(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      canonical_url: form.canonical_url || null,
      robots_index: form.robots_index,
      schema_type: form.schema_type,
      schema_data: form.schema_data || {},
    };
    let error: any = null;
    let newId = item.id;
    if (item.kind === "product") {
      const { data, error: upsertError } = await (supabase as any)
        .from("product_seo")
        .upsert({ product_id: item.product_id, ...payload }, { onConflict: "product_id" })
        .select("id")
        .single();
      error = upsertError;
      if (data?.id) newId = data.id;
    } else {
      const { error: updateError } = await supabase
        .from("seo_settings")
        .update(payload as any)
        .eq("id", item.id);
      error = updateError;
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("SEO data saved");
      onSaved({ ...item, id: newId, ...payload } as SeoItem);
    }
  };

  const updatedItem: SeoItem = { ...item, ...form };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">{item.title}</h3>
          <Badge variant="secondary" className="text-[10px]">{item.page}</Badge>
        </div>
        <ScoreBadge score={getSeoScore(updatedItem)} />
      </div>

      {/* Google preview */}
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Google Preview</p>
        <div className="p-3 rounded-lg border bg-card space-y-0.5">
          <p className="text-sm text-blue-600 truncate">{form.meta_title || item.title}</p>
          <p className="text-xs text-green-700 truncate">{(form.canonical_url || autoCanonical).replace(/^https?:\/\//, "")}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {form.meta_description || "No description set."}
          </p>
        </div>
      </div>

      {/* Editable fields */}
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">Meta Title</Label>
            <CharCount value={form.meta_title} max={60} />
          </div>
          <Input
            value={form.meta_title}
            onChange={(e) => setForm((f) => ({ ...f, meta_title: e.target.value }))}
            placeholder="Page title for search engines"
            className="h-8 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">Meta Description</Label>
            <CharCount value={form.meta_description} max={160} />
          </div>
          <Textarea
            value={form.meta_description}
            onChange={(e) => setForm((f) => ({ ...f, meta_description: e.target.value }))}
            placeholder="Brief description for search results"
            className="text-sm min-h-[60px]"
            rows={2}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">Canonical URL</Label>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, canonical_url: autoCanonical }))}
              className="text-[10px] text-muted-foreground hover:text-foreground hover:underline"
            >
              Auto-generate
            </button>
          </div>
          <Input
            value={form.canonical_url}
            onChange={(e) => setForm((f) => ({ ...f, canonical_url: e.target.value }))}
            placeholder={autoCanonical}
            className="h-8 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">OG Title</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateOg}
                disabled={generatingOg}
                className="h-7 text-[11px] px-2.5 gap-1"
              >
                {generatingOg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                Suggest with AI
              </Button>
              <CharCount value={form.og_title} max={60} />
            </div>
          </div>
          <Input
            value={form.og_title}
            onChange={(e) => setForm((f) => ({ ...f, og_title: e.target.value }))}
            placeholder="Title for social sharing"
            className="h-8 text-sm"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label className="text-xs">OG Description</Label>
            <CharCount value={form.og_description} max={160} />
          </div>
          <Textarea
            value={form.og_description}
            onChange={(e) => setForm((f) => ({ ...f, og_description: e.target.value }))}
            placeholder="Description for social sharing"
            className="text-sm min-h-[60px]"
            rows={2}
          />
        </div>

        <div>
          <Label className="text-xs mb-1 block">OG Image URL</Label>
          <Input
            value={form.og_image}
            onChange={(e) => setForm((f) => ({ ...f, og_image: e.target.value }))}
            placeholder="https://..."
            className="h-8 text-sm"
          />
          {form.og_image && (
            <img src={form.og_image} alt="OG preview" className="mt-2 w-full aspect-[1.91/1] object-cover rounded-md border max-w-md" />
          )}
        </div>

        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Social Preview</p>
          <SocialPreviews
            title={form.og_title || form.meta_title || item.title}
            description={form.og_description || form.meta_description || ""}
            image={form.og_image}
            url={form.canonical_url || autoCanonical}
            siteName="MAX-IR Labs"
          />
        </div>

        <div className="flex items-center justify-between py-1">
          <Label className="text-xs">Allow search engine indexing</Label>
          <Switch
            checked={form.robots_index}
            onCheckedChange={(v) => setForm((f) => ({ ...f, robots_index: v }))}
          />
        </div>

        <SchemaPicker
          schemaType={form.schema_type}
          schemaData={form.schema_data}
          onChange={(type, data) => setForm((f) => ({ ...f, schema_type: type, schema_data: data }))}
        />
      </div>

      {getSeoWarnings(updatedItem).length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Warnings</p>
          <div className="space-y-1">
            {getSeoWarnings(updatedItem).map((w, i) => (
              <p key={i} className="text-xs text-amber-600 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3 shrink-0" /> {w}
              </p>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
        Save SEO Data
      </Button>
    </div>
  );
};

export default SeoPageEditor;
