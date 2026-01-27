import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AmbulanceUser() {
  const navigate = useNavigate();
  const [ambulanceData, setAmbulanceData] = useState({});
  const [user, setUser] = useState("");
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    const userName = localStorage.getItem("userName");
    const isAuth = localStorage.getItem("adminAuth");

    if (!isAuth || !userName) {
      navigate("/", { replace: true });
      return;
    }

    setUser(userName);

    // Fetch submissions data instead of active incidents
    fetch("/submissions.json")
      .then((res) => res.json())
      .then((data) => setIncidents(data.submissions))
      .catch((error) => console.error("Error loading incidents:", error));
  }, [navigate]);

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
            <div className="bg-primary p-1.5 rounded-lg">
              <span className="material-symbols-outlined text-white text-lg md:text-xl">
                emergency
              </span>
            </div>
            <span className="font-bold text-primary tracking-tight text-xs md:text-base">
              EMS Response System
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-6">
            <button className="bg-primary text-white hover:bg-slate-800 px-3 md:px-6 py-2 rounded-lg font-bold flex items-center gap-1 md:gap-2 transition-all active:scale-95 text-xs md:text-sm">
              <span className="material-symbols-outlined text-lg">call</span>
              <span className="hidden sm:inline">Got a Call?</span>
            </button>
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
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {incidents.length > 0 ? (
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-lg z-10">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-red-600 animate-pulse">
                    emergency_home
                  </span>
                  <h2 className="text-primary font-bold text-lg">
                    Active Incidents
                  </h2>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold">
                  Live Dispatch Feed
                </p>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                {incidents.map((incident) => (
                  <button
                    key={incident.id}
                    className="w-full mb-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-4 hover:bg-slate-50 hover:shadow-2xl transition-all active:scale-95 text-left"
                  >
                    <div className="relative h-32 w-full rounded-lg overflow-hidden mb-3">
                      <img
                        alt={incident.title}
                        className="w-full h-full object-cover grayscale-[0.3]"
                        src={incident.image}
                      />
                    </div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-bold text-primary">
                        {incident.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${
                          incident.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : incident.severity === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <span className="material-symbols-outlined text-lg text-primary">
                        location_on
                      </span>
                      <span className="text-xs font-semibold">
                        {incident.location}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{incident.time}</span>
                      <span className="font-bold text-slate-600">
                        {incident.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </aside>
          ) : (
            // Default sidebar - System Status
            <div className="hidden md:block absolute top-6 left-6 z-10 w-80">
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/50 p-2 w-auto h-auto m-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <h2 className="text-primary font-bold text-lg">
                    System Status
                  </h2>
                </div>
                <div className="py-12 flex flex-col items-center justify-center border-t border-slate-100">
                  <span className="material-symbols-outlined text-primary/20 text-5xl mb-4">
                    check_circle
                  </span>
                  <p className="text-primary font-semibold text-center text-base">
                    No accidents nearby
                  </p>
                  <p className="text-slate-400 text-[11px] text-center mt-2 uppercase tracking-widest font-medium">
                    Scanning Area 4-B
                  </p>
                </div>
              </div>
            </div>
          )}
          <main className="flex-1 relative overflow-hidden m-2 md:m-6 rounded-2xl border border-slate-300/30 shadow-inner">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBRak6cJLOXb-92vwvevsuzRxgdR-r4cd2dWX8IDuUJsy_LFU0VfvHxay6tgf3OAZGEEXOVTINNWmlaBPHeg78elaiExy2j6qi0LP1I-iYS2sAljij_MRUZt5_QbZlUrBvsc1pu9vCyvADpsgVBsIIYZF8elpw1dhAGz_W7xOU5yODJ0HaPhFqUoeoC1LkoxkhbovCdBxpeElO3SVj68RYzIdMSL3wfAXOB_QDp4KVKUr5tWRMGzOlEshO1j1vamZKJE5LadVMOPOM')`,
              }}
            >
              <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
              <div className="absolute top-[35%] left-[50%] flex flex-col items-center opacity-40">
                <div className="bg-slate-400 p-2.5 rounded-full shadow-2xl border-4 border-white">
                  <span className="material-symbols-outlined text-white text-2xl">
                    emergency
                  </span>
                </div>
              </div>
              <div className="absolute top-[60%] left-[35%] flex flex-col items-center">
                <div className="bg-primary p-2.5 rounded-full shadow-2xl border-4 border-white animate-pulse">
                  <span className="material-symbols-outlined text-white text-xl">
                    ambulance
                  </span>
                </div>
                <div className="bg-primary text-white px-3 py-1 rounded shadow-lg mt-2">
                  <span className="text-[10px] font-bold whitespace-nowrap uppercase">
                    AMB-12 (You)
                  </span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AmbulanceUser;
