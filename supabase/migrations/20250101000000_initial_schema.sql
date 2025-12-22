-- 1. Create Role Enum
create type user_role as enum ('student', 'teacher', 'admin');

-- 2. Create Profiles Table (Public Profile Data)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role user_role default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- 4. Create Policies for Profiles
-- Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

-- Users can insert their own profile
create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Users can update own profile
create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- 5. Automate Profile Creation on Sign Up (Trigger)
-- This ensures that whenever a user signs up via auth.users, a row is created in public.profiles
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'role')::user_role);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Create Classes Table
create table public.classes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  instructor_id uuid references public.profiles(id) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone,
  status text check (status in ('upcoming', 'live', 'ended')) default 'upcoming',
  viewer_count int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Enable RLS on Classes
alter table public.classes enable row level security;

-- 8. Policies for Classes
-- Everyone can view classes
create policy "Classes are viewable by everyone."
  on public.classes for select
  using ( true );

-- Authenticated users can create classes (for testing purposes, restrict later)
create policy "Authenticated users can create classes."
  on public.classes for insert
  with check ( auth.role() = 'authenticated' );

-- Teachers can manage classes (Delete/Update)
create policy "Teachers can manage classes."
  on public.classes for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );
