import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import SeoPageEditor, { type SeoItem } from "@/components/admin/seo/SeoPageEditor";
import SeoSiteSettings from "@/components/admin/seo/SeoSiteSettings";
import { getSeoScore, getSeoWarnings } from "@/lib/seoUtils";

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

const Seo = () => {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState("https://max-ir.lovable.app");

  useEffect(() => {
    (async () => {
      const [seoRes, siteRes] = await Promise.all([
        supabase.from("seo_settings").select("*").order("page"),
        supabase.from("site_seo_settings" as any).select("base_url").limit(1).maybeSingle(),
      ]);
      const rows = (seoRes.data || []).map((r: any) => ({
        id: r.id,
        page: r.page,
        title: PAGE_LABELS[r.page] || r.page,
        meta_title: r.meta_title,
        meta_description: r.meta_description,
        og_image: r.og_image,
        og_title: r.og_title,
        og_description: r.og_description,
        robots_index: r.robots_index ?? false,
        canonical_url: r.canonical_url,
        schema_type: r.schema_type || "auto",
        schema_data: r.schema_data || {},
      }));
      setItems(rows);
      if (siteRes.data && (siteRes.data as any).base_url) setBaseUrl((siteRes.data as any).base_url);
      setLoading(false);
    })();
  }, []);

  const handleSaved = (updated: SeoItem) => {
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const filtered = items.filter((i) => !search || i.title.toLowerCase().includes(search.toLowerCase()));
  const selected = items.find((i) => i.id === selectedId) || null;

  const avgScore = items.length > 0 ? Math.round(items.reduce((sum, i) => sum + getSeoScore(i), 0) / items.length) : 0;
  const totalWarnings = items.reduce((sum, i) => sum + getSeoWarnings(i).length, 0);
  const indexedCount = items.filter((i) => i.robots_index).length;

  if (loading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage per-page meta tags, social sharing, structured data, and site-wide SEO defaults.
        </p>
      </div>

      <Tabs defaultValue="per-page">
        <TabsList>
          <TabsTrigger value="per-page">Per Page</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="per-page" className="mt-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold">{avgScore}%</p>
              <p className="text-xs text-muted-foreground mt-1">Avg SEO Score</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Pages</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className={`text-2xl font-bold ${totalWarnings > 0 ? "text-amber-600" : ""}`}>{totalWarnings}</p>
              <p className="text-xs text-muted-foreground mt-1">Warnings</p>
            </div>
            <div className="p-4 rounded-lg border bg-card text-center">
              <p className="text-2xl font-bold">{indexedCount}/{items.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Indexed</p>
            </div>
          </div>

          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter pages…" className="pl-9 h-9 text-sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              {filtered.map((item) => {
                const score = getSeoScore(item);
                const warnings = getSeoWarnings(item).length;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedId === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {warnings > 0 && (
                          <span className="text-[10px] text-amber-600 font-medium">{warnings} ⚠</span>
                        )}
                        <span className="text-[10px] font-semibold text-muted-foreground">{score}%</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground truncate block mt-0.5">
                      {item.meta_title || "No meta title"}
                    </span>
                  </button>
                );
              })}
            </div>

            <div>
              {selected ? (
                <div className="p-5 rounded-lg border bg-card">
                  <SeoPageEditor item={selected} baseUrl={baseUrl} onSaved={handleSaved} />
                </div>
              ) : (
                <div className="p-12 rounded-lg border border-dashed text-center text-sm text-muted-foreground">
                  Select a page to edit its SEO data
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="site" className="mt-6">
          <SeoSiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Seo;
