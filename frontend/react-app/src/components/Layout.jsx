import { Outlet, useNavigate, useLocation } from 'react-router-dom'

const NAV = [
  { id:"dashboard",     label:"Dashboard",     icon:"⊞" },
  { id:"patients",      label:"Patients",      icon:"👤" },
  { id:"diseases",      label:"Diseases",      icon:"🦠" },
  { id:"locations",     label:"Locations",     icon:"📍" },
  { id:"analytics",     label:"Analytics",     icon:"📊" },
  { id:"alerts",        label:"Alerts",        icon:"🛡", badge:true },
  { id:"reports",       label:"Reports",       icon:"📋" },
  { id:"notifications", label:"Notifications", icon:"🔔", badge:true },
  { id:"profile",       label:"Profile",       icon:"👤" },
];

const Sidebar = ({ alertCount = 0, notifCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname.replace("/", "") || "dashboard";

  return (
    <aside className="w-64 h-screen flex flex-col fixed left-0 top-0 z-30 border-r border-slate-100 bg-white">
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #0EA5E9, #14B8A6)" }}>
          <span className="text-white text-sm font-bold">⚕</span>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm leading-tight">DSAS</p>
          <p className="text-xs text-slate-400">Disease Surveillance</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        {NAV.map(item => {
          const isActive = active === item.id;
          const count = item.id === "alerts" ? alertCount : item.id === "notifications" ? notifCount : 0;
          return (
            <button key={item.id} onClick={() => navigate(`/${item.id}`)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all
                ${isActive ? "bg-sky-50 text-sky-600 font-semibold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
              <span className="text-base w-5 text-center">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && count > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-slate-500">All services running</span>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const now = new Date();
  const dateStr = now.toLocaleDateString("fr-FR", { weekday:"short", day:"numeric", month:"long" });
  const timeStr = now.toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" });
  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 w-80">
          <span className="text-slate-400 text-sm">🔍</span>
          <input placeholder="Search patients, diseases, regions..."
            className="bg-transparent text-sm text-slate-600 outline-none flex-1 placeholder-slate-400" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-xs font-semibold text-slate-700">{dateStr}</p>
          <p className="text-xs text-slate-400">{timeStr} · GMT+1</p>
        </div>
        <button onClick={() => navigate("/notifications")}
          className="relative w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 transition-colors">
          <span>🔔</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/profile")}>
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{(user?.fullName || "A")[0].toUpperCase()}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold text-slate-700">{user?.fullName || "Admin"}</p>
            <p className="text-xs text-slate-400">{user?.role || "Administrator"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const Layout = ({ user, onLogout }) => (
  <div className="flex bg-slate-50 min-h-screen">
    <Sidebar />
    <div className="flex-1 ml-64 flex flex-col">
      <Topbar user={user} onLogout={onLogout} />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  </div>
);

export default Layout;
