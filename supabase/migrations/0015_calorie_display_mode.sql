alter table profiles
  add column calorie_display_mode text not null default 'remaining'
    check (calorie_display_mode in ('remaining','consumed'));
