import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function HospitalStaff() {
  const navigate = useNavigate();
  const [hospital, setHospital] = useState(null);
  const [staffData, setStaffData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  // API endpoint placeholder - to be filled later
  const API_ENDPOINT = "";

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
    // POST to API when endpoint is available
    if (API_ENDPOINT) {
      try {
        await fetch(`${API_ENDPOINT}/hospital/${hospital.id}/staff`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ staffCount: staffData }),
        });
        alert("Staffing records updated successfully!");
      } catch (err) {
        console.error("Error updating staff:", err);
        alert("Error updating staffing records");
      }
    } else {
      alert(
        "Staffing records updated successfully! (API endpoint not configured)",
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">ambulance</span>
              <span className="text-sm font-medium">Fleet Management</span>
            </Link>
            <Link
              to="/hospital/staff"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white shadow-md shadow-primary/20"
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
                Staffing Management
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
            <div className="max-w-5xl mx-auto space-y-6">
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-primary text-white">
                  <div>
                    <h3 className="font-bold text-xl">
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
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-100 text-primary uppercase text-[10px] font-bold">
                      <tr>
                        <th className="px-8 py-4 w-1/2">Medical Specialty</th>
                        <th className="px-8 py-4">Staff on Duty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {Object.entries(staffData).map(([category, count]) => (
                        <tr key={category} className="hover:bg-slate-50">
                          <td className="px-8 py-5 font-bold text-primary align-middle">
                            <div className="flex items-center gap-4">
                              <span className="w-10 h-10 rounded-lg bg-primary text-white flex items-center justify-center">
                                <span className="material-symbols-outlined text-xl">
                                  {staffIcons[category] || "person"}
                                </span>
                              </span>
                              <span className="text-base">{category}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center max-w-55">
                              <button
                                onClick={() => handleDecrement(category)}
                                className="w-10 h-10 flex items-center justify-center rounded-l-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined">
                                  remove
                                </span>
                              </button>
                              <input
                                className="w-full h-10 text-center border-y border-slate-300 bg-white text-base font-bold text-primary focus:ring-0 focus:border-slate-300"
                                type="number"
                                value={count}
                                onChange={(e) =>
                                  handleInputChange(category, e.target.value)
                                }
                              />
                              <button
                                onClick={() => handleIncrement(category)}
                                className="w-10 h-10 flex items-center justify-center rounded-r-lg bg-white hover:bg-slate-100 border border-slate-300 text-primary font-bold transition-colors"
                              >
                                <span className="material-symbols-outlined">
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
                <div className="px-8 py-8 border-t border-slate-200 bg-white flex flex-col items-center">
                  <button
                    onClick={handleUpdateStaff}
                    className="w-full max-w-lg bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/25 text-lg"
                  >
                    <span className="material-symbols-outlined">
                      how_to_reg
                    </span>
                    <span>Update Staffing Records</span>
                  </button>
                  <p className="text-slate-400 text-[10px] mt-4 uppercase tracking-widest font-bold">
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
