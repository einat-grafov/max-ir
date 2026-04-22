import { useMemo, useState } from "react";
import { Loader2, Smartphone, Monitor, ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Strategy = "mobile" | "desktop";

type LighthouseAudit = {
  id: string;
  title: string;
  description?: string;
  displayValue?: string;
  score: number | null;
  scoreDisplayMode?: string;
  details?: { overallSavingsMs?: number };
};

type PSIResult = {
  id?: string;
  loadingExperience?: { metrics?: Record<string, { percentile: number; category: string }> };
  lighthouseResult?: {
    fetchTime?: string;
    finalUrl?: string;
    categories: Record<string, { id: string; title: string; score: number | null }>;
    audits: Record<string, LighthouseAudit>;
  };
};

const CATEGORY_ORDER = ["performance", "accessibility", "best-practices", "seo"] as const;
const CATEGORY_LABEL: Record<(typeof CATEGORY_ORDER)[number], string> = {
  performance: "Performance",
  accessibility: "Accessibility",
  "best-practices": "Best Practices",
  seo: "SEO",
};

const CWV_AUDITS = [
  { id: "largest-contentful-paint", label: "LCP" },
  { id: "interaction-to-next-paint", label: "INP" },
  { id: "cumulative-layout-shift", label: "CLS" },
  { id: "first-contentful-paint", label: "FCP" },
  { id: "server-response-time", label: "TTFB" },
  { id: "total-blocking-time", label: "TBT" },
];

function scoreColor(score: number | null | undefined) {
  if (score == null) return "text-muted-foreground";
  const v = score * 100;
  if (v >= 90) return "text-emerald-600";
  if (v >= 50) return "text-amber-600";
  return "text-rose-600";
}
function scoreRing(score: number | null | undefined) {
  if (score == null) return "border-muted-foreground/30";
  const v = score * 100;
  if (v >= 90) return "border-emerald-500";
  if (v >= 50) return "border-amber-500";
  return "border-rose-500";
}
function auditTone(score: number | null | undefined) {
  if (score == null) return "secondary" as const;
  if (score >= 0.9) return "default" as const;
  if (score >= 0.5) return "secondary" as const;
  return "destructive" as const;
}

const Performance = () => {
  const [url, setUrl] = useState<string>("https://max-ir.lovable.app");
  const [strategy, setStrategy] = useState<Strategy>("mobile");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PSIResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID as string;

  const runAudit = async (s: Strategy) => {
    if (!url || !/^https?:\/\//i.test(url)) {
      toast.error("Enter a valid URL starting with http(s)://");
      return;
    }
    setStrategy(s);
    setLoading(true);
    setError(null);
    try {
      const endpoint = `https://${projectId}.functions.supabase.co/pagespeed-insights?url=${encodeURIComponent(url)}&strategy=${s}`;
      const res = await fetch(endpoint);
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`);
      setResult(json);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch PageSpeed report";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const categories = result?.lighthouseResult?.categories;
  const audits = result?.lighthouseResult?.audits;

  const opportunities = useMemo(() => {
    if (!audits) return [] as LighthouseAudit[];
    return Object.values(audits)
      .filter((a) => a.details?.overallSavingsMs && (a.score ?? 1) < 0.9)
      .sort((a, b) => (b.details?.overallSavingsMs ?? 0) - (a.details?.overallSavingsMs ?? 0))
      .slice(0, 8);
  }, [audits]);

  const diagnostics = useMemo(() => {
    if (!audits) return [] as LighthouseAudit[];
    return Object.values(audits)
      .filter((a) => a.scoreDisplayMode === "metricSavings" || a.scoreDisplayMode === "informative")
      .filter((a) => a.score !== null && (a.score ?? 1) < 0.9 && !a.details?.overallSavingsMs)
      .slice(0, 8);
  }, [audits]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Run a Google PageSpeed Insights audit on any public URL. Results include Lighthouse scores, Core
          Web Vitals and the top opportunities to fix.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Run an audit</CardTitle>
          <CardDescription>Defaults to your published site. Edit the URL to test any page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="psi-url">URL to test</Label>
            <Input
              id="psi-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/page"
              disabled={loading}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => runAudit("mobile")} disabled={loading}>
              {loading && strategy === "mobile" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Smartphone className="mr-2 h-4 w-4" />
              )}
              Run Mobile
            </Button>
            <Button variant="secondary" onClick={() => runAudit("desktop")} disabled={loading}>
              {loading && strategy === "desktop" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Monitor className="mr-2 h-4 w-4" />
              )}
              Run Desktop
            </Button>
            <a
              href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground self-center ml-auto"
            >
              Open on pagespeed.web.dev <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {result && categories && (
        <>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-lg">Lighthouse scores</CardTitle>
                <CardDescription>
                  {strategy === "mobile" ? "Mobile" : "Desktop"} · {result.lighthouseResult?.finalUrl}
                </CardDescription>
              </div>
              <Badge variant="outline">{strategy.toUpperCase()}</Badge>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORY_ORDER.map((key) => {
                  const cat = categories[key];
                  const score = cat?.score ?? null;
                  return (
                    <div key={key} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card">
                      <div
                        className={`flex items-center justify-center w-20 h-20 rounded-full border-4 ${scoreRing(
                          score,
                        )}`}
                      >
                        <span className={`text-2xl font-semibold ${scoreColor(score)}`}>
                          {score == null ? "–" : Math.round(score * 100)}
                        </span>
                      </div>
                      <div className="text-sm font-medium">{CATEGORY_LABEL[key]}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Core Web Vitals</CardTitle>
              <CardDescription>Lab metrics from this audit run.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CWV_AUDITS.map(({ id, label }) => {
                  const a = audits?.[id];
                  if (!a) return null;
                  return (
                    <div key={id} className="rounded-lg border p-4 bg-card">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
                        <Badge variant={auditTone(a.score)} className="text-[10px]">
                          {a.score == null ? "n/a" : a.score >= 0.9 ? "Good" : a.score >= 0.5 ? "Needs work" : "Poor"}
                        </Badge>
                      </div>
                      <div className={`text-xl font-semibold mt-1 ${scoreColor(a.score)}`}>
                        {a.displayValue || "—"}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.title}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {opportunities.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">No major opportunities detected — nice work.</div>
                  ) : (
                    <ul className="divide-y">
                      {opportunities.map((a) => (
                        <li key={a.id} className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-medium">{a.title}</div>
                              {a.description && (
                                <div
                                  className="text-xs text-muted-foreground mt-1 [&_a]:underline"
                                  // PSI returns light markdown links; render minimally.
                                  dangerouslySetInnerHTML={{
                                    __html: a.description.replace(
                                      /\[(.*?)\]\((.*?)\)/g,
                                      '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
                                    ),
                                  }}
                                />
                              )}
                            </div>
                            {a.details?.overallSavingsMs ? (
                              <Badge variant="secondary" className="shrink-0">
                                Save ~{Math.round(a.details.overallSavingsMs)} ms
                              </Badge>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="diagnostics" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  {diagnostics.length === 0 ? (
                    <div className="p-6 text-sm text-muted-foreground">No additional diagnostics flagged.</div>
                  ) : (
                    <ul className="divide-y">
                      {diagnostics.map((a) => (
                        <li key={a.id} className="p-4">
                          <div className="font-medium">{a.title}</div>
                          {a.displayValue && (
                            <div className="text-xs text-muted-foreground mt-1">{a.displayValue}</div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default Performance;
