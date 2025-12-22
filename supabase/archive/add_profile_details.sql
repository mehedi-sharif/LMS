-- Add bio and specialization to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS specialization text;

COMMENT ON COLUMN public.profiles.bio IS 'Short biography of the user/teacher';
COMMENT ON COLUMN public.profiles.specialization IS 'Area of expertise (especially for teachers)';
