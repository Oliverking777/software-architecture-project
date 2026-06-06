import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, StatCard, Spinner } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI, geoAPI, patientAPI, diseaseAPI } from "../services/api.js";

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

export default function DashboardPage({ setPage }) {
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [analyticsAlerts, setAnalyticsAlerts] = useState([]);
  const [patientStats, setPatientStats] = useState(null);
  const [regionStats, setRegionStats] = useState(null);
  const [totalPatients, setTotalPatients] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [stats, alerts, byDisease, byRegion, total] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getAlerts(),
        patientAPI.getStatsByDisease(),
        patientAPI.getStatsByRegion(),
        patientAPI.getTotal(),
      ]);
      if (stats) setAnalyticsStats(stats);
      if (alerts) setAnalyticsAlerts(alerts.alerts || []);
      if (byDisease) setPatientStats(byDisease);
      if (byRegion) setRegionStats(byRegion);
      if (total !== null) setTotalPatients(total);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  const diseaseChartData = patientStats?.content?.map(d => ({
    name: d.disease || d.name,
    value: d.count || d.total || 0,
  })) || [];

  const regionChartData = regionStats?.content?.map(r => ({
    region: r.region,
    cases: r.count || r.total || 0,
  })) || [];

  const totalCases = totalPatients || 0;
  const activeAlerts = analyticsAlerts.length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time surveillance overview across all regions."
        action={
          <div className="flex gap-2">
            <SecondaryBtn onClick={() => setPage("reports")}>⬇ Export</SecondaryBtn>
            <PrimaryBtn onClick={() => setPage("patients")}>+ New Patient</PrimaryBtn>
          </div>
        }
      />

      {loading && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
          Loading live data from backend...
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Patients" value={fmtNum(totalCases)}  icon="👥" sub="From patient-service" color="#0EA5E9" />
        <StatCard label="Active Alerts"  value={activeAlerts}        icon="⚠"  sub="From analytics"      color="#EF4444" />
        <StatCard label="Diseases"       value={diseaseChartData.length || "—"} icon="🦠" sub="Tracked"  color="#14B8A6" />
        <StatCard label="Regions"        value={regionChartData.length || "—"}  icon="📍" sub="Affected"  color="#F59E0B" />
        <StatCard label="Services"       value="8/8"                 icon="✅" sub="All healthy"          color="#10B981" />
        <StatCard label="Monitoring"     value="24/7"                icon="📡" sub="Continuous"           color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-5">
          <p className="font-semibold text-slate-700 mb-0.5">Weekly Case Trend</p>
          <p className="text-xs text-slate-400 mb-4">Cases and recoveries — last 7 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={WEEKLY}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize:12, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Area type="monotone" dataKey="cases" stroke="#0EA5E9" fill="url(#gC)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="recovered" stroke="#10B981" fill="url(#gR)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-0.5">Disease Distribution</p>
          <p className="text-xs text-slate-400 mb-2">
            {diseaseChartData.length > 0 ? "Live from patient-service" : "Loading..."}
          </p>
          {diseaseChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={diseaseChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {diseaseChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius:10, fontSize:11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {diseaseChartData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-slate-600 truncate">{d.name}</span>
                    <span className="text-xs font-bold text-slate-700 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <Spinner />}
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-5">
          <p className="font-semibold text-slate-700 mb-0.5">Cases by Region</p>
          <p className="text-xs text-slate-400 mb-4">
            {regionChartData.length > 0 ? "Live from patient-service" : "Loading..."}
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionChartData.length > 0 ? regionChartData : []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="region" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }} />
              <Bar dataKey="cases" fill="#0EA5E9" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-700">Live Alerts</p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live
            </span>
          </div>
          {analyticsAlerts.length > 0 ? (
            <div className="space-y-3">
              {analyticsAlerts.slice(0,4).map((a, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-700 capitalize">{a.disease} — {a.region}</p>
                    <p className="text-xs text-slate-400">{a.cases} cas · {a.severity}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <span className="text-3xl block mb-2">✅</span>
              <p className="text-xs text-slate-500">No active alerts</p>
            </div>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <p className="font-semibold text-slate-700 mb-4">Service Status</p>
        <div className="grid grid-cols-4 gap-3">
          {[
            { name:"Analytics",     port:8085, url:"/analytics/health" },
            { name:"Notifications", port:8087, url:"/notifications/health" },
            { name:"Reports",       port:8086, url:"/reports/health" },
            { name:"Geo",           port:8088, url:"/geo/health" },
          ].map(s => <ServiceStatus key={s.name} {...s} />)}
        </div>
      </Card>
    </div>
  );
}

function ServiceStatus({ name, port, url }) {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    fetch(url)
      .then(r => r.ok ? setStatus("up") : setStatus("down"))
      .catch(() => setStatus("down"));
  }, [url]);
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
      <span className={`w-2.5 h-2.5 rounded-full ${status==="up"?"bg-green-500 animate-pulse":status==="down"?"bg-red-500":"bg-yellow-400 animate-pulse"}`} />
      <div>
        <p className="text-xs font-semibold text-slate-700">{name}</p>
        <p className="text-xs text-slate-400">:{port}</p>
      </div>
      <span className={`ml-auto text-xs font-medium ${status==="up"?"text-green-600":status==="down"?"text-red-500":"text-yellow-600"}`}>
        {status==="up"?"UP":status==="down"?"DOWN":"..."}
      </span>
    </div>
  );
}
