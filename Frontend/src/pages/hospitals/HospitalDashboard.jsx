import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

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
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadHospitalData();
  }, []);

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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
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
                Hospital Resource Management
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url('${userAvatarUrl}')` }}
                title="User profile avatar circle"
              ></div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                    Beds Available
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    bed
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {hospital.bedsAvailable}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Total beds in facility
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                    Blood Inventory
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    bloodtype
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {hospital.bloodInventory.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Units across all types
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-sm uppercase tracking-wider">
                    Active Specialists
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    medical_services
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {
                      Object.values(hospital.staffCount).filter(
                        (count) => count > 0,
                      ).length
                    }
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Available specialists
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-slate-900 font-bold">
                      Blood Type Inventory
                    </h3>
                    <button className="text-blue-600 text-xs font-bold uppercase hover:underline">
                      Export Data
                    </button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-3">Blood Type</th>
                        <th className="px-6 py-3">In-Stock (Liters)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {hospital.bloodInventory.bloodTypes.map(
                        (blood, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-bold text-blue-600">
                              {blood.type}
                            </td>
                            <td className="px-6 py-4">{blood.liters} Liters</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </section>
              </div>
              <aside className="space-y-6">
                <section className="bg-white rounded-xl border border-slate-200 h-fit overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-slate-900 font-bold">
                      Incoming Ambulances
                    </h3>
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  </div>
                  <div className="p-4 space-y-3">
                    {hospital.incomingAmbulances &&
                      hospital.incomingAmbulances.map((ambulance, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border-2 ${
                            index === 0
                              ? "border-red-300 bg-red-50"
                              : "border-blue-200 bg-blue-50"
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`p-2 rounded-lg ${
                                  index === 0 ? "bg-red-200" : "bg-blue-200"
                                }`}
                              >
                                <span
                                  className={`material-symbols-outlined text-lg ${
                                    index === 0
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  ambulance
                                </span>
                              </div>
                              <div>
                                <p
                                  className={`text-sm font-bold ${
                                    index === 0
                                      ? "text-red-600"
                                      : "text-blue-600"
                                  }`}
                                >
                                  {ambulance.ambulanceId}
                                </p>
                                <p className="text-xs text-slate-600">
                                  {ambulance.caseType}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                  index === 0
                                    ? "bg-red-200 text-red-700"
                                    : "bg-blue-200 text-blue-700"
                                }`}
                              >
                                P{ambulance.priority}
                              </span>
                            </div>
                          </div>
                          <div className="mb-2">
                            <div className="flex justify-between mb-1">
                              <span className="text-xs text-slate-600">
                                Progress
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  index === 0 ? "text-red-600" : "text-blue-600"
                                }`}
                              >
                                {ambulance.progress}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-300 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  index === 0 ? "bg-red-500" : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${ambulance.progress}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-600">
                              ETA:{" "}
                              <span className="font-bold text-slate-900">
                                {ambulance.eta}m
                              </span>
                            </span>
                            <span
                              className={`font-bold ${
                                index === 0 ? "text-red-600" : "text-blue-600"
                              }`}
                            >
                              {ambulance.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalDashboard;
