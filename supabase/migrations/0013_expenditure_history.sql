create table expenditure_history (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  week_start         date not null,
  estimated_tdee     integer not null,
  target_calories    integer not null,
  target_protein_g   integer not null,
  target_carbs_g     integer not null,
  target_fat_g       integer not null,
  data_points        integer not null,
  confidence         text not null check (confidence in ('seed','low','medium','high')),
  method             text not null check (method in ('seed_mifflin','trend_14d','trend_7d')),
  created_at         timestamptz not null default now()
);

create unique index expenditure_history_user_week_uniq on expenditure_history(user_id, week_start);
create index expenditure_history_user_id_idx on expenditure_history(user_id);

alter table expenditure_history enable row level security;

-- Read-only for the user; only the service-role client (cron) ever inserts, so no insert/update/delete policy exists.
create policy "expenditure_history_select_own" on expenditure_history for select
  using (auth.uid() = user_id);
