
CREATE TABLE public.suppressed_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on suppressed_emails"
  ON public.suppressed_emails FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can manage suppressed emails"
  ON public.suppressed_emails FOR ALL
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.email_unsubscribe_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  token text NOT NULL UNIQUE,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_unsubscribe_tokens"
  ON public.email_unsubscribe_tokens FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.email_send_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id text,
  template_name text,
  recipient_email text,
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_send_log"
  ON public.email_send_log FOR ALL
  TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Admins can view email send log"
  ON public.email_send_log FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
