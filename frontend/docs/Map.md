# Map.jsx Documentation

## Overview

`Map.jsx` is a React-Leaflet based map component that displays ambulance location, incidents, hospitals, and navigation routes.

## File Location

```
src/components/Map.jsx
```

## Dependencies

```javascript
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
```

## Props

| Prop                | Type   | Default | Description                       |
| ------------------- | ------ | ------- | --------------------------------- |
| `ambulanceLocation` | object | -       | Current ambulance GPS coordinates |
| `ambulanceName`     | string | -       | Display name for ambulance        |
| `incidents`         | array  | `[]`    | Array of incident objects         |
| `nearestIncident`   | object | `null`  | Target incident for routing       |
| `nearestDistance`   | number | `null`  | Distance to target (degrees)      |
| `targetHospital`    | object | `null`  | Target hospital for routing       |
| `routePoints`       | array  | `[]`    | Custom route points (unused)      |

## Custom Markers

### Ambulance Icon (Blue)

```javascript
const ambulanceIcon = new L.DivIcon({
  className: "ambulance-marker",
  html: `<div style="background: #1e40af; ...">
    <span class="material-symbols-outlined">ambulance</span>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});
```

### Incident Icon (Red, Animated)

```javascript
const createIncidentIcon = () =>
  new L.DivIcon({
    className: "incident-marker",
    html: `<div style="background: #dc2626; animation: pulse 2s infinite; ...">
    <span class="material-symbols-outlined">emergency</span>
  </div>`,
    iconSize: [40, 40],
  });
```

### Hospital Icon (Green)

```javascript
const createHospitalIcon = () =>
  new L.DivIcon({
    className: "hospital-marker",
    html: `<div style="background: #059669; ...">
    <span class="material-symbols-outlined">local_hospital</span>
  </div>`,
    iconSize: [40, 40],
  });
```

## Sub-Components

### MapCenterUpdater

Internal component that handles map center updates:

```javascript
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 18, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}
```

## Routing (OSRM)

### Route Calculation

Uses OpenStreetMap Routing Machine (OSRM) public API:

```javascript
const osrmUrl = `https://router.project-osrm.org/route/v1/driving/
  ${startLng},${startLat};${endLng},${endLat}
  ?overview=full&geometries=geojson`;
```

### Route Priority

1. **Hospital Route** (green line) - When `targetHospital` is set
2. **Incident Route** (blue line) - When `nearestIncident` is set

### Route Styling

```javascript
<Polyline
  positions={route}
  pathOptions={{
    color: targetHospital ? "#059669" : "#1e40af",
    weight: 4,
    opacity: 0.8,
    dashArray: "10, 10",
  }}
/>
```

## Map Configuration

### Default Center

```javascript
const defaultCenter = ambulanceLocation
  ? [ambulanceLocation.latitude, ambulanceLocation.longitude]
  : [28.2096, 83.9856]; // Pokhara fallback
```

### Tile Layer

Uses OpenStreetMap tiles:

```javascript
<TileLayer
  attribution="&copy; OpenStreetMap contributors"
  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
/>
```

### Zoom Level

Default zoom: 18 (street-level detail)

## Marker Popups

### Ambulance Popup

- Ambulance name with emoji
- Latitude/Longitude (6 decimal places)
- GPS accuracy

### Incident Popup

- Incident title
- Location description
- Time reported
- Current status

### Hospital Popup

- Hospital name
- Address
- Phone number
- Available beds

## CSS Animations

```css
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

## Leaflet Icon Fix

Required for Vite/Webpack bundlers:

```javascript
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/.../marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/.../marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/.../marker-shadow.png",
});
```

## Data Structures

### Ambulance Location

```javascript
{
  latitude: 28.220903,
  longitude: 83.977384,
  accuracy: 15.5
}
```

### Incident

```javascript
{
  id: "SUB-123",
  title: "Road Accident",
  location: "Thamel District",
  latitude: 28.220903,
  longitude: 83.977384,
  time: "2 mins ago",
  status: "ACTIVE"
}
```

### Hospital

```javascript
{
  id: 1,
  name: "Western Regional Hospital",
  address: "Ramghat, Pokhara",
  phone: "+977-61-520066",
  latitude: 28.2096,
  longitude: 83.9856,
  bedsAvailable: 50
}
```

## Related Files

- [AmbulanceUser.jsx](./AmbulanceUser.md) - Parent component
- `/public/hospitals.json` - Hospital data
- `/public/submissions.json` - Incident data
