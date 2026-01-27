export const isAdminLoggedIn = () => {
  return localStorage.getItem("adminAuth") === "true";
};
