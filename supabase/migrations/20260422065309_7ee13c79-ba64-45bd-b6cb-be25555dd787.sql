-- Single-row settings table for admin notification recipients.
-- Admins enter email addresses where copies of public form submissions are forwarded.
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton BOOLEAN NOT NULL DEFAULT true UNIQUE,
  inquiries_notification_email TEXT,
  careers_notification_email TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Public can READ the notification email so the public-form submission flow
-- (running anonymously from the browser) knows where to forward a copy.
-- Only the email addresses are stored here — no sensitive data — and admins
-- explicitly opt in by entering an address.
CREATE POLICY "Anyone can view notification settings"
ON public.notification_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage notification settings"
ON public.notification_settings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_notification_settings_updated
BEFORE UPDATE ON public.notification_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the singleton row so the admin UI always has something to update.
INSERT INTO public.notification_settings (singleton) VALUES (true)
ON CONFLICT (singleton) DO NOTHING;