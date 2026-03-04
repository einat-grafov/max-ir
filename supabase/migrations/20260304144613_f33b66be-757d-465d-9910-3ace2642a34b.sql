
ALTER TABLE public.customer_notes
ADD COLUMN date_of_interaction timestamptz NOT NULL DEFAULT now(),
ADD COLUMN customer_name text,
ADD COLUMN company text,
ADD COLUMN contact_person text,
ADD COLUMN sales_representative text,
ADD COLUMN interaction_type text,
ADD COLUMN interaction_type_other text,
ADD COLUMN summary text,
ADD COLUMN action_items text,
ADD COLUMN customer_feedback text,
ADD COLUMN follow_up_required boolean NOT NULL DEFAULT false,
ADD COLUMN follow_up_details text,
ADD COLUMN sales_stage text,
ADD COLUMN sales_stage_other text,
ADD COLUMN next_follow_up_date date,
ADD COLUMN assigned_sales_rep text;
