-- Allow public (anonymous) access to view products on the store page
CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);