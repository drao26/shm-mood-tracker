-- moods table

create table if not exists moods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('april', 'angie', 'deepthi')),
  date date not null,
  score int not null check (score >= 0 and score <= 10),
  gratitude text,
  rant text,
  created_at timestamptz default now(),
  unique (name, date)
);

-- enable row level security
alter table moods enable row level security;

-- permissive policy: allow all operations for anonymous users
-- this is a private 3-person tool behind an unguessable URL
drop policy if exists "allow all for anon" on moods;
create policy "allow all for anon"
  on moods
  for all
  to anon
  using (true)
  with check (true);

-- theme_summaries table (AI-generated / rule-based theme cache)
create table if not exists theme_summaries (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name in ('april', 'angie', 'deepthi')),
  period text not null,                -- 'all-time' for now; future: '2026-05' for monthly
  themes jsonb not null,               -- ThemeSummary[] (same shape as src/lib/themes.ts)
  generated_at timestamptz default now(),
  unique (name, period)
);

alter table theme_summaries enable row level security;

drop policy if exists "allow all for anon" on theme_summaries;
create policy "allow all for anon"
  on theme_summaries
  for all
  to anon
  using (true)
  with check (true);

-- reactions table (pastel emoji reactions on a friend's entry)
create table if not exists reactions (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references moods(id) on delete cascade,
  reactor_user_id text not null check (reactor_user_id in ('april', 'angie', 'deepthi')),
  emoji text not null,
  created_at timestamptz default now(),
  unique (entry_id, reactor_user_id, emoji)
);

create index if not exists reactions_entry_id_idx on reactions(entry_id);

alter table reactions enable row level security;

drop policy if exists "allow all for anon" on reactions;
create policy "allow all for anon"
  on reactions
  for all
  to anon
  using (true)
  with check (true);
