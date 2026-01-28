import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom ambulance icon
const ambulanceIcon = new L.DivIcon({
  className: "ambulance-marker",
  html: `
    <div style="
      background: #1e40af;
      padding: 10px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span class="material-symbols-outlined" style="color: white; font-size: 22px;">ambulance</span>
    </div>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22],
});

// Custom incident icon
const createIncidentIcon = () => {
  return new L.DivIcon({
    className: "incident-marker",
    html: `
      <div style="
        background: #dc2626;
        padding: 8px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <span class="material-symbols-outlined" style="color: white; font-size: 18px;">emergency</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Custom hospital icon
const createHospitalIcon = () => {
  return new L.DivIcon({
    className: "hospital-marker",
    html: `
      <div style="
        background: #059669;
        padding: 8px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span class="material-symbols-outlined" style="color: white; font-size: 18px;">local_hospital</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to handle map center updates
function MapCenterUpdater({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, 18, { duration: 1.5 });
    }
  }, [center, map]);

  return null;
}

function Map({
  ambulanceLocation,
  ambulanceName,
  incidents = [],
  nearestIncident = null,
  nearestDistance = null,
  targetHospital = null,
  routePoints = [],
}) {
  const [route, setRoute] = useState([]);

  // Use ambulance location as center, fallback to Pokhara
  const defaultCenter = ambulanceLocation
    ? [ambulanceLocation.latitude, ambulanceLocation.longitude]
    : [28.2096, 83.9856]; // Pokhara fallback

  console.log("Map Center (defaultCenter):", defaultCenter);

  // Calculate route from ambulance to target (incident or hospital) using OSRM
  useEffect(() => {
    const calculateRouteWithOSRM = async () => {
      if (!ambulanceLocation) {
        setRoute([]);
        return;
      }

      // Determine target: hospital takes priority, then incident
      let target = null;
      if (
        targetHospital &&
        targetHospital.latitude &&
        targetHospital.longitude
      ) {
        target = {
          latitude: targetHospital.latitude,
          longitude: targetHospital.longitude,
        };
      } else if (
        nearestIncident &&
        nearestIncident.latitude &&
        nearestIncident.longitude
      ) {
        target = {
          latitude: nearestIncident.latitude,
          longitude: nearestIncident.longitude,
        };
      }

      if (!target) {
        setRoute([]);
        return;
      }

      const ambulancePos = [
        ambulanceLocation.longitude, // OSRM uses [lng, lat]
        ambulanceLocation.latitude,
      ];

      const targetPos = [
        target.longitude, // OSRM uses [lng, lat]
        target.latitude,
      ];

      try {
        // Use OSRM public API for routing
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${ambulancePos[0]},${ambulancePos[1]};${targetPos[0]},${targetPos[1]}?overview=full&geometries=geojson`;

        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (data.routes && data.routes.length > 0) {
          const routeCoordinates = data.routes[0].geometry.coordinates.map(
            ([lng, lat]) => [lat, lng], // Convert back to [lat, lng] for Leaflet
          );
          setRoute(routeCoordinates);
        } else {
          setRoute([]);
        }
      } catch (error) {
        console.error("Error fetching OSRM route:", error);
        // Fallback to straight line if OSRM fails
        setRoute([
          [ambulanceLocation.latitude, ambulanceLocation.longitude],
          [target.latitude, target.longitude],
        ]);
      }
    };

    calculateRouteWithOSRM();
  }, [ambulanceLocation, nearestIncident, targetHospital]);

  const mapCenter = ambulanceLocation
    ? [ambulanceLocation.latitude, ambulanceLocation.longitude]
    : defaultCenter;

  return (
    <div
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          .leaflet-container {
            width: 100%;
            height: 100%;
            z-index: 1;
          }
        `}
      </style>
      <MapContainer
        center={defaultCenter}
        zoom={18}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Update map center when ambulance location changes */}
        <MapCenterUpdater center={ambulanceLocation ? mapCenter : null} />

        {/* Ambulance Marker */}
        {ambulanceLocation && (
          <Marker
            position={[ambulanceLocation.latitude, ambulanceLocation.longitude]}
            icon={ambulanceIcon}
          >
            <Popup>
              <div style={{ padding: "4px" }}>
                <strong style={{ color: "#1e40af" }}>
                  🚑 {ambulanceName || "Ambulance"}
                </strong>
                <br />
                <span style={{ fontSize: "11px", color: "#666" }}>
                  Lat: {ambulanceLocation.latitude.toFixed(6)}
                  <br />
                  Lng: {ambulanceLocation.longitude.toFixed(6)}
                  <br />
                  Accuracy: ±{ambulanceLocation.accuracy?.toFixed(1) || "N/A"}m
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Incident Markers */}
        {incidents.map((incident) => {
          if (!incident.latitude || !incident.longitude) return null;

          return (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
              icon={createIncidentIcon()}
            >
              <Popup>
                <div style={{ padding: "4px", minWidth: "180px" }}>
                  <strong style={{ color: "#dc2626" }}>
                    🚨 {incident.title || "Incident"}
                  </strong>
                  <br />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#666",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    📍 {incident.location || "Unknown location"}
                    <br />
                    🕐 {incident.time || "Unknown time"}
                    <br />
                    Status: <strong>{incident.status || "PENDING"}</strong>
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route Line */}
        {route.length >= 2 && (
          <Polyline
            positions={route}
            pathOptions={{
              color: targetHospital ? "#059669" : "#1e40af",
              weight: 4,
              opacity: 0.8,
              dashArray: "10, 10",
            }}
          />
        )}

        {/* Target Hospital Marker */}
        {targetHospital &&
          targetHospital.latitude &&
          targetHospital.longitude && (
            <Marker
              position={[targetHospital.latitude, targetHospital.longitude]}
              icon={createHospitalIcon()}
            >
              <Popup>
                <div style={{ padding: "4px", minWidth: "180px" }}>
                  <strong style={{ color: "#059669" }}>
                    🏥 {targetHospital.name || "Hospital"}
                  </strong>
                  <br />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#666",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    📍 {targetHospital.address || "Unknown address"}
                    <br />
                    📞 {targetHospital.phone || "N/A"}
                    <br />
                    🛏️ Beds:{" "}
                    <strong>{targetHospital.bedsAvailable || "N/A"}</strong>
                  </span>
                </div>
              </Popup>
            </Marker>
          )}

        {/* Nearest Incident Marker (when navigating to it) */}
        {nearestIncident &&
          nearestIncident.latitude &&
          nearestIncident.longitude &&
          !targetHospital && (
            <Marker
              position={[nearestIncident.latitude, nearestIncident.longitude]}
              icon={createIncidentIcon()}
            >
              <Popup>
                <div style={{ padding: "4px", minWidth: "180px" }}>
                  <strong style={{ color: "#dc2626" }}>
                    🚨 {nearestIncident.title || "Incident"}
                  </strong>
                  <br />
                  <span
                    style={{
                      fontSize: "11px",
                      color: "#666",
                      marginTop: "4px",
                      display: "block",
                    }}
                  >
                    📍 {nearestIncident.location || "Unknown location"}
                    <br />
                    🕐 {nearestIncident.time || "Unknown time"}
                    <br />
                    Status:{" "}
                    <strong>{nearestIncident.status || "PENDING"}</strong>
                  </span>
                </div>
              </Popup>
            </Marker>
          )}
      </MapContainer>
    </div>
  );
}

export default Map;
