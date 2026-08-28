-- Practice Plans: schema + Row Level Security
-- Run once in the Supabase SQL Editor (Project -> SQL Editor -> New query).

-- ---------------------------------------------------------------------------
-- profiles: one row per signed-up coach, auto-created on signup.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are readable by any signed-in coach"
  on public.profiles for select
  to authenticated
  using (true);

create policy "a coach can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "a coach can update their own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Auto-create a profile row whenever someone signs up. Uses the display name
-- passed in signUp's options.data.display_name, falling back to the email
-- prefix so a row always exists even if that wasn't provided.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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

alter table public.drills enable row level security;

create policy "drills are readable by any signed-in coach"
  on public.drills for select
  to authenticated
  using (true);

create policy "any signed-in coach can add a drill"
  on public.drills for insert
  to authenticated
  with check (true);

create policy "any signed-in coach can edit a drill"
  on public.drills for update
  to authenticated
  using (true)
  with check (true);

create policy "any signed-in coach can delete a drill"
  on public.drills for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- drill_ratings: one row per (drill, coach), replaces the old ratings map.
-- ---------------------------------------------------------------------------
create table public.drill_ratings (
  drill_id uuid not null references public.drills(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (drill_id, user_id)
);

create index drill_ratings_drill_id_idx on public.drill_ratings(drill_id);

alter table public.drill_ratings enable row level security;

create policy "ratings are readable by any signed-in coach"
  on public.drill_ratings for select
  to authenticated
  using (true);

create policy "a coach can rate as themselves"
  on public.drill_ratings for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a coach can update their own rating"
  on public.drill_ratings for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "a coach can remove their own rating"
  on public.drill_ratings for delete
  to authenticated
  using (user_id = auth.uid());

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

alter table public.drill_comments enable row level security;

create policy "comments are readable by any signed-in coach"
  on public.drill_comments for select
  to authenticated
  using (true);

create policy "a coach can comment as themselves"
  on public.drill_comments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a coach can delete their own comment"
  on public.drill_comments for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- practice_plans: fully private per coach.
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

alter table public.practice_plans enable row level security;

create policy "a coach can read their own plans"
  on public.practice_plans for select
  to authenticated
  using (user_id = auth.uid());

create policy "a coach can create their own plans"
  on public.practice_plans for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "a coach can update their own plans"
  on public.practice_plans for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "a coach can delete their own plans"
  on public.practice_plans for delete
  to authenticated
  using (user_id = auth.uid());
