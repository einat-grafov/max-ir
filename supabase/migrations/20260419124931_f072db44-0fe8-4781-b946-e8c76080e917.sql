
-- Notes/interactions for career applications
CREATE TABLE public.career_application_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
  content text NOT NULL,
  summary text,
  date_of_interaction timestamp with time zone NOT NULL DEFAULT now(),
  interaction_type text,
  interaction_type_other text,
  sales_representative text,
  contact_person text,
  action_items text,
  customer_feedback text,
  follow_up_required boolean NOT NULL DEFAULT false,
  follow_up_details text,
  next_follow_up_date date,
  attachment_name text,
  attachment_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.career_application_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage career application notes"
ON public.career_application_notes
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Optional fields on career_applications for tracking
ALTER TABLE public.career_applications
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS resume_url text,
  ADD COLUMN IF NOT EXISTS notes text;

CREATE INDEX IF NOT EXISTS idx_career_app_notes_app_id
  ON public.career_application_notes(application_id);
