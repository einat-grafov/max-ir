
-- Create orders table
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number serial,
  customer_id uuid REFERENCES public.customers(id),
  customer_name text NOT NULL,
  customer_email text,
  status text NOT NULL DEFAULT 'unfulfilled',
  payment_status text NOT NULL DEFAULT 'pending',
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  payment_due_later boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  product_name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  total numeric NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for orders
CREATE POLICY "Admins can manage orders"
ON public.orders
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Authenticated users can view orders"
ON public.orders
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- RLS policies for order_items
CREATE POLICY "Admins can manage order items"
ON public.order_items
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));

CREATE POLICY "Authenticated users can view order items"
ON public.order_items
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at on orders
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
