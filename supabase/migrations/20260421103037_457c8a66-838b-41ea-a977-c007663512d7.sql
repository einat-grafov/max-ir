-- Extend seo_settings with SEO + GEO fields
ALTER TABLE public.seo_settings
  ADD COLUMN IF NOT EXISTS robots_index boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS schema_type text DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS schema_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS primary_topic text,
  ADD COLUMN IF NOT EXISTS supporting_topics text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS key_entities text[] NOT NULL DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS faq_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_readiness_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_indexing_allowed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS ai_last_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS ai_last_generated_by text,
  ADD COLUMN IF NOT EXISTS faq_last_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS faq_last_generated_by text;

-- Site-wide singleton settings
CREATE TABLE IF NOT EXISTS public.site_seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  base_url text NOT NULL DEFAULT 'https://max-ir.lovable.app',
  default_og_image text DEFAULT '',
  organization_name text DEFAULT 'MAX-IR Labs',
  organization_logo text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  social_profiles jsonb NOT NULL DEFAULT '[]'::jsonb,
  robots_default text NOT NULL DEFAULT 'noindex, nofollow',
  sitemap_enabled boolean NOT NULL DEFAULT true,
  robots_txt text NOT NULL DEFAULT E'User-agent: *\nDisallow: /\n',
  google_site_verification text DEFAULT '',
  llms_txt_auto boolean NOT NULL DEFAULT true,
  llms_txt_override text DEFAULT '',
  ai_bot_controls jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_seo_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view site seo settings" ON public.site_seo_settings;
CREATE POLICY "Anyone can view site seo settings"
  ON public.site_seo_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert site seo settings" ON public.site_seo_settings;
CREATE POLICY "Admins can insert site seo settings"
  ON public.site_seo_settings FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update site seo settings" ON public.site_seo_settings;
CREATE POLICY "Admins can update site seo settings"
  ON public.site_seo_settings FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete site seo settings" ON public.site_seo_settings;
CREATE POLICY "Admins can delete site seo settings"
  ON public.site_seo_settings FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_site_seo_settings_updated_at
  BEFORE UPDATE ON public.site_seo_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed singleton row
INSERT INTO public.site_seo_settings (singleton)
VALUES (true)
ON CONFLICT (singleton) DO NOTHING;