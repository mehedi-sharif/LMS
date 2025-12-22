-- Add approval_status to profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status approval_status DEFAULT 'pending';

-- Update existing profiles to approved (so current users don't get locked out)
UPDATE public.profiles SET status = 'approved' WHERE status = 'pending';

-- Update handle_new_user function to handle default status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    initial_status approval_status;
    user_role user_role;
BEGIN
    user_role := (new.raw_user_meta_data->>'role')::user_role;
    
    -- Admins are automatically approved. Teachers and Students are pending.
    IF user_role = 'admin' THEN
        initial_status := 'approved';
    ELSE
        initial_status := 'pending';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, status)
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name', 
        user_role,
        initial_status
    );
    RETURN new;
END;
$$;
