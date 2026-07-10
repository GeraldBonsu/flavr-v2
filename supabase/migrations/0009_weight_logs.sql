create table weight_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  weight_kg  numeric not null check (weight_kg > 0 and weight_kg < 500),
  logged_at  date not null default current_date,
  note       text,
  created_at timestamptz not null default now()
);

create unique index weight_logs_user_date_uniq on weight_logs(user_id, logged_at);
create index weight_logs_user_id_idx on weight_logs(user_id);

alter table weight_logs enable row level security;

create policy "Users manage own weight logs"
  on weight_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
