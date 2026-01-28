# Emergency Medical Services (EMS) - Data Flow Documentation

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                             │
│  ┌─────────────┐   ┌─────────────────┐   ┌─────────────────────────────────┐    │
│  │  GuestUser  │   │  AmbulanceUser  │   │         Hospital Pages          │    │
│  │  (Report)   │   │   (Respond)     │   │ Dashboard|Inventory|Staff|Fleet │    │
│  └──────┬──────┘   └────────┬────────┘   └───────────────┬─────────────────┘    │
│         │                   │                            │                       │
│         └───────────────────┼────────────────────────────┘                       │
│                             │                                                    │
│                    ┌────────┴────────┐                                          │
│                    │  src/services/  │                                          │
│                    │     api.js      │                                          │
│                    └────────┬────────┘                                          │
└─────────────────────────────┼───────────────────────────────────────────────────┘
                              │ HTTP REST API
                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express.js)                                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Routes Layer                                     │   │
│  │  auth | ambulances | accidents | casualties | hospitals | bloodRequests  │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                          │
│  ┌───────────────────────────────────┴──────────────────────────────────────┐   │
│  │                        Controllers Layer                                  │   │
│  │  authController | ambulanceController | accidentController               │   │
│  │  casualtyController | hospitalController | bloodRequestController        │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                          │
│  ┌───────────────────────────────────┴──────────────────────────────────────┐   │
│  │                         Utils Layer                                       │   │
│  │  dataAccess.js | distanceUtils.js | hospitalMatcher.js                   │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
└──────────────────────────────────────┼──────────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER (JSON Files)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐   │
│  │ hospitals.   │  │ ambulances.  │  │  accidents.   │  │  casualties.      │   │
│  │    json      │  │    json      │  │     json      │  │     json          │   │
│  └──────────────┘  └──────────────┘  └───────────────┘  └───────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐                                             │
│  │bloodRequests │  │ submissions. │                                             │
│  │    .json     │  │    json      │                                             │
│  └──────────────┘  └──────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Files Structure

### 1. hospitals.json

```javascript
{
  "hospitals": [
    {
      "id": 1,
      "name": "Hospital Name",
      "password": "hashed_password",
      "email": "email@example.com",
      "phone": "+1234567890",
      "address": "Full Address",
      "location": "City, State",
      "latitude": 28.2096,
      "longitude": 83.9856,
      "ambulanceCount": 5,
      "bedsAvailable": 50,
      "bloodInventory": {
        "total": 500,
        "bloodTypes": [
          { "type": "A+", "liters": 100 },
          { "type": "O-", "liters": 80 }
        ]
      },
      "staffCount": {
        "Cardiology": 5,
        "Neurology": 3,
        "Orthopedics": 4,
        "Emergency": 10
      }
    }
  ]
}
```

### 2. ambulances.json

```javascript
{
  "ambulances": [
    {
      "id": "AMB-001",
      "name": "Ambulance Name",
      "password": "hashed_password",
      "driverName": "Driver Name",
      "phone": "+1234567890",
      "latitude": 28.2100,
      "longitude": 83.9800,
      "status": "available|en_route|at_scene|transporting|busy",
      "currentAccidentId": null | "accident_id",
      "destinationHospitalId": null | 1,
      "hospitalId": 1  // Owning hospital
    }
  ]
}
```

### 3. accidents.json

```javascript
{
  "accidents": [
    {
      "id": "ACC-001",
      "title": "Emergency Reported",
      "description": "Accident description",
      "latitude": 28.2150,
      "longitude": 83.9900,
      "location": "Location description",
      "image": "base64_encoded_image",
      "reporterPhone": "+1234567890",
      "status": "pending|ambulance_dispatched|ambulance_arrived|in_transit|completed",
      "assignedAmbulance": {
        "id": "AMB-001",
        "name": "Ambulance Name"
      },
      "casualties": ["CAS-001", "CAS-002"],
      "createdAt": "2026-01-28T10:30:00Z"
    }
  ]
}
```

### 4. casualties.json

```javascript
{
  "casualties": [
    {
      "id": "CAS-001",
      "accidentId": "ACC-001",
      "name": "Patient Name",
      "age": 35,
      "gender": "Male|Female|Unknown",
      "injuryType": "Trauma|Cardiac|Burns|etc",
      "severity": "mild|moderate|severe|critical",
      "bloodType": "A+|B-|O+|etc",
      "bloodUnitsNeeded": 2,
      "notes": "Additional notes",
      "status": "pending|hospital_assigned|in_transit|admitted|discharged",
      "assignedHospital": {
        "id": 1,
        "name": "Hospital Name",
        "distance": 2.5,
        "eta": "8 mins"
      }
    }
  ]
}
```

### 5. bloodRequests.json

```javascript
{
  "bloodRequests": [
    {
      "id": "BR-001",
      "requestingHospitalId": 1,
      "donorHospitalId": 2,
      "bloodType": "O-",
      "unitsRequested": 5,
      "urgency": "normal|urgent|critical",
      "status": "pending|approved|in_transit|completed|rejected",
      "createdAt": "2026-01-28T10:30:00Z"
    }
  ]
}
```

---

## API Endpoints Reference

### Authentication

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| POST   | `/api/auth/ambulance-login` | Ambulance driver login |
| POST   | `/api/auth/hospital-login`  | Hospital admin login   |

### Ambulances (10 endpoints)

| Method | Endpoint                                 | Description              |
| ------ | ---------------------------------------- | ------------------------ |
| GET    | `/api/ambulances`                        | Get all ambulances       |
| GET    | `/api/ambulances/:id`                    | Get ambulance by ID      |
| PATCH  | `/api/ambulances/:id/location`           | Update location (GPS)    |
| PATCH  | `/api/ambulances/:id/status`             | Update status            |
| POST   | `/api/ambulances/find-nearest`           | Find nearest available   |
| POST   | `/api/ambulances/:id/accept-assignment`  | Accept accident          |
| POST   | `/api/ambulances/:id/arrive-scene`       | Mark arrived at scene    |
| POST   | `/api/ambulances/:id/start-transport`    | Start hospital transport |
| POST   | `/api/ambulances/:id/complete-transport` | Complete transport       |
| GET    | `/api/ambulances/:id/active-case`        | Get current assignment   |

### Accidents (5 endpoints)

| Method | Endpoint                    | Description                 |
| ------ | --------------------------- | --------------------------- |
| POST   | `/api/accidents/report`     | Report new accident (Guest) |
| GET    | `/api/accidents`            | Get all accidents           |
| GET    | `/api/accidents/pending`    | Get pending accidents       |
| GET    | `/api/accidents/:id`        | Get accident details        |
| PATCH  | `/api/accidents/:id/status` | Update accident status      |

### Casualties (5 endpoints)

| Method | Endpoint                              | Description                  |
| ------ | ------------------------------------- | ---------------------------- |
| POST   | `/api/casualties`                     | Add casualty to accident     |
| GET    | `/api/casualties`                     | Get all casualties           |
| GET    | `/api/casualties/accident/:id`        | Get casualties for accident  |
| PATCH  | `/api/casualties/:id/status`          | Update casualty status       |
| POST   | `/api/casualties/recommend-hospitals` | Get hospital recommendations |

### Hospitals (12 endpoints)

| Method | Endpoint                             | Description                 |
| ------ | ------------------------------------ | --------------------------- |
| GET    | `/api/hospitals`                     | Get all hospitals           |
| GET    | `/api/hospitals/:id`                 | Get hospital by ID          |
| GET    | `/api/hospitals/:id/dashboard`       | Get dashboard data          |
| PATCH  | `/api/hospitals/:id/beds`            | Update bed count            |
| PATCH  | `/api/hospitals/:id/blood-inventory` | Update blood inventory      |
| GET    | `/api/hospitals/:id/staff`           | Get staff details           |
| POST   | `/api/hospitals/:id/staff`           | Add staff member            |
| PATCH  | `/api/hospitals/:id/staff/:staffId`  | Update staff member         |
| DELETE | `/api/hospitals/:id/staff/:staffId`  | Remove staff member         |
| GET    | `/api/hospitals/:id/fleet`           | Get ambulance fleet         |
| POST   | `/api/hospitals/:id/fleet`           | Add ambulance to fleet      |
| POST   | `/api/hospitals/find-best`           | Find best matching hospital |

### Blood Requests (6 endpoints)

| Method | Endpoint                           | Description          |
| ------ | ---------------------------------- | -------------------- |
| POST   | `/api/blood-requests`              | Create blood request |
| GET    | `/api/blood-requests`              | Get all requests     |
| GET    | `/api/blood-requests/:id`          | Get request details  |
| PATCH  | `/api/blood-requests/:id/approve`  | Approve request      |
| PATCH  | `/api/blood-requests/:id/complete` | Complete transfer    |
| PATCH  | `/api/blood-requests/:id/reject`   | Reject request       |

---

## Entity Relationships

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  HOSPITAL   │ 1─────n │  AMBULANCE  │ 1─────n │  ACCIDENT   │
│             │ owns    │             │ responds│             │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │ 1                     │ transports            │ has
       │                       ▼                       ▼
       │              ┌─────────────┐         ┌─────────────┐
       └──────────────│  CASUALTY   │─────────│  CASUALTIES │
         assigned to  │             │         │   (array)   │
                      └─────────────┘         └─────────────┘

┌─────────────┐  requests  ┌─────────────┐
│  HOSPITAL   │───────────▶│   BLOOD     │
│ (requesting)│            │   REQUEST   │
└─────────────┘            └──────┬──────┘
       ▲                          │
       │         fulfills         │
       │    ┌─────────────┐       │
       └────│  HOSPITAL   │◀──────┘
            │   (donor)   │
            └─────────────┘
```

---

## User Journey Flows

### 1. Guest User - Emergency Reporting

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                          GUEST USER FLOW                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐  │
│  │ Open    │───▶│ Capture     │───▶│ Enable GPS   │───▶│ Submit Report   │  │
│  │ Camera  │    │ Photo       │    │ Location     │    │ (Photo + GPS)   │  │
│  └─────────┘    └─────────────┘    └──────────────┘    └────────┬────────┘  │
│                                                                  │           │
│                                                                  ▼           │
│                                                    ┌─────────────────────┐   │
│                                                    │ POST /api/accidents │   │
│                                                    │     /report         │   │
│                                                    └─────────┬───────────┘   │
│                                                              │               │
│                     ┌────────────────────────────────────────┴───────┐       │
│                     ▼                                                ▼       │
│         ┌──────────────────────┐                    ┌────────────────────┐   │
│         │ Create Accident      │                    │ Find & Dispatch    │   │
│         │ Record in JSON       │                    │ Nearest Ambulance  │   │
│         └──────────────────────┘                    └────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**API Calls:**

1. `POST /api/accidents/report` - Creates accident and auto-dispatches nearest ambulance

---

### 2. Ambulance User - Complete Workflow

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         AMBULANCE USER FLOW                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 1: LOGIN & INITIALIZATION                                                 │
│  ┌────────────────┐    ┌────────────────┐    ┌─────────────────────┐            │
│  │ Login with     │───▶│ Enable GPS     │───▶│ Fetch Pending       │            │
│  │ Credentials    │    │ Tracking       │    │ Accidents           │            │
│  └────────────────┘    └────────────────┘    └─────────────────────┘            │
│        │                      │                        │                         │
│        ▼                      ▼                        ▼                         │
│  POST /auth/         PATCH /ambulances/        GET /accidents/pending            │
│  ambulance-login     :id/location                                                │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 2: ACCEPT INCIDENT                                                        │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────────────┐         │
│  │ View Nearest    │───▶│ Accept          │───▶│ Navigate to          │         │
│  │ Incident        │    │ Incident        │    │ Accident Scene       │         │
│  └─────────────────┘    └─────────────────┘    └──────────────────────┘         │
│                               │                                                  │
│                               ▼                                                  │
│                    PATCH /ambulances/:id/status (busy)                           │
│                    POST /ambulances/:id/accept-assignment                        │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 3: ON SCENE                                                               │
│  ┌─────────────────┐    ┌──────────────────────────────────────────────────────┐│
│  │ Mark Arrived    │───▶│ Enter Casualty Data for Each Patient                 ││
│  │ at Scene        │    │ • Blood Type    • Severity    • Required Specialty   ││
│  └─────────────────┘    └──────────────────────────────────────────────────────┘│
│        │                               │                                         │
│        ▼                               ▼                                         │
│  POST /ambulances/            POST /casualties (for each patient)                │
│  :id/arrive-scene             POST /casualties/recommend-hospitals               │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 4: TRANSPORT TO HOSPITAL                                                  │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐ │
│  │ Start Transport     │───▶│ Navigate to         │───▶│ Hospital sees        │ │
│  │ (Select Hospital)   │    │ Best Hospital       │    │ incoming ambulance   │ │
│  └─────────────────────┘    └─────────────────────┘    └──────────────────────┘ │
│        │                                                                         │
│        ▼                                                                         │
│  POST /ambulances/:id/start-transport                                            │
│  { hospitalId: selectedHospital.id }                                             │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  PHASE 5: COMPLETE TRANSPORT                                                     │
│  ┌─────────────────────┐    ┌─────────────────────┐    ┌──────────────────────┐ │
│  │ Mark Reached        │───▶│ Complete Transport  │───▶│ Status → Available   │ │
│  │ Hospital            │    │ API Call            │    │ Ready for next call  │ │
│  └─────────────────────┘    └─────────────────────┘    └──────────────────────┘ │
│        │                                                                         │
│        ▼                                                                         │
│  POST /ambulances/:id/complete-transport                                         │
│  PATCH /ambulances/:id/status (active/available)                                 │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

**"Got a Call" Alternative Flow:**

```
┌────────────────────────────────────────────────────────────────┐
│ Click "Got a Call" → Status: Busy → Enter Casualties →        │
│ Find Best Hospital → Start Transport → Navigate to Hospital → │
│ Complete Transport → Status: Active                            │
└────────────────────────────────────────────────────────────────┘
```

---

### 3. Hospital User - Dashboard & Management

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                          HOSPITAL USER FLOW                                       │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  LOGIN & DASHBOARD                                                               │
│  ┌────────────────┐    ┌──────────────────────────────────────────────────────┐ │
│  │ Login with     │───▶│                  DASHBOARD VIEW                       │ │
│  │ Email/Password │    │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐  │ │
│  └────────────────┘    │  │ Beds     │ │ Blood    │ │ Staff    │ │Incoming │  │ │
│        │               │  │ Available│ │ Inventory│ │ Count    │ │Ambulance│  │ │
│        ▼               │  └──────────┘ └──────────┘ └──────────┘ └─────────┘  │ │
│  POST /auth/           │                                                       │ │
│  hospital-login        └───────────────────────────────────────────────────────┘ │
│        │                                     │                                   │
│        ▼                                     ▼                                   │
│  GET /hospitals/:id/dashboard    (Auto-refresh every 30 seconds)                 │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  INVENTORY MANAGEMENT                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  Blood Inventory Tab                                                        │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │ │
│  │  │ View Current │───▶│ Update Units │───▶│ Save Changes │                  │ │
│  │  │ Stock        │    │ Per Type     │    │ to Backend   │                  │ │
│  │  └──────────────┘    └──────────────┘    └──────────────┘                  │ │
│  │                              │                                              │ │
│  │                              ▼                                              │ │
│  │               PATCH /hospitals/:id/blood-inventory                          │ │
│  │               { bloodTypes: [{type: "A+", liters: 150}, ...] }              │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  STAFF MANAGEMENT                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                  │ │
│  │  │ View Staff   │    │ Add Staff    │    │ Update/Delete│                  │ │
│  │  │ by Specialty │    │ Member       │    │ Staff Member │                  │ │
│  │  └──────────────┘    └──────────────┘    └──────────────┘                  │ │
│  │        │                   │                    │                           │ │
│  │        ▼                   ▼                    ▼                           │ │
│  │  GET /hospitals/    POST /hospitals/     PATCH|DELETE                       │ │
│  │  :id/staff          :id/staff            /hospitals/:id/staff/:staffId      │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  FLEET MANAGEMENT                                                                │
│  ┌────────────────────────────────────────────────────────────────────────────┐ │
│  │  ┌───────────────────┐    ┌───────────────────┐                            │ │
│  │  │ View All Hospital │    │ Add New Ambulance │                            │ │
│  │  │ Ambulances        │    │ to Fleet          │                            │ │
│  │  └───────────────────┘    └───────────────────┘                            │ │
│  │        │                         │                                          │ │
│  │        ▼                         ▼                                          │ │
│  │  GET /hospitals/:id/fleet  POST /hospitals/:id/fleet                        │ │
│  └────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

## Hospital Matching Algorithm

When finding the best hospital for a casualty, the system uses a **weighted scoring algorithm**:

```
┌────────────────────────────────────────────────────────────────────────────────┐
│                     HOSPITAL MATCHING ALGORITHM                                 │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  INPUT: Casualty Details                                                       │
│  • Blood Type Required                                                         │
│  • Specialty Required (e.g., Cardiology, Orthopedics)                         │
│  • Location (Latitude, Longitude)                                              │
│  • Blood Units Needed                                                          │
│                                                                                │
│  SCORING WEIGHTS:                                                              │
│  ┌─────────────────────────────────────┬──────────────┐                        │
│  │ Factor                              │ Weight       │                        │
│  ├─────────────────────────────────────┼──────────────┤                        │
│  │ Blood Availability                  │ 40%          │                        │
│  │ Specialist Availability             │ 30%          │                        │
│  │ Distance (closer = better)          │ 20%          │                        │
│  │ Bed Availability                    │ 10%          │                        │
│  └─────────────────────────────────────┴──────────────┘                        │
│                                                                                │
│  PROCESS:                                                                      │
│  1. Filter hospitals with required blood type                                  │
│  2. Filter hospitals with required specialist                                  │
│  3. Calculate distance using Haversine formula                                 │
│  4. Score each hospital using weighted formula                                 │
│  5. Return ranked list of hospitals                                            │
│                                                                                │
│  OUTPUT:                                                                       │
│  • Best matching hospital with scores                                          │
│  • Distance in km                                                              │
│  • Estimated Time of Arrival (ETA)                                             │
│                                                                                │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## Status State Machines

### Accident Status Flow

```
pending ──▶ ambulance_dispatched ──▶ ambulance_arrived ──▶ in_transit ──▶ completed
```

### Ambulance Status Flow

```
available ──▶ dispatched ──▶ en_route ──▶ at_scene ──▶ transporting ──▶ available
                                             │                              ▲
                                             └──────────────────────────────┘
                                               (if no casualties)
```

### Casualty Status Flow

```
pending ──▶ hospital_assigned ──▶ in_transit ──▶ admitted ──▶ discharged
```

### Blood Request Status Flow

```
pending ──▶ approved ──▶ in_transit ──▶ completed
    │
    └──▶ rejected
```

---

## Real-time Data Sync

### Location Tracking

- Ambulance location is updated every **5 seconds** via `watchPosition` API
- Location is posted to backend via `PATCH /ambulances/:id/location`
- Hospital dashboard shows real-time ambulance positions

### Incoming Ambulances (Hospital View)

- Hospital queries ambulances where:
  - `destinationHospitalId === hospital.id`
  - `status === "transporting"`
- ETA calculated using Haversine distance formula

### Dashboard Refresh

- Hospital dashboard auto-refreshes data
- Pending accidents list refreshes on ambulance page

---

## Error Handling

| Scenario            | Frontend Handling              | Backend Response          |
| ------------------- | ------------------------------ | ------------------------- |
| Network failure     | Retry with exponential backoff | N/A                       |
| Invalid credentials | Show error message             | 401 Unauthorized          |
| Resource not found  | Redirect or show alert         | 404 Not Found             |
| Validation error    | Highlight fields               | 400 Bad Request           |
| Server error        | Generic error message          | 500 Internal Server Error |

---

## Security Considerations

1. **Authentication**: Simple password-based login (recommend JWT for production)
2. **Data Validation**: Backend validates all inputs before processing
3. **Password Storage**: Passwords in JSON (recommend hashing for production)
4. **CORS**: Configured for localhost development
5. **HTTPS**: Required for geolocation APIs in production

---

## File Locations

```
HackathonPEC/
├── src/
│   ├── pages/
│   │   ├── GuestUser.jsx        # Emergency reporting
│   │   ├── AmbulanceUser.jsx    # Ambulance operations
│   │   ├── Login.jsx            # Authentication
│   │   └── hospitals/
│   │       ├── HospitalDashboard.jsx
│   │       ├── HospitalInventory.jsx
│   │       ├── HospitalStaff.jsx
│   │       └── HospitalFleet.jsx
│   └── services/
│       └── api.js               # All API functions (40+)
│
├── backend/
│   ├── src/
│   │   ├── controllers/         # Business logic
│   │   ├── routes/              # API routes
│   │   └── utils/               # Data access & utilities
│   └── data/                    # JSON data files
│       ├── hospitals.json
│       ├── ambulances.json
│       ├── accidents.json
│       ├── casualties.json
│       ├── bloodRequests.json
│       └── submissions.json
```
