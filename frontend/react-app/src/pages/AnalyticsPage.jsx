import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Spinner, EmptyState } from "../components/UI.jsx";
import { PageHeader, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";

const WEEKLY = [
  { day:"Mon", cases:145, recovered:110 },
  { day:"Tue", cases:162, recovered:125 },
  { day:"Wed", cases:178, recovered:140 },
  { day:"Thu", cases:210, recovered:165 },
  { day:"Fri", cases:225, recovered:180 },
  { day:"Sat", cases:198, recovered:160 },
  { day:"Sun", cases:187, recovered:155 },
];

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("30D");
  const [stats, setStats] = useState(null);
  const [thresholds, setThresholds] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [s, t, a] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getThresholds(),
        analyticsAPI.getAlerts(),
      ]);
      if (s) setStats(s);
      if (t) setThresholds(t);
      if (a) setAlerts(a.alerts || []);
      setLoading(false);
    };
    load();
    const interval = setInterval(async () => {
      const s = await analyticsAPI.getStats();
      if (s) setStats(s);
      const a = await analyticsAPI.getAlerts();
      if (a) setAlerts(a.alerts || []);
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
  const totalCases = Object.values(diseaseData).reduce((a,b)=>a+b, 0);

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Analytics & Intelligence"
        subtitle="Real-time epidemiological analysis from analytics-service."
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
          Live · {stats.total_tracked} combinations tracked · Auto-refresh 15s
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total Cases",    value: fmtNum(totalCases),              color:"text-sky-600" },
          { label:"Active Alerts",  value: alerts.length,                   color:"text-red-600" },
          { label:"Diseases",       value: Object.keys(diseaseData).length || "—", color:"text-teal-600" },
          { label:"Regions",        value: Object.keys(regionData).length  || "—", color:"text-amber-600" },
        ].map(s => (
          <Card key={s.label} className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">Via analytics-service</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-1">Cases by Disease</p>
          <p className="text-xs text-slate-400 mb-4">
            {pieData.length > 0 ? "Live from RabbitMQ events" : "No RabbitMQ events yet"}
          </p>
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
            <EmptyState icon="📊" title="No cases recorded yet"
              desc="Create patients via API to trigger RabbitMQ events" />
          )}
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-1">Cases by Region</p>
          <p className="text-xs text-slate-400 mb-4">{barData.length > 0 ? "Live data" : "No data yet"}</p>
          {loading ? <Spinner /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData.length > 0 ? barData : []} barSize={20}>
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
                    <div className="h-full rounded-full" style={{ width:`${pct}%`, background: pct>=100?"#EF4444":pct>=75?"#F59E0B":"#0EA5E9" }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{pct}%</p>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <p className="font-semibold text-slate-700 mb-1">Weekly Pulse</p>
        <p className="text-xs text-slate-400 mb-4">Cases vs recoveries</p>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={WEEKLY}>
            <defs>
              <linearGradient id="gA" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }} />
            <Area type="monotone" dataKey="cases" stroke="#0EA5E9" fill="url(#gA)" strokeWidth={2.5} dot={{ r:3 }} />
            <Area type="monotone" dataKey="recovered" stroke="#10B981" fill="none" strokeWidth={2} dot={{ r:3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
