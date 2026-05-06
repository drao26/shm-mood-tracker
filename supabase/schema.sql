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
create policy "allow all for anon"
  on moods
  for all
  to anon
  using (true)
  with check (true);
