-- The Daily Slice — MVP1 Schema
-- Drop old tables if they exist (handles migration from previous Slice Wars schema)
DROP TABLE IF EXISTS battle_votes CASCADE;
DROP TABLE IF EXISTS votes CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS deals CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS restaurant_pizza_styles CASCADE;
DROP TABLE IF EXISTS pizza_styles CASCADE;
DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS battles CASCADE;
DROP FUNCTION IF EXISTS cast_vote CASCADE;
DROP FUNCTION IF EXISTS increment_battle_votes CASCADE;

-- Battles table
CREATE TABLE battles (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  option_a     TEXT NOT NULL,
  option_b     TEXT NOT NULL,
  image_a      TEXT,
  image_b      TEXT,
  description  TEXT,
  location     TEXT DEFAULT 'Lake Orion, MI',
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  status       TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'scheduled')),
  votes_a      INTEGER DEFAULT 0,
  votes_b      INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Votes table (one per session per battle)
CREATE TABLE votes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id    UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
  selected     TEXT NOT NULL CHECK (selected IN ('a', 'b')),
  session_id   TEXT NOT NULL,
  city         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(battle_id, session_id)
);

-- Deals table
CREATE TABLE deals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  area            TEXT,
  expiration      TEXT,
  phone           TEXT,
  address         TEXT,
  link            TEXT,
  active          BOOLEAN DEFAULT true,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Analytics events table
CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name   TEXT NOT NULL,
  session_id   TEXT,
  battle_id    UUID,
  deal_id      UUID,
  metadata     JSONB,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- RLS: allow public read on battles and deals
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read battles" ON battles;
DROP POLICY IF EXISTS "public can insert votes" ON votes;
DROP POLICY IF EXISTS "public can read votes" ON votes;
DROP POLICY IF EXISTS "public can read deals" ON deals;
DROP POLICY IF EXISTS "public can insert events" ON events;

CREATE POLICY "public can read battles" ON battles FOR SELECT USING (true);
CREATE POLICY "public can insert votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "public can read votes" ON votes FOR SELECT USING (true);
CREATE POLICY "public can read deals" ON deals FOR SELECT USING (active = true);
CREATE POLICY "public can insert events" ON events FOR INSERT WITH CHECK (true);

-- Atomic vote casting: inserts vote row + increments denormalized counter
CREATE OR REPLACE FUNCTION cast_vote(
  p_battle_id  UUID,
  p_session_id TEXT,
  p_selected   TEXT  -- 'a' or 'b'
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert vote (will fail on UNIQUE constraint if duplicate)
  INSERT INTO votes (battle_id, session_id, selected)
  VALUES (p_battle_id, p_session_id, p_selected);

  -- Increment the appropriate counter
  IF p_selected = 'a' THEN
    UPDATE battles SET votes_a = votes_a + 1 WHERE id = p_battle_id;
  ELSE
    UPDATE battles SET votes_b = votes_b + 1 WHERE id = p_battle_id;
  END IF;
END;
$$;

-- Grant execute to anon role
GRANT EXECUTE ON FUNCTION cast_vote TO anon;
