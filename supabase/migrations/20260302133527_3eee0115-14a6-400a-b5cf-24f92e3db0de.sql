CREATE POLICY "Admins can delete stock notifications"
ON public.stock_notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'));