import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getHospitalByName, updateBloodInventory } from "../../services/api";

function HospitalInventory() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [inventoryData, setInventoryData] = useState({});
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
          // Initialize inventory data from hospital bloodInventory
          const inventoryMap = {};
          if (
            selectedHospital.bloodInventory &&
            selectedHospital.bloodInventory.bloodTypes
          ) {
            selectedHospital.bloodInventory.bloodTypes.forEach((blood) => {
              inventoryMap[blood.type] = blood.liters;
            });
          }
          setInventoryData(inventoryMap);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadHospitalData();
  }, []);

  const handleQuantityChange = (bloodType, value) => {
    setInventoryData({
      ...inventoryData,
      [bloodType]: parseInt(value, 10) || 0,
    });
  };

  const handleIncrement = (bloodType) => {
    setInventoryData({
      ...inventoryData,
      [bloodType]: (inventoryData[bloodType] || 0) + 1,
    });
  };

  const handleDecrement = (bloodType) => {
    setInventoryData({
      ...inventoryData,
      [bloodType]: Math.max(0, (inventoryData[bloodType] || 0) - 1),
    });
  };

  const handleUpdateInventory = async () => {
    try {
      // Convert inventoryData to bloodTypes array format
      const bloodTypes = Object.entries(inventoryData).map(
        ([type, liters]) => ({
          type,
          liters,
        }),
      );

      const result = await updateBloodInventory(hospital.id, bloodTypes);

      if (result.success) {
        // Update local storage with new data (calculate total)
        const total = bloodTypes.reduce((sum, blood) => sum + blood.liters, 0);
        const updatedHospital = {
          ...hospital,
          bloodInventory: { bloodTypes, total },
        };
        localStorage.setItem("hospitalData", JSON.stringify(updatedHospital));
        alert("Inventory updated successfully!");
      } else {
        alert("Error updating inventory: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error updating inventory:", err);
      alert("Error updating inventory");
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
            <div className="bg-primary p-2 rounded-lg text-white">
              <span className="material-symbols-outlined block">emergency</span>
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20"
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
                Blood Inventory Management
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            <div className="max-w-5xl mx-auto space-y-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
                  <div>
                    <h3 className="text-primary font-bold text-lg sm:text-xl">
                      Blood Stock Control
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">
                      Manage and update the current reserve levels for all blood
                      types.
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm min-w-100">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 sm:px-8 py-3 sm:py-4 w-1/2">
                          Blood Type
                        </th>
                        <th className="px-4 sm:px-8 py-3 sm:py-4">
                          Quantity (Liters)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {hospital.bloodInventory.bloodTypes.map(
                        (blood, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-primary align-middle">
                              <div className="flex items-center gap-2 sm:gap-4">
                                <span
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                                    blood.type === "O-"
                                      ? "bg-red-600 text-white ring-2 sm:ring-4 ring-red-100"
                                      : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {blood.type}
                                </span>
                                <span className="text-sm sm:text-base">
                                  Blood {blood.type}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 sm:px-8 py-4 sm:py-5">
                              <div className="flex items-center max-w-45 sm:max-w-55">
                                <button
                                  onClick={() => handleDecrement(blood.type)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-l-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm sm:text-base">
                                    remove
                                  </span>
                                </button>
                                <input
                                  className="w-full h-8 sm:h-10 text-center border-y border-slate-200 bg-white text-sm sm:text-base font-medium focus:ring-0 focus:border-slate-200"
                                  type="number"
                                  value={inventoryData[blood.type] || 0}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      blood.type,
                                      e.target.value,
                                    )
                                  }
                                />
                                <button
                                  onClick={() => handleIncrement(blood.type)}
                                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-r-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 font-bold transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm sm:text-base">
                                    add
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 sm:px-8 py-6 sm:py-8 border-t border-slate-200 bg-slate-50 flex flex-col items-center">
                  <button
                    onClick={handleUpdateInventory}
                    className="w-full max-w-lg bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/25 text-base sm:text-lg"
                  >
                    <span className="material-symbols-outlined">save</span>
                    <span>Update Inventory Database</span>
                  </button>
                  <p className="text-slate-400 text-[10px] mt-3 sm:mt-4 uppercase tracking-widest font-bold text-center">
                    Last updated: 14:32:01 • By Admin
                  </p>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default HospitalInventory;
