CREATE TABLE public.inquiry_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  content text NOT NULL,
  summary text,
  date_of_interaction timestamp with time zone NOT NULL DEFAULT now(),
  contact_person text,
  interaction_type text,
  interaction_type_other text,
  action_items text,
  customer_feedback text,
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_details text,
  next_follow_up_date date,
  attachment_url text,
  attachment_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiry_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage inquiry notes"
  ON public.inquiry_notes
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_inquiry_notes_inquiry_id ON public.inquiry_notes(inquiry_id);