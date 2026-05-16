-- ══════════════════════════════════════════════════════════════════
--  POLLA MUNDIALISTA 2026 — Schema v2 (con fase eliminatoria)
--  Ejecutar completo en: Supabase Dashboard → SQL Editor
-- ══════════════════════════════════════════════════════════════════

create table if not exists participants (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,
  created_at timestamptz default now()
);
create table if not exists match_results (
  id uuid primary key default gen_random_uuid(),
  match_id int not null unique, home_score int, away_score int,
  updated_at timestamptz default now()
);
create table if not exists predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  match_id int not null, home_score int, away_score int,
  created_at timestamptz default now(),
  unique(participant_id, match_id)
);
create table if not exists classified_results (
  id uuid primary key default gen_random_uuid(),
  group_id text not null unique, first_place text, second_place text,
  updated_at timestamptz default now()
);
create table if not exists classified_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  group_id text not null, first_place text, second_place text,
  unique(participant_id, group_id)
);
create table if not exists open_matches (match_id int primary key);

-- Knockout stage
create table if not exists knockout_results (
  id uuid primary key default gen_random_uuid(),
  match_id int not null unique,
  home_team text, away_team text, home_score int, away_score int,
  updated_at timestamptz default now()
);
create table if not exists knockout_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade,
  match_id int not null, home_score int, away_score int,
  created_at timestamptz default now(),
  unique(participant_id, match_id)
);
-- Champion predictions
create table if not exists champion_result (
  id uuid primary key default gen_random_uuid(),
  champion text, runner_up text, third text,
  updated_at timestamptz default now()
);
create table if not exists champion_predictions (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid references participants(id) on delete cascade unique,
  champion text, runner_up text, third text,
  created_at timestamptz default now()
);

-- RLS: all tables public read/write (PIN protects admin in frontend)
do $$ declare t text;
begin
  for t in select unnest(array[
    'participants','match_results','predictions','classified_results',
    'classified_predictions','open_matches','knockout_results',
    'knockout_predictions','champion_result','champion_predictions'
  ]) loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "allow_all" on %I', t);
    execute format('create policy "allow_all" on %I for all using (true) with check (true)', t);
  end loop;
end $$;
