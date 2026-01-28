# Emergency Healthcare System - Complete Data Flow Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Files Structure](#data-files-structure)
3. [API Endpoints Reference](#api-endpoints-reference)
4. [Entity Relationships](#entity-relationships)
5. [User Journey Flows](#user-journey-flows)
6. [ASCII Data Flow Diagrams](#ascii-data-flow-diagrams)

---

## System Overview

This is an Emergency Healthcare Response System that connects **Guests** (accident reporters), **Ambulances**, and **Hospitals** in a coordinated emergency response workflow.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EMERGENCY HEALTHCARE SYSTEM ARCHITECTURE                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────────┐   │
│    │   FRONTEND  │◄──►│   BACKEND   │◄──►│        DATA LAYER           │   │
│    │   (React)   │    │  (Express)  │    │    (JSON Files)             │   │
│    └─────────────┘    └─────────────┘    └─────────────────────────────┘   │
│          │                   │                        │                     │
│    ┌─────┴─────┐       ┌─────┴─────┐           ┌─────┴─────┐               │
│    │ api.js    │       │Controllers│           │ dataAccess│               │
│    │ (Service) │       │  Routes   │           │   .js     │               │
│    └───────────┘       └───────────┘           └───────────┘               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Files Structure

### 1. `hospitals.json`

```json
{
  "hospitals": [
    {
      "id": 1, // Unique identifier (number)
      "name": "Western Regional Hospital", // Hospital name (login credential)
      "password": "hospital123", // Plain text password
      "email": "admin@hospital.com",
      "phone": "+977-61-520066",
      "address": "Ramghat, Pokhara-8, Nepal",
      "location": "Ramghat, Pokhara",
      "latitude": 28.2096, // GPS latitude
      "longitude": 83.9856, // GPS longitude
      "ambulanceCount": 9, // Total ambulances owned
      "bedsAvailable": 50, // Current available beds
      "bloodInventory": {
        "total": 6, // Total blood liters
        "bloodTypes": [
          { "type": "A+", "liters": 3 },
          { "type": "A-", "liters": 2 },
          { "type": "B+", "liters": 1 },
          { "type": "B-", "liters": 0 },
          { "type": "O+", "liters": 0 },
          { "type": "O-", "liters": 0 },
          { "type": "AB+", "liters": 0 },
          { "type": "AB-", "liters": 0 }
        ]
      },
      "staffCount": {
        // Specialists available
        "Cardiologist": 2,
        "Neurologist": 1,
        "Orthopedic Surgeon": 3,
        "General Surgeon": 2,
        "Emergency Medicine Specialist": 4
        // ... more specialties
      }
    }
  ]
}
```

### 2. `ambulances.json`

```json
{
  "ambulances": [
    {
      "id": "AMB-001", // Unique ID (string)
      "name": "MH-02-AB-0001", // Ambulance name (login credential)
      "password": "ambulance@123", // Plain text password
      "latitude": 28.2109, // Current GPS latitude
      "longitude": 83.9774, // Current GPS longitude
      "status": "available", // Status enum (see below)
      "hospitalId": 1, // Owner hospital ID
      "driverName": "Ram Bahadur Thapa",
      "phone": "+977-98-56012345",
      "currentAccidentId": null, // Assigned accident ID
      "destinationHospitalId": null // Target hospital when transporting
    }
  ]
}
```

**Ambulance Status Values:**

- `available` - Ready to accept incidents
- `dispatched` - Assigned but not accepted
- `en_route` - Driving to incident
- `at_scene` - Arrived at accident location
- `transporting` - Carrying casualties to hospital
- `at_hospital` - At hospital
- `offline` - Not in service

### 3. `active_accidents.json`

```json
{
  "accidents": [
    {
      "id": "ACC-1769574428461", // Unique ID (timestamp-based)
      "title": "Emergency Reported",
      "description": "",
      "latitude": 28.210903, // Accident GPS latitude
      "longitude": 83.9773, // Accident GPS longitude
      "location": "Unknown Location",
      "image": "data:image/jpeg;base64,/9j/...", // Base64 encoded photo
      "reporterPhone": null,
      "status": "pending", // Status enum (see below)
      "assignedAmbulance": {
        // Assigned ambulance info
        "id": "AMB-001",
        "name": "MH-02-AB-0001",
        "driverName": "Ram Bahadur Thapa",
        "phone": "+977-98-56012345"
      },
      "casualties": [], // Array of casualty IDs
      "createdAt": "2026-01-28T04:27:08.461Z"
    }
  ]
}
```

**Accident Status Values:**

- `pending` - Waiting for ambulance
- `ambulance_dispatched` - Ambulance assigned
- `ambulance_en_route` - Ambulance on the way
- `ambulance_arrived` - Ambulance at scene
- `in_transit` - Casualties being transported
- `completed` - Emergency resolved
- `cancelled` - Emergency cancelled

### 4. `casualties.json`

```json
{
  "casualties": [
    {
      "id": "CAS-1769574428461", // Unique ID
      "accidentId": "ACC-1769574428461", // Parent accident ID
      "name": "Unknown",
      "age": null,
      "gender": "Unknown",
      "injuryType": "General Trauma", // Type of injury
      "severity": "moderate", // mild, moderate, severe, critical
      "bloodType": "O+",
      "bloodUnitsNeeded": 2,
      "notes": "",
      "status": "pending", // Status enum (see below)
      "assignedHospital": {
        // Matched hospital
        "id": 1,
        "name": "Western Regional Hospital",
        "address": "...",
        "phone": "...",
        "distance": 2.5,
        "eta": 4
      },
      "createdAt": "2026-01-28T04:27:08.461Z"
    }
  ]
}
```

**Casualty Status Values:**

- `pending` - Not yet assigned
- `hospital_assigned` - Hospital matched
- `in_transit` - Being transported
- `admitted` - At hospital
- `discharged` - Released

### 5. `blood_requests.json`

```json
{
  "requests": [
    {
      "id": "BR-1769574428461", // Unique ID
      "requestingHospitalId": 1,
      "requestingHospitalName": "Hospital A",
      "bloodType": "O+",
      "unitsNeeded": 5,
      "urgency": "urgent", // normal, urgent, critical
      "notes": "",
      "status": "pending", // pending, approved, rejected, completed
      "donorHospitalId": 2,
      "donorHospitalName": "Hospital B",
      "createdAt": "2026-01-28T04:27:08.461Z"
    }
  ]
}
```

### 6. `submissions.json`

```json
{
  "submissions": [
    {
      "id": "SUB-1769574428461",
      // General purpose submissions storage
      "status": "pending",
      "createdAt": "2026-01-28T04:27:08.461Z"
    }
  ]
}
```

---

## API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint                    | Purpose         | Request Body         | Response        |
| ------ | --------------------------- | --------------- | -------------------- | --------------- |
| POST   | `/api/auth/ambulance/login` | Ambulance login | `{ name, password }` | `{ ambulance }` |
| POST   | `/api/auth/hospital/login`  | Hospital login  | `{ name, password }` | `{ hospital }`  |

### Ambulance Endpoints

| Method | Endpoint                                 | Purpose                  | Request Body              | Response                       |
| ------ | ---------------------------------------- | ------------------------ | ------------------------- | ------------------------------ |
| GET    | `/api/ambulances`                        | Get all ambulances       | -                         | `{ ambulances[] }`             |
| GET    | `/api/ambulances/available`              | Get available ambulances | -                         | `{ ambulances[] }`             |
| GET    | `/api/ambulances/:id`                    | Get ambulance by ID      | -                         | `{ ambulance }`                |
| POST   | `/api/ambulances/find-nearest`           | Find nearest to location | `{ latitude, longitude }` | `{ ambulance, distance, eta }` |
| PATCH  | `/api/ambulances/:id/location`           | Update location          | `{ latitude, longitude }` | `{ ambulance }`                |
| PATCH  | `/api/ambulances/:id/status`             | Update status            | `{ status }`              | `{ ambulance }`                |
| POST   | `/api/ambulances/:id/accept-assignment`  | Accept incident          | `{ accidentId }`          | `{ ambulance, accident, eta }` |
| POST   | `/api/ambulances/:id/arrive-scene`       | Mark arrived at scene    | -                         | `{ ambulance }`                |
| POST   | `/api/ambulances/:id/start-transport`    | Start hospital transport | `{ hospitalId }`          | `{ ambulance }`                |
| POST   | `/api/ambulances/:id/complete-transport` | Complete transport       | -                         | `{ ambulance }`                |

### Accident Endpoints

| Method | Endpoint                    | Purpose                | Request Body                                            | Response                  |
| ------ | --------------------------- | ---------------------- | ------------------------------------------------------- | ------------------------- |
| POST   | `/api/accidents/report`     | Report new accident    | `{ latitude, longitude, image?, title?, description? }` | `{ accident, dispatch? }` |
| GET    | `/api/accidents`            | Get all accidents      | -                                                       | `{ accidents[] }`         |
| GET    | `/api/accidents/pending`    | Get pending accidents  | -                                                       | `{ accidents[] }`         |
| GET    | `/api/accidents/:id`        | Get accident by ID     | -                                                       | `{ accident }`            |
| PATCH  | `/api/accidents/:id/status` | Update accident status | `{ status }`                                            | `{ accident }`            |

### Casualty Endpoints

| Method | Endpoint                               | Purpose                      | Request Body                                      | Response                           |
| ------ | -------------------------------------- | ---------------------------- | ------------------------------------------------- | ---------------------------------- |
| POST   | `/api/casualties`                      | Add casualty                 | `{ accidentId, injuryType, bloodType, severity }` | `{ casualty, hospitalAssignment }` |
| GET    | `/api/casualties`                      | Get all casualties           | -                                                 | `{ casualties[] }`                 |
| GET    | `/api/casualties/accident/:accidentId` | Get casualties for accident  | -                                                 | `{ casualties[] }`                 |
| POST   | `/api/casualties/recommend-hospitals`  | Get hospital recommendations | `{ injuryType, bloodType, latitude, longitude }`  | `{ recommendations[] }`            |
| PATCH  | `/api/casualties/:id/status`           | Update casualty status       | `{ status }`                                      | `{ casualty }`                     |

### Hospital Endpoints

| Method | Endpoint                             | Purpose                         | Request Body                                            | Response                                                                           |
| ------ | ------------------------------------ | ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| GET    | `/api/hospitals`                     | Get all hospitals               | -                                                       | `{ hospitals[] }`                                                                  |
| GET    | `/api/hospitals/:id`                 | Get hospital by ID              | -                                                       | `{ hospital }`                                                                     |
| GET    | `/api/hospitals/by-name/:name`       | Get hospital by name            | -                                                       | `{ hospital }`                                                                     |
| GET    | `/api/hospitals/:id/dashboard`       | Get dashboard data              | -                                                       | `{ hospital, stats, incomingAmbulances, casualties, bloodRequests, staffSummary }` |
| GET    | `/api/hospitals/:id/fleet`           | Get hospital ambulances         | -                                                       | `{ ambulances[] }`                                                                 |
| GET    | `/api/hospitals/:id/blood-inventory` | Get blood inventory             | -                                                       | `{ inventory }`                                                                    |
| GET    | `/api/hospitals/:id/staff`           | Get staff count                 | -                                                       | `{ staff, total }`                                                                 |
| PATCH  | `/api/hospitals/:id/beds`            | Update bed count                | `{ bedsAvailable }`                                     | `{ hospital }`                                                                     |
| PATCH  | `/api/hospitals/:id/blood-inventory` | Update blood inventory          | `{ bloodTypes[] }`                                      | `{ hospital }`                                                                     |
| PATCH  | `/api/hospitals/:id/staff`           | Update staff count              | `{ staffCount }`                                        | `{ hospital }`                                                                     |
| PATCH  | `/api/hospitals/:id/ambulance-count` | Update ambulance count          | `{ ambulanceCount }`                                    | `{ hospital }`                                                                     |
| POST   | `/api/hospitals/find-best`           | Find best hospital for casualty | `{ bloodType, specialtyRequired, latitude, longitude }` | `{ hospital, allOptions[] }`                                                       |

### Blood Request Endpoints

| Method | Endpoint                                   | Purpose                   | Request Body                                                | Response                         |
| ------ | ------------------------------------------ | ------------------------- | ----------------------------------------------------------- | -------------------------------- |
| POST   | `/api/blood/request`                       | Create blood request      | `{ requestingHospitalId, bloodType, unitsNeeded, urgency }` | `{ request, availableDonors[] }` |
| GET    | `/api/blood/requests`                      | Get all blood requests    | -                                                           | `{ requests[] }`                 |
| GET    | `/api/blood/requests/:id`                  | Get request by ID         | -                                                           | `{ request }`                    |
| GET    | `/api/blood/requests/hospital/:hospitalId` | Get requests for hospital | -                                                           | `{ requests[] }`                 |
| GET    | `/api/blood/requests/pending/:hospitalId`  | Get pending requests      | -                                                           | `{ requests[] }`                 |
| POST   | `/api/blood/requests/:id/approve`          | Approve blood request     | -                                                           | `{ request }`                    |
| POST   | `/api/blood/requests/:id/decline`          | Decline blood request     | `{ reason? }`                                               | `{ request }`                    |
| POST   | `/api/blood/requests/:id/complete`         | Complete blood transfer   | -                                                           | `{ request }`                    |

---

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ENTITY RELATIONSHIP DIAGRAM                         │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │    HOSPITAL     │
    │─────────────────│
    │ id (PK)         │
    │ name            │◄─────────────────────────────────────────┐
    │ password        │                                          │
    │ bloodInventory  │◄──────────────────────┐                  │
    │ staffCount      │                       │                  │
    │ bedsAvailable   │                       │                  │
    │ ambulanceCount  │                       │                  │
    │ latitude/long   │                       │                  │
    └────────┬────────┘                       │                  │
             │                                │                  │
             │ owns (1:N)                     │                  │
             ▼                                │                  │
    ┌─────────────────┐                       │                  │
    │   AMBULANCE     │                       │                  │
    │─────────────────│                       │                  │
    │ id (PK)         │                       │                  │
    │ name            │◄────────┐             │                  │
    │ hospitalId (FK) │         │             │                  │
    │ status          │         │             │                  │
    │ currentAccident │─────────┼─────┐       │                  │
    │ destHospitalId  │─────────┼─────┼───────┼──────────────────┘
    │ latitude/long   │         │     │       │      destination
    └─────────────────┘         │     │       │
                                │     │       │
             assigned to (N:1)  │     │       │
                                │     │       │
    ┌─────────────────┐         │     │       │
    │    ACCIDENT     │         │     │       │
    │─────────────────│         │     │       │
    │ id (PK)         │◄────────┴─────┘       │
    │ status          │                       │ assigned to
    │ assignedAmb     │                       │ (N:1)
    │ casualties[]    │───────────────┐       │
    │ latitude/long   │               │       │
    │ image           │               │       │
    └─────────────────┘               │       │
                                      │       │
             has (1:N)                │       │
                                      ▼       │
    ┌─────────────────┐               │       │
    │    CASUALTY     │◄──────────────┘       │
    │─────────────────│                       │
    │ id (PK)         │                       │
    │ accidentId (FK) │                       │
    │ bloodType       │                       │
    │ injuryType      │                       │
    │ assignedHosp    │───────────────────────┘
    │ status          │
    └─────────────────┘

    ┌─────────────────┐         ┌─────────────────┐
    │  BLOOD_REQUEST  │         │    HOSPITAL     │
    │─────────────────│         │   (Donor)       │
    │ id (PK)         │         └────────▲────────┘
    │ requestingHosp  │──────────────────┤
    │ donorHospital   │──────────────────┘
    │ bloodType       │
    │ unitsNeeded     │
    │ status          │
    └─────────────────┘
```

---

## User Journey Flows

### 1. Guest User Journey - Emergency Reporting

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        GUEST USER EMERGENCY FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Guest (Public)                Frontend (GuestUser.jsx)              Backend API
         │                                  │                               │
         │  1. Opens app                    │                               │
         ├─────────────────────────────────►│                               │
         │                                  │                               │
         │  2. Grants camera permission     │                               │
         │◄─────────────────────────────────┤                               │
         │                                  │                               │
         │  3. Grants location permission   │                               │
         │◄─────────────────────────────────┤                               │
         │                                  │                               │
         │  4. Captures accident photo      │                               │
         ├─────────────────────────────────►│                               │
         │                                  │                               │
         │  5. Submits emergency report     │                               │
         │                                  ├──────────────────────────────►│
         │                                  │  POST /api/accidents/report   │
         │                                  │  { image, latitude, longitude}│
         │                                  │                               │
         │                                  │  ┌─────────────────────────┐  │
         │                                  │  │ Backend Processing:     │  │
         │                                  │  │ 1. Create accident      │  │
         │                                  │  │ 2. Find nearest AMB     │  │
         │                                  │  │ 3. Calculate ETA        │  │
         │                                  │  │ 4. Dispatch ambulance   │  │
         │                                  │  │ 5. Update statuses      │  │
         │                                  │  └─────────────────────────┘  │
         │                                  │                               │
         │                                  │◄──────────────────────────────┤
         │                                  │  { accident, dispatch info }  │
         │                                  │                               │
         │  6. Show ETA & ambulance info    │                               │
         │◄─────────────────────────────────┤                               │
         ▼                                  ▼                               ▼
```

**Data Flow:**

1. `GuestUser.jsx` → captures image + gets geolocation
2. `api.js::reportAccident()` → POST `/api/accidents/report`
3. `accidentController.js::reportAccident` → creates accident in `active_accidents.json`
4. `distanceUtils.js::findNearestAmbulance` → finds closest available ambulance
5. `dataAccess.js::updateAmbulance` → updates ambulance status to "dispatched"
6. Response returns accident ID, ambulance info, and ETA

---

### 2. Ambulance User Journey - Complete Incident Handling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      AMBULANCE USER COMPLETE FLOW                            │
└─────────────────────────────────────────────────────────────────────────────┘

Phase 1: Login & Location Tracking
─────────────────────────────────────
Ambulance Driver           AmbulanceUser.jsx                  Backend API
      │                          │                                 │
      │  1. Login                │                                 │
      ├─────────────────────────►│                                 │
      │                          ├────────────────────────────────►│
      │                          │  POST /api/auth/ambulance/login │
      │                          │◄────────────────────────────────┤
      │                          │  { ambulance data }             │
      │                          │                                 │
      │  2. Start GPS tracking   │                                 │
      │                          ├────────────────────────────────►│
      │                          │  PATCH /ambulances/:id/location │
      │                          │  (continuous updates)           │
      │                          │                                 │

Phase 2: Incident Detection & Acceptance
─────────────────────────────────────────
      │                          │                                 │
      │  3. View pending incidents│                                │
      │                          ├────────────────────────────────►│
      │                          │  GET /api/accidents/pending     │
      │                          │◄────────────────────────────────┤
      │                          │  { accidents[] }                │
      │                          │                                 │
      │  4. Accept nearest incident                                │
      │                          ├────────────────────────────────►│
      │                          │  PATCH /ambulances/:id/status   │
      │                          │  { status: "busy" }             │
      │                          │                                 │

Phase 3: En Route to Incident
────────────────────────────────
      │                          │                                 │
      │  5. Navigate to scene    │                                 │
      │      (GPS updates)       ├────────────────────────────────►│
      │                          │  PATCH /ambulances/:id/location │
      │                          │                                 │
      │  6. Arrive at scene      │                                 │
      │                          ├────────────────────────────────►│
      │                          │  POST /ambulances/:id/arrive-scene
      │                          │                                 │

Phase 4: Casualty Data Collection
────────────────────────────────────
      │                          │                                 │
      │  7. Enter casualty count │                                 │
      │  8. Enter casualty details│                                │
      │     - Blood type         │                                 │
      │     - Injury type        │                                 │
      │     - Severity           │                                 │
      │     - Required specialty │                                 │
      │                          ├────────────────────────────────►│
      │                          │  POST /api/casualties           │
      │                          │  (for each casualty)            │
      │                          │                                 │
      │                          │  ┌─────────────────────────┐    │
      │                          │  │ hospitalMatcher.js:     │    │
      │                          │  │ 1. Score by blood (40%) │    │
      │                          │  │ 2. Score specialty (30%)│    │
      │                          │  │ 3. Score distance (20%) │    │
      │                          │  │ 4. Score beds (10%)     │    │
      │                          │  └─────────────────────────┘    │
      │                          │◄────────────────────────────────┤
      │                          │  { casualty, hospitalAssignment}│
      │                          │                                 │

Phase 5: Transport to Hospital
────────────────────────────────
      │                          │                                 │
      │  9. Start transport      │                                 │
      │                          ├────────────────────────────────►│
      │                          │  POST /ambulances/:id/start-transport
      │                          │  { hospitalId }                 │
      │                          │                                 │
      │      (Hospital is now    │                                 │
      │       notified of        │                                 │
      │       incoming ambulance)│                                 │
      │                          │                                 │
      │ 10. Navigate to hospital │                                 │
      │      (GPS updates)       ├────────────────────────────────►│
      │                          │  PATCH /ambulances/:id/location │
      │                          │                                 │

Phase 6: Handoff & Completion
────────────────────────────────
      │                          │                                 │
      │ 11. Arrive at hospital   │                                 │
      │                          ├────────────────────────────────►│
      │                          │  POST /ambulances/:id/complete-transport
      │                          │                                 │
      │      Ambulance status    │                                 │
      │      → "available"       │                                 │
      │                          │                                 │
      │ 12. Ready for next call  │                                 │
      ▼                          ▼                                 ▼
```

**Data Flow:**

1. `Login.jsx` → `api.js::ambulanceLogin()` → validates against `ambulances.json`
2. Continuous location updates via `navigator.geolocation.watchPosition()` → `updateAmbulanceLocation()`
3. Fetch incidents via `getPendingAccidents()` → filters accidents by status
4. Accept via `updateAmbulanceStatus()` → sets `status: "busy"`, `currentAccidentId`
5. Arrive at scene → `arriveAtScene()` → updates accident status
6. Add casualties → `addCasualty()` → triggers `hospitalMatcher.js` algorithm
7. `findBestHospital()` → scores hospitals using weighted algorithm:
   - Blood availability: 40%
   - Specialist availability: 30%
   - Distance: 20%
   - Beds available: 10%
8. `startTransport()` → sets `destinationHospitalId`, hospital dashboard shows incoming
9. `completeTransport()` → resets ambulance to available, marks accident complete

---

### 3. Hospital User Journey - Dashboard & Resource Management

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      HOSPITAL USER COMPLETE FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

Login & Dashboard
────────────────────
Hospital Staff              Hospital Pages                     Backend API
      │                          │                                 │
      │  1. Login                │                                 │
      ├─────────────────────────►│ (Login.jsx)                     │
      │                          ├────────────────────────────────►│
      │                          │  POST /api/auth/hospital/login  │
      │                          │◄────────────────────────────────┤
      │                          │  { hospital data }              │
      │                          │                                 │
      │  2. View Dashboard       │ (HospitalDashboard.jsx)         │
      │                          ├────────────────────────────────►│
      │                          │  GET /hospitals/:id/dashboard   │
      │                          │◄────────────────────────────────┤
      │                          │  { stats, incomingAmbulances,   │
      │                          │    casualties, bloodRequests }  │
      │                          │                                 │

Dashboard Data Structure:
┌──────────────────────────────────────────────────────────────────┐
│                        DASHBOARD VIEW                             │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐  │
│  │ Beds       │  │ Blood      │  │ Ambulances │  │ Incoming   │  │
│  │ Available  │  │ Inventory  │  │ Count      │  │ Ambulances │  │
│  │    50      │  │   6 L      │  │    9       │  │    2       │  │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘  │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Incoming Ambulances (transporting to this hospital)        │ │
│  │ ┌─────────────────────────────────────────────────────────┐│ │
│  │ │ AMB-001 | Driver: Ram | Distance: 2.5km | ETA: 4 min   ││ │
│  │ └─────────────────────────────────────────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Assigned Casualties                                        │ │
│  │ ┌───────────────────────────────────────────────────────┐  │ │
│  │ │ CAS-001 | Head Trauma | O+ Blood | Neurologist needed │  │ │
│  │ └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────┘

Inventory Management (HospitalInventory.jsx)
───────────────────────────────────────────────
      │                          │                                 │
      │  3. View blood inventory │                                 │
      │                          ├────────────────────────────────►│
      │                          │  GET /hospitals/:id/blood-inventory
      │                          │                                 │
      │  4. Update blood levels  │                                 │
      │     A+ : 3 → 5 liters    │                                 │
      │     O- : 0 → 2 liters    │                                 │
      │                          ├────────────────────────────────►│
      │                          │  PATCH /hospitals/:id/blood-inventory
      │                          │  { bloodTypes: [...] }          │
      │                          │                                 │

Staff Management (HospitalStaff.jsx)
───────────────────────────────────────
      │                          │                                 │
      │  5. View staff count     │                                 │
      │                          ├────────────────────────────────►│
      │                          │  GET /hospitals/:id/staff       │
      │                          │                                 │
      │  6. Update staff counts  │                                 │
      │     Cardiologist: 2→3    │                                 │
      │     Neurologist: 1→2     │                                 │
      │                          ├────────────────────────────────►│
      │                          │  PATCH /hospitals/:id/staff     │
      │                          │  { staffCount: {...} }          │
      │                          │                                 │

Fleet Management (HospitalFleet.jsx)
───────────────────────────────────────
      │                          │                                 │
      │  7. Update ambulance count                                 │
      │                          ├────────────────────────────────►│
      │                          │  PATCH /hospitals/:id/ambulance-count
      │                          │                                 │
      │  8. View blood requests  │                                 │
      │                          ├────────────────────────────────►│
      │                          │  GET /blood/requests/hospital/:id
      │                          │                                 │
      │  9. Approve/Decline requests                               │
      │                          ├────────────────────────────────►│
      │                          │  POST /blood/requests/:id/approve
      │                          │  POST /blood/requests/:id/decline
      ▼                          ▼                                 ▼
```

**Hospital Pages:**

- `HospitalDashboard.jsx` - Overview stats, incoming ambulances, casualties
- `HospitalInventory.jsx` - Blood inventory management (8 blood types)
- `HospitalStaff.jsx` - Specialist count management (20+ specialties)
- `HospitalFleet.jsx` - Ambulance count, blood request handling

---

## ASCII Data Flow Diagrams

### Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE EMERGENCY FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

     GUEST                  AMBULANCE                HOSPITAL
       │                        │                        │
       │  1. Report Accident    │                        │
       │  ─────────────────────►│                        │
       │                        │                        │
       │         ┌──────────────┴──────────────┐         │
       │         │      ACCIDENT CREATED       │         │
       │         │   + NEAREST AMB FOUND       │         │
       │         │   + AMB DISPATCHED          │         │
       │         └──────────────┬──────────────┘         │
       │                        │                        │
       │  2. Receive ETA        │                        │
       │  ◄─────────────────────│                        │
       │                        │                        │
       │                        │  3. Accept & Navigate  │
       │                        │  ─────────────────────►│
       │                        │                        │
       │                        │  4. Arrive at Scene    │
       │                        │  ─────────────────────►│
       │                        │                        │
       │                        │         ┌──────────────┴──────────────┐
       │                        │         │    CASUALTY DATA ENTERED    │
       │                        │         │    + BEST HOSPITAL MATCHED  │
       │                        │         └──────────────┬──────────────┘
       │                        │                        │
       │                        │  5. Start Transport    │
       │                        │  ─────────────────────►│
       │                        │                        │
       │                        │         ┌──────────────┴──────────────┐
       │                        │         │  HOSPITAL SEES INCOMING    │
       │                        │         │  AMBULANCE ON DASHBOARD    │
       │                        │         └──────────────┬──────────────┘
       │                        │                        │
       │                        │  6. Complete Transport │
       │                        │  ─────────────────────►│
       │                        │                        │
       │         ┌──────────────┴──────────────┐         │
       │         │    AMBULANCE AVAILABLE      │         │
       │         │    ACCIDENT COMPLETED       │         │
       │         │    CASUALTY ADMITTED        │         │
       │         └─────────────────────────────┘         │
       ▼                        ▼                        ▼
```

### Hospital Matching Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOSPITAL MATCHING ALGORITHM                               │
│                    (hospitalMatcher.js)                                      │
└─────────────────────────────────────────────────────────────────────────────┘

                    ┌─────────────────────┐
                    │   CASUALTY INPUT    │
                    │  ┌───────────────┐  │
                    │  │ Blood Type    │  │
                    │  │ Injury Type   │  │
                    │  │ Location      │  │
                    │  └───────────────┘  │
                    └──────────┬──────────┘
                               │
                               ▼
    ┌──────────────────────────────────────────────────────────────────────┐
    │                      FOR EACH HOSPITAL                                │
    ├──────────────────────────────────────────────────────────────────────┤
    │                                                                      │
    │  ┌────────────────┐   ┌────────────────┐   ┌────────────────┐       │
    │  │ BLOOD SCORE    │   │ SPECIALIST     │   │ DISTANCE       │       │
    │  │ (40% weight)   │   │ SCORE (30%)    │   │ SCORE (20%)    │       │
    │  ├────────────────┤   ├────────────────┤   ├────────────────┤       │
    │  │ Has O+ blood?  │   │ Has Neurologist│   │ < 5km = 100    │       │
    │  │ Units >= need? │   │ for head trauma│   │ < 10km = 80    │       │
    │  │ Score: 0-100   │   │ Score: 0-100   │   │ < 20km = 60    │       │
    │  └────────────────┘   └────────────────┘   └────────────────┘       │
    │                                                                      │
    │  ┌────────────────┐                                                  │
    │  │ BEDS SCORE     │                                                  │
    │  │ (10% weight)   │                                                  │
    │  ├────────────────┤                                                  │
    │  │ Available > 0? │                                                  │
    │  │ Score: 0-100   │                                                  │
    │  └────────────────┘                                                  │
    │                                                                      │
    │  TOTAL = (Blood × 0.4) + (Specialist × 0.3) + (Distance × 0.2)      │
    │          + (Beds × 0.1)                                              │
    │                                                                      │
    └──────────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  SORT BY TOTAL      │
                    │  RETURN TOP MATCH   │
                    └─────────────────────┘
```

### Blood Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BLOOD REQUEST FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    HOSPITAL A                                          HOSPITAL B
    (Requesting)                                        (Donor)
         │                                                   │
         │  1. Create Blood Request                          │
         │     POST /api/blood/request                       │
         │     { bloodType: "O+", unitsNeeded: 5 }          │
         │                                                   │
         │         ┌────────────────────────────────┐        │
         │         │ System finds nearby hospitals  │        │
         │         │ with O+ blood available        │        │
         │         │ Sorted by distance & quantity  │        │
         │         └────────────────────────────────┘        │
         │                                                   │
         │  2. Request appears in                            │
         │     Hospital B's fleet page                       │
         │     ─────────────────────────────────────────────►│
         │                                                   │
         │                                  3. Approve/Decline│
         │                                     POST /blood/   │
         │                                     requests/:id/  │
         │                                     approve        │
         │                                                   │
         │  4. Blood inventory updated                       │
         │     Hospital A: O+ +5                             │
         │     Hospital B: O+ -5                             │
         ▼                                                   ▼
```

---

## Frontend-Backend Communication

### API Service Layer (`src/services/api.js`)

The `api.js` file provides a clean abstraction layer between React components and the backend:

```javascript
// Standard API Response Format
{
  success: boolean,           // Operation success status
  data: object | array,       // Response payload
  error?: string,             // Error message if failed
  message?: string            // Human-readable message
}

// All requests go through apiRequest() helper:
const apiRequest = async (endpoint, options) => {
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  return response.json();
};
```

### Data Access Layer (`backend/src/utils/dataAccess.js`)

All JSON file operations are centralized:

```javascript
// Read operations
getHospitals(); // → hospitals.json
getAmbulances(); // → ambulances.json
getAccidents(); // → active_accidents.json
getCasualties(); // → casualties.json
getBloodRequests(); // → blood_requests.json

// Write operations
updateHospital(id, updates); // → hospitals.json
updateAmbulance(id, updates); // → ambulances.json
addAccident(data); // → active_accidents.json
addCasualty(data); // → casualties.json
addBloodRequest(data); // → blood_requests.json
```

---

## Status Transition Diagrams

### Accident Status Flow

```
                     ┌─────────┐
                     │ pending │
                     └────┬────┘
                          │ ambulance assigned
                          ▼
              ┌──────────────────────┐
              │ ambulance_dispatched │
              └──────────┬───────────┘
                         │ ambulance accepts
                         ▼
              ┌──────────────────────┐
              │ ambulance_en_route   │
              └──────────┬───────────┘
                         │ ambulance arrives
                         ▼
              ┌──────────────────────┐
              │ ambulance_arrived    │
              └──────────┬───────────┘
                         │ starts transport
                         ▼
                  ┌───────────┐
                  │ in_transit│
                  └─────┬─────┘
                        │ arrives at hospital
                        ▼
                  ┌───────────┐
                  │ completed │
                  └───────────┘
```

### Ambulance Status Flow

```
              ┌───────────┐
              │ available │◄─────────────────────────────┐
              └─────┬─────┘                              │
                    │ dispatched to incident             │
                    ▼                                    │
              ┌────────────┐                             │
              │ dispatched │                             │
              └─────┬──────┘                             │
                    │ driver accepts                     │
                    ▼                                    │
              ┌──────────┐                               │
              │ en_route │                               │
              └─────┬────┘                               │
                    │ arrives at scene                   │
                    ▼                                    │
              ┌──────────┐                               │
              │ at_scene │                               │
              └─────┬────┘                               │
                    │ starts transport                   │
                    ▼                                    │
            ┌─────────────┐                              │
            │ transporting│                              │
            └──────┬──────┘                              │
                   │ arrives at hospital                 │
                   ▼                                     │
            ┌─────────────┐                              │
            │ at_hospital │──────────────────────────────┘
            └─────────────┘   completes transport
```

---

## Technology Stack Summary

| Layer        | Technology        | Files                                                      |
| ------------ | ----------------- | ---------------------------------------------------------- |
| Frontend     | React + Vite      | `src/pages/*.jsx`, `src/services/api.js`                   |
| Backend      | Express.js        | `backend/src/server.js`, `backend/src/controllers/*.js`    |
| Data Storage | JSON Files        | `backend/data/*.json`                                      |
| Routing      | Express Router    | `backend/src/routes/*.js`                                  |
| Data Access  | Custom Utils      | `backend/src/utils/dataAccess.js`                          |
| Algorithms   | Custom Utils      | `backend/src/utils/hospitalMatcher.js`, `distanceUtils.js` |
| Mapping      | Leaflet (Map.jsx) | `src/components/Map.jsx`                                   |

---

_Document generated on: January 28, 2026_
_System Version: Emergency Healthcare Response System v1.0_
