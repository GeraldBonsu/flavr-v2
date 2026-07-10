-- profiles_update_own (0002) lets a user update any column on their own row,
-- including subscription_tier — so any signed-in user could grant themselves
-- premium via a direct client-side update, bypassing Stripe entirely.
-- This trigger silently reverts any change to subscription_tier that doesn't
-- come from the service-role client (i.e. the Stripe webhook).

create or replace function public.protect_subscription_tier()
returns trigger
language plpgsql
as $$
begin
  if new.subscription_tier is distinct from old.subscription_tier
     and auth.role() <> 'service_role' then
    new.subscription_tier := old.subscription_tier;
  end if;
  return new;
end;
$$;

create trigger protect_subscription_tier_trigger
  before update on profiles
  for each row
  execute procedure public.protect_subscription_tier();
