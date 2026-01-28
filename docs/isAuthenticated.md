# isAuthenticated.jsx Documentation

## Overview

`isAuthenticated.jsx` is a React component that provides route protection for authenticated users. It wraps protected routes and handles role-based access control.

## File Location

```
src/Hooks/isAuthenticated.jsx
```

## Dependencies

```javascript
import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "./adminAuth";
```

## Props

| Prop           | Type      | Default | Description                   |
| -------------- | --------- | ------- | ----------------------------- |
| `children`     | ReactNode | -       | Protected component to render |
| `allowedRoles` | array     | `[]`    | Array of allowed user roles   |

## Authentication Logic

### Step 1: Check Login Status

```javascript
const isAuth = isAdminLoggedIn();
```

Uses `adminAuth.jsx` helper to check localStorage.

### Step 2: Redirect if Not Logged In

```javascript
if (!isAuth) {
  return <Navigate to="/" replace />;
}
```

### Step 3: Role-Based Access Control

```javascript
if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
  // Redirect to appropriate dashboard
  if (userType === "hospital") {
    return <Navigate to="/hospital" replace />;
  } else if (userType === "ambulance") {
    return <Navigate to="/ambulance" replace />;
  }
  return <Navigate to="/" replace />;
}
```

### Step 4: Render Protected Content

```javascript
return children;
```

## Usage Example

```jsx
<IsAuthenticated allowedRoles={["ambulance"]}>
  <AmbulanceUser />
</IsAuthenticated>
```

## Role Types

| Role          | Access Pages         |
| ------------- | -------------------- |
| `"hospital"`  | `/hospital/*` routes |
| `"ambulance"` | `/ambulance` route   |

## LocalStorage Keys Used

- `adminAuth` - Authentication status ("true" or null)
- `userType` - User role ("hospital" or "ambulance")

## Security Notes

- Client-side protection only
- Backend validation still required
- LocalStorage can be manipulated by users

## Related Files

- [adminAuth.jsx](./adminAuth.md) - Authentication helper
- [App.jsx](./App.md) - Route definitions
- [Login.jsx](./Login.md) - Sets authentication state
