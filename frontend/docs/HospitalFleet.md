# HospitalFleet.jsx Documentation

## Overview
`HospitalFleet.jsx` provides ambulance fleet management and blood request handling for hospital administrators. It allows managing ambulance counts and responding to blood donation requests from other hospitals.

## File Location
```
src/pages/hospitals/HospitalFleet.jsx
```

## Dependencies
```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
```

## State Variables

| State | Type | Default | Description |
|-------|------|---------|-------------|
| `hospital` | object | `null` | Current hospital data |
| `ambulanceCount` | number | `0` | Number of ambulances |
| `bloodRequests` | array | `[]` | Incoming blood requests |
| `loading` | boolean | `true` | Loading state |
| `error` | string | `null` | Error message |

## Key Functions

### Ambulance Management

#### handleIncrement()
Increases ambulance count by 1.

#### handleDecrement()
Decreases ambulance count by 1 (minimum 0).

### Blood Request Management

#### handleApproveRequest(requestId)
```javascript
setBloodRequests(prev =>
  prev.map(req =>
    req.requestId === requestId
      ? { ...req, status: "Approved" }
      : req
  )
);
// POST to API when configured
```

#### handleDeclineRequest(requestId)
```javascript
setBloodRequests(prev =>
  prev.map(req =>
    req.requestId === requestId
      ? { ...req, status: "Declined" }
      : req
  )
);
// POST to API when configured
```

#### handleUpdateFleet()
Posts all fleet data to backend:
```javascript
await fetch(`${API_ENDPOINT}/hospital/${hospital.id}/fleet`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ambulanceCount,
    bloodRequests,
  }),
});
```

## UI Components

### Sidebar Navigation
Same as HospitalDashboard with "Fleet Management" highlighted.

### Ambulance Count Section
```jsx
<div className="ambulance-section">
  <h3>Total Ambulances</h3>
  <div className="count-display">{ambulanceCount}</div>
  <div className="controls">
    <button onClick={handleDecrement}>-</button>
    <button onClick={handleIncrement}>+</button>
  </div>
</div>
```

### Blood Requests Table
| Column | Description |
|--------|-------------|
| Request ID | Unique identifier (#BR-XXX) |
| Hospital | Requesting hospital name |
| Blood Type | Required blood type |
| Amount | Liters needed |
| Distance | Miles away |
| Status | Pending/Approved/Declined |
| Actions | Approve/Decline buttons |

### Request Row Example
```jsx
<tr>
  <td>#BR-101</td>
  <td>Riverdale Hospital</td>
  <td><span className="blood-badge">B+</span></td>
  <td>25 L</td>
  <td>3.4 mi</td>
  <td>
    <span className="status-pending">Pending</span>
  </td>
  <td>
    <button onClick={() => handleApproveRequest(req.requestId)}>
      Approve
    </button>
    <button onClick={() => handleDeclineRequest(req.requestId)}>
      Decline
    </button>
  </td>
</tr>
```

### Update Button
```jsx
<button onClick={handleUpdateFleet}>
  Update Fleet Records
</button>
```

## Data Structures

### Blood Request Object
```javascript
{
  requestId: "#BR-101",
  hospitalName: "Riverdale Hospital",
  bloodType: "B+",
  litersNeeded: 25,
  distanceMiles: 3.4,
  status: "Pending" // or "Approved", "Declined"
}
```

### Status Types
| Status | Description | Color |
|--------|-------------|-------|
| Pending | Awaiting decision | Yellow |
| Approved | Request accepted | Green |
| Declined | Request rejected | Red |

## API Endpoints (When Configured)

### Update Fleet
- **POST** `/hospital/{id}/fleet`
- Body: `{ ambulanceCount, bloodRequests }`

### Approve Request
- **POST** `/blood-requests/{requestId}/approve`
- Body: `{ status: "Approved" }`

### Decline Request
- **POST** `/blood-requests/{requestId}/decline`
- Body: `{ status: "Declined" }`

## Features

### Ambulance Fleet
- View current ambulance count
- Increment/decrement controls
- Save changes to backend

### Blood Request Workflow
1. Other hospitals submit blood requests
2. Requests appear in this hospital's table
3. Administrator can approve or decline
4. Status updates reflected in real-time
5. Changes synced to backend

## Related Files
- [HospitalDashboard.jsx](./HospitalDashboard.md) - Main dashboard
- [HospitalInventory.jsx](./HospitalInventory.md) - Blood inventory
- [HospitalStaff.jsx](./HospitalStaff.md) - Staff management
- `/public/hospitals.json` - Data source
