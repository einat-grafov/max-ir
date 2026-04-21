import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Loader2, ExternalLink, Plus, X } from "lucide-react";

interface SiteSettings {
  id: string;
  base_url: string;
  default_og_image: string | null;
  organization_name: string | null;
  organization_logo: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  social_profiles: string[];
  robots_default: string;
  sitemap_enabled: boolean;
  robots_txt: string;
  google_site_verification: string | null;
}

const SeoSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_seo_settings" as any)
        .select("*")
        .limit(1)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setSettings({
          ...d,
          social_profiles: Array.isArray(d.social_profiles) ? d.social_profiles : [],
        });
      }
      setLoading(false);
    })();
  }, []);

  const update = (key: keyof SiteSettings, value: any) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_seo_settings" as any)
      .update({
        base_url: settings.base_url,
        default_og_image: settings.default_og_image || null,
        organization_name: settings.organization_name || null,
        organization_logo: settings.organization_logo || null,
        contact_email: settings.contact_email || null,
        contact_phone: settings.contact_phone || null,
        social_profiles: settings.social_profiles || [],
        robots_default: settings.robots_default,
        sitemap_enabled: settings.sitemap_enabled,
        robots_txt: settings.robots_txt,
        google_site_verification: settings.google_site_verification || null,
      } as any)
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Site SEO settings saved");
  };

  if (loading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;
  if (!settings) return <div className="text-sm text-muted-foreground py-12 text-center">No settings found</div>;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-base font-semibold">Site-wide SEO</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Global defaults applied across the entire website.
        </p>
      </div>

      {/* Site identity */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Site Identity</p>
        <div className="space-y-2">
          <Label className="text-sm">Base URL</Label>
          <Input value={settings.base_url} onChange={(e) => update("base_url", e.target.value)} placeholder="https://yoursite.com" />
          <p className="text-xs text-muted-foreground">Used for canonical URLs and absolute links.</p>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Default OG Image URL</Label>
          <Input value={settings.default_og_image || ""} onChange={(e) => update("default_og_image", e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground">Fallback for pages without their own OG image. Recommended: 1200×630px.</p>
        </div>
      </section>

      {/* Sitemap */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sitemap.xml</p>
        <div className="flex items-start justify-between gap-4 p-3 rounded-md border bg-card">
          <div className="space-y-0.5">
            <Label className="text-sm">Auto-generate sitemap</Label>
            <p className="text-xs text-muted-foreground">Builds /sitemap.xml from all published pages and products.</p>
          </div>
          <Switch checked={settings.sitemap_enabled} onCheckedChange={(v) => update("sitemap_enabled", v)} />
        </div>
      </section>

      {/* Robots.txt */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Robots.txt</p>
        <Textarea
          value={settings.robots_txt}
          onChange={(e) => update("robots_txt", e.target.value)}
          className="font-mono text-xs min-h-[140px]"
          placeholder={"User-agent: *\nDisallow:"}
        />
        <p className="text-xs text-muted-foreground">
          Use <code>Disallow: /</code> to block all crawlers.
        </p>
        <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          View live robots.txt <ExternalLink className="h-3 w-3" />
        </a>
      </section>

      {/* Google Site Verification */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Google Site Verification</p>
        <Input
          value={settings.google_site_verification || ""}
          onChange={(e) => update("google_site_verification", e.target.value)}
          placeholder="abc123XYZ_paste-only-the-content-value"
        />
        <p className="text-xs text-muted-foreground">
          Paste only the <code>content</code> value from Search Console's HTML tag method.
        </p>
      </section>

      {/* Organization */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Organization (JSON-LD)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Organization Name</Label>
            <Input value={settings.organization_name || ""} onChange={(e) => update("organization_name", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Organization Logo URL</Label>
            <Input value={settings.organization_logo || ""} onChange={(e) => update("organization_logo", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contact Email</Label>
            <Input type="email" value={settings.contact_email || ""} onChange={(e) => update("contact_email", e.target.value)} placeholder="hello@yoursite.com" />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Contact Phone</Label>
            <Input value={settings.contact_phone || ""} onChange={(e) => update("contact_phone", e.target.value)} placeholder="+1 555 0100" />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Social Profile URLs</Label>
          <p className="text-xs text-muted-foreground">
            Used in <code>sameAs</code> for richer search results (LinkedIn, X, etc.).
          </p>
          <div className="space-y-2">
            {settings.social_profiles.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={url}
                  onChange={(e) => {
                    const next = [...settings.social_profiles];
                    next[idx] = e.target.value;
                    update("social_profiles", next);
                  }}
                  placeholder="https://www.linkedin.com/company/..."
                />
                <button
                  type="button"
                  onClick={() => update("social_profiles", settings.social_profiles.filter((_, i) => i !== idx))}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update("social_profiles", [...settings.social_profiles, ""])}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" /> Add profile URL
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <Label className="text-sm">Default Robots Directive</Label>
        <Input value={settings.robots_default} onChange={(e) => update("robots_default", e.target.value)} placeholder="index, follow" />
        <p className="text-xs text-muted-foreground">Per-page meta robots tag default. Per-page settings override this.</p>
      </section>

      <div className="pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
          {saving ? "Saving…" : "Save Site SEO Settings"}
        </Button>
      </div>
    </div>
  );
};

export default SeoSiteSettings;
