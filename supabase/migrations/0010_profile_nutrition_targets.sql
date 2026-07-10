alter table profiles
  add column target_protein_g       integer,
  add column target_carbs_g         integer,
  add column target_fat_g           integer,
  add column estimated_tdee         integer,
  add column expenditure_updated_at timestamptz,
  add column expenditure_confidence text check (expenditure_confidence in ('seed','low','medium','high'));
