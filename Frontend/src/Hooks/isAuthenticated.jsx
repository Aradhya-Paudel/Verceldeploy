import { Navigate } from "react-router-dom";
import { isAdminLoggedIn } from "./adminAuth";

function isAuthenticated({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default isAuthenticated;
