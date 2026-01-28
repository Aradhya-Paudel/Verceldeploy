# App.jsx Documentation

## Overview

`App.jsx` is the root component of the Emergency Healthcare System frontend application. It serves as the main entry point that defines all application routes using React Router.

## File Location

```
src/App.jsx
```

## Dependencies

```javascript
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import AmbulanceUser from "./pages/AmbulanceUser";
import IsAuthenticated from "./Hooks/isAuthenticated";
import HospitalDashboard from "./pages/hospitals/HospitalDashboard";
import HospitalInventory from "./pages/hospitals/HospitalInventory";
import GuestUser from "./pages/GuestUser";
import HospitalStaff from "./pages/hospitals/HospitalStaff";
import HospitalFleet from "./pages/hospitals/HospitalFleet";
```

## Route Configuration

### Public Routes

| Path     | Component       | Description                                     |
| -------- | --------------- | ----------------------------------------------- |
| `/`      | `<Login />`     | Login page for hospitals and ambulance users    |
| `/guest` | `<GuestUser />` | Guest user photo capture and incident reporting |

### Protected Routes (Ambulance)

| Path         | Component           | Allowed Roles   | Description                                          |
| ------------ | ------------------- | --------------- | ---------------------------------------------------- |
| `/ambulance` | `<AmbulanceUser />` | `["ambulance"]` | Ambulance dashboard with map and incident management |

### Protected Routes (Hospital)

| Path                  | Component               | Allowed Roles  | Description                 |
| --------------------- | ----------------------- | -------------- | --------------------------- |
| `/hospital`           | `<HospitalDashboard />` | `["hospital"]` | Main hospital dashboard     |
| `/hospital/inventory` | `<HospitalInventory />` | `["hospital"]` | Blood inventory management  |
| `/hospital/staff`     | `<HospitalStaff />`     | `["hospital"]` | Staff/specialist management |
| `/hospital/fleet`     | `<HospitalFleet />`     | `["hospital"]` | Ambulance fleet management  |

## Authentication Flow

All protected routes are wrapped with the `IsAuthenticated` component which:

1. Checks if user is logged in via `localStorage`
2. Validates user role against `allowedRoles` prop
3. Redirects unauthorized users to appropriate pages

## Component Structure

```jsx
function App() {
  return <RouterProvider router={router} />;
}
```

## Usage

This component is rendered by `main.jsx` and provides routing for the entire application.

## Related Files

- [main.jsx](./main.md) - Application entry point
- [Login.jsx](./Login.md) - Authentication page
- [isAuthenticated.jsx](./isAuthenticated.md) - Route protection hook
