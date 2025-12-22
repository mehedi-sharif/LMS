-- 1. Restrict class creation to teachers and admins
DROP POLICY IF EXISTS "Authenticated users can create classes." ON public.classes;

CREATE POLICY "Teachers and admins can create classes."
  ON public.classes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

-- 2. Consolidate management policies (Update/Delete)
DROP POLICY IF EXISTS "Teachers can manage classes." ON public.classes;

CREATE POLICY "Teachers and admins can update classes."
  ON public.classes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );

CREATE POLICY "Teachers and admins can delete classes."
  ON public.classes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('teacher', 'admin')
    )
  );
