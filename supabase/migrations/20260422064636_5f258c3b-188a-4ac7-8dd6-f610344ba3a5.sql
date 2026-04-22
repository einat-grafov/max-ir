-- Catalog of installed integrations (GA4, GTM, Meta Pixel, etc.)
CREATE TABLE IF NOT EXISTS public.site_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_category TEXT NOT NULL DEFAULT 'analytics',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled site integrations"
ON public.site_integrations FOR SELECT
USING (enabled = true);

CREATE POLICY "Admins can manage site integrations"
ON public.site_integrations FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_site_integrations_updated
BEFORE UPDATE ON public.site_integrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Custom code snippets (head or body, consent-gated)
CREATE TABLE IF NOT EXISTS public.custom_code_snippets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT 'head',  -- 'head' | 'body'
  consent_category TEXT NOT NULL DEFAULT 'necessary', -- 'necessary' | 'functional' | 'analytics' | 'marketing'
  enabled BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_code_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled custom code snippets"
ON public.custom_code_snippets FOR SELECT
USING (enabled = true);

CREATE POLICY "Admins can manage custom code snippets"
ON public.custom_code_snippets FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_custom_code_snippets_updated
BEFORE UPDATE ON public.custom_code_snippets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();