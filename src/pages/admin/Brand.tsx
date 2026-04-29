import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Save,
  Upload,
  Download,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  Palette,
  Check,
  Copy,
} from "lucide-react";

const LOGO_DEFAULT = "/images/maxir-logo.svg";
const LOGO_DARK = "/images/maxir-logo-dark.svg";
const LOGO_LIGHT = "/images/maxir-logo-light.svg";

type BrandSettings = {
  id: string;
  site_name: string | null;
  site_tagline: string | null;
  favicon_url: string | null;
  apple_touch_icon_url: string | null;
  default_og_image: string | null;
  organization_logo: string | null;
  theme_color: string | null;
  twitter_handle: string | null;
};

const FIELDS =
  "id, site_name, site_tagline, favicon_url, apple_touch_icon_url, default_og_image, organization_logo, theme_color, twitter_handle";

export default function Brand() {
  const [settings, setSettings] = useState<BrandSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_seo_settings" as any)
        .select(FIELDS)
        .limit(1)
        .maybeSingle();
      if (data) setSettings(data as any);
      setLoading(false);
    })();
  }, []);

  const update = (key: keyof BrandSettings, value: any) =>
    setSettings((s) => (s ? { ...s, [key]: value } : s));

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_seo_settings" as any)
      .update({
        site_name: settings.site_name || null,
        site_tagline: settings.site_tagline || null,
        favicon_url: settings.favicon_url || null,
        apple_touch_icon_url: settings.apple_touch_icon_url || null,
        default_og_image: settings.default_og_image || null,
        organization_logo: settings.organization_logo || null,
        theme_color: settings.theme_color || null,
        twitter_handle: settings.twitter_handle || null,
      } as any)
      .eq("id", settings.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Brand settings saved");
  };

  if (loading)
    return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;
  if (!settings)
    return <div className="text-sm text-muted-foreground py-12 text-center">No settings found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Brand</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your visual identity — favicons, logos, fonts, and design tokens.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="design">Design System</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-6">
          <AssetsPanel
            settings={settings}
            update={update}
            onSave={handleSave}
            saving={saving}
          />
        </TabsContent>

        <TabsContent value="design" className="mt-6">
          <DesignSystemPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ──────────────── Assets Panel ──────────────── */

function AssetsPanel({
  settings,
  update,
  onSave,
  saving,
}: {
  settings: BrandSettings;
  update: (k: keyof BrandSettings, v: any) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <div className="max-w-3xl space-y-8">
      {/* Identity */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Identity
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Site Name</Label>
            <Input
              value={settings.site_name || ""}
              onChange={(e) => update("site_name", e.target.value)}
              placeholder="Max-IR Labs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Twitter / X Handle</Label>
            <Input
              value={settings.twitter_handle || ""}
              onChange={(e) => update("twitter_handle", e.target.value)}
              placeholder="@yourhandle"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Tagline</Label>
          <Input
            value={settings.site_tagline || ""}
            onChange={(e) => update("site_tagline", e.target.value)}
            placeholder="A short line that describes your brand"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm">Theme Color</Label>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="color"
              value={settings.theme_color || "#FF2D55"}
              onChange={(e) => update("theme_color", e.target.value)}
              className="h-10 w-14 rounded-md border border-input cursor-pointer bg-background"
            />
            <Input
              value={settings.theme_color || ""}
              onChange={(e) => update("theme_color", e.target.value)}
              placeholder="#FF2D55"
              className="max-w-[160px] font-mono text-sm"
            />
            <span className="text-xs text-muted-foreground">
              Used by mobile browsers for the address bar.
            </span>
          </div>
        </div>
      </section>

      {/* Browser Icons */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Browser Icons
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AssetUploader
            label="Favicon"
            hint="32×32 or 64×64 PNG / ICO. Shown in browser tabs."
            value={settings.favicon_url}
            accept="image/png,image/x-icon,image/svg+xml,image/vnd.microsoft.icon"
            pathPrefix="brand/favicon"
            onChange={(url) => update("favicon_url", url)}
          />
          <AssetUploader
            label="Apple Touch Icon"
            hint="180×180 PNG. Shown when added to iOS home screen."
            value={settings.apple_touch_icon_url}
            accept="image/png"
            pathPrefix="brand/apple-touch-icon"
            onChange={(url) => update("apple_touch_icon_url", url)}
          />
        </div>
      </section>

      {/* Logo + OG */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Logo & Social Preview
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AssetUploader
            label="Organization Logo"
            hint="SVG or PNG. Used in Organization schema and emails."
            value={settings.organization_logo}
            accept="image/png,image/svg+xml,image/jpeg,image/webp"
            pathPrefix="brand/logo"
            onChange={(url) => update("organization_logo", url)}
          />
          <AssetUploader
            label="Default OG / Preview Image"
            hint="1200×630 JPG or PNG. Used when a page has no specific OG image."
            value={settings.default_og_image}
            accept="image/png,image/jpeg,image/webp"
            pathPrefix="brand/og-default"
            onChange={(url) => update("default_og_image", url)}
          />
        </div>
      </section>

      {/* Built-in logo files */}
      <section className="space-y-3">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Built-in Logo Files
        </p>
        <div className="space-y-2">
          {[
            { src: LOGO_DEFAULT, name: "Max-IR Logo (Primary)", file: "maxir-logo.svg" },
            { src: LOGO_DARK, name: "Max-IR Logo (Dark)", file: "maxir-logo-dark.svg" },
            { src: LOGO_LIGHT, name: "Max-IR Logo (Light)", file: "maxir-logo-light.svg" },
          ].map((logo) => (
            <div
              key={logo.file}
              className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 shrink-0 rounded-md bg-muted flex items-center justify-center">
                  <img src={logo.src} alt={logo.name} className="h-7 max-w-[40px] object-contain" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{logo.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Bundled at /public/images/{logo.file}
                  </p>
                </div>
              </div>
              <a href={logo.src} download={logo.file}>
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4 border-t">
        <Button onClick={onSave} disabled={saving}>
          <Save className="h-3.5 w-3.5 mr-1.5" />
          {saving ? "Saving…" : "Save Brand Settings"}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────── Asset Uploader ──────────────── */

function AssetUploader({
  label,
  hint,
  value,
  accept,
  pathPrefix,
  onChange,
}: {
  label: string;
  hint: string;
  value: string | null;
  accept: string;
  pathPrefix: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop() || "bin";
    const path = `${pathPrefix}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("website-assets").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type || undefined,
    });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from("website-assets").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
    toast.success(`${label} uploaded`);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <Label className="text-sm">{label}</Label>
        <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 rounded-md border border-border bg-muted flex items-center justify-center overflow-hidden">
          {value ? (
            <img src={value} alt={label} className="max-h-full max-w-full object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste a URL or upload below"
            className="text-xs"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1.5" />
              )}
              {uploading ? "Uploading…" : "Upload"}
            </Button>
            {value && (
              <a href={value} target="_blank" rel="noreferrer">
                <Button type="button" variant="ghost" size="sm">
                  <ExternalLink className="h-3.5 w-3.5 mr-1.5" /> View
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── Design System Panel ──────────────── */

const TYPE_SAMPLES = [
  {
    tag: "H1",
    text: "Making Infrared Sense",
    className: "text-5xl md:text-6xl font-bold leading-[1.05] text-foreground",
    font: "Montserrat",
    size: "48 / 60 / 72px",
    weight: "700",
  },
  {
    tag: "H2",
    text: "Real-time chemical analysis",
    className: "text-3xl md:text-4xl font-bold leading-[1.1] text-foreground",
    font: "Montserrat",
    size: "30 / 36 / 48px",
    weight: "700",
  },
  {
    tag: "H3",
    text: "Quantum Cascade Laser",
    className: "text-2xl md:text-3xl font-semibold leading-[1.2] text-foreground",
    font: "Montserrat",
    size: "24 / 30px",
    weight: "600",
  },
  {
    tag: "H4",
    text: "Sphinx of black quartz, judge my vow",
    className: "text-xl md:text-2xl font-semibold leading-[1.3] text-foreground",
    font: "Montserrat",
    size: "20 / 24px",
    weight: "600",
  },
  {
    tag: "Body",
    text: "Max-IR Labs leverages state-of-the-art infrared technologies for high-value commercial and defense applications.",
    className: "text-base text-foreground leading-relaxed",
    font: "Montserrat",
    size: "16px",
    weight: "400",
  },
  {
    tag: "Small",
    text: "The five boxing wizards jump quickly.",
    className: "text-sm text-muted-foreground",
    font: "Montserrat",
    size: "14px",
    weight: "400",
  },
];

const FONTS = [
  {
    name: "Montserrat",
    role: "Display / Headings / Body",
    weight: "400–700",
    href: "https://fonts.google.com/download?family=Montserrat",
  },
];

const COLOR_TOKENS = [
  { name: "Primary (Brand Pink)", token: "--primary", hex: "#FF2D55" },
  { name: "Secondary (Teal)", token: "--secondary-accent", hex: "#4FBDBA" },
  { name: "Surface Dark", token: "--maxir-dark", hex: "#121212" },
  { name: "Surface Darker", token: "--maxir-section-darker", hex: "#0C0F14" },
  { name: "Foreground", token: "--foreground", hex: "#212121" },
  { name: "Background", token: "--background", hex: "#FFFFFF" },
  { name: "Muted", token: "--muted", hex: "#F5F5F5" },
  { name: "Border", token: "--border", hex: "#E5E5E5" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center justify-center w-6 h-6 rounded-md text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
      title="Copy to clipboard"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DesignSystemPanel() {
  return (
    <div className="max-w-4xl space-y-10">
      {/* Typography */}
      <section className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
            Typography
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            The type scale used across the site. Reference only — to change, edit{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">tailwind.config.ts</code>.
          </p>
        </div>
        <div className="space-y-3">
          {TYPE_SAMPLES.map((s) => (
            <div key={s.tag} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <span className="inline-flex items-center justify-center h-6 min-w-[2.5rem] px-2 rounded bg-muted text-xs font-semibold text-foreground">
                  {s.tag}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  {s.font} • {s.size} • {s.weight}
                </span>
              </div>
              <p className={s.className}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Fonts */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Fonts</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FONTS.map((f) => (
            <div
              key={f.name}
              className="rounded-lg border border-border bg-card p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{f.name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.role} • {f.weight}
                </p>
              </div>
              <a href={f.href} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download
                </Button>
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Colors */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Colors
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {COLOR_TOKENS.map((c) => (
            <div key={c.token} className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="h-20" style={{ backgroundColor: c.hex }} />
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs text-muted-foreground font-mono truncate">{c.hex}</p>
                  <CopyButton text={c.hex} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Buttons */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Buttons
        </p>
        <div className="rounded-lg border border-border bg-card p-6 flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      {/* Status Tags */}
      <section className="space-y-4">
        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">
          Status Tags
        </p>
        <p className="text-sm text-muted-foreground">
          Lifecycle status pills used in the Career Applications and Sales/Support Inquiries tables.
        </p>
        <div className="rounded-lg border border-border bg-card p-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 border-blue-200">Applied</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 border-amber-200">Under Review</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 border-purple-200">Interview Stage</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-cyan-100 text-cyan-800 border-cyan-200">Offer Extended</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-teal-100 text-teal-800 border-teal-200">Offer Accepted</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 border-emerald-200">Hired</span>
          <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 border-red-200">Rejected</span>
        </div>
      </section>
    </div>
  );
}
