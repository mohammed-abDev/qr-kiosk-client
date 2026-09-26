import { useState } from "react";

import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(
    Boolean(localStorage.getItem("token")),
  );

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAdmin(false);
  };

  if (!isAdmin) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
}

export default AdminPage;
