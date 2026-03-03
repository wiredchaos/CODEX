-- 001_create_events.rollback.sql
-- Rollback: drop events table and related objects

BEGIN;

DROP TRIGGER IF EXISTS trg_no_delete ON events;
DROP TRIGGER IF EXISTS trg_no_update ON events;
DROP FUNCTION IF EXISTS prevent_event_mutation();
DROP TABLE IF EXISTS events CASCADE;

COMMIT;
