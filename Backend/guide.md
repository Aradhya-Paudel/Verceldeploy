# Hospital Resource Backend — Architecture Guide

## 1) Overview
This backend is a Node.js/Express API that exposes hospital data, performs matching based on location and medical constraints, and integrates with LocationIQ for geocoding and static map URLs. Data is stored in Supabase (PostgreSQL with PostGIS), and the server uses Supabase RPC to compute location-aware matching.

## 2) High-Level Request Flow
1. **Client sends HTTP request** to Express.
2. **Middleware runs** (CORS, JSON parsing, logging, and rate limiting where applied).
3. **Route handler** validates inputs and calls:
   - Supabase (DB queries / RPC)
   - LocationIQ (geocoding / reverse geocoding)
4. **Response is normalized** and returned with JSON.

## 3) Key Modules and Responsibilities
### `index.js`
- Bootstraps Express server.
- Loads environment variables (`dotenv`).
- Sets up middleware: `cors`, `express.json`, and logging.
- Health check at `GET /health` (tests Supabase connection).
- Mounts API routes under `/api`:
  - `routes/match.js`
  - `routes/map.js`
  - `routes/hospital.js`
- Root endpoint `/` returns an endpoint summary.

### `supabaseClient.js`
- Creates Supabase client using `SUPABASE_URL` and `SUPABASE_KEY`.
- Exits process if missing configuration.

### `routes/match.js`
- **POST `/api/match`**
- Accepts `latitude`, `longitude`, `address`, `injuryType`, `bloodType`, `excludeIds`.
- If coordinates are missing and `address` is provided, it geocodes via `locationService.geocodeAddress`.
- Validates coordinate ranges.
- Calls Supabase RPC: `find_best_hospital_v2` with filters.
- Returns a list of matches with distance, map URL, and route map URL.
- Uses rate limiter middleware.

### `routes/map.js`
- **POST `/api/geocode`**: Geocode address via LocationIQ and return a static map URL.
- **POST `/api/reverse-geocode`**: Reverse geocode coordinates via LocationIQ.
- Both endpoints are rate-limited.

### `routes/hospital.js`
- **GET `/api/hospitals/map`**: Fetches hospital markers and overview map.
  - Uses `find_best_hospital_v2` with a neutral point to retrieve all hospitals with lat/lon.
  - Builds per-hospital map URLs plus a global overview URL.
- **GET `/api/hospital/:id/status`**: Retrieves a single hospital’s status and map details.
  - Uses `find_best_hospital_v2`, then filters in-memory for the requested ID.
  - Adds reverse-geocoded address when available.

### `utils/locationService.js`
- Wraps LocationIQ API calls:
  - `geocodeAddress(address)`
  - `reverseGeocode(latitude, longitude)`
  - `generateStaticMapUrl(latitude, longitude)`
  - `generateRouteMapUrl(startLat, startLon, endLat, endLon)`
  - `generateOverviewMapUrl(hospitals)`
- Returns `null` on failures to allow graceful error handling.

### `middleware/rateLimiter.js`
- Express rate limiter:
  - 100 requests per hour per IP
  - Returns `RATE_LIMIT_EXCEEDED` on throttling
- Applied to `/api/geocode`, `/api/reverse-geocode`, and `/api/match`.

## 4) Data Layer (Supabase)
- Uses Supabase client for database access.
- **RPC**: `find_best_hospital_v2`
  - Accepts user location and optional filters.
  - Returns hospitals with computed distance and lat/lon.
- Tables and views used by the API:
  - `hospitals` (main dataset)
  - `hospitals_summary` (used in `/api/hospitals` legacy endpoint)

## 5) External Services
- **LocationIQ** for geocoding and static map images.
- Required env variable: `LOCATIONIQ_API_KEY`.
  - If missing, map-related features return `null` URLs and geocoding fails gracefully.

## 6) Error Handling
- Route-level validation returns 400/404 for invalid input or not found.
- Geocoding failures are handled with explicit 400/404 responses.
- Global error handler returns 500 for unhandled errors.

## 7) Environment Variables
Required:
- `SUPABASE_URL`
- `SUPABASE_KEY`

Optional (map/geocode features):
- `LOCATIONIQ_API_KEY`

## 8) Endpoint Summary
- `GET /` – service status + endpoint list
- `GET /health` – DB connectivity check
- `GET /api/hospitals` – legacy summary list
- `GET /api/hospitals/map` – hospital list with map URLs
- `GET /api/hospital/:id/status` – single hospital status
- `POST /api/match` – best hospital matching
- `POST /api/geocode` – address → coordinates
- `POST /api/reverse-geocode` – coordinates → address
