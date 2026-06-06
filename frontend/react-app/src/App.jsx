import { useState, useEffect } from "react";
import { Sidebar, Topbar } from "./components/Layout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import PatientsPage from "./pages/PatientsPage.jsx";
import DiseasesPage from "./pages/DiseasesPage.jsx";
import LocationsPage from "./pages/LocationsPage.jsx";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";
import AlertsPage from "./pages/AlertsPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { analyticsAPI } from "./services/api.js";
import ReportsPage from "./pages/ReportsPage.jsx";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const token = sessionStorage.getItem("dsas_token");
    const userData = sessionStorage.getItem("dsas_user");
    if (token && userData) {
      try { setUser(JSON.parse(userData)); setAuthenticated(true); } catch {}
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const poll = async () => {
      const data = await analyticsAPI.getAlerts();
      if (data) setAlertCount(data.alerts?.length || 0);
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = (token, userData) => {
    sessionStorage.setItem("dsas_token", token);
    sessionStorage.setItem("dsas_user", JSON.stringify(userData));
    setUser(userData);
    setAuthenticated(true);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    setAuthenticated(false);
    setPage("dashboard");
  };

  if (!authenticated) return <LoginPage onLogin={handleLogin} />;

  const pages = {
    dashboard:     <DashboardPage setPage={setPage} />,
    patients:      <PatientsPage user={user} />,
    diseases:      <DiseasesPage />,
    locations:     <LocationsPage />,
    analytics:     <AnalyticsPage />,
    alerts:        <AlertsPage />,
    reports:       <ReportsPage />,
    notifications: <NotificationsPage />,
    profile:       <ProfilePage user={user} onLogout={handleLogout} />,
  };

  return (
    <div className="flex bg-slate-50 min-h-screen">
      <Sidebar active={page} setActive={setPage} alertCount={alertCount} notifCount={3} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Topbar user={user} setPage={setPage} />
        <main className="flex-1 overflow-auto">
          {pages[page] ?? pages.dashboard}
        </main>
      </div>
    </div>
  );
}
