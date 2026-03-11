
-- Create website-assets storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('website-assets', 'website-assets', true);

-- Allow authenticated admins to upload files
CREATE POLICY "Admins can upload website assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'website-assets'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow authenticated admins to delete files
CREATE POLICY "Admins can delete website assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'website-assets'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow public read access
CREATE POLICY "Public can view website assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'website-assets');
