import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI, locationAPI, analyticsAPI, reportAPI, geoAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";

// ── PROFILE ───────────────────────────────────────────────────
export function ProfilePage({ user, onLogout }) {
  return (
    <div className="p-6 max-w-2xl space-y-5">
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
        <div className="grid grid-cols-2 gap-4">
          {[
            { label:"Full Name", value:user?.fullName || "Administrator" },
            { label:"Email",     value:user?.email || "admin@dsas.gov" },
            { label:"Role",      value:user?.role || "ADMIN" },
            { label:"Status",    value:"Active" },
          ].map(f => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{f.label}</label>
              <div className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-slate-50">{f.value}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button onClick={onLogout}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors">
            🚪 Sign Out
          </button>
        </div>
      </Card>
      <Card className="p-5">
        <p className="font-semibold text-slate-700 mb-4">System Architecture</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label:"patient-service",  value:":8082 → /patient-service" },
            { label:"disease-service",  value:":8083 → /disease-service" },
            { label:"location-service", value:":8084 → /location-service" },
            { label:"analytics-service",value:":8085 (Python FastAPI)" },
            { label:"report-service",   value:":8086 (Python FastAPI)" },
            { label:"geo-service",      value:":8088 (Python FastAPI)" },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="text-slate-500 text-xs font-semibold">{s.label}</span>
              <span className="text-slate-700 font-mono text-xs">{s.value}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage
