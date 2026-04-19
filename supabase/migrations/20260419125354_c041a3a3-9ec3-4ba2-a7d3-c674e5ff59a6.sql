
-- Private bucket for career application files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('career-application-files', 'career-application-files', false, 20971520)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: admin-only
CREATE POLICY "Admins can read career application files"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'career-application-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can upload career application files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'career-application-files' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete career application files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'career-application-files' AND has_role(auth.uid(), 'admin'::app_role));

-- File metadata table
CREATE TABLE public.career_application_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.career_applications(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  file_size bigint,
  mime_type text,
  uploaded_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.career_application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage career application files"
ON public.career_application_files
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_career_app_files_app_id
  ON public.career_application_files(application_id);
