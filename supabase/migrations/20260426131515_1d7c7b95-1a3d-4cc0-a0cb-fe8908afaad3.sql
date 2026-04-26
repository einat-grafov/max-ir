ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS apartment text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS postal_code text,
  ADD COLUMN IF NOT EXISTS accepts_info_emails boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS accepts_marketing boolean NOT NULL DEFAULT false;