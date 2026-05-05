alter table profiles
  add column if not exists notification_preferences jsonb
    not null default '{"weekly_recipes":true,"pantry_reminders":true,"cooking_tips":false,"meal_plan":false}'::jsonb;
