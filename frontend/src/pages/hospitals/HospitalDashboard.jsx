import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getHospitalByName } from "../../services/api";

function HospitalDashboard() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
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
        // Get hospital name from localStorage (set during login)
        const userName = localStorage.getItem("userName");

        // Try to get from localStorage first (set during login)
        const cachedData = localStorage.getItem("hospitalData");
        if (cachedData) {
          setHospital(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Otherwise fetch from API
        const result = await getHospitalByName(userName);

        if (result.success && result.data) {
          setHospital(result.data);
          localStorage.setItem("hospitalData", JSON.stringify(result.data));
        } else {
          setError("Hospital not found");
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
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
                title="User profile avatar circle"
              ></div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Beds Available
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    bed
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {hospital.bedsAvailable}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Total beds in facility
                </p>
              </div>
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Blood Inventory
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    bloodtype
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {(
                      hospital.bloodInventory?.total ||
                      hospital.bloodInventory?.bloodTypes?.reduce(
                        (sum, b) => sum + (b.liters || b.units || 0),
                        0,
                      ) ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Units across all types
                </p>
              </div>
              <div className="bg-blue-50 p-4 sm:p-6 rounded-xl border border-blue-200 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-blue-600 font-bold text-xs sm:text-sm uppercase tracking-wider">
                    Active Specialists
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    medical_services
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900">
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
              <div className="xl:col-span-2 space-y-6 sm:space-y-8">
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-slate-900 font-bold text-sm sm:text-base">
                      Blood Type Inventory
                    </h3>
                    <button className="text-blue-600 text-xs font-bold uppercase hover:underline self-start sm:self-auto">
                      Export Data
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-75">
                      <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="px-4 sm:px-6 py-3">Blood Type</th>
                          <th className="px-4 sm:px-6 py-3">
                            In-Stock (Liters)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {hospital.bloodInventory.bloodTypes.map(
                          (blood, index) => (
                            <tr key={index} className="hover:bg-slate-50">
                              <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-blue-600">
                                {blood.type}
                              </td>
                              <td className="px-4 sm:px-6 py-3 sm:py-4">
                                {blood.liters} Liters
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalDashboard;
