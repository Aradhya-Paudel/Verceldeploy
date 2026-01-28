import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getHospitalByName, updateHospitalStaff } from "../../services/api";

function HospitalStaff() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [staffData, setStaffData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  // Icons for each specialist category
  const staffIcons = {
    Cardiologist: "cardiology",
    Neurologist: "neurology",
    "Orthopedic Surgeon": "orthopedics",
    "General Surgeon": "surgical",
    Anesthesiologist: "masks",
    Radiologist: "radiology",
    Oncologist: "oncology",
    Pediatrician: "pediatrics",
    Psychiatrist: "psychiatry",
    Dermatologist: "dermatology",
    Gastroenterologist: "gastroenterology",
    Nephrologist: "nephrology",
    Pulmonologist: "pulmonology",
    Endocrinologist: "endocrinology",
    Rheumatologist: "rheumatology",
    Urologist: "urology",
    Ophthalmologist: "ophthalmology",
    "ENT Specialist": "hearing",
    Gynecologist: "gynecology",
    "Emergency Medicine Specialist": "emergency",
  };

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
          setStaffData(selectedHospital.staffCount || {});
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    loadHospitalData();
  }, []);

  const handleIncrement = (category) => {
    setStaffData((prev) => ({
      ...prev,
      [category]: (prev[category] || 0) + 1,
    }));
  };

  const handleDecrement = (category) => {
    setStaffData((prev) => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) - 1),
    }));
  };

  const handleInputChange = (category, value) => {
    setStaffData((prev) => ({
      ...prev,
      [category]: parseInt(value) || 0,
    }));
  };

  const handleUpdateStaff = async () => {
    try {
      const result = await updateHospitalStaff(hospital.id, staffData);
      if (result.success) {
        // Update local storage with new staff data
        const updatedHospital = { ...hospital, staffCount: staffData };
        localStorage.setItem("hospitalData", JSON.stringify(updatedHospital));
        alert("Staffing records updated successfully!");
      } else {
        alert(
          "Error updating staffing records: " +
            (result.error || "Unknown error"),
        );
      }
    } catch (err) {
      console.error("Error updating staff:", err);
      alert("Error updating staffing records");
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">ambulance</span>
              <span className="text-sm font-medium">Fleet Management</span>
            </Link>
            <Link
              to="/hospital/staff"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20"
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
            <div className="max-w-5xl mx-auto space-y-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-primary text-white">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">
                      Staff Availability Control
                    </h3>
                    <p className="text-white/70 text-xs mt-1">
                      Adjust real-time personnel counts across medical
                      departments.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-400"></span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Live System
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto bg-slate-50">
                  <table className="w-full text-left text-sm min-w-100">
                    <thead className="bg-slate-100 text-primary uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-4 sm:px-8 py-3 sm:py-4 w-1/2">
                          Medical Specialty
                        </th>
                        <th className="px-4 sm:px-8 py-3 sm:py-4">
                          Staff on Duty
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(staffData).map(([category, count]) => (
                        <tr key={category} className="hover:bg-slate-50">
                          <td className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-primary align-middle">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <span className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary text-white flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-base sm:text-xl">
                                  {staffIcons[category] || "person"}
                                </span>
                              </span>
                              <span className="text-sm sm:text-base">
                                {category}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 sm:px-8 py-4 sm:py-5">
                            <div className="flex items-center max-w-45 sm:max-w-55">
                              <button
                                onClick={() => handleDecrement(category)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-l-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm sm:text-base">
                                  remove
                                </span>
                              </button>
                              <input
                                className="w-full h-8 sm:h-10 text-center border-y border-slate-300 bg-white text-sm sm:text-base font-bold text-primary focus:ring-0 focus:border-slate-300"
                                type="number"
                                value={count}
                                onChange={(e) =>
                                  handleInputChange(category, e.target.value)
                                }
                              />
                              <button
                                onClick={() => handleIncrement(category)}
                                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-r-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm sm:text-base">
                                  add
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-4 sm:px-8 py-6 sm:py-8 border-t border-slate-200 bg-white flex flex-col items-center">
                  <button
                    onClick={handleUpdateStaff}
                    className="w-full max-w-lg bg-primary hover:bg-primary/90 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-primary/25 text-base sm:text-lg"
                  >
                    <span className="material-symbols-outlined">
                      how_to_reg
                    </span>
                    <span>Update Staffing Records</span>
                  </button>
                  <p className="text-slate-400 text-[10px] mt-3 sm:mt-4 uppercase tracking-widest font-bold text-center">
                    Shift verification: Active • Last confirmed by Shift Lead
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

export default HospitalStaff;
