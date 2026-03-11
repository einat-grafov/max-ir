
CREATE TABLE public.seo_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL UNIQUE,
  meta_title text DEFAULT '',
  meta_description text DEFAULT '',
  og_title text DEFAULT '',
  og_description text DEFAULT '',
  og_image text DEFAULT '',
  canonical_url text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view seo settings" ON public.seo_settings
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage seo settings" ON public.seo_settings
  FOR ALL TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
