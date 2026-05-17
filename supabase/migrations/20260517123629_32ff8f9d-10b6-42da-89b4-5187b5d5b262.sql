ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS info_banner_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS info_banner_text TEXT;