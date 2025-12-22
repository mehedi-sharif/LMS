-- Fix foreign key constraint on classes table to allow teacher deletion
-- By default, it was RESTRICT, which prevented deleting teachers who had classes.
-- We change it to CASCADE so that classes are removed when their instructor is deleted.

ALTER TABLE public.classes
DROP CONSTRAINT IF EXISTS classes_instructor_id_fkey;

ALTER TABLE public.classes
ADD CONSTRAINT classes_instructor_id_fkey
FOREIGN KEY (instructor_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;
