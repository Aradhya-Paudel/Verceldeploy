# Login.jsx Documentation

## Overview

`Login.jsx` is the authentication page for the Emergency Healthcare System. It handles login for both hospital administrators and ambulance users.

## File Location

```
src/pages/Login.jsx
```

## Dependencies

```javascript
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
```

## State Variables

| State             | Type    | Default | Description                         |
| ----------------- | ------- | ------- | ----------------------------------- |
| `user`            | string  | `""`    | Username input value                |
| `password`        | string  | `""`    | Password input value                |
| `passwordVisible` | boolean | `false` | Toggle password visibility          |
| `loading`         | boolean | `false` | Loading state during authentication |
| `error`           | string  | `""`    | Error message display               |

## Authentication Flow

### 1. Auto-Redirect (useEffect)

If user is already logged in, redirects to appropriate dashboard:

```javascript
if (isAuth === "true" && userType) {
  if (userType === "hospital") navigate("/hospital");
  else if (userType === "ambulance") navigate("/ambulance");
}
```

### 2. Login Process (handleSubmit)

1. Validates input fields
2. Fetches `hospitals.json` and `ambulances.json`
3. Matches credentials against hospital list first
4. Then checks ambulance list
5. Sets `localStorage` values on success:
   - `adminAuth`: "true"
   - `userType`: "hospital" or "ambulance"
   - `userName`: User's display name

### 3. Credential Sources

- **Hospitals**: `/public/hospitals.json` - matches `name` and `password`
- **Ambulances**: `/public/ambulances.json` - matches `name` and `password`

## UI Features

### Form Elements

- Username input with person icon
- Password input with visibility toggle
- Submit button with loading spinner
- Error message display

### Styling

- Tailwind CSS for responsive design
- Primary color theme
- Shadow and border effects
- Smooth transitions and hover states

## Security Considerations

- Passwords are stored in plain text in JSON (demo only)
- No actual API authentication implemented
- LocalStorage used for session persistence

## Navigation

- Successful hospital login → `/hospital`
- Successful ambulance login → `/ambulance`

## Related Files

- [App.jsx](./App.md) - Route configuration
- [isAuthenticated.jsx](./isAuthenticated.md) - Route protection
- `/public/hospitals.json` - Hospital credentials
- `/public/ambulances.json` - Ambulance credentials
