# Emergency Response System - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Response Format

All API responses follow this structure:

```json
{
  "success": true/false,
  "message": "Description of result",
  "data": { ... } // or "error": "Error type"
}
```

---

## 🔐 Authentication APIs

### Ambulance Login

```
POST /api/auth/ambulance/login
```

**Request Body:**

```json
{
  "name": "MH-02-AB-0001",
  "password": "ambulance@123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Ambulance login successful",
  "data": {
    "ambulance": {
      "id": "AMB-001",
      "name": "MH-02-AB-0001",
      "latitude": 28.2109,
      "longitude": 83.9774,
      "status": "available",
      "hospitalId": 1,
      "driverName": "Ram Bahadur Thapa",
      "phone": "+977-98-56012345"
    }
  }
}
```

### Hospital Login

```
POST /api/auth/hospital/login
```

**Request Body:**

```json
{
  "name": "Western Regional Hospital",
  "password": "hospital123"
}
```

---

## 🚑 Ambulance APIs

### Get All Ambulances

```
GET /api/ambulances
```

### Get Available Ambulances

```
GET /api/ambulances/available
```

### Get Ambulance by ID

```
GET /api/ambulances/:id
```

### Find Nearest Ambulance

```
POST /api/ambulances/find-nearest
```

**Request Body:**

```json
{
  "latitude": 28.215,
  "longitude": 83.98
}
```

### Update Ambulance Location

```
PATCH /api/ambulances/:id/location
```

**Request Body:**

```json
{
  "latitude": 28.215,
  "longitude": 83.98
}
```

### Update Ambulance Status

```
PATCH /api/ambulances/:id/status
```

**Request Body:**

```json
{
  "status": "available" // available, dispatched, en_route, at_scene, transporting, at_hospital, offline
}
```

### Accept Accident Assignment

```
POST /api/ambulances/:id/accept-assignment
```

**Request Body:**

```json
{
  "accidentId": "ACC-1234567890"
}
```

### Arrive at Scene

```
POST /api/ambulances/:id/arrive-scene
```

### Start Transport to Hospital

```
POST /api/ambulances/:id/start-transport
```

**Request Body:**

```json
{
  "hospitalId": 1
}
```

### Complete Transport

```
POST /api/ambulances/:id/complete-transport
```

---

## 🚨 Accident APIs

### Report Accident (Guest User)

```
POST /api/accidents/report
```

**Request Body:**

```json
{
  "title": "Road Accident - Car Collision",
  "description": "Two vehicles involved",
  "latitude": 28.220903,
  "longitude": 83.977384,
  "location": "Lakeside, Pokhara",
  "image": "base64_encoded_image_string",
  "reporterPhone": "+977-98-12345678"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Accident reported and ambulance dispatched",
  "data": {
    "accident": {
      "id": "ACC-1706428800000",
      "title": "Road Accident - Car Collision",
      "location": "Lakeside, Pokhara",
      "latitude": 28.220903,
      "longitude": 83.977384,
      "status": "ambulance_dispatched",
      "createdAt": "2026-01-28T10:00:00.000Z"
    },
    "dispatch": {
      "ambulanceId": "AMB-001",
      "ambulanceName": "MH-02-AB-0001",
      "driverName": "Ram Bahadur Thapa",
      "driverPhone": "+977-98-56012345",
      "distance": 1.25,
      "eta": 2
    }
  }
}
```

### Get All Accidents

```
GET /api/accidents
```

### Get Pending Accidents

```
GET /api/accidents/pending
```

### Get Accident by ID

```
GET /api/accidents/:id
```

### Update Accident Status

```
PATCH /api/accidents/:id/status
```

**Request Body:**

```json
{
  "status": "ambulance_arrived" // pending, ambulance_dispatched, ambulance_arrived, in_transit, completed, cancelled
}
```

---

## 👤 Casualty APIs

### Add Casualty to Accident

```
POST /api/casualties
```

**Request Body:**

```json
{
  "accidentId": "ACC-1706428800000",
  "name": "John Doe",
  "age": 35,
  "gender": "Male",
  "injuryType": "Head Injury",
  "severity": "severe",
  "bloodType": "O+",
  "bloodUnitsNeeded": 2,
  "notes": "Unconscious, requires immediate attention"
}
```

**Response includes hospital assignment with weighted scores:**

```json
{
  "success": true,
  "message": "Casualty added and hospital assigned",
  "data": {
    "casualty": {
      "id": "CAS-1706428800000",
      "name": "John Doe",
      "injuryType": "Head Injury",
      "severity": "severe",
      "status": "hospital_assigned"
    },
    "hospitalAssignment": {
      "hospital": {
        "id": 2,
        "name": "Manipal Teaching Hospital",
        "address": "Phulbari, Pokhara-11",
        "phone": "+977-61-526416"
      },
      "scores": {
        "blood": 100,
        "specialist": 80,
        "distance": 75,
        "beds": 100,
        "total": 90.5
      },
      "distance": 2.5,
      "eta": 4,
      "requiredSpecialist": "Neurologist"
    }
  }
}
```

### Get Hospital Recommendations

```
POST /api/casualties/recommend-hospitals
```

**Request Body:**

```json
{
  "injuryType": "Cardiac",
  "bloodType": "A+",
  "bloodUnitsNeeded": 3,
  "latitude": 28.215,
  "longitude": 83.98
}
```

### Get Casualties for Accident

```
GET /api/casualties/accident/:accidentId
```

### Update Casualty Status

```
PATCH /api/casualties/:id/status
```

---

## 🏥 Hospital APIs

### Get All Hospitals

```
GET /api/hospitals
```

### Get Hospital by ID

```
GET /api/hospitals/:id
```

### Get Hospital Dashboard

```
GET /api/hospitals/:id/dashboard
```

**Response includes:**

- Hospital details
- Statistics (beds, blood units, ambulances, etc.)
- Incoming ambulances with ETA
- Assigned casualties
- Blood requests (outgoing/incoming)
- Staff summary

### Get Hospital Fleet

```
GET /api/hospitals/:id/fleet
```

### Get Blood Inventory

```
GET /api/hospitals/:id/blood-inventory
```

### Get Staff

```
GET /api/hospitals/:id/staff
```

### Update Beds

```
PATCH /api/hospitals/:id/beds
```

**Request Body:**

```json
{
  "bedsAvailable": 45
}
```

### Update Blood Inventory

```
PATCH /api/hospitals/:id/blood-inventory
```

**Request Body:**

```json
{
  "bloodType": "O+",
  "units": 50,
  "operation": "add" // add, subtract, or omit for absolute set
}
```

### Update Staff Count

```
PATCH /api/hospitals/:id/staff
```

**Request Body:**

```json
{
  "specialty": "Cardiologist",
  "count": 4
}
```

---

## 🩸 Blood Transfer APIs

### Create Blood Request

```
POST /api/blood/request
```

**Request Body:**

```json
{
  "requestingHospitalId": 1,
  "bloodType": "O-",
  "unitsNeeded": 5,
  "urgency": "critical",
  "notes": "Emergency surgery required"
}
```

**Response includes list of available donor hospitals sorted by ability to fulfill and distance**

### Get All Blood Requests

```
GET /api/blood/requests
```

### Get Blood Request by ID

```
GET /api/blood/requests/:id
```

### Get Pending Requests for Hospital

```
GET /api/blood/requests/pending/:hospitalId
```

Returns both outgoing requests (this hospital needs blood) and incoming requests (this hospital can donate)

### Accept Blood Request

```
POST /api/blood/requests/:id/accept
```

**Request Body:**

```json
{
  "donorHospitalId": 2
}
```

### Complete Blood Transfer

```
POST /api/blood/requests/:id/complete
```

### Reject Blood Request

```
POST /api/blood/requests/:id/reject
```

**Request Body:**

```json
{
  "reason": "Insufficient stock"
}
```

---

## 🔧 Frontend Integration Examples

### React Fetch Example

```javascript
const API_BASE = "http://localhost:5000/api";

// Report accident
const reportAccident = async (accidentData) => {
  const response = await fetch(`${API_BASE}/accidents/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(accidentData),
  });
  return response.json();
};

// Login ambulance
const loginAmbulance = async (name, password) => {
  const response = await fetch(`${API_BASE}/auth/ambulance/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, password }),
  });
  return response.json();
};

// Get hospital dashboard
const getHospitalDashboard = async (hospitalId) => {
  const response = await fetch(`${API_BASE}/hospitals/${hospitalId}/dashboard`);
  return response.json();
};
```

### Using with Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Report accident
export const reportAccident = (data) => api.post("/accidents/report", data);

// Get hospitals
export const getHospitals = () => api.get("/hospitals");

// Create blood request
export const createBloodRequest = (data) => api.post("/blood/request", data);
```

---

## 📊 Hospital Matching Algorithm

The system uses weighted scoring to match casualties to hospitals:

| Factor                  | Weight |
| ----------------------- | ------ |
| Blood Availability      | 40%    |
| Specialist Availability | 30%    |
| Distance                | 20%    |
| Bed Availability        | 10%    |

### Injury Type to Specialist Mapping

- Head Injury → Neurologist
- Cardiac/Heart Attack → Cardiologist
- Fracture/Bone Injury → Orthopedic Surgeon
- Burns/Trauma → General Surgeon
- Respiratory/Breathing → Pulmonologist
- Pregnancy/Maternity → Gynecologist
- Default → Emergency Medicine Specialist

---

## 🌍 Distance Calculation

Uses Haversine formula for accurate distance calculation between GPS coordinates.

ETA is calculated assuming average ambulance speed of 40 km/h in city conditions.

---

## Test Credentials

### Ambulances

| Name          | Password      |
| ------------- | ------------- |
| MH-02-AB-0001 | ambulance@123 |
| MH-02-AB-0002 | ambu2024pass  |
| MH-02-AB-0003 | emerg@ncy99   |

### Hospitals

| Name                      | Password    |
| ------------------------- | ----------- |
| Western Regional Hospital | hospital123 |
| Manipal Teaching Hospital | manipal456  |
| Gandaki Medical College   | gandaki789  |
| Fishtail Hospital         | fishtail321 |
| Metro City Hospital       | metro555    |
