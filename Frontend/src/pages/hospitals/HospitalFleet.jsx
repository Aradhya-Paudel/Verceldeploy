import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function HospitalFleet() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [ambulanceCount, setAmbulanceCount] = useState(0);
  const [bloodRequests, setBloodRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  // API endpoint placeholder - to be filled later
  const API_ENDPOINT = "";

  const handleLogout = () => {
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("userType");
    localStorage.removeItem("userName");
    navigate("/", { replace: true });
  };

  // Load hospital data from JSON based on localStorage userName
  useEffect(() => {
    const loadHospitalData = async () => {
      try {
        const response = await fetch("/hospitals.json");
        const data = await response.json();
        // Get hospital name from localStorage (set during login)
        const userName = localStorage.getItem("userName");
        const selectedHospital = data.hospitals.find(
          (h) => h.name === userName,
        );

        if (!selectedHospital) {
          setError("Hospital not found");
        } else {
          setHospital(selectedHospital);
          setAmbulanceCount(selectedHospital.ambulanceCount);
          setBloodRequests(selectedHospital.bloodRequests || []);
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
    setBloodRequests((prev) =>
      prev.map((req) =>
        req.requestId === requestId ? { ...req, status: "Approved" } : req,
      ),
    );
    // POST to API when endpoint is available
    if (API_ENDPOINT) {
      try {
        await fetch(`${API_ENDPOINT}/blood-requests/${requestId}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Approved" }),
        });
      } catch (err) {
        console.error("Error approving request:", err);
      }
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setBloodRequests((prev) =>
      prev.map((req) =>
        req.requestId === requestId ? { ...req, status: "Declined" } : req,
      ),
    );
    // POST to API when endpoint is available
    if (API_ENDPOINT) {
      try {
        await fetch(`${API_ENDPOINT}/blood-requests/${requestId}/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Declined" }),
        });
      } catch (err) {
        console.error("Error declining request:", err);
      }
    }
  };

  const handleUpdateFleet = async () => {
    // POST to API when endpoint is available
    if (API_ENDPOINT) {
      try {
        await fetch(`${API_ENDPOINT}/hospital/${hospital.id}/fleet`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ambulanceCount,
            bloodRequests,
          }),
        });
        alert("Fleet records updated successfully!");
      } catch (err) {
        console.error("Error updating fleet:", err);
        alert("Error updating fleet records");
      }
    } else {
      alert(
        "Fleet records updated successfully! (API endpoint not configured)",
      );
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
        <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
          <div className="p-6 border-b border-slate-200 flex items-center gap-3">
            <div className="bg-primary p-2 rounded-lg text-white">
              <span className="material-symbols-outlined block">emergency</span>
            </div>
            <div>
              <h1 className="text-primary text-sm font-bold leading-tight">
                {hospital.name}
              </h1>
              <p className="text-slate-500 text-xs font-medium">
                Emergency Hub
              </p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <Link
              to="/hospital"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <Link
              to="/hospital/inventory"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="text-sm font-medium">Inventory</span>
            </Link>
            <Link
              to="/hospital/fleet"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20"
            >
              <span className="material-symbols-outlined">ambulance</span>
              <span className="text-sm font-medium">Fleet Management</span>
            </Link>
            <Link
              to="/hospital/staff"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
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
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6 flex-1">
              <h2 className="text-primary text-lg font-bold">
                Fleet Management
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
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-8 pb-12">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-primary text-white">
                  <div>
                    <h3 className="font-bold text-xl">
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
                <div className="overflow-x-auto bg-slate-50 p-8">
                  <div className="flex items-center justify-between max-w-2xl mx-auto bg-white p-6 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-6">
                      <span className="w-16 h-16 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-3xl">
                          ambulance
                        </span>
                      </span>
                      <div>
                        <span className="text-xl font-bold text-primary block">
                          Emergency Ambulances
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Ready for immediate dispatch
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center w-full max-w-60">
                      <button
                        onClick={handleDecrement}
                        className="w-12 h-12 flex items-center justify-center rounded-l-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined">
                          remove
                        </span>
                      </button>
                      <input
                        className="w-full h-12 text-center border-y border-slate-300 bg-white text-xl font-bold text-primary focus:ring-0 focus:border-slate-300"
                        type="number"
                        value={ambulanceCount}
                        onChange={(e) =>
                          setAmbulanceCount(parseInt(e.target.value) || 0)
                        }
                      />
                      <button
                        onClick={handleIncrement}
                        className="w-12 h-12 flex items-center justify-center rounded-r-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                      >
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">
                    bloodtype
                  </span>
                  <h3 className="text-xl font-bold text-primary">
                    Incoming Blood Requests
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bloodRequests.map((request) => (
                    <div
                      key={request.requestId}
                      className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                    >
                      <div className="mb-4">
                        <h4 className="font-bold text-primary text-lg">
                          {request.hospitalName}
                        </h4>
                        <p className="text-slate-500 text-xs">
                          {request.requestId}
                        </p>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-lg">
                            bloodtype
                          </span>
                          <span>
                            Request for {request.litersNeeded} liters of{" "}
                            {request.bloodType} Blood
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="material-symbols-outlined text-lg">
                            location_on
                          </span>
                          <span>
                            {request.distanceMiles} miles from current location
                          </span>
                        </div>
                        {request.status !== "Pending" && (
                          <div className="flex items-center gap-3 text-sm">
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
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() =>
                              handleDeclineRequest(request.requestId)
                            }
                            className="py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() =>
                              handleApproveRequest(request.requestId)
                            }
                            className="py-2.5 rounded-lg bg-primary text-white font-bold text-sm hover:opacity-90 shadow-md shadow-primary/20 transition-all"
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <div className="pt-8 border-t border-slate-200 flex flex-col items-center">
                <button
                  onClick={handleUpdateFleet}
                  className="w-full max-w-lg bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/25 text-lg"
                >
                  <span className="material-symbols-outlined text-2xl">
                    save
                  </span>
                  <span>Update Fleet Records</span>
                </button>
                <p className="text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-bold">
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
