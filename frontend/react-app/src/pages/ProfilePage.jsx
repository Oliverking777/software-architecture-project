import { useState, useEffect } from "react";
import { Card, Badge, Input, Alert, StatCard } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { patientAPI, analyticsAPI, diseaseAPI } from "../services/api.js";

export default function ProfilePage({ user, onLogout }) {
  const [accountForm, setAccountForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    role: user?.role || "ADMIN",
    organization: "Disease Surveillance & Alert System",
  });
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [accountMsg, setAccountMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);
  const [stats, setStats] = useState({ patients: null, alerts: null, diseases: null });

  useEffect(() => {
    Promise.all([
      patientAPI.getTotal(),
      analyticsAPI.getAlerts(),
      diseaseAPI.getAll({ size: 1 }),
    ]).then(([total, alerts, diseases]) => {
      setStats({
        patients: typeof total === "number" ? total : (total ?? "—"),
        alerts: alerts?.count ?? alerts?.alerts?.length ?? 0,
        diseases: diseases?.totalElements ?? diseases?.content?.length ?? "—",
      });
    });
  }, []);

  const flash = (setter, msg, type="success") => {
    setter({ type, msg });
    setTimeout(() => setter(null), 3500);
  };

  const handleSaveAccount = () => {
    if (!accountForm.fullName || !accountForm.email) {
      flash(setAccountMsg, "Full name and email are required.", "error");
      return;
    }
    try {
      const stored = JSON.parse(sessionStorage.getItem("dsas_user") || "{}");
      const updated = { ...stored, fullName: accountForm.fullName, email: accountForm.email };
      sessionStorage.setItem("dsas_user", JSON.stringify(updated));
    } catch {}
    flash(setAccountMsg, "Account information saved (auth-service has no profile-update endpoint yet — changes are kept for this session).");
  };

  const handleChangePassword = () => {
    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      flash(setPwMsg, "Please fill in all password fields.", "error");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      flash(setPwMsg, "New password and confirmation do not match.", "error");
      return;
    }
    if (pwForm.next.length < 8) {
      flash(setPwMsg, "New password must be at least 8 characters.", "error");
      return;
    }
    flash(setPwMsg, "Password change request validated. auth-service does not yet expose a change-password endpoint — ask an administrator to update it directly.");
    setPwForm({ current: "", next: "", confirm: "" });
  };

  return (
    <div className="p-6 max-w-3xl space-y-5">
      <PageHeader title="Profile" subtitle="Your account information" />

      <Card className="p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-sky-500 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">
              {(user?.fullName || "A")[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-slate-800">{user?.fullName || "Administrator"}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <div className="mt-1"><Badge level={user?.role || "ADMIN"} /></div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Patients" value={stats.patients ?? "—"} icon="👥" color="#0EA5E9" sub="patient-service" />
          <StatCard label="Active Alerts" value={stats.alerts ?? "—"} icon="🚨" color="#EF4444" sub="analytics-service" />
          <StatCard label="Diseases Tracked" value={stats.diseases ?? "—"} icon="🦠" color="#10B981" sub="disease-service" />
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-semibold text-slate-700 mb-4">Account Information</p>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full Name" value={accountForm.fullName} onChange={v=>setAccountForm(f=>({...f,fullName:v}))} />
          <Input label="Email" type="email" value={accountForm.email} onChange={v=>setAccountForm(f=>({...f,email:v}))} />
          <Input label="Role" value={accountForm.role} onChange={v=>setAccountForm(f=>({...f,role:v}))} />
          <Input label="Organization" value={accountForm.organization} onChange={v=>setAccountForm(f=>({...f,organization:v}))} />
        </div>
        {accountMsg && <div className="mt-4"><Alert type={accountMsg.type} message={accountMsg.msg} /></div>}
        <div className="mt-5">
          <PrimaryBtn onClick={handleSaveAccount}>Save changes</PrimaryBtn>
        </div>
      </Card>

      <Card className="p-6">
        <p className="font-semibold text-slate-700 mb-4">Change Password</p>
        <div className="grid grid-cols-1 gap-4 max-w-sm">
          <Input label="Current Password" type="password" value={pwForm.current} onChange={v=>setPwForm(f=>({...f,current:v}))} />
          <Input label="New Password" type="password" value={pwForm.next} onChange={v=>setPwForm(f=>({...f,next:v}))} />
          <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={v=>setPwForm(f=>({...f,confirm:v}))} />
        </div>
        {pwMsg && <div className="mt-4 max-w-sm"><Alert type={pwMsg.type} message={pwMsg.msg} /></div>}
        <div className="mt-5">
          <PrimaryBtn onClick={handleChangePassword}>Update password</PrimaryBtn>
        </div>
      </Card>

      <Card className="p-5">
        <p className="font-semibold text-slate-700 mb-4">System Architecture</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label:"api-gateway",        value:":8080 → Point d'entree JWT" },
            { label:"auth-service",       value:":8081 → /auth-service/**" },
            { label:"patient-service",    value:":8082 → /patient-service/**" },
            { label:"disease-service",    value:":8083 → /disease-service/**" },
            { label:"location-service",   value:":8084 → /location-service/**" },
            { label:"analytics-service",  value:":8085 (Python FastAPI)" },
            { label:"report-service",     value:":8086 (Python FastAPI)" },
            { label:"geo-service",        value:":8088 (Python FastAPI)" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500 text-xs font-semibold">{s.label}</span>
              <span className="text-slate-700 font-mono text-xs">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <button onClick={onLogout}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
          🚪 Sign Out
        </button>
      </Card>
    </div>
  );
}
