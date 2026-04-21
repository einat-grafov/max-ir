CREATE TABLE public.accessibility_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  button_color text NOT NULL DEFAULT '#FF2D55',
  position text NOT NULL DEFAULT 'bottom-left',
  updated_at timestamptz NOT NULL DEFAULT now(),
  singleton boolean NOT NULL DEFAULT true UNIQUE
);

ALTER TABLE public.accessibility_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view accessibility settings"
ON public.accessibility_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can update accessibility settings"
ON public.accessibility_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert accessibility settings"
ON public.accessibility_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_accessibility_settings_updated_at
BEFORE UPDATE ON public.accessibility_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.accessibility_settings (enabled, button_color, position)
VALUES (true, '#FF2D55', 'bottom-left');