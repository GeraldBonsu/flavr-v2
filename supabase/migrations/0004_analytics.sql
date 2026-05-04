-- ============================================================
-- 0004_analytics.sql
-- Table: analytics_events
-- Written by service role only — users never write directly
-- ============================================================

CREATE TABLE public.analytics_events (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES public.profiles ON DELETE SET NULL,
  event_name text        NOT NULL,
  properties jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_event_name_idx  ON public.analytics_events (event_name);
CREATE INDEX analytics_created_at_idx  ON public.analytics_events (created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
-- No user-facing SELECT policy — analytics are internal only.
-- Service role (bypasses RLS) writes events via /api/analytics route.
