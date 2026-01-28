import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "./adminAuth";

function IsAuthenticated({ children, allowedRoles = [] }) {
  const isAuth = isAdminLoggedIn();
  const userType = localStorage.getItem("userType");

  // Not logged in - redirect to login
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // Check role-based access if roles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(userType)) {
    // Redirect to appropriate dashboard based on user type
    if (userType === "hospital") {
      return <Navigate to="/hospital" replace />;
    } else if (userType === "ambulance") {
      return <Navigate to="/ambulance" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default IsAuthenticated;
