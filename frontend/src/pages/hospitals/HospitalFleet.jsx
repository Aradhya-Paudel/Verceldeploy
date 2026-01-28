import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  getHospitalByName,
  updateHospitalAmbulanceCount,
  getBloodRequestsForHospital,
  approveBloodRequest,
  declineBloodRequest,
} from "../../services/api";

function HospitalFleet() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [ambulanceCount, setAmbulanceCount] = useState(0);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  // Load hospital data from API based on localStorage userName
  useEffect(() => {
    const loadHospitalData = async () => {
      try {
        const userName = localStorage.getItem("userName");

        // Try to get from localStorage first (set during login)
        const cachedData = localStorage.getItem("hospitalData");
        let selectedHospital = cachedData ? JSON.parse(cachedData) : null;

        // Otherwise fetch from API
        if (!selectedHospital) {
          const result = await getHospitalByName(userName);
          if (result.success && result.data) {
            selectedHospital = result.data;
            localStorage.setItem("hospitalData", JSON.stringify(result.data));
          }
        }

        if (!selectedHospital) {
          setError("Hospital not found");
        } else {
          setHospital(selectedHospital);
          setAmbulanceCount(selectedHospital.ambulanceCount || 0);

          // Fetch blood requests from API
          const requestsResult = await getBloodRequestsForHospital(
            selectedHospital.id,
          );
          if (requestsResult.success) {
            setBloodRequests(requestsResult.data || []);
          }
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadHospitalData();
  }, []);

  const handleIncrement = () => {
    setAmbulanceCount((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setAmbulanceCount((prev) => Math.max(0, prev - 1));
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const result = await approveBloodRequest(requestId);
      if (result.success) {
        setBloodRequests((prev) =>
          prev.map((req) =>
            req.requestId === requestId ? { ...req, status: "Approved" } : req,
          ),
        );
      }
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const result = await declineBloodRequest(requestId);
      if (result.success) {
        setBloodRequests((prev) =>
          prev.map((req) =>
            req.requestId === requestId ? { ...req, status: "Declined" } : req,
          ),
        );
      }
    } catch (err) {
      console.error("Error declining request:", err);
    }
  };

  const handleUpdateFleet = async () => {
    try {
      const result = await updateHospitalAmbulanceCount(
        hospital.id,
        ambulanceCount,
      );
      if (result.success) {
        // Update local storage with new ambulance count
        const updatedHospital = { ...hospital, ambulanceCount };
        localStorage.setItem("hospitalData", JSON.stringify(updatedHospital));
        alert("Fleet records updated successfully!");
      } else {
        alert(
          "Error updating fleet records: " + (result.error || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error updating fleet:", err);
      alert("Error updating fleet records");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-slate-600">Loading hospital data...</div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-red-600">Error loading hospital data: {error}</div>
      </div>
    );
  }

  return (
    <div className="Main bg-slate-50 text-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 border-r border-slate-200 bg-white flex flex-col shrink-0
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="rounded-lg text-white w-8 h-8">
              <img src="../public/logo.webp" className=" rounded-xl" alt="" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-primary text-sm font-bold leading-tight truncate">
                {hospital.name}
              </h1>
              <p className="text-slate-500 text-xs font-medium">
                Emergency Hub
              </p>
            </div>
            <button
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link
              to="/hospital"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              to="/hospital/inventory"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="text-sm font-medium">Inventory</span>
            </Link>
            <Link
              to="/hospital/fleet"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">ambulance</span>
              <span className="text-sm font-medium">Fleet Management</span>
            </Link>
            <Link
              to="/hospital/staff"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-medium">Staffing</span>
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-700 text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-red-800 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-14 sm:h-16 border-b border-slate-200 bg-white px-4 sm:px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 sm:gap-6 flex-1">
              <button
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-primary text-base sm:text-lg font-bold truncate">
                Amcon
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url('${userAvatarUrl}')` }}
                title="User profile avatar"
              ></div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 pb-8 sm:pb-12">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-primary text-white">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">
                      Vehicle Availability Control
                    </h3>
                    <p className="text-white/70 text-xs mt-1">
                      Manage current deployment levels of the emergency fleet.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">
                      Active Status
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto bg-slate-50 p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 max-w-2xl mx-auto bg-white p-4 sm:p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                        <span className="material-symbols-outlined text-2xl sm:text-3xl">
                          ambulance
                        </span>
                      </span>
                      <div>
                        <span className="text-base sm:text-xl font-bold text-primary block">
                          Emergency Ambulances
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Ready for immediate dispatch
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center w-full sm:w-auto max-w-50 sm:max-w-60">
                      <button
                        onClick={handleDecrement}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-l-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <input
                        className="w-full h-10 sm:h-12 text-center border-y border-slate-300 bg-white text-lg sm:text-xl font-bold text-primary focus:ring-0 focus:border-slate-300"
                        type="number"
                        value={ambulanceCount}
                        onChange={(e) =>
                          setAmbulanceCount(parseInt(e.target.value) || 0)
                        }
                      />
                      <button
                        onClick={handleIncrement}
                        className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-r-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <span className="material-symbols-outlined text-primary">
                    bloodtype
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-primary">
                    Incoming Blood Requests
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {bloodRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <div className="mb-3 sm:mb-4">
                        <h4 className="font-bold text-primary text-base sm:text-lg">
                          {request.hospitalName}
                        </h4>
                        <p className="text-slate-500 text-xs">
                          {request.requestId}
                        </p>
                      </div>
                      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                          <span className="material-symbols-outlined text-base sm:text-lg">
                            bloodtype
                          </span>
                          <span>
                            Request for {request.litersNeeded} liters of{" "}
                            {request.bloodType} Blood
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600">
                          <span className="material-symbols-outlined text-base sm:text-lg">
                            location_on
                          </span>
                          <span>
                            {request.distanceMiles} miles from current location
                          </span>
                        </div>
                        {request.status !== "Pending" && (
                          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                request.status === "Approved"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {request.status}
                            </span>
                          </div>
                        )}
                      </div>
                      {request.status === "Pending" && (
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <button
                            onClick={() =>
                              handleDeclineRequest(request.requestId)
                            }
                            className="py-2 sm:py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm hover:bg-slate-50 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              handleApproveRequest(request.requestId)
                            }
                            className="py-2 sm:py-2.5 rounded-lg bg-primary text-white font-bold text-xs sm:text-sm hover:opacity-90 shadow-md shadow-primary/20 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <div className="pt-6 sm:pt-8 border-t border-slate-200 flex flex-col items-center">
                <button
                  onClick={handleUpdateFleet}
                  className="w-full max-w-lg bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/25 text-base sm:text-lg"
                >
                  <span className="material-symbols-outlined text-xl sm:text-2xl">
                    save
                  </span>
                  <span>Update Fleet Records</span>
                </button>
                <p className="text-slate-400 text-[10px] mt-3 sm:mt-4 uppercase tracking-widest font-bold text-center">
                  Automatic sync enabled • Last updated at{" "}
                  {new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalFleet;
