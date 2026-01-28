# GuestUser.jsx Documentation

## Overview

`GuestUser.jsx` is a mobile-first photo capture interface for public incident reporting. It allows anyone to capture photos of emergencies and submit them with GPS location data.

## File Location

```
src/pages/GuestUser.jsx
```

## Dependencies

```javascript
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
```

## State Variables

| State           | Type        | Default | Description                   |
| --------------- | ----------- | ------- | ----------------------------- |
| `stream`        | MediaStream | `null`  | Active camera stream          |
| `capturedImage` | string      | `null`  | Base64 encoded captured image |
| `location`      | object      | `null`  | GPS coordinates object        |
| `loading`       | boolean     | `false` | Submission loading state      |
| `error`         | string      | `null`  | General error message         |
| `submitted`     | boolean     | `false` | Submission success state      |
| `locationError` | string      | `null`  | GPS-specific error message    |

## Refs

```javascript
const videoRef = useRef(null); // Video element for camera preview
const canvasRef = useRef(null); // Canvas for photo capture
```

## Key Functions

### Camera Management

```javascript
startCameraStream();
```

- Checks for secure context (HTTPS required)
- Requests camera permission via `navigator.mediaDevices.getUserMedia`
- Prefers back camera (`facingMode: "environment"`)
- Handles various error types:
  - `NotAllowedError` - Permission denied
  - `NotFoundError` - No camera
  - `NotReadableError` - Camera in use
  - `OverconstrainedError` - Constraints not satisfiable

### Location

```javascript
requestLocation();
```

- Returns Promise with GPS coordinates
- Uses `navigator.geolocation.getCurrentPosition`
- Captures:
  - `latitude`, `longitude`
  - `accuracy` (meters)
  - `timestamp`

### Photo Capture

```javascript
capturePhoto();
```

- Draws current video frame to canvas
- Converts to base64 JPEG
- Stores in `capturedImage` state

### Submission

```javascript
submitCapture();
```

- Validates image and location
- Creates submission object:

```javascript
{
  id: `SUB-${Date.now()}`,
  image: capturedImage,
  location: location,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent
}
```

- Posts to API (when configured)
- Shows success message
- Auto-resets after 3 seconds

### Reset

```javascript
resetCapture();
```

- Clears captured image
- Clears location
- Restarts camera stream

## UI Components

### Header

- Photo Capture branding
- "Mobile Evidence Collection" subtitle
- User avatar

### Camera Preview

- Full aspect-ratio video element
- Overlay border for framing
- Displays captured image when taken

### Capture Button

- Large gradient button
- Camera icon with "Capture Photo" text
- Hidden after capture

### Location Panel

- Shows current GPS coordinates
- Latitude/longitude display
- Accuracy indicator
- "Get Location" button if not captured

### Action Buttons (Post-Capture)

- **Submit Capture** - Sends data to backend
- **Retake Photo** - Resets capture

### Status Messages

- Error alerts (red)
- Location errors (yellow)
- Success confirmation (green, animated)

## Security Requirements

- **HTTPS Required**: Camera access only works on:
  - `https://` URLs
  - `localhost`
- Location permission required separately

## Mobile Optimization

- Responsive layout (`max-w-lg mx-auto`)
- Touch-friendly buttons
- Auto-fullscreen camera preview
- Optimized for portrait mode

## Data Flow

### Submission Object

```javascript
{
  id: "SUB-1704067200000",
  image: "data:image/jpeg;base64,/9j/4AAQ...",
  location: {
    latitude: 28.220903,
    longitude: 83.977384,
    accuracy: 15.5,
    timestamp: "2026-01-27T10:30:00Z"
  },
  timestamp: "2026-01-27T10:30:00Z",
  userAgent: "Mozilla/5.0 (iPhone; ...)"
}
```

## Related Files

- [App.jsx](./App.md) - Route configuration
- `/public/submissions.json` - Where submissions would be stored
