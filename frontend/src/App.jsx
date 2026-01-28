import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";

import AmbulanceUser from "./pages/AmbulanceUser";
import IsAuthenticated from "./Hooks/isAuthenticated";
import HospitalDashboard from "./pages/hospitals/HospitalDashboard";
import HospitalInventory from "./pages/hospitals/HospitalInventory";
import GuestUser from "./pages/GuestUser";
import HospitalStaff from "./pages/hospitals/HospitalStaff";
import HospitalFleet from "./pages/hospitals/HospitalFleet";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/ambulance",
    element: (
      <IsAuthenticated allowedRoles={["ambulance"]}>
        <AmbulanceUser />
      </IsAuthenticated>
    ),
  },
  {
    path: "/hospital",
    element: (
      <IsAuthenticated allowedRoles={["hospital"]}>
        <HospitalDashboard />
      </IsAuthenticated>
    ),
  },
  {
    path: "/hospital/inventory",
    element: (
      <IsAuthenticated allowedRoles={["hospital"]}>
        <HospitalInventory />
      </IsAuthenticated>
    ),
  },
  {
    path: "/hospital/staff",
    element: (
      <IsAuthenticated allowedRoles={["hospital"]}>
        <HospitalStaff />
      </IsAuthenticated>
    ),
  },
  {
    path: "/hospital/fleet",
    element: (
      <IsAuthenticated allowedRoles={["hospital"]}>
        <HospitalFleet />
      </IsAuthenticated>
    ),
  },
  {
    path: "/guest",
    element: <GuestUser />,
  },
]);

function Amcon() {
  return <RouterProvider router={router} />;
}

export default Amcon;
