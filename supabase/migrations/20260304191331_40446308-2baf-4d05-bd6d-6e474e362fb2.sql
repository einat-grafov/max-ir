
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
  IF NEW.email IS NOT NULL THEN
    SELECT id INTO matched_id FROM public.customers WHERE email = NEW.email LIMIT 1;
  END IF;

  IF matched_id IS NULL AND NEW.company_name IS NOT NULL AND NEW.company_name != '' THEN
    SELECT id INTO matched_id FROM public.customers WHERE lower(company) = lower(NEW.company_name) LIMIT 1;
  END IF;

  IF matched_id IS NOT NULL THEN
    UPDATE public.customers SET status = 'new_inquiry' WHERE id = matched_id AND status = 'new_lead';
  ELSE
    INSERT INTO public.customers (
      first_name, last_name, email, phone, company, country, state, status
    ) VALUES (
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name, NEW.email, NEW.phone, NEW.company_name,
      COALESCE(NEW.country, 'Israel'), NEW.state, 'new_inquiry'
    )
    RETURNING id INTO matched_id;
    is_new_customer := true;
  END IF;

  IF is_new_customer AND matched_id IS NOT NULL THEN
    INSERT INTO public.customer_contacts (
      customer_id, first_name, last_name, email, phone
    ) VALUES (
      matched_id,
      COALESCE(NEW.first_name, split_part(NEW.name, ' ', 1)),
      NEW.last_name, NEW.email, NEW.phone
    );
  END IF;

  IF matched_id IS NOT NULL THEN
    NEW.customer_id := matched_id;
  END IF;

  RETURN NEW;
END;
$$;
