
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

  IF matched_id IS NOT NULL THEN
    -- Existing customer found: promote from new_lead to new_inquiry
    UPDATE public.customers SET status = 'new_inquiry' WHERE id = matched_id AND status = 'new_lead';
  ELSE
    -- No existing customer: create one
    INSERT INTO public.customers (
      first_name, last_name, email, phone, company, country, status
    ) VALUES (
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name, NEW.email, NEW.phone, NEW.company_name,
      COALESCE(NEW.country, 'Israel'), 'new_inquiry'
    )
    RETURNING id INTO matched_id;
  END IF;

  -- Link inquiry to customer
  IF matched_id IS NOT NULL THEN
    NEW.customer_id := matched_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop the old separate trigger/function since logic is now consolidated
DROP TRIGGER IF EXISTS trg_set_customer_inquiry_status ON public.inquiries;
DROP FUNCTION IF EXISTS public.set_customer_inquiry_status();
