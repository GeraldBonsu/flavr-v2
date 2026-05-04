-- ============================================================
-- 0001_initial_schema.sql
-- Tables: profiles, recipes
-- Triggers: handle_new_user, handle_updated_at
-- RLS: enabled (policies in 0002)
-- ============================================================

-- Profiles (one row per auth.users entry)
CREATE TABLE public.profiles (
  id                      uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email                   text,
  name                    text,
  initials                text,
  -- v1 compat fields
  goal                    text,
  diet                    text[],
  -- Wave 1 intent-driven fields (all nullable — existing users unaffected)
  intent                  text        CHECK (intent IN ('eat_better','fitness_goal','explore_culture','casual')),
  fitness_goal            text        CHECK (fitness_goal IN ('lose_weight','gain_muscle','maintain','recomp')),
  age                     integer,
  weight_kg               numeric,
  height_cm               numeric,
  activity_level          text        CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  target_calories         integer,
  dietary_restrictions    text[],
  cultural_preferences    text[],
  subscription_tier       text        NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free','premium')),
  onboarding_completed_at timestamptz,
  provider                text,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- Recipes (saved recipes per user)
CREATE TABLE public.recipes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  name        text        NOT NULL,
  emoji       text,
  cuisine     text,
  cook_time   text,
  servings    integer,
  calories    integer,
  protein     text,
  carbs       text,
  fats        text,
  ingredients jsonb,
  steps       text[],
  goal_note   text,
  goal        text,
  saved_at    timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recipes_user_id_idx  ON public.recipes (user_id);
CREATE INDEX recipes_saved_at_idx ON public.recipes (saved_at DESC);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Auto-create profile row on new sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS (all policies live in 0002)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes  ENABLE ROW LEVEL SECURITY;
