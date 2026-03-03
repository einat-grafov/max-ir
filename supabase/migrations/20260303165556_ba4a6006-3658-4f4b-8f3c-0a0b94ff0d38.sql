
-- Create customer_contacts table
CREATE TABLE public.customer_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  role TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_contacts ENABLE ROW LEVEL SECURITY;

-- Admins can manage contacts
CREATE POLICY "Admins can manage customer contacts"
ON public.customer_contacts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Authenticated users can view contacts
CREATE POLICY "Authenticated users can view customer contacts"
ON public.customer_contacts
FOR SELECT
USING (auth.uid() IS NOT NULL);
