-- Per-product SEO/GEO overrides
CREATE TABLE public.product_seo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  og_title TEXT DEFAULT '',
  og_description TEXT DEFAULT '',
  og_image TEXT DEFAULT '',
  canonical_url TEXT DEFAULT '',
  robots_index BOOLEAN NOT NULL DEFAULT false,
  schema_type TEXT DEFAULT 'auto',
  schema_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_topic TEXT,
  supporting_topics TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  key_entities TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  ai_summary TEXT,
  faq_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  ai_readiness_score INTEGER NOT NULL DEFAULT 0,
  ai_indexing_allowed BOOLEAN NOT NULL DEFAULT true,
  ai_last_generated_at TIMESTAMPTZ,
  ai_last_generated_by TEXT,
  faq_last_generated_at TIMESTAMPTZ,
  faq_last_generated_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.product_seo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product seo"
  ON public.product_seo FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product seo"
  ON public.product_seo FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_seo_updated_at
  BEFORE UPDATE ON public.product_seo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_product_seo_product_id ON public.product_seo(product_id);