-- events table is analytics-only write data — no row-level restriction needed.
-- Disable RLS so both client-side and server-side inserts work freely with the anon key.
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
