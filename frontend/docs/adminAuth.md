# adminAuth.jsx Documentation

## Overview

`adminAuth.jsx` is a simple utility module that provides a helper function to check if a user is logged in.

## File Location

```
src/Hooks/adminAuth.jsx
```

## Exports

### isAdminLoggedIn()

```javascript
export const isAdminLoggedIn = () => {
  return localStorage.getItem("adminAuth") === "true";
};
```

## Function Details

### Purpose

Checks if the user has a valid authentication session by reading from localStorage.

### Return Value

| Value   | Meaning                   |
| ------- | ------------------------- |
| `true`  | User is authenticated     |
| `false` | User is not authenticated |

### LocalStorage Key

- **Key**: `adminAuth`
- **Valid Value**: `"true"` (string)

## Usage Example

```javascript
import { isAdminLoggedIn } from "./adminAuth";

if (isAdminLoggedIn()) {
  // User is logged in
} else {
  // Redirect to login
}
```

## Setting Authentication

Authentication is set during login in `Login.jsx`:

```javascript
localStorage.setItem("adminAuth", "true");
```

## Clearing Authentication

Authentication is cleared during logout:

```javascript
localStorage.removeItem("adminAuth");
```

## Security Considerations

- **Client-side only**: This is a frontend-only check
- **Easily bypassed**: Users can manually set localStorage
- **No token validation**: No server-side verification
- **For demo purposes**: Production apps should use proper JWT/session auth

## Related Files

- [isAuthenticated.jsx](./isAuthenticated.md) - Uses this function
- [Login.jsx](./Login.md) - Sets authentication state
- All dashboard components - Clear authentication on logout
