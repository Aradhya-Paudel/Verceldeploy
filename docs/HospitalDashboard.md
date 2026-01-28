# HospitalDashboard.jsx Documentation

## Overview

`HospitalDashboard.jsx` is the main dashboard for hospital administrators. It displays hospital resources, incoming ambulances, blood requests, and provides navigation to other hospital management pages.

## File Location

```
src/pages/hospitals/HospitalDashboard.jsx
```

## Dependencies

```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
```

## State Variables

| State      | Type    | Default | Description           |
| ---------- | ------- | ------- | --------------------- |
| `hospital` | object  | `null`  | Current hospital data |
| `loading`  | boolean | `true`  | Loading state         |
| `error`    | string  | `null`  | Error message         |

## Data Loading

### useEffect - Load Hospital Data

```javascript
const loadHospitalData = async () => {
  const response = await fetch("/hospitals.json");
  const data = await response.json();
  const userName = localStorage.getItem("userName");
  const selectedHospital = data.hospitals.find((h) => h.name === userName);
  setHospital(selectedHospital);
};
```

## UI Components

### Sidebar Navigation

- **Dashboard** (current, highlighted)
- **Inventory** → `/hospital/inventory`
- **Fleet Management** → `/hospital/fleet`
- **Staffing** → `/hospital/staff`
- **Logout** button

### Header

- Hospital name display
- User profile avatar

### Statistics Cards (3 columns)

1. **Beds Available**
   - `hospital.bedsAvailable`
   - Blue theme with bed icon

2. **Blood Inventory**
   - `hospital.bloodInventory.total` units
   - Blue theme with bloodtype icon

3. **Active Specialists**
   - Count of non-zero specialist types
   - Blue theme with medical services icon

### Incoming Ambulances Section

Displays `hospital.incomingAmbulances` array:

```javascript
{
  ambulanceId: "#AMB-102",
  caseType: "Critical Trauma",
  priority: 1,
  eta: 4,
  status: "Active",
  progress: 80
}
```

Features:

- Ambulance ID and case type
- Priority badge (color-coded)
- ETA in minutes
- Progress bar visualization
- Status indicator

### Blood Requests Section

Displays `hospital.bloodRequests` array:

```javascript
{
  requestId: "#BR-101",
  hospitalName: "Riverdale Hospital",
  bloodType: "B+",
  litersNeeded: 25,
  distanceMiles: 3.4,
  status: "Pending"
}
```

Features:

- Request ID
- Requesting hospital name
- Blood type badge
- Volume needed
- Distance
- Status (Pending/Approved/Declined)

## Hospital Data Structure

```javascript
{
  id: 1,
  name: "Western Regional Hospital",
  email: "admin@westernregional.gov.np",
  phone: "+977-61-520066",
  address: "Ramghat, Pokhara-8, Kaski, Nepal",
  latitude: 28.2096,
  longitude: 83.9856,
  ambulanceCount: 12,
  bedsAvailable: 50,
  bloodInventory: {
    total: 1728,
    bloodTypes: [
      { type: "A+", liters: 450 },
      // ... other blood types
    ]
  },
  staffCount: {
    "Cardiologist": 3,
    "Neurologist": 2,
    // ... other specialties
  },
  incomingAmbulances: [...],
  bloodRequests: [...]
}
```

## Styling

- Tailwind CSS
- Slate/Blue color theme
- Responsive grid layout
- Shadow and border effects

## Related Files

- [HospitalInventory.jsx](./HospitalInventory.md) - Blood inventory management
- [HospitalStaff.jsx](./HospitalStaff.md) - Staff management
- [HospitalFleet.jsx](./HospitalFleet.md) - Fleet management
- `/public/hospitals.json` - Hospital data source
