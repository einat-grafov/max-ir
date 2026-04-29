ALTER TABLE public.inquiry_notes
ADD COLUMN IF NOT EXISTS lead_status text,
ADD COLUMN IF NOT EXISTS lead_status_reason text;