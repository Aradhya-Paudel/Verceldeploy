import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Map from "../components/Map";
import {
  getPendingAccidents,
  getAllHospitals,
  updateAmbulanceLocation,
  updateAmbulanceStatus,
  addCasualty,
  findBestHospital,
  removeAccident,
} from "../services/api";

function AmbulanceUser() {
  const navigate = useNavigate();
  const [ambulanceData, setAmbulanceData] = useState(null);
  const [user, setUser] = useState("");
  const [incidents, setIncidents] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle, requesting, active
  const [nearestIncident, setNearestIncident] = useState(null);
  const [nearestDistance, setNearestDistance] = useState(null);

  // New states for ambulance workflow
  const [ambulanceStatus, setAmbulanceStatus] = useState("active"); // active, busy
  const [currentIncident, setCurrentIncident] = useState(null);
  const [showCasualtyPopup, setShowCasualtyPopup] = useState(false);
  const [casualtyCount, setCasualtyCount] = useState(0);
  const [casualties, setCasualties] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [nearestHospital, setNearestHospital] = useState(null);
  const [isNavigatingToHospital, setIsNavigatingToHospital] = useState(false);
  const [distanceInMeters, setDistanceInMeters] = useState(null);

  const PROXIMITY_THRESHOLD = 30;

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    const isAuth = localStorage.getItem("adminAuth");

    if (!isAuth || !userName) {
      navigate("/", { replace: true });
      return;
    }

    setUser(userName);

    // Fetch ambulance data by name and store id
    const fetchAmbulanceData = async () => {
      try {
        const res = await getAllAmbulances();
        if (res.success && Array.isArray(res.data)) {
          const found = res.data.find((a) => a.name === userName);
          if (found) setAmbulanceData(found);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchAmbulanceData();

    // Only start location tracking after user is set
    if (userName) {
      requestLocationPermission(userName);
    }

    // Fetch pending accidents from API
    const fetchIncidents = async () => {
      try {
        const result = await getPendingAccidents();
        if (result.success) {
          setIncidents(result.data);
        }
      } catch (error) {
        console.error("Error loading incidents:", error);
      }
    };

    // Fetch hospitals from API
    const fetchHospitals = async () => {
      try {
        const result = await getAllHospitals();
        if (result.success) {
          setHospitals(result.data);
        }
      } catch (error) {
        console.error("Error loading hospitals:", error);
      }
    };

    fetchIncidents();
    fetchHospitals();
  }, [navigate]);

  // Calculate distance in meters using Haversine formula
  const calculateDistanceMeters = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    // Decrease by default of 10 meters, ensure non-negative
    return Math.max(0, R * c - 30);
  }, []);

  // Calculate nearest incident whenever location or incidents change (only if active)
  useEffect(() => {
    if (!location || incidents.length === 0 || ambulanceStatus === "busy") {
      if (ambulanceStatus === "busy") return; // Don't clear if busy
      setNearestIncident(null);
      setNearestDistance(null);
      setDistanceInMeters(null);
      return;
    }

    let nearest = null;
    let minDistance = Infinity;

    incidents.forEach((incident) => {
      if (incident.latitude && incident.longitude) {
        const distance = calculateDistanceMeters(
          location.latitude,
          location.longitude,
          incident.latitude,
          incident.longitude,
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = incident;
        }
      }
    });

    setNearestIncident(nearest);
    setNearestDistance(minDistance / 111000); // Convert back to degrees for map
    setDistanceInMeters(minDistance);
  }, [location, incidents, ambulanceStatus, calculateDistanceMeters]);

  // Calculate distance to current incident when busy
  useEffect(() => {
    if (
      ambulanceStatus === "busy" &&
      currentIncident &&
      location &&
      !isNavigatingToHospital
    ) {
      const distance = calculateDistanceMeters(
        location.latitude,
        location.longitude,
        currentIncident.latitude,
        currentIncident.longitude,
      );
      setDistanceInMeters(distance);
    }
  }, [
    location,
    currentIncident,
    ambulanceStatus,
    isNavigatingToHospital,
    calculateDistanceMeters,
  ]);

  // Find nearest hospital
  const findNearestHospital = useCallback(() => {
    if (!location || hospitals.length === 0) return null;

    let nearest = null;
    let minDistance = Infinity;

    hospitals.forEach((hospital) => {
      if (hospital.latitude && hospital.longitude) {
        const distance = calculateDistanceMeters(
          location.latitude,
          location.longitude,
          hospital.latitude,
          hospital.longitude,
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = hospital;
        }
      }
    });

    return nearest;
  }, [location, hospitals, calculateDistanceMeters]);

  const requestLocationPermission = async (userNameParam) => {
    setLocationStatus("requesting");
    setLocationError(null);

    if (!("geolocation" in navigator)) {
      setLocationError("Geolocation is not supported by your browser.");
      setLocationStatus("idle");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
          ambulanceName: userNameParam,
        };

        setLocation(coords);
        setLocationStatus("active");
        postLocationToBackend(coords, userNameParam);

        // Watch position for continuous updates
        const watchId = navigator.geolocation.watchPosition(
          (newPosition) => {
            const updatedCoords = {
              latitude: newPosition.coords.latitude,
              longitude: newPosition.coords.longitude,
              accuracy: newPosition.coords.accuracy,
              timestamp: new Date().toISOString(),
              ambulanceName: userNameParam,
            };
            setLocation(updatedCoords);
            postLocationToBackend(updatedCoords, userNameParam);
          },
          (error) => {
            console.error("Error watching position:", error);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 },
        );

        // Cleanup watchPosition on unmount
        return () => navigator.geolocation.clearWatch(watchId);
      },
      (error) => {
        let errorMsg = "Unable to retrieve location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            "Location permission denied. Please enable location access in your browser.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "The request to get location timed out.";
        }
        setLocationError(errorMsg);
        setLocationStatus("idle");
        console.error("Location error:", error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const postLocationToBackend = async (coords, userNameParam) => {
    try {
      // Use ambulanceData.id if available, else fallback to userNameParam or user
      const ambulanceId =
        (ambulanceData && ambulanceData.id) || userNameParam || user;
      await updateAmbulanceLocation(
        ambulanceId,
        coords.latitude,
        coords.longitude,
      );
    } catch (error) {
      console.error("Error posting location:", error);
    }
  };

  // Accept incident and change status to busy
  const handleAcceptIncident = async () => {
    if (nearestIncident) {
      setAmbulanceStatus("busy");
      setCurrentIncident(nearestIncident);

      // Post status to backend
      try {
        await updateAmbulanceStatus(user, "busy", nearestIncident.id);
        // Remove the current incident from active accidents in backend
        await removeAccident(nearestIncident.id);
        // Optionally, update local state to remove the incident from the list
        setIncidents((prev) =>
          prev.filter((inc) => inc.id !== nearestIncident.id),
        );
      } catch (error) {
        console.error(
          "Error updating ambulance status or removing accident:",
          error,
        );
      }
    }
  };

  // Handle when ambulance reaches incident location
  const handleReachedIncident = async () => {
    setShowCasualtyPopup(true);
    setCasualtyCount(0);
    setCasualties([]);
  };

  // Handle casualty count change
  const handleCasualtyCountChange = (count) => {
    const num = parseInt(count) || 0;
    setCasualtyCount(num);
    setCasualties(
      Array(num)
        .fill(null)
        .map((_, i) => ({
          id: i + 1,
          bloodType: "",
          requiredAmount: "",
          severity: "",
          specialtyRequired: "",
        })),
    );
  };

  // Update individual casualty data
  const updateCasualtyData = (index, field, value) => {
    setCasualties((prev) =>
      prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    );
  };

  // Submit casualty data and navigate to hospital
  const handleSubmitCasualties = async () => {
    // Post casualty data to backend
    try {
      for (const casualty of casualties) {
        await addCasualty({
          accidentId: currentIncident?.id,
          ambulanceName: user,
          bloodType: casualty.bloodType,
          requiredAmount: parseInt(casualty.requiredAmount) || 0,
          severity: casualty.severity,
          specialtyRequired: casualty.specialtyRequired,
        });
      }

      // Find best hospital based on casualties
      if (casualties.length > 0 && location) {
        const bestHospitalResult = await findBestHospital({
          bloodType: casualties[0].bloodType,
          specialtyRequired: casualties[0].specialtyRequired,
          latitude: location.latitude,
          longitude: location.longitude,
        });

        if (bestHospitalResult.success && bestHospitalResult.data) {
          setNearestHospital(bestHospitalResult.data);
        } else {
          // Fallback to nearest hospital
          const hospital = findNearestHospital();
          setNearestHospital(hospital);
        }
      } else {
        // Fallback to nearest hospital
        const hospital = findNearestHospital();
        setNearestHospital(hospital);
      }
    } catch (error) {
      console.error("Error posting casualties:", error);
      // Fallback to nearest hospital on error
      const hospital = findNearestHospital();
      setNearestHospital(hospital);
    }

    setIsNavigatingToHospital(true);
    setShowCasualtyPopup(false);
  };

  // Handle when ambulance reaches hospital
  const handleReachedHospital = async () => {
    setAmbulanceStatus("active");
    setCurrentIncident(null);
    setIsNavigatingToHospital(false);
    setNearestHospital(null);
    setCasualties([]);
    setCasualtyCount(0);

    // Post status to backend
    try {
      await updateAmbulanceStatus(user, "active");
    } catch (error) {
      console.error("Error updating ambulance status:", error);
    }
  };

  // Check if within 5 meters of current incident
  const isWithinProximity =
    ambulanceStatus === "busy" &&
    currentIncident &&
    distanceInMeters !== null &&
    distanceInMeters <= PROXIMITY_THRESHOLD;

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  return (
    <div className="Main bg-background-light text-slate-900 antialiased overflow-hidden">
      <div className="flex flex-col h-screen w-full">
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="rounded-lg text-white w-8 h-8">
              <img src="../public/logo.webp" className=" rounded-xl" alt="" />
            </div>
            <span className="font-bold text-primary tracking-tight text-xs md:text-base">
              EMS Response System
            </span>
            {/* Ambulance Status Badge */}
            <div
              className={`ml-4 px-3 py-1 rounded-full text-xs font-bold ${
                ambulanceStatus === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {ambulanceStatus === "active" ? "ACTIVE" : "BUSY"}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            {/* Location Status Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
              <span
                className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                  locationStatus === "active"
                    ? "bg-green-500"
                    : locationStatus === "requesting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              ></span>
              <span className="text-xs font-semibold text-slate-700">
                {locationStatus === "active"
                  ? "Location Active"
                  : locationStatus === "requesting"
                    ? "Requesting..."
                    : "No Location"}
              </span>
            </div>

            {/* Location Error Alert */}
            {locationError && (
              <div className="hidden lg:flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                <span className="material-symbols-outlined text-sm">error</span>
                <span>{locationError}</span>
              </div>
            )}

            {/* Got a Call Button - Manual casualty entry without map navigation */}
            {ambulanceStatus === "active" && (
              <button
                onClick={() => {
                  setAmbulanceStatus("busy");
                  setShowCasualtyPopup(true);
                  setCasualtyCount(0);
                  setCasualties([]);
                }}
                className="bg-primary text-white hover:bg-slate-800 px-3 md:px-6 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 transition-all active:scale-95 text-xs md:text-sm"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                <span className="hidden sm:inline">Got a Call?</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="bg-red-700 text-white hover:bg-red-800 px-3 md:px-6 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 transition-all active:scale-95 text-xs md:text-sm"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
            <div className="hidden md:flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 mt-0.5 max-w-xs truncate font-bold">
                  {user}
                </p>
              </div>
              <div
                className="h-9 w-9 rounded-full bg-cover bg-center border border-slate-200"
                style={{
                  backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuC0AcwK3HF6hhNVJRA24til9Ura45zJoZqdV9wW-hiedLm81sbHwL122rreOmOphrhhdOC9K4Vh6Il_59qNo7auxbt2r9DmZsYi1SpC42nTrZ9sj8eVzQmw3xk5cdjCkph1_jx0xD9RkOQJOV_tDldn4A22QYeMSvNSXJxFbgBsvjh8RZ6ocxbw33Z_mgBKA0r9eE-8HTdVMXsItkeyV0HTGiHHG2EZ017MWWh2WFN2f7WZJGW9queuU0OVof8n5sausqLo3ApblZ8')`,
                }}
              ></div>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold max-w-20 truncate">
                  {user}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Casualty Data Entry Popup */}
        {showCasualtyPopup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-primary">
                      Casualty Data Entry
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Enter details for each casualty
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCasualtyPopup(false);
                      setAmbulanceStatus("active");
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {/* Casualty Count Input */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                    Number of Casualties
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={casualtyCount}
                    onChange={(e) => handleCasualtyCountChange(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter number of casualties"
                  />
                </div>

                {/* Casualty Cards */}
                {casualties.length > 0 && (
                  <div className="space-y-3 sm:space-y-4">
                    {casualties.map((casualty, index) => (
                      <div
                        key={casualty.id}
                        className="bg-slate-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200"
                      >
                        <h3 className="font-bold text-primary mb-2 sm:mb-3 text-sm sm:text-base">
                          Casualty #{casualty.id}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">
                              Blood Type
                            </label>
                            <select
                              required
                              value={casualty.bloodType}
                              onChange={(e) =>
                                updateCasualtyData(
                                  index,
                                  "bloodType",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                            >
                              <option value="">Select</option>
                              <option value="A+">A+</option>
                              <option value="A-">A-</option>
                              <option value="B+">B+</option>
                              <option value="B-">B-</option>
                              <option value="O+">O+</option>
                              <option value="O-">O-</option>
                              <option value="AB+">AB+</option>
                              <option value="AB-">AB-</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">
                              Required Amount (L)
                            </label>
                            <input
                              required
                              type="number"
                              step="0.1"
                              min="0"
                              value={casualty.requiredAmount}
                              onChange={(e) =>
                                updateCasualtyData(
                                  index,
                                  "requiredAmount",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                              placeholder="Liters"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">
                              Severity
                            </label>
                            <select
                              required
                              value={casualty.severity}
                              onChange={(e) =>
                                updateCasualtyData(
                                  index,
                                  "severity",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                            >
                              <option value="">Select</option>
                              <option value="Critical">Critical</option>
                              <option value="Severe">Severe</option>
                              <option value="Moderate">Moderate</option>
                              <option value="Minor">Minor</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] sm:text-xs font-semibold text-slate-600 mb-1">
                              Specialty Required
                            </label>
                            <select
                              required
                              value={casualty.specialtyRequired}
                              onChange={(e) =>
                                updateCasualtyData(
                                  index,
                                  "specialtyRequired",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg text-xs sm:text-sm"
                            >
                              <option value="">Select</option>
                              <option value="Cardiologist">Cardiologist</option>
                              <option value="Neurologist">Neurologist</option>
                              <option value="Orthopedic Surgeon">
                                Orthopedic Surgeon
                              </option>
                              <option value="General Surgeon">
                                General Surgeon
                              </option>
                              <option value="Trauma Surgeon">
                                Trauma Surgeon
                              </option>
                              <option value="Anesthesiologist">
                                Anesthesiologist
                              </option>
                              <option value="Emergency Medicine">
                                Emergency Medicine
                              </option>
                              <option value="Pulmonologist">
                                Pulmonologist
                              </option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Submit Button */}
                {casualties.length > 0 && (
                  <button
                    onClick={handleSubmitCasualties}
                    className="w-full mt-4 sm:mt-6 bg-primary text-white py-2.5 sm:py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">
                      local_hospital
                    </span>
                    Submit & Navigate to Hospital
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Hospital Navigation Banner */}
        {isNavigatingToHospital && nearestHospital && (
          <div className="bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="material-symbols-outlined animate-pulse text-lg sm:text-xl">
                local_hospital
              </span>
              <div>
                <p className="font-bold text-sm sm:text-base">
                  Navigating to {nearestHospital.name}
                </p>
                <p className="text-[10px] sm:text-xs text-blue-200">
                  {nearestHospital.address}
                </p>
              </div>
            </div>
            <button
              onClick={handleReachedHospital}
              className="w-full sm:w-auto bg-white text-blue-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <span className="material-symbols-outlined text-base sm:text-lg">
                check_circle
              </span>
              Reached Hospital
            </button>
          </div>
        )}

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Show sidebar based on ambulance status */}
          {ambulanceStatus === "active" && nearestIncident ? (
            <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:h-full shadow-lg z-10 max-h-[40vh] md:max-h-none overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600 animate-pulse">
                    emergency_home
                  </span>
                  <h2 className="text-primary font-bold text-base sm:text-lg">
                    Nearest Incident
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                  Priority Response
                </p>
              </div>
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                <div className="w-full mb-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-white/50 p-3 sm:p-4">
                  <div className="relative h-24 sm:h-32 w-full rounded-lg overflow-hidden mb-2 sm:mb-3">
                    <img
                      alt={nearestIncident.title}
                      className="w-full h-full object-cover grayscale-[0.3]"
                      src={nearestIncident.image}
                    />
                  </div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-primary">
                      {nearestIncident.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <span className="material-symbols-outlined text-base sm:text-lg text-primary">
                      location_on
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold">
                      {nearestIncident.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] mb-2 sm:mb-3">
                    <span className="text-slate-500">
                      {nearestIncident.time}
                    </span>
                    <span className="font-bold text-slate-600">
                      {nearestIncident.status}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleAcceptIncident}
                    className="w-full bg-red-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                  >
                    <span className="material-symbols-outlined text-base sm:text-lg">
                      directions
                    </span>
                    Accept & Navigate
                  </button>
                </div>
              </div>
            </aside>
          ) : ambulanceStatus === "busy" &&
            currentIncident &&
            !isNavigatingToHospital ? (
            <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col md:h-full shadow-lg z-10 max-h-[40vh] md:max-h-none overflow-y-auto">
              <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-orange-600 animate-pulse">
                    directions_car
                  </span>
                  <h2 className="text-primary font-bold text-base sm:text-lg">
                    En Route
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                  Responding to Incident
                </p>
              </div>
              <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                <div className="w-full mb-4 bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl border border-orange-200 p-3 sm:p-4">
                  <div className="relative h-24 sm:h-32 w-full rounded-lg overflow-hidden mb-2 sm:mb-3">
                    <img
                      alt={currentIncident.title}
                      className="w-full h-full object-cover"
                      src={currentIncident.image}
                    />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-primary mb-2">
                    {currentIncident.title}
                  </h3>
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <span className="material-symbols-outlined text-base sm:text-lg text-primary">
                      location_on
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold">
                      {currentIncident.location}
                    </span>
                  </div>
                  <div className="bg-linear-to-r from-orange-50 to-orange-100 rounded-lg p-2 sm:p-3 flex items-center justify-between mb-3 sm:mb-4">
                    <span className="text-[10px] sm:text-xs font-semibold text-orange-900">
                      Distance:
                    </span>
                    <span className="text-sm sm:text-lg font-bold text-orange-600">
                      {distanceInMeters
                        ? `${distanceInMeters.toFixed(0)}m`
                        : "Calculating..."}
                    </span>
                  </div>

                  {/* Reached Button - shows when within 5 meters */}
                  {isWithinProximity ? (
                    <button
                      onClick={handleReachedIncident}
                      className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2 animate-pulse text-xs sm:text-sm"
                    >
                      <span className="material-symbols-outlined text-base sm:text-lg">
                        check_circle
                      </span>
                      Reached?
                    </button>
                  ) : (
                    <div className="w-full bg-slate-100 text-slate-500 py-2 sm:py-3 rounded-lg font-semibold text-center text-[10px] sm:text-sm">
                      Get within 5m to confirm arrival
                    </div>
                  )}
                </div>
              </div>
            </aside>
          ) : (
            // Default sidebar - System Status (hidden on mobile when no incident)
            <div className="hidden md:block absolute top-6 left-6 z-10 w-72 lg:w-80">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-2 w-auto h-auto m-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-primary font-bold text-base lg:text-lg">
                    System Status
                  </h2>
                </div>
                <div className="py-8 lg:py-12 flex flex-col items-center justify-center border-t border-slate-100">
                  <span className="material-symbols-outlined text-primary/20 text-4xl lg:text-5xl mb-4">
                    check_circle
                  </span>
                  <p className="text-primary font-semibold text-center text-sm lg:text-base">
                    {isNavigatingToHospital
                      ? "Navigating to Hospital"
                      : "No accidents nearby"}
                  </p>
                  <p className="text-slate-400 text-[10px] lg:text-[11px] text-center mt-2 uppercase tracking-widest font-medium">
                    {ambulanceStatus === "active"
                      ? "Scanning Area"
                      : "In Transit"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1 relative overflow-hidden m-1 sm:m-2 md:m-6 rounded-xl sm:rounded-2xl border border-slate-300/30 shadow-inner min-h-75 md:min-h-0">
            <Map
              ambulanceLocation={location}
              ambulanceName={user}
              incidents={ambulanceStatus === "active" ? incidents : []}
              nearestIncident={
                ambulanceStatus === "busy" ? currentIncident : nearestIncident
              }
              nearestDistance={nearestDistance}
              targetHospital={isNavigatingToHospital ? nearestHospital : null}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AmbulanceUser;
