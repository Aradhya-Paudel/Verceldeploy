-- Phase 5 Schema Migration

-- 1. Users & Authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK (role IN ('hospital', 'ambulance', 'dispatcher', 'admin')),
  entity_id INTEGER, -- Links to existing 'hospitals' id or 'ambulances' id (if exists)
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 2. Real-Time Connections
CREATE TABLE IF NOT EXISTS socket_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER REFERENCES users(id),
  socket_id TEXT UNIQUE,
  namespace TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Resource Reservations (Critical for avoiding double-booking)
CREATE TABLE IF NOT EXISTS resource_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id INTEGER REFERENCES hospitals(id),
  ambulance_trip_id UUID, -- Can be null initially until trip confirmed
  beds_reserved INTEGER DEFAULT 1,
  blood_reserved JSONB, -- e.g. {"A+": 1}
  status TEXT CHECK (status IN ('active', 'confirmed', 'expired', 'cancelled')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reservations_status ON resource_reservations(status);

-- 4. Analytics Views
-- Assuming ambulance_trips table exists from Phase 2/3. If not, create it first?
-- We did not explicitly create 'ambulance_trips' in previous logs, we referenced 'trips' in concept only?
-- Checking 'backend_analysis.md' or 'match.js'.
-- We need to ensure 'ambulance_trips' exists.
CREATE TABLE IF NOT EXISTS ambulance_trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ambulance_id INTEGER, -- If we have ambulances table
    hospital_id INTEGER REFERENCES hospitals(id),
    patient_id INTEGER,
    status TEXT CHECK (status IN ('pending', 'in_transit', 'arrived', 'completed', 'cancelled')),
    distance_km FLOAT,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW analytics_trip_summary AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_trips,
  AVG(distance_km) as avg_distance_km,
  COUNT(*) FILTER (WHERE status = 'completed') as completed
FROM ambulance_trips
GROUP BY DATE(created_at);
