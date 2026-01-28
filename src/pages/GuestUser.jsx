import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAccident } from "../services/api";

function GuestUser() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [locationError, setLocationError] = useState(null);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  // Check if we're in a secure context (required for camera/location)
  const isSecureContext = window.isSecureContext;

  const startCameraStream = async () => {
    // Check if secure context
    if (!isSecureContext) {
      setError(
        "Camera requires HTTPS. Please access this site via HTTPS or localhost.",
      );
      return;
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError(
        "Camera API not supported in this browser. Please use a modern browser.",
      );
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setError(null);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err.name === "NotAllowedError") {
        setError(
          "Camera access denied. Please enable camera permissions in your browser settings.",
        );
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use by another application.");
      } else if (err.name === "OverconstrainedError") {
        setError("Camera constraints could not be satisfied.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  };

  useEffect(() => {
    startCameraStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const requestLocation = async () => {
    setLocationError(null);
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString(),
            };
            setLocation(coords);
            resolve(coords);
          },
          (error) => {
            let errorMsg = "Unable to retrieve location";
            if (error.code === error.PERMISSION_DENIED) {
              errorMsg =
                "Location permission denied. Please enable location access.";
            } else if (error.code === error.POSITION_UNAVAILABLE) {
              errorMsg = "Location information is unavailable.";
            } else if (error.code === error.TIMEOUT) {
              errorMsg = "The request to get user location timed out.";
            }
            setLocationError(errorMsg);
            reject(new Error(errorMsg));
          },
        );
      } else {
        const msg = "Geolocation is not supported by this browser.";
        setLocationError(msg);
        reject(new Error(msg));
      }
    });
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(
        videoRef.current,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      );
      const imageData = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageData);
    }
  };

  const submitCapture = async () => {
    if (!capturedImage) {
      setError("Please capture a photo first.");
      return;
    }

    if (!location) {
      setError("Please allow location access.");
      return;
    }

    setLoading(true);

    try {
      // Report accident via API
      const result = await reportAccident({
        image: capturedImage,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        userAgent: navigator.userAgent,
      });

      if (result.success) {
        setSubmitted(true);
        setLoading(false);

        // Reset after 3 seconds
        setTimeout(() => {
          setCapturedImage(null);
          setLocation(null);
          setSubmitted(false);
        }, 3000);
      } else {
        setError(result.error || "Failed to submit accident report.");
        setLoading(false);
      }
    } catch (err) {
      setError("Error submitting photo: " + err.message);
      setLoading(false);
      console.error("Error:", err);
    }
  };

  const resetCapture = () => {
    setCapturedImage(null);
    setLocation(null);
    setError(null);
    startCameraStream();
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen">
      <div className="max-w-lg mx-auto flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 sm:h-16 border-b border-slate-200 bg-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-primary p-1.5 sm:p-2 rounded-lg text-white">
              <span className="material-symbols-outlined text-lg sm:text-xl">
                photo_camera
              </span>
            </div>
            <div>
              <h1 className="text-primary font-bold text-xs sm:text-sm">
                Photo Capture
              </h1>
              <p className="text-slate-500 text-[10px] sm:text-xs">
                Mobile Evidence Collection
              </p>
            </div>
          </div>
          <div
            className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-cover bg-center border border-slate-200"
            style={{ backgroundImage: `url('${userAvatarUrl}')` }}
            title="User profile avatar"
          ></div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-red-700 text-xs sm:text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {locationError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <p className="text-yellow-700 text-xs sm:text-sm font-medium">
                {locationError}
              </p>
            </div>
          )}

          {submitted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 animate-pulse">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="material-symbols-outlined text-green-600 text-lg sm:text-xl">
                  check_circle
                </span>
                <div>
                  <p className="text-green-700 font-bold text-sm sm:text-base">
                    Submitted Successfully!
                  </p>
                  <p className="text-green-600 text-[10px] sm:text-xs">
                    Photo and location saved
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Camera Preview or Captured Image */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            {!capturedImage ? (
              <div className="relative aspect-video bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 border-4 border-primary/30 pointer-events-none" />
              </div>
            ) : (
              <div className="aspect-video bg-black flex items-center justify-center">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>

          {/* Photo Capture Button */}
          {!capturedImage && (
            <button
              onClick={capturePhoto}
              className="w-full bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white font-bold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg shadow-primary/25"
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl">
                photo_camera
              </span>
              <span className="text-sm sm:text-base">Capture Photo</span>
            </button>
          )}

          {/* Location Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-slate-900 font-bold text-xs sm:text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base sm:text-lg">
                  location_on
                </span>
                Location Information
              </h3>
              {location && (
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              )}
            </div>

            {location ? (
              <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs">
                <div className="flex justify-between p-1.5 sm:p-2 bg-slate-50 rounded">
                  <span className="text-slate-600">Latitude:</span>
                  <span className="font-mono font-bold text-primary">
                    {location.latitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 sm:p-2 bg-slate-50 rounded">
                  <span className="text-slate-600">Longitude:</span>
                  <span className="font-mono font-bold text-primary">
                    {location.longitude.toFixed(6)}
                  </span>
                </div>
                <div className="flex justify-between p-1.5 sm:p-2 bg-slate-50 rounded">
                  <span className="text-slate-600">Accuracy:</span>
                  <span className="font-mono font-bold text-primary">
                    ±{location.accuracy.toFixed(1)}m
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-[11px] sm:text-xs">
                Location not yet captured. Click below to enable.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            {!location && (
              <button
                onClick={requestLocation}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  my_location
                </span>
                <span>Enable Location Access</span>
              </button>
            )}

            {capturedImage && location && (
              <button
                onClick={submitCapture}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  {loading ? "hourglass_top" : "cloud_upload"}
                </span>
                <span>
                  {loading ? "Submitting..." : "Submit Photo & Location"}
                </span>
              </button>
            )}

            {capturedImage && (
              <button
                onClick={resetCapture}
                className="w-full bg-slate-300 hover:bg-slate-400 text-slate-900 font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">
                  refresh
                </span>
                <span>Retake Photo</span>
              </button>
            )}
          </div>

          {/* Info Section */}
          <div className="bg-slate-100 rounded-lg p-3 sm:p-4 text-[11px] sm:text-xs text-slate-600 space-y-2">
            <div className="flex gap-2">
              <span className="material-symbols-outlined text-sm text-primary shrink-0">
                info
              </span>
              <div>
                <p className="font-bold text-slate-900 mb-1">How it works:</p>
                <ol className="list-decimal list-inside space-y-0.5 sm:space-y-1">
                  <li>Click "Capture Photo" to take a picture</li>
                  <li>Enable location access to capture GPS coordinates</li>
                  <li>Click "Submit" to save both photo and location</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuestUser;
