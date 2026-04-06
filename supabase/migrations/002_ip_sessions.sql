-- The Daily Slice — IP Sessions
-- Maps IP addresses to session UUIDs for persistent cross-device/localStorage tracking
-- Run after 001_initial_schema.sql

CREATE TABLE IF NOT EXISTS ip_sessions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT        UNIQUE NOT NULL,
  session_id TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Only the service role (server-side API routes) can access this table.
-- Anon/public clients have no access.
ALTER TABLE ip_sessions ENABLE ROW LEVEL SECURITY;

-- No RLS policies — service role bypasses RLS automatically.
-- Anon key gets no access by default when RLS is enabled with no permissive policies.
