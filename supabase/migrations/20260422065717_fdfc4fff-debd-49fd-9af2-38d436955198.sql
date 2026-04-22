ALTER TABLE public.site_seo_settings
ADD COLUMN IF NOT EXISTS cookie_banner_enabled boolean NOT NULL DEFAULT true;