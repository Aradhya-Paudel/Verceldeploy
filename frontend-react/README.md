# Hospital Resource System - React Frontend

This is an advanced React-based frontend for the Hospital Resource System that provides a complete dashboard with real map views and all system functionalities.

## Features

- **Interactive Dashboard**: Overview of system status and hospital locations
- **Real-time Maps**: Interactive Leaflet maps showing hospital locations
- **Hospital Management**: View and search hospital details
- **Hospital Matching**: Find the best hospital based on location and medical needs
- **Geocoding Tools**: Convert addresses to coordinates and vice versa
- **System Health**: Monitor backend status and connectivity

## Setup Instructions

1. Make sure your backend server is running on `http://localhost:3000`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Visit `http://localhost:3000` in your browser

## Requirements

- Backend server running on `http://localhost:3000`
- Node.js and npm installed
- LocationIQ API key configured in backend (for geocoding features)

## Functionality

### Dashboard
- Shows total hospitals and system status
- Interactive map displaying all hospital locations
- Quick overview of system health

### Hospitals
- Browse all registered hospitals
- Get detailed status for specific hospitals by ID
- View hospital details including location, beds, and contact info

### Match Hospital
- Find the best hospital based on location and medical needs
- Support for both coordinate and address input
- Optional filters for injury type and blood type
- Visual map showing matched hospitals

### Geocoding Tools
- Convert addresses to coordinates (geocoding)
- Convert coordinates to addresses (reverse geocoding)
- Visual feedback for geocoding operations

### Health Check
- System status monitoring
- Backend connectivity verification

## Technologies Used

- React.js for frontend framework
- Leaflet and React-Leaflet for interactive maps
- Axios for API communication
- Create React App for project scaffolding

## Troubleshooting

If the reverse geocode or other API functions fail:

1. Verify that the backend server is running on `http://localhost:3000`
2. Check that your backend `.env` file has the correct LocationIQ API key
3. Confirm that the database migration has been run
4. Check browser console for any CORS or network errors