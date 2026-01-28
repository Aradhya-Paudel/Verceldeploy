# AmbulanceUser.jsx Documentation

## Overview

`AmbulanceUser.jsx` is the main dashboard for ambulance operators. It provides real-time GPS tracking, incident management, casualty data entry, and hospital navigation features.

## File Location

```
src/pages/AmbulanceUser.jsx
```

## Dependencies

```javascript
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
```

## State Variables

### Core States

| State            | Type   | Default  | Description                          |
| ---------------- | ------ | -------- | ------------------------------------ |
| `user`           | string | `""`     | Logged-in ambulance user name        |
| `incidents`      | array  | `[]`     | All active incidents from backend    |
| `location`       | object | `null`   | Current GPS coordinates              |
| `locationError`  | string | `null`   | GPS error message                    |
| `locationStatus` | string | `"idle"` | GPS status: idle, requesting, active |

### Workflow States

| State              | Type   | Default    | Description                            |
| ------------------ | ------ | ---------- | -------------------------------------- |
| `ambulanceStatus`  | string | `"active"` | Ambulance availability: active or busy |
| `currentIncident`  | object | `null`     | Currently accepted incident            |
| `nearestIncident`  | object | `null`     | Nearest incident to ambulance          |
| `nearestDistance`  | number | `null`     | Distance to nearest incident (degrees) |
| `distanceInMeters` | number | `null`     | Distance in meters (Haversine)         |

### Casualty Management

| State               | Type    | Default | Description                    |
| ------------------- | ------- | ------- | ------------------------------ |
| `showCasualtyPopup` | boolean | `false` | Show casualty entry modal      |
| `casualtyCount`     | number  | `0`     | Number of casualties           |
| `casualties`        | array   | `[]`    | Array of casualty data objects |

### Hospital Navigation

| State                    | Type    | Default | Description                    |
| ------------------------ | ------- | ------- | ------------------------------ |
| `hospitals`              | array   | `[]`    | All hospitals from backend     |
| `nearestHospital`        | object  | `null`  | Target hospital for navigation |
| `isNavigatingToHospital` | boolean | `false` | Hospital navigation mode       |

## Constants

```javascript
const API_ENDPOINT = ""; // Backend API (empty for demo)
const PROXIMITY_THRESHOLD = 5; // 5 meters
```

## Key Functions

### Distance Calculation

```javascript
calculateDistanceMeters(lat1, lon1, lat2, lon2);
```

Uses **Haversine formula** to calculate accurate distance between two coordinates in meters.

### Location Tracking

```javascript
requestLocationPermission();
```

- Requests browser geolocation permission
- Uses `navigator.geolocation.watchPosition` for continuous updates
- Posts location to backend via `postLocationToBackend()`

### Incident Handling

```javascript
handleAcceptIncident();
```

- Sets ambulance status to "busy"
- Stores current incident
- Posts status to backend

```javascript
handleReachedIncident();
```

- Opens casualty data entry popup
- Called when ambulance reaches incident location

### Casualty Management

```javascript
handleCasualtyCountChange(count);
```

- Sets number of casualties
- Creates array of casualty objects with fields:
  - `id`, `bloodType`, `requiredAmount`, `severity`, `specialtyRequired`

```javascript
updateCasualtyData(index, field, value);
```

- Updates individual casualty field

```javascript
handleSubmitCasualties();
```

- Posts casualty data to backend
- Finds nearest hospital
- Initiates hospital navigation

### Hospital Navigation

```javascript
findNearestHospital();
```

- Calculates nearest hospital using Haversine formula
- Returns hospital object with coordinates

```javascript
handleReachedHospital();
```

- Resets ambulance status to "active"
- Clears all casualty and incident data
- Ready for next incident

### Manual Call Feature

```javascript
// "Got a Call?" button handler
onClick={() => {
  setAmbulanceStatus("busy");
  setShowCasualtyPopup(true);
  setCasualtyCount(0);
  setCasualties([]);
}}
```

- Allows manual casualty entry without map navigation
- Directly opens casualty popup

## Workflow States

### Active State

- Ambulance is available for incidents
- Shows nearest incident in sidebar
- "Accept & Navigate" button available
- "Got a Call?" button visible in header

### Busy State (Navigating to Incident)

- Shows current incident in sidebar
- Displays real-time distance to incident
- "Reached?" button appears when within 5 meters (pulsing green)

### Busy State (At Incident)

- Casualty data entry popup displayed
- Enter number of casualties
- Fill casualty cards with medical data
- Submit to navigate to hospital

### Busy State (Navigating to Hospital)

- Blue banner shows target hospital
- "Reached Hospital" button available
- Route shown on map to hospital

## UI Components

### Header

- EMS Response System branding
- Ambulance status badge (ACTIVE/BUSY)
- GPS status indicator
- "Got a Call?" button (when active)
- Logout button
- User profile

### Sidebar (Dynamic)

1. **Active + Incident Available**: Shows nearest incident with "Accept & Navigate"
2. **Busy + En Route**: Shows current incident with distance and "Reached?" button
3. **No Incidents**: Shows "System Status" panel

### Casualty Popup Modal

- Number of casualties input
- Dynamic casualty cards with:
  - Blood type dropdown (A+, A-, B+, B-, O+, O-, AB+, AB-)
  - Required amount input (liters)
  - Severity dropdown (Critical, Severe, Moderate, Minor)
  - Specialty required dropdown

### Hospital Navigation Banner

- Target hospital name and address
- "Reached Hospital" button

### Map Component

- Full-screen map display
- Ambulance marker (blue)
- Incident marker (red, pulsing)
- Hospital marker (green)
- Route polyline (OSRM)

## Data Flow

### Incident Data Structure

```javascript
{
  id: "SUB-1234567890",
  title: "Road Accident - Car Collision",
  image: "base64...",
  location: "Kathmandu - Thamel District",
  latitude: 28.220903,
  longitude: 83.977384,
  time: "2 mins ago",
  status: "ACTIVE"
}
```

### Casualty Data Structure

```javascript
{
  id: 1,
  bloodType: "O+",
  requiredAmount: "2.5",
  severity: "Critical",
  specialtyRequired: "Trauma Surgeon"
}
```

## Related Files

- [Map.jsx](./Map.md) - Map display component
- [isAuthenticated.jsx](./isAuthenticated.md) - Route protection
- `/public/submissions.json` - Incident data
- `/public/hospitals.json` - Hospital data
