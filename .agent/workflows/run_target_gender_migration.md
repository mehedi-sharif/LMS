---
description: Add target_gender column to classes table
---

1. Open a terminal in the project root (`/Users/mehedititas/Development/darus-almutun`).
2. Ensure Supabase CLI is installed (`npm install -g supabase`).
3. Run the migration SQL to add the column:
   ```bash
   supabase db remote commit "Add target_gender column"
   ```
   This will apply the `add_gender_field.sql` migration located at `supabase/archive/add_gender_field.sql`.
   // turbo
4. Verify the column exists by querying the schema:
   ```bash
   supabase db remote status
   ```
   You should see `target_gender` listed in the `classes` table.
5. Restart the development server:
   ```bash
   npm run dev
   ```
   // turbo
6. Test creating a new class again.

If you encounter any errors, ensure your Supabase project reference and credentials are correctly set in `.env.local`.
