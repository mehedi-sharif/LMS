ALTER TABLE public.profiles ADD COLUMN slug TEXT UNIQUE;

-- Function to generate a simple slug
CREATE OR REPLACE FUNCTION generate_slug(name TEXT) RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(REGEXP_REPLACE(REGEXP_REPLACE(name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with slugs
UPDATE public.profiles 
SET slug = generate_slug(full_name) || '-' || SUBSTR(id::text, 1, 4)
WHERE slug IS NULL;
