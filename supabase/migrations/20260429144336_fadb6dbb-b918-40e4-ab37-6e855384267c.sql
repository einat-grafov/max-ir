CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text,
  path text,
  country text,
  country_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_country ON public.page_views (country);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read page views"
  ON public.page_views FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.commerce_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL CHECK (event_type IN ('add_to_cart','reached_checkout','purchased')),
  session_id text,
  order_id uuid,
  product_id uuid,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_commerce_events_created_at ON public.commerce_events (created_at DESC);
CREATE INDEX idx_commerce_events_type ON public.commerce_events (event_type);

ALTER TABLE public.commerce_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert commerce events"
  ON public.commerce_events FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Admins can read commerce events"
  ON public.commerce_events FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));