create table support_tickets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references profiles(id) on delete set null,
  type       text not null, -- billing | technical | feedback | other
  name       text not null,
  email      text not null,
  message    text not null,
  created_at timestamptz default now() not null
);

alter table support_tickets enable row level security;

create policy "Users insert own tickets"
  on support_tickets for insert
  with check (auth.uid() = user_id);

create policy "Users read own tickets"
  on support_tickets for select
  using (auth.uid() = user_id);
