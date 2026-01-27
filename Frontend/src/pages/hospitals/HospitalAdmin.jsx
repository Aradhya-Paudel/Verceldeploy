import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function HospitalAdmin() {
  const { id } = useParams();
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userAvatarUrl =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAznK4Z6bAxZgs6fcy-L7t74V4PiEJ370LX_cCud0cr1VAc-o85wtbdeYFkWUGW10giLXaykhB_FlGKTV3iyz0PKJXRVrQ_rZcGWI-cwre6-yDLpWYagksKCsfl3nd67fFcdVWT7U-Jpa6Tl_l1Q9fHmut1hLpytx4-6eRhzAsihyrNG5IHPoQ9oukaQkyNRfgFes0jM4gnceJ2V7xjfh5xR4M3WkPMGd_JSgexHtXMRrZLnGSP0FUI3Ibt1GwPjrTioOKZ30ZQ9ms";

  // Load hospital data from JSON based on ID
  useEffect(() => {
    const loadHospitalData = async () => {
      try {
        const response = await fetch("/hospitals.json");
        const data = await response.json();
        // Find hospital by ID from URL params
        const hospitalId = id || data.hospitals[0].id; // Default to first hospital if no ID provided
        const selectedHospital = data.hospitals.find(
          (h) => h.id === hospitalId,
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
  }, [id]);

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
              <span className="material-symbols-outlined block">logout</span>
            </div>
            <div>
              <h1 className="text-primary text-sm font-bold leading-tight">
                {hospital.name}
              </h1>
              <p className="text-slate-500 text-xs font-medium">
                Logout
              </p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary text-white"
              href="#"
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              href="#"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="text-sm font-medium">Inventory</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              href="#"
            >
              <span className="material-symbols-outlined">ambulance</span>
              <span className="text-sm font-medium">Fleet Management</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              href="#"
            >
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-medium">Staffing</span>
            </a>
            <a
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100"
              href="#"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="text-sm font-medium">Alerts</span>
            </a>
          </nav>
          <div className="p-4 border-t border-slate-200">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-sm">
                campaign
              </span>
              <span>Emergency Mode</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-6 flex-1">
              <h2 className="text-primary text-lg font-bold">
                Hospital Resource Management
              </h2>
              <div className="max-w-md w-full relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                  search
                </span>
                <input
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
                  placeholder="Search resources, units, or patients..."
                  type="text"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <span className="material-symbols-outlined">translate</span>
              </button>
              <button className="p-2 rounded-lg bg-slate-100 text-slate-600 relative">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <div
                className="h-8 w-8 rounded-full bg-cover bg-center border border-slate-200"
                style={{ backgroundImage: `url('${userAvatarUrl}')` }}
                title="User profile avatar circle"
              ></div>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50 space-y-8">
            <div className="grid grid-cols-1 gap-4">
              {hospital.alerts &&
                hospital.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="bg-red-50 border border-red-200 p-4 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-600 font-bold">
                        warning
                      </span>
                      <p className="text-red-600 font-bold text-sm tracking-tight">
                        {alert.message}
                      </p>
                    </div>
                    <button className="text-xs font-bold text-red-600 underline">
                      Acknowledge
                    </button>
                  </div>
                ))}
            </div>
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
                    Active Specialties
                  </h3>
                  <span className="material-symbols-outlined text-blue-600">
                    medical_services
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">
                    {hospital.specialties.active}
                  </span>
                </div>
                <p className="text-slate-600 text-xs mt-2">
                  Available departments
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 bg-slate-100">
                    <h3 className="text-slate-900 font-bold">
                      Quick Resource Update
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Update Bed Availability
                      </label>
                      <div className="flex gap-2">
                        <select className="flex-1 rounded-lg border border-slate-300 bg-white text-sm">
                          <option>General Ward</option>
                          <option>ICU</option>
                          <option>Emergency Room</option>
                        </select>
                        <input
                          className="w-20 rounded-lg border border-slate-300 bg-white text-sm"
                          type="number"
                          defaultValue="30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 uppercase">
                        Specialty Status
                      </label>
                      <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-lg">
                        <span className="text-sm font-medium text-slate-900">
                          Cardiology Department
                        </span>
                        <div className="w-10 h-5 bg-green-500 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                        Apply Changes
                      </button>
                    </div>
                  </div>
                </section>
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
                  <div className="p-4">
                    <div className="grid grid-cols-[32px_1fr] gap-x-4">
                      {hospital.incomingAmbulances &&
                        hospital.incomingAmbulances.map((ambulance, index) => (
                          <div key={index}>
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={
                                  index === 0
                                    ? "text-red-600"
                                    : "text-slate-400"
                                }
                              >
                                <span className="material-symbols-outlined">
                                  ambulance
                                </span>
                              </div>
                              {index <
                                hospital.incomingAmbulances.length - 1 && (
                                <div className="w-0.5 bg-slate-200 h-8"></div>
                              )}
                            </div>
                            <div className="flex flex-col pb-6">
                              <div className="flex justify-between items-start">
                                <p
                                  className={`text-sm font-bold ${index === 0 ? "text-red-600" : "text-blue-600"}`}
                                >
                                  {ambulance.ambulanceId}
                                </p>
                                <span
                                  className={`text-xs font-bold ${index === 0 ? "text-red-600" : "text-blue-600"}`}
                                >
                                  {ambulance.eta}m ETA
                                </span>
                              </div>
                              <p className="text-slate-600 text-xs mt-0.5">
                                {ambulance.caseType} - Priority{" "}
                                {ambulance.priority}
                              </p>
                              <div className="mt-2 h-1 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${index === 0 ? "bg-red-500" : "bg-blue-600"}`}
                                  style={{ width: `${ambulance.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div className="bg-slate-100 p-4">
                    <button className="w-full text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1">
                      <span>VIEW LIVE TRACKER MAP</span>
                      <span className="material-symbols-outlined text-sm">
                        open_in_new
                      </span>
                    </button>
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

export default HospitalAdmin;
