
CREATE TABLE public.stock_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  variant_sku TEXT,
  variant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.stock_notifications ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe for notifications (public form)
CREATE POLICY "Anyone can insert stock notifications"
  ON public.stock_notifications
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view notifications
CREATE POLICY "Admins can view stock notifications"
  ON public.stock_notifications
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
