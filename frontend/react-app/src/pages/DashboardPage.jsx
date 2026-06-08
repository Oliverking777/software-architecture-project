import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, StatCard, Spinner } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI, geoAPI, patientAPI, diseaseAPI, healthAPI } from "../services/api.js";
import { loadManualAlerts } from "../utils/manualAlerts.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";

const SERVICES = [
  { name:"Analytics",     path:"/api/v1/analytics/stats" },
  { name:"Geo",           path:"/api/v1/geo/regions" },
  { name:"Patients",      path:"/patient-service/stats/total" },
  { name:"Diseases",      path:"/disease-service/count" },
];

const buildWeeklyTrend = (patients) => {
  const days = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    days.push({ key: d.toISOString().split("T")[0], day: d.toLocaleDateString("en-US", { weekday: "short" }), cases: 0 });
  }
  patients.forEach(p => {
    const raw = (p.reportDate || p.reportedAt || "").toString().split("T")[0];
    const match = days.find(d => d.key === raw);
    if (match) match.cases += 1;
  });
  return days;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [analyticsStats, setAnalyticsStats] = useState(null);
  const [analyticsAlerts, setAnalyticsAlerts] = useState([]);
  const [manualAlerts, setManualAlerts] = useState(loadManualAlerts);
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [serviceStatuses, setServiceStatuses] = useState(() => SERVICES.map(s => ({ ...s, status: "checking" })));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [stats, alerts, patientsData, diseasesData, total, healthResults] = await Promise.all([
        analyticsAPI.getStats(),
        analyticsAPI.getAlerts(),
        patientAPI.getAll({ size: 100 }),
        diseaseAPI.getAll({ size: 100 }),
        patientAPI.getTotal(),
        Promise.all(SERVICES.map(s => healthAPI.check(s.path))),
      ]);
      if (stats) setAnalyticsStats(stats);
      if (alerts) setAnalyticsAlerts(alerts.alerts || []);
      if (patientsData?.content) setPatients(patientsData.content);
      if (diseasesData?.content) setDiseases(diseasesData.content);
      if (total !== null) setTotalPatients(total);
      setServiceStatuses(SERVICES.map((s, i) => ({ ...s, status: healthResults[i] ? "up" : "down" })));
      setManualAlerts(loadManualAlerts());
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30000);
    // Manually-logged alerts live in localStorage (set from the Alerts page) — re-read them
    // whenever the tab regains focus so a freshly created alert is reflected here too.
    const onFocus = () => setManualAlerts(loadManualAlerts());
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  const weeklyTrend = buildWeeklyTrend(patients);
  const servicesUp = serviceStatuses.filter(s => s.status === "up").length;

  // Prefer live analytics-service aggregates (same source as the Analytics page) so
  // the figures stay in sync everywhere; fall back to the raw patient list while stats load.
  const caseEntries = analyticsStats?.case_counts ? Object.entries(analyticsStats.case_counts) : [];
  const statsDiseaseMap = caseEntries.reduce((acc, [key, v]) => {
    const [disease] = key.split(":");
    acc[disease] = (acc[disease] || 0) + v;
    return acc;
  }, {});
  const statsRegionMap = caseEntries.reduce((acc, [key, v]) => {
    const parts = key.split(":");
    const region = parts[1] || parts[0];
    acc[region] = (acc[region] || 0) + v;
    return acc;
  }, {});

  const fallbackDiseaseMap = patients.reduce((acc, p) => {
    acc[p.disease] = (acc[p.disease] || 0) + 1;
    return acc;
  }, {});
  const fallbackRegionMap = patients.reduce((acc, p) => {
    acc[p.region] = (acc[p.region] || 0) + 1;
    return acc;
  }, {});

  const diseaseMap = Object.keys(statsDiseaseMap).length > 0 ? statsDiseaseMap : fallbackDiseaseMap;
  const regionMap = Object.keys(statsRegionMap).length > 0 ? statsRegionMap : fallbackRegionMap;

  const diseaseChartData = Object.entries(diseaseMap).map(([name, value]) => ({ name, value }));
  const regionChartData = Object.entries(regionMap).map(([region, cases]) => ({ region, cases }));
  const allAlerts = [...manualAlerts, ...analyticsAlerts];
  const activeAlerts = allAlerts.length;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Executive Dashboard"
        subtitle="Real-time surveillance overview across all regions."
        action={
          <div className="flex gap-2">
            <SecondaryBtn onClick={() => navigate("/reports")}>⬇ Export</SecondaryBtn>
            <PrimaryBtn onClick={() => navigate("/patients")}>+ New Patient</PrimaryBtn>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Patients"  value={fmtNum(totalPatients)}              icon="👥" sub="patient-service"  color="#0EA5E9" />
        <StatCard label="Active Alerts"   value={activeAlerts}                       icon="⚠"  sub="analytics-service" color="#EF4444" />
        <StatCard label="Diseases"        value={diseases.length || "—"}             icon="🦠" sub="Tracked"           color="#14B8A6" />
        <StatCard label="Regions"         value={Object.keys(regionMap).length || "—"} icon="📍" sub="Affected"       color="#F59E0B" />
        <StatCard label="Services"        value={`${servicesUp}/${SERVICES.length}`} icon="✅" sub={servicesUp===SERVICES.length ? "All healthy" : `${SERVICES.length-servicesUp} down`} color={servicesUp===SERVICES.length ? "#10B981" : "#EF4444"} />
        <StatCard label="Monitoring"      value="24/7"                               icon="📡" sub="Continuous"        color="#8B5CF6" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="col-span-2 p-5">
          <p className="font-semibold text-slate-700 mb-0.5">Weekly Case Trend</p>
          <p className="text-xs text-slate-400 mb-4">New cases reported per day — last 7 days · Live from patient-service</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyTrend}>
              <defs>
                <linearGradient id="gC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize:12, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:12, fill:"#94A3B8" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Area type="monotone" dataKey="cases" name="New cases" stroke="#0EA5E9" fill="url(#gC)" strokeWidth={2} dot={{ r:3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-0.5">Disease Distribution</p>
          <p className="text-xs text-slate-400 mb-2">
            {diseaseChartData.length > 0 ? `${diseaseChartData.length} diseases · Live` : "Loading..."}
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
            {regionChartData.length > 0 ? `${regionChartData.length} regions · Live` : "Loading..."}
          </p>
          {regionChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={regionChartData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="region" tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius:12, fontSize:12 }} />
                <Bar dataKey="cases" fill="#0EA5E9" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <Spinner />}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-700">Live Alerts</p>
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Live
            </span>
          </div>
          {allAlerts.length > 0 ? (
            <div className="space-y-2">
              {allAlerts.slice(0,4).map((a, i) => (
                <div key={i} className="flex gap-2.5 p-2 rounded-xl bg-red-50">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 bg-red-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-700 capitalize">{a.disease} — {a.region}</p>
                    <p className="text-xs text-slate-500">{a.cases} cas · <span className={`font-bold ${a.severity==="CRITICAL"?"text-red-600":"text-orange-500"}`}>{a.severity}</span>{a.manual && <span className="text-slate-400 font-normal"> · manual</span>}</p>
                  </div>
                </div>
              ))}
              {allAlerts.length > 4 && (
                <button onClick={() => navigate("/alerts")} className="text-xs text-sky-600 hover:underline w-full text-center">
                  +{allAlerts.length - 4} more alerts →
                </button>
              )}
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
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-slate-700">Service Status</p>
          <span className="flex items-center gap-1 text-xs font-medium text-green-600">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />Auto-refresh 30s
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {serviceStatuses.map(s => (
            <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <span className={`w-2.5 h-2.5 rounded-full ${s.status==="up"?"bg-green-500 animate-pulse":s.status==="down"?"bg-red-500":"bg-yellow-400 animate-pulse"}`} />
              <div>
                <p className="text-xs font-semibold text-slate-700">{s.name}</p>
                <p className="text-xs text-slate-400">{s.path}</p>
              </div>
              <span className={`ml-auto text-xs font-bold ${s.status==="up"?"text-green-600":s.status==="down"?"text-red-500":"text-yellow-600"}`}>
                {s.status==="up"?"UP":s.status==="down"?"DOWN":"..."}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
