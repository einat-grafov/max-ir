
-- Add customer_id column to inquiries
ALTER TABLE public.inquiries ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Update trigger to link inquiry to customer (both existing and new)
CREATE OR REPLACE FUNCTION public.create_customer_from_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_id uuid;
BEGIN
  -- Check if customer already exists by email
  IF NEW.email IS NOT NULL THEN
    SELECT id INTO matched_id FROM public.customers WHERE email = NEW.email LIMIT 1;
  END IF;

  -- If no match by email, check by company name
  IF matched_id IS NULL AND NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN
    SELECT id INTO matched_id FROM public.customers WHERE lower(company) = lower(NEW.company_name) LIMIT 1;
  END IF;

  -- If no existing customer found, create one
  IF matched_id IS NULL THEN
    INSERT INTO public.customers (
      first_name,
      last_name,
      email,
      phone,
      company,
      country,
      status
    ) VALUES (
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name,
      NEW.email,
      NEW.phone,
      NEW.company_name,
      COALESCE(NEW.country, 'Israel'),
      'new_inquiry'
    )
    RETURNING id INTO matched_id;
  END IF;

  -- Link the inquiry to the customer
  IF matched_id IS NOT NULL THEN
    NEW.customer_id := matched_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Recreate trigger as BEFORE INSERT so we can modify NEW
DROP TRIGGER IF EXISTS trg_create_customer_from_inquiry ON public.inquiries;
CREATE TRIGGER trg_create_customer_from_inquiry
BEFORE INSERT ON public.inquiries
FOR EACH ROW
EXECUTE FUNCTION public.create_customer_from_inquiry();
