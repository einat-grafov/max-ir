CREATE TABLE public.url_redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_path TEXT NOT NULL UNIQUE,
  destination_path TEXT NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  enabled BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.url_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage url redirects"
ON public.url_redirects
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view enabled redirects"
ON public.url_redirects
FOR SELECT
TO public
USING (enabled = true);

CREATE TRIGGER update_url_redirects_updated_at
BEFORE UPDATE ON public.url_redirects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();