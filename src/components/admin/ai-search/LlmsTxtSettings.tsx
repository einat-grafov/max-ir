import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, FileText, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LlmsTxtSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [auto, setAuto] = useState(true);
  const [override, setOverride] = useState("");
  const [preview, setPreview] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_seo_settings" as any)
        .select("id, llms_txt_auto, llms_txt_override")
        .limit(1)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setId(d.id);
        setAuto(d.llms_txt_auto ?? true);
        setOverride(d.llms_txt_override || "");
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_seo_settings" as any)
      .update({ llms_txt_auto: auto, llms_txt_override: override || null } as any)
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("LLMs.txt settings saved");
  };

  const loadPreview = async () => {
    setPreviewLoading(true);
    try {
      const res = await fetch("/llms.txt", { headers: { Accept: "text/plain" } });
      const text = (await res.text()).replace(/<[^>]+>/g, "").trim();
      setPreview(text || "(empty)");
    } catch {
      setPreview("Unable to fetch /llms.txt — open in a new tab to inspect.");
    }
    setPreviewLoading(false);
  };

  if (loading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" /> LLMs.txt
        </h3>
        <p className="text-sm text-muted-foreground">
          A plain-text directory of your content for AI crawlers (Perplexity, ChatGPT, Claude). Served at{" "}
          <a
            href="/llms.txt"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            /llms.txt <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">Auto-generate from published content</Label>
          <p className="text-xs text-muted-foreground">
            Stays in sync with your pages and products automatically.
          </p>
        </div>
        <Switch checked={auto} onCheckedChange={setAuto} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm">
            {auto ? "Custom override (optional)" : "Custom llms.txt content"}
          </Label>
          {auto && (
            <span className="text-xs text-muted-foreground">
              Leave blank to use auto-generated version
            </span>
          )}
        </div>
        <Textarea
          value={override}
          onChange={(e) => setOverride(e.target.value)}
          rows={12}
          placeholder={
            auto
              ? "Paste a custom llms.txt to override the auto-generated version…"
              : "# Site Name\n\n> Description\n\n## Pages\n\n- [Home](https://…): Description"
          }
          className="font-mono text-xs"
        />
        {!auto && !override && (
          <p className="text-xs text-amber-600">
            With auto-generation off, your /llms.txt will be empty unless you provide content here.
          </p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={save} disabled={saving} size="sm">
          {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
          {saving ? "Saving…" : "Save"}
        </Button>
        <Button onClick={loadPreview} variant="outline" size="sm" disabled={previewLoading}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1 ${previewLoading ? "animate-spin" : ""}`} />
          Preview live /llms.txt
        </Button>
      </div>

      {preview && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Live preview</Label>
          <pre className="rounded-lg border bg-muted/30 p-4 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-auto">
            {preview}
          </pre>
        </div>
      )}
    </div>
  );
};

export default LlmsTxtSettings;
