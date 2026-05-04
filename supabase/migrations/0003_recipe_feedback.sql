-- ============================================================
-- 0003_recipe_feedback.sql
-- Table: recipe_feedback
-- Captures thumbs rating, "did you cook this?", and notes
-- ============================================================

CREATE TABLE public.recipe_feedback (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES public.profiles ON DELETE CASCADE,
  recipe_id  uuid        NOT NULL REFERENCES public.recipes  ON DELETE CASCADE,
  cooked     boolean,
  rating     integer     CHECK (rating IN (1, 2)),
  notes      text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX recipe_feedback_user_id_idx   ON public.recipe_feedback (user_id);
CREATE INDEX recipe_feedback_recipe_id_idx ON public.recipe_feedback (recipe_id);

ALTER TABLE public.recipe_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_select_own" ON public.recipe_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feedback_insert_own" ON public.recipe_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_update_own" ON public.recipe_feedback
  FOR UPDATE USING (auth.uid() = user_id);
