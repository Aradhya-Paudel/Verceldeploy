# HospitalStaff.jsx Documentation

## Overview

`HospitalStaff.jsx` provides medical staff/specialist management for hospital administrators. It allows viewing and updating the count of each specialist type.

## File Location

```
src/pages/hospitals/HospitalStaff.jsx
```

## Dependencies

```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
```

## State Variables

| State       | Type    | Default | Description               |
| ----------- | ------- | ------- | ------------------------- |
| `hospital`  | object  | `null`  | Current hospital data     |
| `staffData` | object  | `{}`    | Staff counts by specialty |
| `loading`   | boolean | `true`  | Loading state             |
| `error`     | string  | `null`  | Error message             |

## Specialist Categories

### staffIcons Mapping

```javascript
const staffIcons = {
  Cardiologist: "cardiology",
  Neurologist: "neurology",
  "Orthopedic Surgeon": "orthopedics",
  "General Surgeon": "surgical",
  Anesthesiologist: "masks",
  Radiologist: "radiology",
  Oncologist: "oncology",
  Pediatrician: "pediatrics",
  Psychiatrist: "psychiatry",
  Dermatologist: "dermatology",
  Gastroenterologist: "gastroenterology",
  Nephrologist: "nephrology",
  Pulmonologist: "pulmonology",
  Endocrinologist: "endocrinology",
  Rheumatologist: "rheumatology",
  Urologist: "urology",
  Ophthalmologist: "ophthalmology",
  "ENT Specialist": "hearing",
  Gynecologist: "gynecology",
  "Emergency Medicine Specialist": "emergency",
};
```

## Key Functions

### handleIncrement(category)

Increases staff count for a specialty by 1.

```javascript
setStaffData((prev) => ({
  ...prev,
  [category]: (prev[category] || 0) + 1,
}));
```

### handleDecrement(category)

Decreases staff count by 1 (minimum 0).

### handleInputChange(category, value)

Direct input for staff count.

### handleUpdateStaff()

Posts updated staff data to backend:

```javascript
await fetch(`${API_ENDPOINT}/hospital/${hospital.id}/staff`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ staffCount: staffData }),
});
```

## UI Components

### Sidebar Navigation

Same as HospitalDashboard with "Staffing" highlighted.

### Specialist Grid

Cards for each specialty displaying:

- Specialty icon (Material Symbols)
- Specialty name
- Current count badge
- Increment/Decrement buttons
- Direct input field

### Card Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {Object.keys(staffData).map((category) => (
    <div className="specialist-card">
      <span className="material-symbols-outlined">{staffIcons[category]}</span>
      <h4>{category}</h4>
      <span className="count-badge">{staffData[category]}</span>
      <div className="controls">
        <button onClick={() => handleDecrement(category)}>-</button>
        <input value={staffData[category]} onChange={...} />
        <button onClick={() => handleIncrement(category)}>+</button>
      </div>
    </div>
  ))}
</div>
```

### Update Button

```jsx
<button onClick={handleUpdateStaff}>Update Staffing Records</button>
```

## Data Structure

### Input Format (from JSON)

```javascript
{
  staffCount: {
    "Cardiologist": 3,
    "Neurologist": 2,
    "Orthopedic Surgeon": 2,
    "General Surgeon": 3,
    // ... 16 more specialties
  }
}
```

### Working Format (state)

Same object structure, directly editable.

## Supported Specialties (20 total)

1. Cardiologist
2. Neurologist
3. Orthopedic Surgeon
4. General Surgeon
5. Anesthesiologist
6. Radiologist
7. Oncologist
8. Pediatrician
9. Psychiatrist
10. Dermatologist
11. Gastroenterologist
12. Nephrologist
13. Pulmonologist
14. Endocrinologist
15. Rheumatologist
16. Urologist
17. Ophthalmologist
18. ENT Specialist
19. Gynecologist
20. Emergency Medicine Specialist

## API Integration

```javascript
const API_ENDPOINT = ""; // Placeholder for backend
```

When API is configured:

- POST to `/hospital/{id}/staff`
- Body: `{ staffCount: staffData }`

## Related Files

- [HospitalDashboard.jsx](./HospitalDashboard.md) - Main dashboard
- [HospitalInventory.jsx](./HospitalInventory.md) - Blood inventory
- [HospitalFleet.jsx](./HospitalFleet.md) - Fleet management
- `/public/hospitals.json` - Data source
