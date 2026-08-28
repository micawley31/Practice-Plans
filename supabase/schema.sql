-- Practice Plans: schema (no login required)
-- Run once in the Supabase SQL Editor (Project -> SQL Editor -> New query).
--
-- This app is shared with a small trusted group, not the public internet.
-- "Profiles" are simple named entries anyone can create from the app (like
-- a name tag), not real accounts, and Row Level Security is left off since
-- there's no login to check a policy against.

-- ---------------------------------------------------------------------------
-- profiles: one row per person using the app, created from the UI.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- drills: shared community library.
-- ---------------------------------------------------------------------------
create table public.drills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  difficulty text not null,
  description text not null,
  tags text[] not null default '{}',
  duration integer not null,
  participants text,
  equipment text,
  video_url text,
  diagram jsonb,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- drill_ratings: one row per (drill, profile), replaces the old ratings map.
-- ---------------------------------------------------------------------------
create table public.drill_ratings (
  drill_id uuid not null references public.drills(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (drill_id, user_id)
);

create index drill_ratings_drill_id_idx on public.drill_ratings(drill_id);

-- ---------------------------------------------------------------------------
-- drill_comments
-- ---------------------------------------------------------------------------
create table public.drill_comments (
  id uuid primary key default gen_random_uuid(),
  drill_id uuid not null references public.drills(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

create index drill_comments_drill_id_idx on public.drill_comments(drill_id);

-- ---------------------------------------------------------------------------
-- practice_plans: scoped to whichever profile created them.
-- ---------------------------------------------------------------------------
create table public.practice_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  date text,
  start_time text,
  end_time text,
  notes text,
  segments jsonb not null default '[]',
  favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index practice_plans_user_id_idx on public.practice_plans(user_id);
