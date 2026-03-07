
-- Seed about page content by copying current home page sections
INSERT INTO public.website_content (page, section_key, content, is_visible, sort_order)
SELECT 'about', section_key, content, is_visible, sort_order
FROM public.website_content
WHERE page = 'home'
ON CONFLICT DO NOTHING;
