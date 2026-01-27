import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const currentDate = new Date().getFullYear();

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const isAuth = localStorage.getItem("adminAuth");
    const userType = localStorage.getItem("userType");

    if (isAuth === "true" && userType) {
      if (userType === "hospital") {
        navigate("/hospital", { replace: true });
      } else if (userType === "ambulance") {
        navigate("/ambulance", { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError(""); // Clear error on input change
    if (name === "user") {
      setUser(value);
    } else if (name === "password") {
      setPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Input validation
    if (!user.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      // Fetch hospitals data
      const hospitalsData = await fetch("/hospitals.json").then((r) =>
        r.json(),
      );

      // Fetch ambulances data
      const ambulancesData = await fetch("/ambulances.json").then((r) =>
        r.json(),
      );

      // Check hospitals
      const hospital = hospitalsData.hospitals.find(
        (h) => h.name === user.trim() && h.password === password,
      );
      if (hospital) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("userType", "hospital");
        localStorage.setItem("userName", hospital.name);
        navigate("/hospital", { replace: true });
        return;
      }

      // Check ambulances
      const ambulance = ambulancesData.ambulances.find(
        (a) => a.name === user.trim() && a.password === password,
      );
      if (ambulance) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("userType", "ambulance");
        localStorage.setItem("userName", ambulance.name);
        navigate("/ambulance", { replace: true });
        return;
      }

      // No match found
      setError("Invalid username or password. Please try again.");
      setPassword("");
    } catch (err) {
      setError(
        "Unable to connect. Please check your connection and try again.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilitychange = (e) => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="Main bg-background-light min-h-screen flex flex-col font-display">
      <header className="flex items-center justify-between border-b border-solid border-gray-200 bg-white px-10 py-4 shadow-sm">
        <div className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary text-white rounded-lg">
            <span className="material-symbols-outlined text-2xl">
              medical_services
            </span>
          </div>
          <h2 className="text-primary text-xl font-bold leading-tight tracking-tight">
            Emergency Healthcare System
          </h2>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-120 bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-primary text-2xl font-bold leading-tight mb-2">
                Healthcare Resource Portal
              </h1>
              <p className="text-gray-500 text-sm">
                Secure Access for Hospital Personnel &amp; EMS Professionals
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-lg">
                    error
                  </span>
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-primary text-sm font-semibold px-1">
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                    person
                  </span>
                  <input
                    name="user"
                    value={user}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 bg-accent/10 border border-accent/30 rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-primary text-sm font-semibold">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-primary/50">
                    vpn_key
                  </span>
                  <input
                    className="w-full pl-11 pr-12 py-3.5 bg-accent/10 border border-accent/30 rounded-lg text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••••••"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary flex items-center"
                    type="button"
                    onClick={handleVisibilitychange}
                  >
                    <span className="material-symbols-outlined text-xl">
                      {passwordVisible ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <span className="material-symbols-outlined">login</span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-gray-500">
                Need to report an emergency?
              </p>
              <button
                className="w-full px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-semibold transition-all"
                onClick={() => {
                  navigate("/guest");
                }}
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-6 px-10 flex justify-center items-center text-xs text-gray-400">
        <div className="flex items-center gap-4">
          <span>&copy; {currentDate} Emergency Healthcare Network</span>
        </div>
      </footer>
    </div>
  );
}

export default Login;
