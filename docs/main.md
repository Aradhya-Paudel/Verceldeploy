# main.jsx Documentation

## Overview

`main.jsx` is the application entry point that bootstraps the React application and mounts it to the DOM.

## File Location

```
src/main.jsx
```

## Dependencies

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
```

## Purpose

This file:

1. Imports global CSS styles (`index.css`)
2. Creates a React root element attached to the `#root` DOM element
3. Renders the `App` component wrapped in React's `StrictMode`

## Code Structure

```jsx
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

## StrictMode

React's StrictMode is enabled to:

- Identify unsafe lifecycles
- Warn about legacy string ref API usage
- Warn about deprecated findDOMNode usage
- Detect unexpected side effects
- Detect legacy context API

## HTML Integration

This file connects to `index.html` which contains:

```html
<div id="root"></div>
```

## Related Files

- [App.jsx](./App.md) - Main application component
- `index.css` - Global styles including Tailwind CSS
- `index.html` - HTML template
