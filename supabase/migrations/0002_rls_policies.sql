-- ============================================================
-- 0002_rls_policies.sql
-- All RLS policies for profiles and recipes
-- ============================================================

-- Profiles: each user can only read/update their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Recipes: each user can only access their own recipes
CREATE POLICY "recipes_select_own" ON public.recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "recipes_insert_own" ON public.recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recipes_delete_own" ON public.recipes
  FOR DELETE USING (auth.uid() = user_id);
