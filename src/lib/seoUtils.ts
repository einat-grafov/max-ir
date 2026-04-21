export interface FaqItem {
  question: string;
  answer: string;
}

export interface AiReadinessInput {
  primary_topic: string | null;
  ai_summary: string | null;
  key_entities: string[];
  faq_items: FaqItem[] | any[];
  supporting_topics: string[];
}

export function calculateAiReadinessScore(item: AiReadinessInput): number {
  let score = 0;
  if (item.primary_topic) score += 25;
  if (item.ai_summary) score += 25;
  if ((item.key_entities?.length || 0) >= 5) score += 20;
  if ((item.faq_items?.length || 0) >= 3) score += 20;
  if ((item.supporting_topics?.length || 0) >= 3) score += 10;
  return Math.min(100, Math.max(0, score));
}

export interface SeoScoringInput {
  meta_title?: string | null;
  meta_description?: string | null;
  og_image?: string | null;
  og_title?: string | null;
  og_description?: string | null;
  robots_index?: boolean;
}

export function getSeoScore(item: SeoScoringInput): number {
  let score = 0;
  const total = 5;
  if (item.meta_title) score++;
  if (item.meta_description) score++;
  if (item.og_image) score++;
  if (item.og_title || item.meta_title) score++;
  if (item.og_description || item.meta_description) score++;
  return Math.round((score / total) * 100);
}

export function getSeoWarnings(item: SeoScoringInput): string[] {
  const w: string[] = [];
  if (!item.meta_title) w.push("Missing meta title");
  else if (item.meta_title.length > 60) w.push("Meta title too long (>60)");
  else if (item.meta_title.length < 30) w.push("Meta title too short (<30)");
  if (!item.meta_description) w.push("Missing meta description");
  else if (item.meta_description.length > 160) w.push("Description too long (>160)");
  else if (item.meta_description.length < 90) w.push("Description too short (<90)");
  if (!item.og_image) w.push("Missing OG image");
  if (item.robots_index === false) w.push("Indexing disabled");
  return w;
}
