const fs = require('fs');
const path = require('path');

const hospitalsPath = path.join(__dirname, 'Backend', 'system database', 'hospitals.json');
const outputPath = path.join(__dirname, 'Backend', 'drop_and_recreate.sql');

try {
    const data = fs.readFileSync(hospitalsPath, 'utf8');
    const json = JSON.parse(data);
    const hospitals = json.hospitals;

    let sql = `-- Migration Script: Single Table Hospitals Structure (Pokhara)
-- Generated on ${new Date().toISOString()}

-- STEP 1: DROP EXISTING TABLES
DROP TABLE IF EXISTS ambulance_trips CASCADE;
DROP TABLE IF EXISTS hospital_status CASCADE;
DROP TABLE IF EXISTS ambulances CASCADE;
DROP TABLE IF EXISTS hospitals CASCADE;

-- STEP 2: CREATE NEW HOSPITALS TABLE
CREATE TABLE hospitals (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  ambulance_count INTEGER NOT NULL DEFAULT 0,
  staff_count JSONB NOT NULL,
  beds_available INTEGER NOT NULL,
  total_beds INTEGER NOT NULL,
  blood_inventory JSONB NOT NULL,
  specialties TEXT[] NOT NULL,
  incoming_ambulances JSONB NOT NULL DEFAULT '[]'::jsonb,
  icu_capacity INTEGER NOT NULL,
  alerts JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hospitals_location ON hospitals USING GIST(location);
CREATE INDEX idx_hospitals_email ON hospitals(email);

-- STEP 3: SEED DATA
INSERT INTO hospitals (
  id, name, password, email, phone, address, location, 
  ambulance_count, staff_count, beds_available, total_beds, 
  blood_inventory, specialties, incoming_ambulances, icu_capacity, alerts
) VALUES
`;

    // Pokhara Coordinates (approximate spread)
    const coordinates = [
        { lat: 28.2096, lng: 83.9856 }, // Center
        { lat: 28.2150, lng: 83.9900 }, // NE
        { lat: 28.2000, lng: 83.9800 }, // SW
        { lat: 28.2200, lng: 83.9750 }, // NW
        { lat: 28.1950, lng: 84.0000 }  // SE
    ];

    const values = hospitals.map((h, index) => {
        // 1. Coordinates
        const coord = coordinates[index % coordinates.length];
        const locationSql = `ST_SetSRID(ST_MakePoint(${coord.lng}, ${coord.lat}), 4326)::geography`;

        // 2. Blood Inventory Flattening
        const bloodInv = { total: h.bloodInventory.total };
        if (h.bloodInventory.bloodTypes) {
            h.bloodInventory.bloodTypes.forEach(bt => {
                bloodInv[bt.type] = bt.liters;
            });
        }

        // 3. Specialties List
        const specialties = h.specialties.list || [];
        const specialtiesSql = `ARRAY['${specialties.join("','")}']`;

        // 4. Total Beds Calculation
        const incomingCount = h.incomingAmbulances ? h.incomingAmbulances.length : 0;
        const totalBeds = h.bedsAvailable + (incomingCount * 2);

        // JSONB stringifying
        const staffCountJson = JSON.stringify(h.staffCount);
        const bloodInvJson = JSON.stringify(bloodInv);
        const incomingJson = JSON.stringify(h.incomingAmbulances || []);
        const alertsJson = JSON.stringify(h.alerts || []);

        return `(
  ${h.id},
  '${h.name.replace(/'/g, "''")}',
  '${h.password}',
  '${h.email}',
  '${h.phone}',
  '${h.address.replace(/'/g, "''")}',
  ${locationSql},
  ${h.ambulanceCount},
  '${staffCountJson}'::jsonb,
  ${h.bedsAvailable},
  ${totalBeds},
  '${bloodInvJson}'::jsonb,
  ${specialtiesSql},
  '${incomingJson}'::jsonb,
  ${h.icuCapacity},
  '${alertsJson}'::jsonb
)`;
    });

    sql += values.join(',\n') + ';\n\n';

    // STEP 4: CREATE VIEWS
    sql += `-- STEP 4: VIEWS
CREATE OR REPLACE VIEW hospitals_summary AS
SELECT 
  id, name, email, phone, address, 
  beds_available, icu_capacity, 
  location
FROM hospitals;
`;

    // STEP 5: UPDATE FUNCTION
    sql += `
-- STEP 5: UPDATE FUNCTION
CREATE OR REPLACE FUNCTION find_best_hospital_v2(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  required_specialist TEXT DEFAULT NULL,
  required_blood_type TEXT DEFAULT NULL,
  exclude_hospital_ids INTEGER[] DEFAULT NULL
)
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  phone TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  distance_km DOUBLE PRECISION,
  beds_available INTEGER,
  icu_capacity INTEGER,
  specialties TEXT[],
  has_specialist BOOLEAN,
  blood_available INTEGER,
  score DOUBLE PRECISION
) AS $$
DECLARE
  search_point GEOGRAPHY;
BEGIN
  search_point := ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography;

  RETURN QUERY
  SELECT
    h.id,
    h.name,
    h.phone,
    h.address,
    ST_Y(h.location::geometry) as latitude,
    ST_X(h.location::geometry) as longitude,
    (ST_Distance(h.location, search_point) / 1000.0) as distance_km,
    h.beds_available,
    h.icu_capacity,
    h.specialties,
    CASE 
      WHEN required_specialist IS NULL THEN TRUE
      ELSE required_specialist = ANY(h.specialties)
    END as has_specialist,
    CASE
      WHEN required_blood_type IS NULL THEN 100 -- Dummy value if not checked
      ELSE COALESCE((h.blood_inventory->>required_blood_type)::INTEGER, 0)
    END as blood_available,
    -- Simple Scoring Logic (can be tuned)
    (
      (h.beds_available * 0.5) + 
      (CASE WHEN required_specialist = ANY(h.specialties) THEN 50 ELSE 0 END) - 
      ((ST_Distance(h.location, search_point) / 1000.0) * 2)
    ) as score
  FROM hospitals h
  WHERE 
    h.beds_available > 0
    AND (exclude_hospital_ids IS NULL OR NOT (h.id = ANY(exclude_hospital_ids)))
    AND (
      required_blood_type IS NULL 
      OR (h.blood_inventory->>required_blood_type)::INTEGER > 0
    )
    AND (
      required_specialist IS NULL
      OR required_specialist = ANY(h.specialties)
    )
  ORDER BY 
    score DESC;
END;
$$ LANGUAGE plpgsql;
`;

    fs.writeFileSync(outputPath, sql);
    console.log(`Successfully generated migration file at ${outputPath}`);

} catch (err) {
    console.error('Error generating migration:', err);
    process.exit(1);
}
