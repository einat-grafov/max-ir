import { useEffect, useMemo, useState } from "react";
import {
  Plug,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings as SettingsIcon,
  Plus,
  Trash2,
  Code2,
  Cookie,
  Info,
  ChevronRight,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  INTEGRATION_CATALOG,
  INTEGRATION_CATEGORIES,
  CONSENT_CATEGORY_OPTIONS,
  getDefinition,
  type IntegrationCategory,
  type IntegrationDefinition,
  type ConsentCategory,
} from "@/lib/integrations-catalog";
import LegacyInfrastructure from "./IntegrationsInfrastructure";

// ============================================================================
// Types
// ============================================================================

type IntegrationRow = {
  provider: string;
  enabled: boolean;
  config: Record<string, string>;
  consent_category: ConsentCategory;
};

type SnippetRow = {
  id?: string;
  name: string;
  code: string;
  location: "head" | "body";
  consent_category: ConsentCategory;
  enabled: boolean;
  sort_order: number;
};

// ============================================================================
// Page
// ============================================================================

const IntegrationsSettings = () => {
  const [tab, setTab] = useState("infra");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<IntegrationCategory | "All">("All");

  // Catalog state
  const [integrations, setIntegrations] = useState<Record<string, IntegrationRow>>({});
  const [loadingIntegrations, setLoadingIntegrations] = useState(true);
  const [setupOpen, setSetupOpen] = useState(false);
  const [setupDef, setSetupDef] = useState<IntegrationDefinition | null>(null);

  // Snippets
  const [snippets, setSnippets] = useState<SnippetRow[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(true);

  // Cookie banner global toggle
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [bannerSaving, setBannerSaving] = useState(false);

  const loadIntegrations = async () => {
    setLoadingIntegrations(true);
    const { data } = await supabase
      .from("site_integrations")
      .select("provider,enabled,config,consent_category");
    const map: Record<string, IntegrationRow> = {};
    for (const r of data ?? []) {
      map[r.provider] = {
        provider: r.provider,
        enabled: r.enabled,
        config: (r.config as Record<string, string>) ?? {},
        consent_category: r.consent_category as ConsentCategory,
      };
    }
    setIntegrations(map);
    setLoadingIntegrations(false);
  };

  const loadSnippets = async () => {
    setLoadingSnippets(true);
    const { data } = await supabase
      .from("custom_code_snippets")
      .select("*")
      .order("sort_order", { ascending: true });
    setSnippets(
      (data ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        location: r.location as "head" | "body",
        consent_category: r.consent_category as ConsentCategory,
        enabled: r.enabled,
        sort_order: r.sort_order,
      })),
    );
    setLoadingSnippets(false);
  };

  const loadBannerSetting = async () => {
    setBannerLoading(true);
    const { data } = await supabase
      .from("site_seo_settings")
      .select("id,cookie_banner_enabled")
      .maybeSingle();
    setBannerEnabled(data?.cookie_banner_enabled !== false);
    setBannerLoading(false);
  };

  useEffect(() => {
    loadIntegrations();
    loadSnippets();
    loadBannerSetting();
  }, []);

  // True if any tracker (non-necessary) is currently enabled.
  const hasActiveTrackers = useMemo(() => {
    const integrationTrackers = Object.values(integrations).some((row) => {
      if (!row.enabled) return false;
      const def = getDefinition(row.provider);
      const category = row.consent_category || def?.defaultConsent || "analytics";
      return category !== "necessary";
    });
    const snippetTrackers = snippets.some(
      (s) => s.enabled && s.consent_category !== "necessary",
    );
    return integrationTrackers || snippetTrackers;
  }, [integrations, snippets]);

  // Compliance lock helper: ensure the banner is enabled in DB + state.
  // Used after enabling a tracker (integration or snippet) with a non-necessary
  // consent category, so the impossible state "trackers on, banner off" cannot exist.
  const ensureBannerEnabledForTracker = async () => {
    if (bannerEnabled) return;
    const { data: existing } = await supabase
      .from("site_seo_settings")
      .select("id")
      .maybeSingle();
    const payload = { cookie_banner_enabled: true };
    if (existing?.id) {
      await supabase
        .from("site_seo_settings")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabase.from("site_seo_settings").insert(payload);
    }
    setBannerEnabled(true);
    toast.info(
      "Cookie banner was automatically enabled because a tracker is now active.",
    );
  };

  // Filter
  const filteredCatalog = useMemo(() => {
    const q = search.trim().toLowerCase();
    return INTEGRATION_CATALOG.filter((d) => {
      if (activeCategory !== "All" && d.category !== activeCategory) return false;
      if (!q) return true;
      return (
        d.name.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.provider.toLowerCase().includes(q)
      );
    });
  }, [search, activeCategory]);

  const connectedCount = Object.values(integrations).filter((i) => i.enabled).length;

  // ---------------- Cookie banner controls ----------------
  const handleResetConsent = () => {
    try {
      window.localStorage.removeItem("maxir_consent_state");
      window.dispatchEvent(
        new CustomEvent("maxir:consent-changed", { detail: null }),
      );
      toast.success("Cookie consent cleared. The banner will show on next public-page visit.");
    } catch {
      toast.error("Failed to clear consent");
    }
  };

  const handleOpenPreferences = () => {
    window.dispatchEvent(new Event("maxir:open-cookie-preferences"));
    toast.info("Cookie Preferences opened (only visible on public pages).");
  };

  const handleToggleBanner = async (next: boolean) => {
    // Block disabling if any tracker is active — compliance lock.
    if (!next && hasActiveTrackers) {
      toast.error(
        "Cannot disable the cookie banner while trackers are enabled. Disable all trackers first, then you can turn the banner off.",
      );
      return;
    }

    setBannerSaving(true);
    // site_seo_settings is a singleton — fetch the existing row id, then update.
    const { data: existing } = await supabase
      .from("site_seo_settings")
      .select("id")
      .maybeSingle();
    const payload = { cookie_banner_enabled: next };
    const { error } = existing?.id
      ? await supabase
          .from("site_seo_settings")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("site_seo_settings").insert(payload);
    setBannerSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setBannerEnabled(next);
    toast.success(
      next
        ? "Cookie banner enabled. Visitors will be prompted for consent."
        : "Cookie banner disabled. No trackers are active, so no consent is required.",
    );
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <Plug className="h-6 w-6 text-primary mt-1" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Extend your site with analytics, marketing tools, and custom scripts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            {connectedCount} connected
          </Badge>
        </div>
      </div>

      {/* Consent gating banner */}
      <Card
        className={`p-4 mb-6 border-primary/20 ${
          bannerEnabled ? "bg-primary/5" : "bg-muted/40"
        }`}
      >
        <div className="flex items-start gap-3 flex-wrap">
          <Cookie
            className={`h-5 w-5 shrink-0 mt-0.5 ${
              bannerEnabled ? "text-primary" : "text-muted-foreground"
            }`}
          />
          <div className="flex-1 min-w-[260px]">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-semibold text-foreground">
                {bannerEnabled
                  ? "Consent gating is active"
                  : "Consent gating is disabled"}
              </div>
              <Badge
                variant={bannerEnabled ? "default" : "secondary"}
                className="gap-1"
              >
                {bannerEnabled ? "On" : "Off"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {bannerEnabled ? (
                <>
                  Scripts respect your visitors' cookie banner choices. Items tagged{" "}
                  <span className="font-medium">Analytics</span> or{" "}
                  <span className="font-medium">Marketing</span> only run after consent
                  is given. <span className="font-medium">Necessary</span> always runs.
                </>
              ) : (
                <>
                  The cookie banner is hidden from visitors and{" "}
                  <span className="font-medium">all scripts run immediately</span>,
                  regardless of category. Make sure this complies with your local
                  privacy laws (GDPR, CCPA, etc.).
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="cookie-banner-toggle"
                  className="text-xs font-medium text-foreground cursor-pointer"
                >
                  Cookie banner
                </Label>
                <Switch
                  id="cookie-banner-toggle"
                  checked={bannerEnabled}
                  disabled={
                    bannerLoading ||
                    bannerSaving ||
                    (hasActiveTrackers && bannerEnabled)
                  }
                  onCheckedChange={handleToggleBanner}
                />
              </div>
              {hasActiveTrackers && bannerEnabled && (
                <p className="text-[11px] text-muted-foreground max-w-[220px] text-right leading-tight">
                  Locked on — trackers are active. Disable all trackers to allow
                  turning the banner off.
                </p>
              )}
            </div>
            {bannerEnabled && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleOpenPreferences}>
                  Preview banner
                </Button>
                <Button size="sm" variant="outline" onClick={handleResetConsent}>
                  Reset visitor consent
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>


      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="catalog">
            <Plug className="h-4 w-4 mr-1.5" />
            Catalog
          </TabsTrigger>
          <TabsTrigger value="custom">
            <Code2 className="h-4 w-4 mr-1.5" />
            Custom code
            <AlertTriangle className="h-3.5 w-3.5 ml-1.5 text-amber-500" />
          </TabsTrigger>
          <TabsTrigger value="infra">
            <Wrench className="h-4 w-4 mr-1.5" />
            Infrastructure
          </TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* CATALOG TAB                                                    */}
        {/* ============================================================ */}
        <TabsContent value="catalog" className="mt-6">
          {/* Search + filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search integrations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <CategoryChip
                label="All"
                active={activeCategory === "All"}
                onClick={() => setActiveCategory("All")}
              />
              {INTEGRATION_CATEGORIES.map((c) => (
                <CategoryChip
                  key={c}
                  label={c}
                  active={activeCategory === c}
                  onClick={() => setActiveCategory(c)}
                />
              ))}
            </div>
          </div>

          {loadingIntegrations ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCatalog.map((def) => {
                const row = integrations[def.provider];
                const status: "connected" | "needs-attention" | "not-connected" =
                  row?.enabled
                    ? "connected"
                    : row && Object.keys(row.config).length > 0
                      ? "needs-attention"
                      : "not-connected";
                return (
                  <IntegrationCard
                    key={def.provider}
                    def={def}
                    status={status}
                    onClick={() => {
                      setSetupDef(def);
                      setSetupOpen(true);
                    }}
                  />
                );
              })}
              {filteredCatalog.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-full py-8 text-center">
                  No integrations match your filter.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        {/* ============================================================ */}
        {/* CUSTOM CODE TAB                                                */}
        {/* ============================================================ */}
        <TabsContent value="custom" className="mt-6">
          <CustomCodePanel
            snippets={snippets}
            loading={loadingSnippets}
            onChanged={loadSnippets}
            ensureBannerEnabledForTracker={ensureBannerEnabledForTracker}
          />
        </TabsContent>

        {/* ============================================================ */}
        {/* INFRASTRUCTURE TAB (Stripe / FedEx / UPS — preserved)          */}
        {/* ============================================================ */}
        <TabsContent value="infra" className="mt-6">
          <LegacyInfrastructure />
        </TabsContent>
      </Tabs>

      {/* Setup dialog */}
      <SetupDialog
        open={setupOpen}
        onOpenChange={setSetupOpen}
        def={setupDef}
        existing={setupDef ? integrations[setupDef.provider] : undefined}
        ensureBannerEnabledForTracker={ensureBannerEnabledForTracker}
        onSaved={() => {
          loadIntegrations();
          setSetupOpen(false);
        }}
      />
    </div>
  );
};

// ============================================================================
// Sub-components
// ============================================================================

const CategoryChip = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
      active
        ? "bg-primary text-primary-foreground border-primary"
        : "bg-background text-muted-foreground border-border hover:bg-muted"
    }`}
  >
    {label}
  </button>
);

const IntegrationCard = ({
  def,
  status,
  onClick,
}: {
  def: IntegrationDefinition;
  status: "connected" | "needs-attention" | "not-connected";
  onClick: () => void;
}) => {
  const statusBadge = (() => {
    if (status === "connected")
      return (
        <Badge variant="default" className="gap-1 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <CheckCircle2 className="h-3 w-3" />
          Connected
        </Badge>
      );
    if (status === "needs-attention")
      return (
        <Badge variant="default" className="gap-1 bg-amber-500 text-white hover:bg-amber-500/90">
          <AlertTriangle className="h-3 w-3" />
          Needs attention
        </Badge>
      );
    return (
      <Badge variant="secondary" className="gap-1">
        <XCircle className="h-3 w-3" />
        Not connected
      </Badge>
    );
  })();

  return (
    <button
      onClick={onClick}
      className="text-left group"
    >
      <Card className="p-4 h-full hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${def.brandColor}`}
          >
            {def.logo}
          </div>
          {statusBadge}
        </div>
        <h3 className="text-sm font-semibold text-foreground mb-1">{def.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {def.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{def.category}</span>
          <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </Card>
    </button>
  );
};

// ============================================================================
// Setup dialog (per integration)
// ============================================================================

const SetupDialog = ({
  open,
  onOpenChange,
  def,
  existing,
  ensureBannerEnabledForTracker,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  def: IntegrationDefinition | null;
  existing?: IntegrationRow;
  ensureBannerEnabledForTracker: () => Promise<void>;
  onSaved: () => void;
}) => {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [consent, setConsent] = useState<ConsentCategory>("analytics");
  const [enabled, setEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && def) {
      setConfig(existing?.config ?? {});
      setConsent(existing?.consent_category ?? def.defaultConsent);
      setEnabled(existing?.enabled ?? false);
    }
  }, [open, def, existing]);

  if (!def) return null;

  const allFilled = def.fields.every((f) => (config[f.key] || "").trim().length > 0);

  const handleSave = async () => {
    if (enabled && !allFilled) {
      toast.error("Please fill in all required fields before enabling.");
      return;
    }
    setSaving(true);
    const trimmed = Object.fromEntries(
      Object.entries(config).map(([k, v]) => [k, (v || "").trim()]),
    );
    const { error } = await supabase.from("site_integrations").upsert(
      {
        provider: def.provider,
        display_name: def.name,
        category: def.category,
        enabled,
        config: trimmed,
        consent_category: consent,
      },
      { onConflict: "provider" },
    );
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Compliance lock: enabling a tracker auto-enables the banner.
    if (enabled && consent !== "necessary") {
      await ensureBannerEnabledForTracker();
    }
    toast.success(`${def.name} ${enabled ? "connected" : "saved"}`);
    onSaved();
  };

  const handleDisconnect = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("site_integrations")
      .delete()
      .eq("provider", def.provider);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`${def.name} disconnected`);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold ${def.brandColor}`}
            >
              {def.logo}
            </div>
            <div>
              <DialogTitle>{def.name}</DialogTitle>
              <DialogDescription>{def.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          {def.fields.map((f) => (
            <div key={f.key}>
              <Label className="text-xs">{f.label}</Label>
              <Input
                value={config[f.key] || ""}
                onChange={(e) =>
                  setConfig((p) => ({ ...p, [f.key]: e.target.value }))
                }
                placeholder={f.placeholder}
                className="mt-1 font-mono text-sm"
              />
              {f.helpText && (
                <p className="text-xs text-muted-foreground mt-1">{f.helpText}</p>
              )}
            </div>
          ))}

          <ConsentCategorySelect value={consent} onChange={setConsent} />

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <Label className="text-sm font-semibold">Enable on live site</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                When on, the script is loaded on every public page (subject to
                consent).
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {def.docsUrl && (
            <a
              href={def.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View setup docs →
            </a>
          )}
        </div>

        <DialogFooter className="gap-2 flex-row justify-between sm:justify-between">
          {existing ? (
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDisconnect}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Disconnect
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : enabled ? "Save & enable" : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Custom Code panel
// ============================================================================

const CustomCodePanel = ({
  snippets,
  loading,
  onChanged,
  ensureBannerEnabledForTracker,
}: {
  snippets: SnippetRow[];
  loading: boolean;
  onChanged: () => void;
  ensureBannerEnabledForTracker: () => Promise<void>;
}) => {
  const [editor, setEditor] = useState<SnippetRow | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const headSnippets = snippets.filter((s) => s.location === "head");
  const bodySnippets = snippets.filter((s) => s.location === "body");

  const openNew = (location: "head" | "body") => {
    setEditor({
      name: "",
      code: "",
      location,
      // Safer default — admins must deliberately downgrade to "necessary".
      consent_category: "analytics",
      enabled: false,
      sort_order: 0,
    });
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Warning */}
      <Card className="p-4 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-foreground">
              Custom code is not validated
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Broken scripts can break your live site. Snippets execute on every
              public page — test carefully before enabling.
            </p>
          </div>
        </div>
      </Card>

      {/* Head snippets */}
      <SnippetSection
        title="Head code"
        description="Injected at the top of the page. Use for verification codes, analytics snippets that must load early, and meta tags."
        location="head"
        snippets={headSnippets}
        loading={loading}
        onAdd={() => openNew("head")}
        onEdit={(s) => {
          setEditor(s);
          setEditorOpen(true);
        }}
        onChanged={onChanged}
        ensureBannerEnabledForTracker={ensureBannerEnabledForTracker}
      />

      {/* Body snippets */}
      <SnippetSection
        title="Body code"
        description="Injected after page content. Use for chat widgets, late-loading scripts and custom behaviors."
        location="body"
        snippets={bodySnippets}
        loading={loading}
        onAdd={() => openNew("body")}
        onEdit={(s) => {
          setEditor(s);
          setEditorOpen(true);
        }}
        onChanged={onChanged}
        ensureBannerEnabledForTracker={ensureBannerEnabledForTracker}
      />

      <SnippetEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        snippet={editor}
        ensureBannerEnabledForTracker={ensureBannerEnabledForTracker}
        onSaved={() => {
          setEditorOpen(false);
          onChanged();
        }}
      />
    </div>
  );
};

const SnippetSection = ({
  title,
  description,
  location,
  snippets,
  loading,
  onAdd,
  onEdit,
  onChanged,
  ensureBannerEnabledForTracker,
}: {
  title: string;
  description: string;
  location: "head" | "body";
  snippets: SnippetRow[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (s: SnippetRow) => void;
  onChanged: () => void;
  ensureBannerEnabledForTracker: () => Promise<void>;
}) => {
  const handleToggle = async (s: SnippetRow, enabled: boolean) => {
    if (!s.id) return;
    const { error } = await supabase
      .from("custom_code_snippets")
      .update({ enabled })
      .eq("id", s.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Compliance lock: enabling a non-necessary snippet auto-enables the banner.
    if (enabled && s.consent_category !== "necessary") {
      await ensureBannerEnabledForTracker();
    }
    toast.success(`Snippet ${enabled ? "enabled" : "disabled"}`);
    onChanged();
  };

  const handleDelete = async (s: SnippetRow) => {
    if (!s.id) return;
    if (!confirm(`Delete "${s.name}"?`)) return;
    const { error } = await supabase
      .from("custom_code_snippets")
      .delete()
      .eq("id", s.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Snippet deleted");
    onChanged();
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-lg">
            {description}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-4 w-4 mr-1" />
          Add snippet
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : snippets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Code2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            No {location} snippets yet.
          </p>
          <Button size="sm" variant="outline" onClick={onAdd}>
            <Plus className="h-4 w-4 mr-1" />
            Add snippet
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden">
          {snippets.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {s.name || "(untitled)"}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {consentLabel(s.consent_category)}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                  {s.code.split("\n")[0]?.slice(0, 80) || "(empty)"}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Switch
                  checked={s.enabled}
                  onCheckedChange={(v) => handleToggle(s, v)}
                />
                <Button size="sm" variant="ghost" onClick={() => onEdit(s)}>
                  <SettingsIcon className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(s)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============================================================================
// Snippet editor dialog
// ============================================================================

const SnippetEditor = ({
  open,
  onOpenChange,
  snippet,
  ensureBannerEnabledForTracker,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  snippet: SnippetRow | null;
  ensureBannerEnabledForTracker: () => Promise<void>;
  onSaved: () => void;
}) => {
  const [draft, setDraft] = useState<SnippetRow | null>(snippet);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setDraft(snippet);
  }, [open, snippet]);

  if (!draft) return null;

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error("Please give the snippet a name.");
      return;
    }
    setSaving(true);
    let error;
    if (draft.id) {
      ({ error } = await supabase
        .from("custom_code_snippets")
        .update({
          name: draft.name.trim(),
          code: draft.code,
          location: draft.location,
          consent_category: draft.consent_category,
          enabled: draft.enabled,
        })
        .eq("id", draft.id));
    } else {
      ({ error } = await supabase.from("custom_code_snippets").insert({
        name: draft.name.trim(),
        code: draft.code,
        location: draft.location,
        consent_category: draft.consent_category,
        enabled: draft.enabled,
      }));
    }
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    // Compliance lock: saving an enabled non-necessary snippet auto-enables the banner.
    if (draft.enabled && draft.consent_category !== "necessary") {
      await ensureBannerEnabledForTracker();
    }
    toast.success("Snippet saved");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{draft.id ? "Edit snippet" : "New snippet"}</DialogTitle>
          <DialogDescription>
            Code is injected on every public page when enabled.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pt-4 space-y-4">
          <div>
            <Label className="text-xs">Snippet name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="e.g. Schema.org markup"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Location</Label>
              <Select
                value={draft.location}
                onValueChange={(v) =>
                  setDraft({ ...draft, location: v as "head" | "body" })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="head">Head (loads early)</SelectItem>
                  <SelectItem value="body">Body (loads late)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ConsentCategorySelect
              value={draft.consent_category}
              onChange={(v) => setDraft({ ...draft, consent_category: v })}
              compact
            />
          </div>
          {draft.consent_category === "necessary" && (
            <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-900 dark:text-yellow-200">
              ⚠ <strong>"Necessary"</strong> bypasses the cookie banner. This snippet
              will run for every visitor, even those who reject cookies. Only use
              "Necessary" for truly essential scripts (CSRF tokens, session
              helpers, consent-management helpers). For trackers like Google
              Analytics, Meta Pixel, Hotjar, HubSpot, etc., choose "Analytics" or
              "Marketing" instead — they'll be automatically gated by the consent
              banner.
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs">Code</Label>
              <span className="text-xs text-muted-foreground font-mono">
                {draft.code.length} chars
              </span>
            </div>
            <Textarea
              value={draft.code}
              onChange={(e) => setDraft({ ...draft, code: e.target.value })}
              placeholder={
                draft.location === "head"
                  ? "<script>console.log('hello')</script>"
                  : "<script>document.body.classList.add('ready')</script>"
              }
              className="font-mono text-xs min-h-[280px]"
              spellCheck={false}
            />
            <p className="text-xs text-muted-foreground mt-1">
              You can paste a full <code className="font-mono">&lt;script&gt;…&lt;/script&gt;</code>{" "}
              block — outer tags will be unwrapped before execution.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border">
            <div>
              <Label className="text-sm font-semibold">Enable on live site</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                Will run on every public page subject to consent gating.
              </p>
            </div>
            <Switch
              checked={draft.enabled}
              onCheckedChange={(v) => setDraft({ ...draft, enabled: v })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save snippet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// Helpers
// ============================================================================

const ConsentCategorySelect = ({
  value,
  onChange,
  compact,
}: {
  value: ConsentCategory;
  onChange: (v: ConsentCategory) => void;
  compact?: boolean;
}) => (
  <div>
    <div className="flex items-center gap-1 mb-1">
      <Label className="text-xs">Consent category</Label>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className="text-muted-foreground hover:text-foreground">
            <Info className="h-3 w-3" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-xs">
            Scripts tagged Analytics or Marketing only run after the visitor accepts
            the matching cookie banner category. Necessary always runs.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
    <Select value={value} onValueChange={(v) => onChange(v as ConsentCategory)}>
      <SelectTrigger className={compact ? "" : "mt-0"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CONSENT_CATEGORY_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <div>
              <div className="text-sm">{opt.label}</div>
              {!compact && (
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const consentLabel = (c: ConsentCategory): string =>
  CONSENT_CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;

export default IntegrationsSettings;
