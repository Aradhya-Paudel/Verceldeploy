import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ambulanceLogin, hospitalLogin } from "../services/api";

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
      // Try hospital login first
      const hospitalResult = await hospitalLogin(user.trim(), password);
      if (hospitalResult.success) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("userType", "hospital");
        localStorage.setItem("userName", hospitalResult.data.name);
        localStorage.setItem(
          "hospitalData",
          JSON.stringify(hospitalResult.data),
        );
        navigate("/hospital", { replace: true });
        return;
      }

      // Try ambulance login
      const ambulanceResult = await ambulanceLogin(user.trim(), password);
      if (ambulanceResult.success) {
        localStorage.setItem("adminAuth", "true");
        localStorage.setItem("userType", "ambulance");
        localStorage.setItem("userName", ambulanceResult.data.name);
        localStorage.setItem(
          "ambulanceData",
          JSON.stringify(ambulanceResult.data),
        );
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
      <header className="flex items-center justify-between border-b border-solid border-gray-200 bg-white px-4 sm:px-6 md:px-10 py-3 sm:py-4 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-3 text-primary">
          <div className="size-7 sm:size-8 flex items-center justify-center text-white rounded-lg shrink-0">
            <img src="../public/logo.webp" className=" rounded-xl" alt="" />
          </div>
          <h2 className="text-primary text-base sm:text-lg md:text-xl font-bold leading-tight tracking-tight truncate">
            Bachaoo
          </h2>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-5 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-primary text-xl sm:text-5xl font-bold leading-tight mb-2">
                Bachaoo Login
              </h1>
            </div>
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 sm:p-3 flex items-start sm:items-center gap-2">
                  <span className="material-symbols-outlined text-red-600 text-base sm:text-lg shrink-0 mt-0.5 sm:mt-0">
                    error
                  </span>
                  <p className="text-red-700 text-xs sm:text-sm font-medium">
                    {error}
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <label className="text-primary text-xs sm:text-sm font-semibold px-1">
                  Username
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary/50 text-lg sm:text-xl">
                    person
                  </span>
                  <input
                    name="user"
                    value={user}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-3 sm:py-3.5 bg-accent/10 border border-accent/30 rounded-lg text-sm sm:text-base text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-primary text-xs sm:text-sm font-semibold">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-primary/50 text-lg sm:text-xl">
                    vpn_key
                  </span>
                  <input
                    className="w-full pl-9 sm:pl-11 pr-10 sm:pr-12 py-3 sm:py-3.5 bg-accent/10 border border-accent/30 rounded-lg text-sm sm:text-base text-primary placeholder:text-primary/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="••••••••••••"
                    type={passwordVisible ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-primary/50 hover:text-primary flex items-center p-1"
                    type="button"
                    onClick={handleVisibilitychange}
                  >
                    <span className="material-symbols-outlined text-lg sm:text-xl">
                      {passwordVisible ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              <button
                className="w-full py-3 sm:py-4 bg-primary hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed text-white rounded-lg font-bold text-base sm:text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-2"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-lg sm:text-xl">
                      progress_activity
                    </span>
                    <span className="text-sm sm:text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="text-sm sm:text-base">Login</span>
                    <span className="material-symbols-outlined text-lg sm:text-xl">
                      login
                    </span>
                  </>
                )}
              </button>
            </form>
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-100 flex flex-col items-center gap-3 sm:gap-4 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                Need to report an emergency?
              </p>
              <button
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg text-xs sm:text-sm font-semibold transition-all active:scale-[0.98]"
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
      <footer className="py-4 sm:py-6 px-4 sm:px-10 flex justify-center items-center text-[10px] sm:text-xs text-gray-400">
        <div className="flex items-center gap-2 sm:gap-4 text-center">
          <span>&copy; {currentDate} Bachaoo</span>
        </div>
      </footer>
    </div>
  );
}

export default Login;
