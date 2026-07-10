-- Tighten weight_logs and meal_logs: reads always allowed (don't lose data on downgrade),
-- writes require an active premium subscription — evaluated by Postgres, not JS.

drop policy "Users manage own weight logs" on weight_logs;

create policy "weight_logs_select_own" on weight_logs for select
  using (auth.uid() = user_id);

create policy "weight_logs_write_premium" on weight_logs for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );

create policy "weight_logs_update_premium" on weight_logs for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );

create policy "weight_logs_delete_premium" on weight_logs for delete
  using (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );

-- identical 4-policy split for meal_logs

drop policy "Users manage own meal logs" on meal_logs;

create policy "meal_logs_select_own" on meal_logs for select
  using (auth.uid() = user_id);

create policy "meal_logs_write_premium" on meal_logs for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );

create policy "meal_logs_update_premium" on meal_logs for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );

create policy "meal_logs_delete_premium" on meal_logs for delete
  using (
    auth.uid() = user_id
    and exists (select 1 from profiles p where p.id = auth.uid() and p.subscription_tier = 'premium')
  );
