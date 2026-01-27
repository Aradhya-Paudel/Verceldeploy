# Hospital Resource System Backend

A robust Express.js backend for managing hospital resources, accident response, and ambulance routing, integrated with Supabase (PostgreSQL) and LocationIQ.

## Features

-   **Hospital Management**: Track beds, blood inventory, specialists, and status.
-   **Smart Matching**: Find the best hospital based on location, injury type, and resource availability.
-   **Mapping Services**: Geocoding, reverse geocoding, and static map generation via LocationIQ.
-   **Rate Limiting**: Protects public map endpoints from abuse.
-   **Health Checks**: Monitoring endpoints for system status.

## Prerequisites

-   Node.js (v16+)
-   Supabase Project URL & Anon Key
-   LocationIQ API Key (Free Tier supported)

## Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd Backend
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory based on `.env.example`:
    ```ini
    PORT=3000
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    LOCATIONIQ_API_KEY=pk.your_locationiq_key
    ```

4.  **Database Migration**
    Run the SQL script `drop_and_recreate.sql` in your Supabase SQL Editor to set up the schema and seed initial data.

5.  **Run the Server**
    ```bash
    npm run dev
    ```

## API Documentation

### 🏥 Hospital Operations

#### `GET /api/hospitals`
Returns a summary list of all hospitals.

#### `GET /api/hospitals/map`
Returns all hospitals with geolocation data and a static overview map URL.
```json
{
  "hospitals": [...],
  "totalHospitals": 5,
  "mapOverviewUrl": "https://maps.locationiq..."
}
```

#### `GET /api/hospital/:id/status`
Returns detailed status for a specific hospital, including dynamic maps.

### 🚑 Emergency Matching

#### `POST /api/match`
Finds the best hospital for an emergency.
**Body:**
```json
{
  "latitude": 28.2096,
  "longitude": 83.9856,
  "injuryType": "Trauma Surgery", // Optional
  "bloodType": "A+" // Optional
}
```
*Supports `address` field instead of lat/long (auto-geocoded).*

### 🗺️ Mapping Services

#### `POST /api/geocode`
Convert an address to coordinates.
**Body:** `{"address": "Pokhara, Nepal"}`

#### `POST /api/reverse-geocode`
Convert coordinates to an address.
**Body:** `{"latitude": 28.2, "longitude": 83.9}`

## Error Handling

Standardized error response format:
```json
{
  "error": "Human readable message",
  "code": "ERROR_CODE",
  "details": "Technical details (optional)"
}
```

## Rate Limiting

Map endpoints (`/geocode`, `/reverse-geocode`) are limited to **100 requests per hour** per IP.

## Architecture

-   **Backend**: Node.js, Express
-   **Database**: Supabase (PostgreSQL with PostGIS)
-   **Maps**: LocationIQ
-   **Deployment**: Ready for Vercel/Render/Railway
