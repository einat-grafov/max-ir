import { Check, X } from "lucide-react";
import type { FaqItem } from "@/lib/seoUtils";

export interface CitationItem {
  title: string;
  ai_summary: string | null;
  key_entities: string[];
  faq_items: FaqItem[];
  supporting_topics: string[];
  schema_type?: string | null;
  primary_topic: string | null;
}

interface CheckResult {
  label: string;
  pass: boolean;
  hint?: string;
}

export function evaluateCitationReadiness(item: CitationItem): {
  checks: CheckResult[];
  passed: number;
  total: number;
} {
  const entities = item.key_entities?.length || 0;
  const faqs = item.faq_items?.length || 0;
  const topics = item.supporting_topics?.length || 0;

  const checks: CheckResult[] = [
    {
      label: "AI summary present",
      pass: !!item.ai_summary && item.ai_summary.length > 40,
      hint: "Generate or write an 80–140 word factual summary",
    },
    {
      label: "Primary topic set",
      pass: !!item.primary_topic,
      hint: "Define the page's primary topic",
    },
    {
      label: "Key entities (5+)",
      pass: entities >= 5,
      hint: `Add ${Math.max(0, 5 - entities)} more entities`,
    },
    {
      label: "FAQ items (3+)",
      pass: faqs >= 3,
      hint: `Add ${Math.max(0, 3 - faqs)} more FAQs`,
    },
    {
      label: "Supporting topics (3+)",
      pass: topics >= 3,
      hint: `Add ${Math.max(0, 3 - topics)} more supporting topics`,
    },
    {
      label: "Explicit schema type",
      pass: !!item.schema_type && item.schema_type !== "auto",
      hint: "Pick a specific schema type in the SEO tab",
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  return { checks, passed, total: checks.length };
}

const CitationChecklist = ({ item }: { item: CitationItem }) => {
  const { checks, passed, total } = evaluateCitationReadiness(item);
  const pct = Math.round((passed / total) * 100);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Citation Readiness</p>
        <span className="text-sm font-semibold">
          {passed}/{total} <span className="text-muted-foreground font-normal">({pct}%)</span>
        </span>
      </div>
      <div className="space-y-1.5">
        {checks.map((c) => (
          <div key={c.label} className="flex items-start gap-2 text-xs">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                c.pass ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
              }`}
            >
              {c.pass ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
            </span>
            <div className="flex-1">
              <span className={c.pass ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
              {!c.pass && c.hint && <span className="text-muted-foreground"> — {c.hint}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CitationChecklist;
