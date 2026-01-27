import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";

import AmbulanceUser from "./pages/AmbulanceUser";
import isAuthenticated from "./Hooks/isAuthenticated";
import HospitalAdmin from "./pages/hospitals/HospitalAdmin";
import GuestUser from "./pages/GuestUser";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/ambulance",
    element: (
      <isAuthenticated>
        <AmbulanceUser />
      </isAuthenticated>
    ),
  },
  {
    path: "/hospital",
    element: (
      <isAuthenticated>
        <HospitalAdmin />
      </isAuthenticated>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
