
ALTER TABLE public.customers
ADD COLUMN status text NOT NULL DEFAULT 'new_lead';

-- Set all existing customers to 'active'
UPDATE public.customers SET status = 'active';

-- Create a trigger function to auto-set customer status to 'active' when an order is placed
CREATE OR REPLACE FUNCTION public.set_customer_active_on_order()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.customer_id IS NOT NULL THEN
    UPDATE public.customers SET status = 'active' WHERE id = NEW.customer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_customer_active_on_order
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_customer_active_on_order();

-- Create a trigger function to set customer status to 'new_inquiry' when an inquiry is linked
CREATE OR REPLACE FUNCTION public.set_customer_inquiry_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_customer_id uuid;
BEGIN
  -- Match inquiry to customer by email
  SELECT id INTO matched_customer_id
  FROM public.customers
  WHERE email = NEW.email AND status = 'new_lead'
  LIMIT 1;

  IF matched_customer_id IS NOT NULL THEN
    UPDATE public.customers SET status = 'new_inquiry' WHERE id = matched_customer_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_set_customer_inquiry_status
AFTER INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.set_customer_inquiry_status();
