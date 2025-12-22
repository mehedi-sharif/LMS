-- Update handle_new_user function to prevent unauthorized admin role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  assigned_role user_role;
BEGIN
  -- Default to student
  assigned_role := 'student';
  
  -- Only allow 'teacher' or 'student' from metadata. 
  -- Never allow 'admin' to be set via public metadata.
  IF (new.raw_user_meta_data->>'role') = 'teacher' THEN
    assigned_role := 'teacher';
  ELSIF (new.raw_user_meta_data->>'role') = 'student' THEN
    assigned_role := 'student';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name', 
    assigned_role
  );
  
  RETURN new;
END;
$$;
