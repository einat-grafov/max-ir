CREATE TABLE public.career_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  full_name text NOT NULL,
  email text NOT NULL,
  country text,
  education text,
  about text,
  read boolean NOT NULL DEFAULT false
);

ALTER TABLE public.career_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit career applications"
ON public.career_applications
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Admins can manage career applications"
ON public.career_applications
FOR ALL
TO public
USING (public.has_role(auth.uid(), 'admin'));
