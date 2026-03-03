-- 001_create_events.sql
-- Append-only event store with global ordering

BEGIN;

-- Events table: append-only, globally ordered
CREATE TABLE IF NOT EXISTS events (
  global_seq                  BIGSERIAL    PRIMARY KEY,
  stream_id                   TEXT         NOT NULL,
  stream_seq                  BIGINT       NOT NULL,
  event_type                  TEXT         NOT NULL,
  payload                     JSONB        NOT NULL,
  payload_hash                TEXT         NOT NULL,
  envelope_hash               TEXT         NOT NULL,
  prev_envelope_hash          TEXT,          -- NULL for first event in stream
  prev_global_envelope_hash   TEXT,          -- NULL for first event globally
  created_at                  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  -- Each stream has strictly ordered sequence numbers
  CONSTRAINT uq_stream_seq UNIQUE (stream_id, stream_seq)
);

-- Index for stream lookups
CREATE INDEX IF NOT EXISTS idx_events_stream_id ON events (stream_id, stream_seq);

-- Index for global ordering queries
CREATE INDEX IF NOT EXISTS idx_events_global_seq ON events (global_seq);

-- Index for hash chain verification
CREATE INDEX IF NOT EXISTS idx_events_envelope_hash ON events (envelope_hash);

-- ============================================================
-- APPEND-ONLY TRIGGER: block UPDATE and DELETE
-- ============================================================
CREATE OR REPLACE FUNCTION prevent_event_mutation()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'events table is append-only: % operations are forbidden', TG_OP;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_no_update ON events;
CREATE TRIGGER trg_no_update
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_event_mutation();

DROP TRIGGER IF EXISTS trg_no_delete ON events;
CREATE TRIGGER trg_no_delete
  BEFORE DELETE ON events
  FOR EACH ROW
  EXECUTE FUNCTION prevent_event_mutation();

-- ============================================================
-- PERMISSIONS: app_user can only SELECT and INSERT
-- ============================================================
-- NOTE: Run these after creating the app_user role:
--   CREATE ROLE app_user WITH LOGIN PASSWORD 'app_password';
--
-- REVOKE ALL ON TABLE events FROM app_user;
-- GRANT SELECT, INSERT ON TABLE events TO app_user;
-- GRANT USAGE, SELECT ON SEQUENCE events_global_seq_seq TO app_user;

DO $$
BEGIN
  -- Only apply grants if the role exists
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    EXECUTE 'REVOKE ALL ON TABLE events FROM app_user';
    EXECUTE 'GRANT SELECT, INSERT ON TABLE events TO app_user';
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE events_global_seq_seq TO app_user';
  END IF;
END
$$;

COMMIT;
