ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stripe_price_id text;

UPDATE public.products SET stripe_price_id = 'ismir_sense_cartridge_price' WHERE id = 'b28189e9-c67f-42ee-b769-a44372e632e5';
UPDATE public.products SET stripe_price_id = 'ismir_standalone_price' WHERE id = 'fe2105e8-cad9-44a9-9894-58ce88979dd2';
UPDATE public.products SET stripe_price_id = 'ismir_flow_price' WHERE id = '9cd762e7-59ac-40f8-bee1-73407eaad7e8';
UPDATE public.products SET stripe_price_id = 'ismir_module_ftir_price' WHERE id = 'abf76391-ae7d-4b34-9fa6-71f5a8e0b1d5';