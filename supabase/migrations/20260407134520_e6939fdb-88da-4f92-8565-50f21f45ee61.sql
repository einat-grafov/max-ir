ALTER TABLE public.orders ADD COLUMN shipping_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN shipping_method text;