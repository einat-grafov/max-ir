import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, Sparkles, HelpCircle, Loader2, Save, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { calculateAiReadinessScore, type FaqItem } from "@/lib/seoUtils";
import CitationChecklist from "@/components/admin/seo/CitationChecklist";

interface AiItem {
  id: string; // seo_settings.id for pages, product_seo.id (empty if none) for products
  page: string;
  title: string;
  primary_topic: string | null;
  supporting_topics: string[];
  key_entities: string[];
  ai_summary: string | null;
  faq_items: FaqItem[];
  ai_readiness_score: number;
  ai_indexing_allowed: boolean;
  schema_type: string | null;
  ai_last_generated_at: string | null;
  ai_last_generated_by: string | null;
  faq_last_generated_at: string | null;
  faq_last_generated_by: string | null;
  body_content: string;
  kind: "page" | "product";
  product_id?: string;
}

const PAGE_LABELS: Record<string, string> = {
  home: "Home Page",
  about: "About Us Page",
  team: "Team Page",
  store: "Store Page",
  "privacy-policy": "Privacy Policy",
  "refund-and-return": "Refund & Return",
  "shipping-policy": "Shipping Policy",
  "terms-and-conditions": "Terms & Conditions",
};

/** Extract plain-text from a website_content JSON section. */
function extractText(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map(extractText).join(" ");
  if (typeof content === "object") {
    return Object.values(content).map(extractText).join(" ");
  }
  return "";
}

const PerPageGeoEditor = () => {
  const [items, setItems] = useState<AiItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingFaq, setGeneratingFaq] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [primaryTopic, setPrimaryTopic] = useState("");
  const [supportingTopics, setSupportingTopics] = useState("");
  const [keyEntities, setKeyEntities] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);
  const [aiIndexingAllowed, setAiIndexingAllowed] = useState(true);

  const load = async () => {
    const [seoRes, contentRes, productsRes, productSeoRes] = await Promise.all([
      supabase.from("seo_settings").select("*").order("page"),
      supabase.from("website_content").select("page, content"),
      supabase.from("products").select("id, name, overview, description"),
      (supabase as any).from("product_seo").select("*"),
    ]);
    const bodyByPage: Record<string, string> = {};
    (contentRes.data || []).forEach((row: any) => {
      bodyByPage[row.page] = (bodyByPage[row.page] || "") + " " + extractText(row.content);
    });
    const pageRows: AiItem[] = (seoRes.data || []).map((r: any) => ({
      id: r.id,
      page: r.page,
      title: PAGE_LABELS[r.page] || r.page,
      primary_topic: r.primary_topic,
      supporting_topics: r.supporting_topics || [],
      key_entities: r.key_entities || [],
      ai_summary: r.ai_summary,
      faq_items: Array.isArray(r.faq_items) ? r.faq_items : [],
      ai_readiness_score: r.ai_readiness_score || 0,
      ai_indexing_allowed: r.ai_indexing_allowed ?? true,
      schema_type: r.schema_type,
      ai_last_generated_at: r.ai_last_generated_at,
      ai_last_generated_by: r.ai_last_generated_by,
      faq_last_generated_at: r.faq_last_generated_at,
      faq_last_generated_by: r.faq_last_generated_by,
      body_content: (bodyByPage[r.page] || "").trim(),
      kind: "page" as const,
    }));
    const seoByProduct: Record<string, any> = {};
    ((productSeoRes as any).data || []).forEach((r: any) => {
      seoByProduct[r.product_id] = r;
    });
    const productRows: AiItem[] = (productsRes.data || []).map((p: any) => {
      const r = seoByProduct[p.id];
      const stripHtml = (s: string) => (s || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      const body = `${p.name} ${stripHtml(p.overview || "")} ${stripHtml(p.description || "")}`.trim();
      return {
        id: r?.id || "",
        page: `products/${p.id}`,
        title: `Product: ${p.name}`,
        primary_topic: r?.primary_topic ?? null,
        supporting_topics: r?.supporting_topics || [],
        key_entities: r?.key_entities || [],
        ai_summary: r?.ai_summary ?? null,
        faq_items: Array.isArray(r?.faq_items) ? r.faq_items : [],
        ai_readiness_score: r?.ai_readiness_score || 0,
        ai_indexing_allowed: r?.ai_indexing_allowed ?? true,
        schema_type: r?.schema_type || "Product",
        ai_last_generated_at: r?.ai_last_generated_at ?? null,
        ai_last_generated_by: r?.ai_last_generated_by ?? null,
        faq_last_generated_at: r?.faq_last_generated_at ?? null,
        faq_last_generated_by: r?.faq_last_generated_by ?? null,
        body_content: body,
        kind: "product" as const,
        product_id: p.id,
      };
    });
    setItems([...pageRows, ...productRows]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const selected = items.find((i) => i.page === selectedId) || null;

  const selectItem = (item: AiItem) => {
    setSelectedId(item.page);
    setPrimaryTopic(item.primary_topic || "");
    setSupportingTopics((item.supporting_topics || []).join(", "));
    setKeyEntities((item.key_entities || []).join(", "));
    setAiSummary(item.ai_summary || "");
    setFaqItems(item.faq_items || []);
    setAiIndexingAllowed(item.ai_indexing_allowed ?? true);
  };

  const score = selected
    ? calculateAiReadinessScore({
        primary_topic: primaryTopic,
        ai_summary: aiSummary,
        key_entities: keyEntities.split(",").map((s) => s.trim()).filter(Boolean),
        faq_items: faqItems,
        supporting_topics: supportingTopics.split(",").map((s) => s.trim()).filter(Boolean),
      })
    : 0;

  const updateAiRow = async (extra: Record<string, any>) => {
    if (!selected) return { error: null as any };
    if (selected.kind === "product") {
      return await (supabase as any)
        .from("product_seo")
        .upsert({ product_id: selected.product_id, ...extra }, { onConflict: "product_id" });
    }
    return await supabase.from("seo_settings").update(extra as any).eq("id", selected.id);
  };

  const saveFields = async () => {
    if (!selected) return;
    setSaving(true);
    const topics = supportingTopics.split(",").map((s) => s.trim()).filter(Boolean);
    const entities = keyEntities.split(",").map((s) => s.trim()).filter(Boolean);
    const newScore = calculateAiReadinessScore({
      primary_topic: primaryTopic,
      ai_summary: aiSummary,
      key_entities: entities,
      faq_items: faqItems,
      supporting_topics: topics,
    });
    const { error } = await updateAiRow({
      primary_topic: primaryTopic || null,
      supporting_topics: topics,
      key_entities: entities,
      ai_summary: aiSummary || null,
      faq_items: faqItems,
      ai_readiness_score: newScore,
      ai_indexing_allowed: aiIndexingAllowed,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("AI fields saved");
      load();
    }
  };

  const generateSummary = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("cms-ai-generate", {
        body: { type: "summary", title: selected.title, body_content: selected.body_content },
      });
      if (error) throw error;
      if (data) {
        setPrimaryTopic(data.primary_topic || primaryTopic);
        setSupportingTopics((data.supporting_topics || []).join(", "));
        setKeyEntities((data.key_entities || []).join(", "));
        setAiSummary(data.ai_summary || aiSummary);
        const { data: userData } = await supabase.auth.getUser();
        await updateAiRow({
          ai_last_generated_at: new Date().toISOString(),
          ai_last_generated_by: userData.user?.email || "unknown",
        });
        toast.success("AI summary generated");
      }
    } catch (e: any) {
      toast.error(e.message || "Generation failed");
    }
    setGenerating(false);
  };

  const generateFaqs = async () => {
    if (!selected) return;
    setGeneratingFaq(true);
    try {
      const { data, error } = await supabase.functions.invoke("cms-ai-generate", {
        body: { type: "faq", title: selected.title, body_content: selected.body_content },
      });
      if (error) throw error;
      if (data?.faq_items) {
        setFaqItems(data.faq_items);
        const { data: userData } = await supabase.auth.getUser();
        await updateAiRow({
          faq_last_generated_at: new Date().toISOString(),
          faq_last_generated_by: userData.user?.email || "unknown",
        });
        toast.success("FAQs generated");
      }
    } catch (e: any) {
      toast.error(e.message || "FAQ generation failed");
    }
    setGeneratingFaq(false);
  };

  const filtered = items.filter(
    (i) => !search || i.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pages…"
          className="pl-9 h-9 text-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="space-y-1.5">
          {filtered.map((item) => (
            <button
              key={item.page}
              onClick={() => selectItem(item)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedId === item.page ? "border-primary bg-primary/5" : "hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{item.title}</span>
                <div className="flex items-center gap-1 shrink-0">
                  {!item.ai_indexing_allowed && (
                    <Badge variant="outline" className="text-[10px]">No AI</Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px]">{item.ai_readiness_score}%</Badge>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                {item.page}
              </span>
            </button>
          ))}
        </div>

        {/* Editor */}
        {selected ? (
          <div className="lg:col-span-2 space-y-6 p-5 rounded-lg border bg-card">
            {/* GEO score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">GEO / AI Readiness Score</p>
                <span className="text-sm font-semibold">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>

            {/* Citation readiness */}
            <div className="rounded-lg border p-4 bg-muted/20">
              <CitationChecklist
                item={{
                  title: selected.title,
                  ai_summary: aiSummary,
                  key_entities: keyEntities.split(",").map((s) => s.trim()).filter(Boolean),
                  faq_items: faqItems,
                  supporting_topics: supportingTopics.split(",").map((s) => s.trim()).filter(Boolean),
                  schema_type: selected.schema_type,
                  primary_topic: primaryTopic,
                }}
              />
            </div>

            {/* AI indexing toggle */}
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Allow AI training & citation</Label>
                <p className="text-xs text-muted-foreground">
                  When off, AI bots are asked to skip this page and it is excluded from /llms.txt.
                </p>
              </div>
              <Switch checked={aiIndexingAllowed} onCheckedChange={setAiIndexingAllowed} />
            </div>

            {/* Generate buttons */}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={generateSummary} disabled={generating}>
                {generating ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 mr-1" />
                )}
                Generate AI Summary
              </Button>
              <Button size="sm" variant="outline" onClick={generateFaqs} disabled={generatingFaq}>
                {generatingFaq ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                )}
                Suggest FAQs
              </Button>
            </div>

            {/* Timestamps */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {selected.ai_last_generated_at && (
                <span>
                  Summary: {new Date(selected.ai_last_generated_at).toLocaleDateString()} by{" "}
                  {selected.ai_last_generated_by}
                </span>
              )}
              {selected.faq_last_generated_at && (
                <span>
                  FAQs: {new Date(selected.faq_last_generated_at).toLocaleDateString()} by{" "}
                  {selected.faq_last_generated_by}
                </span>
              )}
            </div>

            {/* Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Primary Topic</Label>
                <Input
                  value={primaryTopic}
                  onChange={(e) => setPrimaryTopic(e.target.value)}
                  placeholder="e.g. Infrared Spectroscopic Sensors"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Supporting Topics <span className="text-muted-foreground">(comma separated)</span>
                </Label>
                <Input
                  value={supportingTopics}
                  onChange={(e) => setSupportingTopics(e.target.value)}
                  placeholder="water analysis, food quality, blood diagnostics"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">
                  Key Entities <span className="text-muted-foreground">(comma separated)</span>
                </Label>
                <Input
                  value={keyEntities}
                  onChange={(e) => setKeyEntities(e.target.value)}
                  placeholder="MAX-IR, infrared sensor, MEMS, spectroscopy"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">AI Summary</Label>
                <Textarea
                  value={aiSummary}
                  onChange={(e) => setAiSummary(e.target.value)}
                  rows={4}
                  placeholder="A clear, factual 80–140 word summary for AI consumption…"
                />
              </div>

              {/* FAQs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">FAQ Items</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-7"
                    onClick={() => setFaqItems([...faqItems, { question: "", answer: "" }])}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add FAQ
                  </Button>
                </div>
                {faqItems.map((faq, i) => (
                  <div key={i} className="rounded-lg border p-3 space-y-2 bg-muted/10">
                    <div className="flex items-start justify-between gap-2">
                      <Input
                        value={faq.question}
                        onChange={(e) => {
                          const next = [...faqItems];
                          next[i] = { ...next[i], question: e.target.value };
                          setFaqItems(next);
                        }}
                        placeholder="Question"
                        className="h-8 text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => setFaqItems(faqItems.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-destructive shrink-0 mt-1"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const next = [...faqItems];
                        next[i] = { ...next[i], answer: e.target.value };
                        setFaqItems(next);
                      }}
                      placeholder="Answer"
                      rows={2}
                      className="text-sm"
                    />
                  </div>
                ))}
                {faqItems.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">
                    No FAQs yet — add manually or click "Suggest FAQs".
                  </p>
                )}
              </div>
            </div>

            <Button onClick={saveFields} disabled={saving} size="sm" className="w-full">
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1.5" />
              )}
              Save AI Fields
            </Button>
          </div>
        ) : (
          <div className="lg:col-span-2 p-12 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
            Select a page to edit its AI search fields
          </div>
        )}
      </div>
    </div>
  );
};

export default PerPageGeoEditor;
