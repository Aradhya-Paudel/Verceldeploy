# HospitalInventory.jsx Documentation

## Overview

`HospitalInventory.jsx` provides blood inventory management for hospital administrators. It allows viewing and updating blood stock levels for all blood types.

## File Location

```
src/pages/hospitals/HospitalInventory.jsx
```

## Dependencies

```javascript
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
```

## State Variables

| State           | Type    | Default | Description               |
| --------------- | ------- | ------- | ------------------------- |
| `hospital`      | object  | `null`  | Current hospital data     |
| `inventoryData` | object  | `{}`    | Blood type quantities map |
| `loading`       | boolean | `true`  | Loading state             |
| `error`         | string  | `null`  | Error message             |

## Data Loading

### Initialize Inventory Data

```javascript
const inventoryMap = {};
selectedHospital.bloodInventory.bloodTypes.forEach((blood) => {
  inventoryMap[blood.type] = blood.liters;
});
setInventoryData(inventoryMap);
```

## Key Functions

### handleQuantityChange(bloodType, value)

Updates blood type quantity from input field.

```javascript
setInventoryData({
  ...inventoryData,
  [bloodType]: parseInt(value, 10) || 0,
});
```

### handleIncrement(bloodType)

Increases blood type quantity by 1.

### handleDecrement(bloodType)

Decreases blood type quantity by 1 (minimum 0).

### handleUpdateInventory()

Posts updated inventory to backend API:

```javascript
await fetch(`${API_ENDPOINT}/hospital/${hospital.id}/inventory`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ bloodInventory: inventoryData }),
});
```

## UI Components

### Sidebar Navigation

Same as HospitalDashboard with "Inventory" highlighted.

### Blood Stock Table

| Column           | Description                               |
| ---------------- | ----------------------------------------- |
| Blood Type       | A+, A-, B+, B-, O+, O-, AB+, AB-          |
| Current (Liters) | Display current quantity                  |
| Adjust           | Increment/Decrement buttons + input field |

### Table Row Example

```jsx
<tr>
  <td>A+</td>
  <td>{inventoryData["A+"]}</td>
  <td>
    <button onClick={() => handleDecrement("A+")}>-</button>
    <input value={inventoryData["A+"]} onChange={...} />
    <button onClick={() => handleIncrement("A+")}>+</button>
  </td>
</tr>
```

### Update Button

```jsx
<button onClick={handleUpdateInventory}>Update Inventory</button>
```

## Blood Types Managed

- A+ (A Positive)
- A- (A Negative)
- B+ (B Positive)
- B- (B Negative)
- O+ (O Positive)
- O- (O Negative)
- AB+ (AB Positive)
- AB- (AB Negative)

## Data Structure

### Input Format (from JSON)

```javascript
{
  bloodInventory: {
    total: 1728,
    bloodTypes: [
      { type: "A+", liters: 450 },
      { type: "A-", liters: 45 },
      // ...
    ]
  }
}
```

### Working Format (state)

```javascript
{
  "A+": 450,
  "A-": 45,
  "B+": 320,
  // ...
}
```

## API Integration

```javascript
const API_ENDPOINT = ""; // Placeholder for backend
```

When API is configured:

- POST to `/hospital/{id}/inventory`
- Body: `{ bloodInventory: inventoryData }`

## Related Files

- [HospitalDashboard.jsx](./HospitalDashboard.md) - Main dashboard
- [HospitalStaff.jsx](./HospitalStaff.md) - Staff management
- [HospitalFleet.jsx](./HospitalFleet.md) - Fleet management
- `/public/hospitals.json` - Data source
