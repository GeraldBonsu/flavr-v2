create table meal_logs (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  logged_at   timestamptz not null default now(),
  meal_type   text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  name        text not null,
  calories    integer not null check (calories >= 0),
  protein_g   numeric not null default 0 check (protein_g >= 0),
  carbs_g     numeric not null default 0 check (carbs_g >= 0),
  fat_g       numeric not null default 0 check (fat_g >= 0),
  source      text not null check (source in ('manual','photo','recipe')),
  recipe_id   uuid references recipes(id) on delete set null,
  items       jsonb,
  created_at  timestamptz not null default now()
);

create index meal_logs_user_id_idx on meal_logs(user_id);
create index meal_logs_user_logged_at_idx on meal_logs(user_id, logged_at desc);

alter table meal_logs enable row level security;

create policy "Users manage own meal logs"
  on meal_logs for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
