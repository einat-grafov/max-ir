CREATE TABLE public.website_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  section_key text NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(page, section_key)
);

ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage website content"
ON public.website_content FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view website content"
ON public.website_content FOR SELECT
USING (true);

CREATE TRIGGER update_website_content_updated_at
BEFORE UPDATE ON public.website_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();