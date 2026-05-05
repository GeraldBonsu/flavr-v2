create table pantry_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete cascade not null,
  ingredient text not null,
  category   text not null default 'cupboard', -- fridge | cupboard | spices
  added_at   timestamptz default now() not null
);

alter table pantry_items enable row level security;

create policy "Users manage own pantry"
  on pantry_items for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);
