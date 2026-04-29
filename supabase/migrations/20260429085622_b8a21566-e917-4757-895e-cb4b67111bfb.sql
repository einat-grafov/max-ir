ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'sales';
CREATE INDEX IF NOT EXISTS inquiries_source_idx ON public.inquiries(source);