import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bot, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BotInfo {
  id: string;
  label: string;
  vendor: string;
  purpose: string;
}

const BOTS: BotInfo[] = [
  { id: "GPTBot", label: "GPTBot", vendor: "OpenAI", purpose: "Trains ChatGPT models" },
  { id: "ChatGPT-User", label: "ChatGPT-User", vendor: "OpenAI", purpose: "Fetches pages on user request inside ChatGPT" },
  { id: "OAI-SearchBot", label: "OAI-SearchBot", vendor: "OpenAI", purpose: "Powers ChatGPT search results" },
  { id: "PerplexityBot", label: "PerplexityBot", vendor: "Perplexity", purpose: "Crawls for Perplexity answers and citations" },
  { id: "ClaudeBot", label: "ClaudeBot", vendor: "Anthropic", purpose: "Crawls for Claude responses" },
  { id: "anthropic-ai", label: "anthropic-ai", vendor: "Anthropic", purpose: "Trains Claude models" },
  { id: "Google-Extended", label: "Google-Extended", vendor: "Google", purpose: "Trains Gemini & Vertex AI (separate from Search)" },
  { id: "CCBot", label: "CCBot", vendor: "Common Crawl", purpose: "Open dataset used by many AI models" },
  { id: "Bytespider", label: "Bytespider", vendor: "ByteDance / TikTok", purpose: "Trains ByteDance AI models" },
  { id: "Amazonbot", label: "Amazonbot", vendor: "Amazon", purpose: "Powers Alexa and Amazon AI" },
  { id: "Applebot-Extended", label: "Applebot-Extended", vendor: "Apple", purpose: "Trains Apple Intelligence" },
  { id: "meta-externalagent", label: "meta-externalagent", vendor: "Meta", purpose: "Trains Meta AI / Llama" },
  { id: "DuckAssistBot", label: "DuckAssistBot", vendor: "DuckDuckGo", purpose: "Powers DuckAssist AI summaries" },
];

const BotTrafficControls = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string | null>(null);
  const [controls, setControls] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("site_seo_settings" as any)
        .select("id, ai_bot_controls")
        .limit(1)
        .maybeSingle();
      if (data) {
        const d = data as any;
        setId(d.id);
        setControls((d.ai_bot_controls as Record<string, boolean>) || {});
      }
      setLoading(false);
    })();
  }, []);

  const toggle = (botId: string, value: boolean) =>
    setControls((prev) => ({ ...prev, [botId]: value }));

  const save = async () => {
    if (!id) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_seo_settings" as any)
      .update({ ai_bot_controls: controls as any } as any)
      .eq("id", id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Bot controls saved", { description: "Changes apply to /robots.txt immediately." });
  };

  const allowAll = () => {
    const next: Record<string, boolean> = {};
    BOTS.forEach((b) => (next[b.id] = true));
    setControls(next);
  };
  const blockAll = () => {
    const next: Record<string, boolean> = {};
    BOTS.forEach((b) => (next[b.id] = false));
    setControls(next);
  };

  if (loading) return <div className="text-sm text-muted-foreground py-12 text-center">Loading…</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-1">
        <h3 className="text-base font-semibold flex items-center gap-2">
          <Bot className="h-4 w-4" /> AI Bot Traffic Controls
        </h3>
        <p className="text-sm text-muted-foreground">
          Allow or block individual AI crawlers from accessing your site. Rules are written into your{" "}
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            /robots.txt <ExternalLink className="h-3 w-3" />
          </a>
          .
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={allowAll}>Allow all</Button>
        <Button size="sm" variant="outline" onClick={blockAll}>Block all</Button>
      </div>

      <div className="rounded-lg border divide-y">
        {BOTS.map((bot) => {
          const allowed = controls[bot.id] !== false;
          return (
            <div key={bot.id} className="flex items-start justify-between gap-4 p-4">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">{bot.label}</Label>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {bot.vendor}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{bot.purpose}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs ${allowed ? "text-emerald-600" : "text-muted-foreground"}`}>
                  {allowed ? "Allowed" : "Blocked"}
                </span>
                <Switch checked={allowed} onCheckedChange={(v) => toggle(bot.id, v)} />
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={save} disabled={saving} size="sm">
        {saving ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
        {saving ? "Saving…" : "Save bot controls"}
      </Button>

      <p className="text-xs text-muted-foreground">
        Note: robots.txt is a request, not a guarantee. Reputable AI vendors honor it; some do not.
      </p>
    </div>
  );
};

export default BotTrafficControls;
