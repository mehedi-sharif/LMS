-- Add target_gender column to classes table
ALTER TABLE public.classes
ADD COLUMN IF NOT EXISTS target_gender text CHECK (target_gender IN ('male', 'female', 'all')) DEFAULT 'all';

COMMENT ON COLUMN public.classes.target_gender IS 'Intended audience gender: male, female, or all';
