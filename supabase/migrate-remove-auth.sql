-- Removes the login requirement. Profiles are now simple named entries
-- anyone can create (like a name tag), not tied to Supabase Auth accounts.
-- Run once in the Supabase SQL Editor against your existing database.

-- The auto-profile-on-signup trigger no longer applies (no more signups).
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Detach profiles from auth.users so the app can create them directly.
alter table public.profiles drop constraint profiles_id_fkey;
alter table public.profiles alter column id set default gen_random_uuid();

-- No login means no auth.uid() to check policies against. This app is
-- shared with a small trusted group, not the public internet, so access
-- control is intentionally dropped rather than faked.
alter table public.profiles disable row level security;
alter table public.drills disable row level security;
alter table public.drill_ratings disable row level security;
alter table public.drill_comments disable row level security;
alter table public.practice_plans disable row level security;
