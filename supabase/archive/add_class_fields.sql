-- Add new columns to classes table
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS instructor_name text,
ADD COLUMN IF NOT EXISTS duration integer, -- duration in minutes
ADD COLUMN IF NOT EXISTS meet_link text;

-- Add comment for clarity
COMMENT ON COLUMN public.classes.duration IS 'Duration of the class in minutes';
COMMENT ON COLUMN public.classes.meet_link IS 'Google Meet or video conference link';
COMMENT ON COLUMN public.classes.instructor_name IS 'Name of the instructor (can override profile name)';
