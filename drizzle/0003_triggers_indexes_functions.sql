-- =============================================================
-- Migration 0003: Indexes, Triggers, and Stored Functions
-- Apply with:  npx drizzle-kit migrate
--              — or — run directly in the Neon SQL console
-- =============================================================


-- =============================================================
-- SECTION 1: INDEXES
-- Every column that appears in a WHERE / JOIN / ORDER BY clause
-- but had no index before this migration.
-- =============================================================

-- audio_samples --------------------------------------------------

-- Scopes every admin query to the owning user
CREATE INDEX IF NOT EXISTS idx_audio_samples_uploaded_by
  ON audio_samples (uploaded_by);

-- Direct study lookup (new column from migration 0002)
CREATE INDEX IF NOT EXISTS idx_audio_samples_study_id
  ON audio_samples (study_id)
  WHERE study_id IS NOT NULL;

-- Session creation: language + active filter
CREATE INDEX IF NOT EXISTS idx_audio_samples_language_active
  ON audio_samples (language, is_active);

-- Admin dashboard: user + active composite
CREATE INDEX IF NOT EXISTS idx_audio_samples_uploaded_by_active
  ON audio_samples (uploaded_by, is_active);

-- ratings --------------------------------------------------------

-- Used in inArray() sub-selects across stats / analytics / export
CREATE INDEX IF NOT EXISTS idx_ratings_audio_id
  ON ratings (audio_id);

-- Study stats query joins via session_id
CREATE INDEX IF NOT EXISTS idx_ratings_session_id
  ON ratings (session_id);

-- Time-range filters (today's ratings, 7-day timeline)
CREATE INDEX IF NOT EXISTS idx_ratings_timestamp
  ON ratings (timestamp DESC);

-- Rater counting / demographic queries
CREATE INDEX IF NOT EXISTS idx_ratings_rater_id
  ON ratings (rater_id);

-- evaluation_sessions --------------------------------------------

-- Study stats group by study
CREATE INDEX IF NOT EXISTS idx_eval_sessions_study_id
  ON evaluation_sessions (study_id)
  WHERE study_id IS NOT NULL;

-- Completion rate: filter WHERE completed_at IS NOT NULL
CREATE INDEX IF NOT EXISTS idx_eval_sessions_completed_at
  ON evaluation_sessions (completed_at)
  WHERE completed_at IS NOT NULL;

-- Active sessions window (started in last hour)
CREATE INDEX IF NOT EXISTS idx_eval_sessions_started_at
  ON evaluation_sessions (started_at DESC);

-- raters ---------------------------------------------------------

-- IP-hash duplicate detection on session create
CREATE INDEX IF NOT EXISTS idx_raters_ip_hash
  ON raters (ip_hash)
  WHERE ip_hash IS NOT NULL;


-- =============================================================
-- SECTION 2: TRIGGER — auto-sync session progress on rating insert
--
-- Fires AFTER every row inserted into `ratings`.
-- Increments completed_count and, once all samples are rated,
-- sets completed_at automatically.  This makes the session state
-- consistent even if the API call that follows the INSERT fails.
-- The application no longer needs to manually increment the count.
-- =============================================================

CREATE OR REPLACE FUNCTION fn_sync_session_on_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE evaluation_sessions
  SET
    completed_count = completed_count + 1,
    -- Auto-complete: only set the first time the threshold is crossed
    completed_at = CASE
      WHEN (completed_count + 1) >= total_samples
        AND completed_at IS NULL
        THEN NOW()
      ELSE completed_at
    END
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_session_on_rating ON ratings;

CREATE TRIGGER trg_sync_session_on_rating
  AFTER INSERT ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION fn_sync_session_on_rating();


-- =============================================================
-- SECTION 3: TRIGGER — audit trail for admin_users changes
--
-- Fires AFTER every UPDATE on admin_users.
-- Computes the diff between OLD and NEW, ignoring high-frequency
-- noise columns (last_activity, last_login, failed_login_attempts).
-- Only writes an audit_logs row when a meaningful field changed.
-- =============================================================

CREATE OR REPLACE FUNCTION fn_audit_admin_user_changes()
RETURNS TRIGGER AS $$
DECLARE
  changed_fields JSONB;
BEGIN
  -- Build a JSONB object of only the fields that actually changed
  SELECT jsonb_object_agg(key, value)
  INTO changed_fields
  FROM jsonb_each(to_jsonb(NEW))
  WHERE
    -- Field differs from the old value
    NOT (to_jsonb(OLD) @> jsonb_build_object(key, value))
    -- Exclude noisy / high-frequency columns that are not security-relevant
    AND key NOT IN (
      'last_activity',
      'last_login',
      'failed_login_attempts',
      'locked_until'
    );

  -- Skip the audit write if nothing meaningful changed
  IF changed_fields IS NOT NULL AND changed_fields <> '{}'::jsonb THEN
    INSERT INTO audit_logs (
      admin_id, action, resource_type, resource_id, metadata, timestamp
    ) VALUES (
      NEW.id,
      'update_user',
      'admin_user',
      NEW.id,
      jsonb_build_object('changed_fields', changed_fields),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_admin_users ON admin_users;

CREATE TRIGGER trg_audit_admin_users
  AFTER UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION fn_audit_admin_user_changes();


-- =============================================================
-- SECTION 4: FUNCTION — single-call dashboard stats per user
--
-- Replaces the 8 separate COUNT / AVG queries that the stats
-- endpoint fires on every dashboard load.  All aggregations are
-- done inside the database in one round-trip.
--
-- Usage (Drizzle):
--   const [row] = await db.execute(
--     sql`SELECT * FROM fn_get_user_dashboard_stats(${userId})`
--   );
-- =============================================================

CREATE OR REPLACE FUNCTION fn_get_user_dashboard_stats(p_user_id UUID)
RETURNS TABLE (
  total_ratings      BIGINT,
  ratings_today      BIGINT,
  this_week_ratings  BIGINT,
  prev_week_ratings  BIGINT,
  active_sessions    BIGINT,
  total_sessions     BIGINT,
  completed_sessions BIGINT,
  total_raters       BIGINT,
  total_samples      BIGINT,
  avg_mos            NUMERIC,
  avg_time_ms        NUMERIC,
  total_languages    BIGINT
) AS $$
  WITH
    -- All audio samples owned by this user
    user_audio AS (
      SELECT id
      FROM audio_samples
      WHERE uploaded_by = p_user_id
    ),
    -- All ratings for those samples
    user_ratings AS (
      SELECT r.score, r.time_to_rate_ms, r.rater_id, r.session_id, r.timestamp
      FROM ratings r
      WHERE r.audio_id IN (SELECT id FROM user_audio)
    ),
    -- All evaluation sessions that contain at least one rating for this user
    user_sessions AS (
      SELECT es.id, es.started_at, es.completed_at
      FROM evaluation_sessions es
      WHERE es.id IN (SELECT DISTINCT session_id FROM user_ratings)
    )
  SELECT
    -- Lifetime totals
    (SELECT COUNT(*)               FROM user_ratings)                                    AS total_ratings,
    (SELECT COUNT(*)               FROM user_ratings WHERE timestamp >= CURRENT_DATE)    AS ratings_today,
    (SELECT COUNT(*)               FROM user_ratings
       WHERE timestamp >= NOW() - INTERVAL '7 days')                                     AS this_week_ratings,
    (SELECT COUNT(*)               FROM user_ratings
       WHERE timestamp >= NOW() - INTERVAL '14 days'
         AND timestamp <  NOW() - INTERVAL '7 days')                                     AS prev_week_ratings,

    -- Sessions
    (SELECT COUNT(*)               FROM user_sessions
       WHERE started_at  >= NOW() - INTERVAL '1 hour'
         AND completed_at IS NULL)                                                        AS active_sessions,
    (SELECT COUNT(*)               FROM user_sessions)                                   AS total_sessions,
    (SELECT COUNT(*)               FROM user_sessions WHERE completed_at IS NOT NULL)    AS completed_sessions,

    -- Raters (distinct)
    (SELECT COUNT(DISTINCT rater_id) FROM user_ratings)                                  AS total_raters,

    -- Samples
    (SELECT COUNT(*)
       FROM audio_samples
       WHERE uploaded_by = p_user_id AND is_active = TRUE)                               AS total_samples,

    -- Score averages
    (SELECT ROUND(AVG(score)::numeric, 2)        FROM user_ratings)                      AS avg_mos,
    (SELECT AVG(time_to_rate_ms)                 FROM user_ratings
       WHERE time_to_rate_ms IS NOT NULL)                                                 AS avg_time_ms,

    -- Active languages configured by this user
    (SELECT COUNT(*)
       FROM languages
       WHERE user_id = p_user_id AND is_active = TRUE)                                   AS total_languages;
$$ LANGUAGE sql STABLE;


-- =============================================================
-- SECTION 5: FUNCTION — clean up stale sessions
--
-- Marks all `sessions` rows whose expires_at has passed as
-- 'expired'.  Call this from a cron job or scheduled task.
-- Returns the number of rows updated.
--
-- Usage:  SELECT fn_cleanup_expired_sessions();
-- =============================================================

CREATE OR REPLACE FUNCTION fn_cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE sessions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at < NOW();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;
