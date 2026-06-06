import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI, locationAPI, analyticsAPI, reportAPI, geoAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";
// ── ANALYTICS ─────────────────────────────────────────────────
export function AnalyticsPage() {
  const [period, setPeriod] = useState("30D");
  const [stats, setStats] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getStats(),
      analyticsAPI.getThresholds(),
      analyticsAPI.getAlerts(),
    ]).then(([s, t, a]) => {
      if (s) setStats(s);
      if (t) setThresholds(t);
      if (a) setAlerts(a.alerts || []);
      setLoading(false);
    });
    const interval = setInterval(async () => {
      const s = await analyticsAPI.getStats();
      if (s) setStats(s);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const caseEntries = stats?.case_counts ? Object.entries(stats.case_counts) : [];
  const diseaseData = caseEntries.reduce((acc, [key, v]) => {
    const [disease] = key.split(":");
    acc[disease] = (acc[disease]||0) + v;
    return acc;
  }, {});
  const regionData = caseEntries.reduce((acc, [key, v]) => {
    const parts = key.split(":");
    const region = parts[1] || parts[0];
    acc[region] = (acc[region]||0) + v;
    return acc;
  }, {});

  const pieData = Object.entries(diseaseData).map(([name, value]) => ({ name, value }));
  const barData = Object.entries(regionData).map(([region, cases]) => ({ region, cases }));
  const totalCases = Object.values(diseaseData).reduce((a,b)=>a+b,0);

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Analytics & Intelligence" subtitle="Real-time epidemiological analysis from analytics-service."
        action={
          <div className="flex items-center gap-2">
            {["Today","7D","30D","90D","1Y"].map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${period===p?"text-white":"text-slate-500 hover:bg-slate-100"}`}
                style={period===p ? { background:"linear-gradient(135deg, #0EA5E9, #14B8A6)" } : {}}>
                {p}
              </button>
            ))}
          </div>
        }
      />

      {stats && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2 w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live · {stats.total_tracked} disease-region combinations tracked · Auto-refresh 15s
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Total Cases</p>
          <p className="text-2xl font-bold text-sky-600 mt-1">{fmtNum(totalCases)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Via analytics-service</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Active Alerts</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{alerts.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Thresholds exceeded</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Diseases</p>
          <p className="text-2xl font-bold text-teal-600 mt-1">{Object.keys(diseaseData).length || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">Unique tracked</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Regions</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{Object.keys(regionData).length || "—"}</p>
          <p className="text-xs text-slate-400 mt-0.5">With active cases</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-1">Cases by Disease</p>
          <p className="text-xs text-slate-400 mb-4">{pieData.length > 0 ? "Live analytics data" : "No data yet — send cases via RabbitMQ"}</p>
          {loading ? <Spinner /> : pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {pieData.map((_,i) => <Cell key={i} fill={COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1 mt-2">
                {pieData.map((d,i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background:COLORS[i%COLORS.length] }} />
                    <span className="text-xs text-slate-600 flex-1 capitalize">{d.name}</span>
                    <span className="text-xs font-bold text-slate-700">{d.value} cases</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState icon="📊" title="No cases recorded yet" desc="Analytics data appears after RabbitMQ events" />
          )}
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-1">Cases by Region</p>
          <p className="text-xs text-slate-400 mb-4">{barData.length > 0 ? "Live analytics data" : "No data yet"}</p>
          {loading ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:10, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                <Bar dataKey="cases" fill="#0EA5E9" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {thresholds && (
        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-4">Alert Thresholds — Live Configuration</p>
          <div className="grid grid-cols-5 gap-3">
            {Object.entries(thresholds).filter(([k]) => k !== "default").map(([disease, threshold]) => {
              const current = diseaseData[disease] || 0;
              const pct = Math.min(100, Math.round((current / threshold) * 100));
              return (
                <div key={disease} className="p-3 rounded-xl bg-slate-50">
                  <p className="text-xs font-semibold text-slate-600 capitalize">{disease}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{current} <span className="text-xs text-slate-400">/ {threshold}</span></p>
                  <div className="mt-2 h-1.5 rounded-full bg-slate-200">
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: pct>=100?"#EF4444":pct>=75?"#F59E0B":"#0EA5E9" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

export default AnalyticsPage
