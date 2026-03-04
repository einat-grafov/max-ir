
CREATE OR REPLACE FUNCTION public.create_customer_from_inquiry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  matched_id uuid;
  is_new_customer boolean := false;
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
    -- Existing customer: promote from new_lead to new_inquiry
    UPDATE public.customers SET status = 'new_inquiry' WHERE id = matched_id AND status = 'new_lead';
  ELSE
    -- Create new customer
    INSERT INTO public.customers (
      first_name, last_name, email, phone, company, country, status
    ) VALUES (
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name, NEW.email, NEW.phone, NEW.company_name,
      COALESCE(NEW.country, 'Israel'), 'new_inquiry'
    )
    RETURNING id INTO matched_id;
    is_new_customer := true;
  END IF;

  -- Create a contact record for new customers
  IF is_new_customer AND matched_id IS NOT NULL THEN
    INSERT INTO public.customer_contacts (
      customer_id, first_name, last_name, email, phone
    ) VALUES (
      matched_id,
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name,
      NEW.email,
      NEW.phone
    );
  END IF;

  -- Link inquiry to customer
  IF matched_id IS NOT NULL THEN
    NEW.customer_id := matched_id;
  END IF;

  RETURN NEW;
END;
$$;
