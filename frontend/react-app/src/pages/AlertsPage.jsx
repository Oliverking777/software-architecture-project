import { useState, useEffect } from "react";
import { Card, Badge, Spinner, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn } from "../components/UI.jsx";
import { analyticsAPI } from "../services/api.js";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [investigated, setInvestigated] = useState({});

  useEffect(() => {
    const load = async () => {
      const d = await analyticsAPI.getAlerts();
      setAlerts(d?.alerts || []);
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const filtered = alerts.filter(a => filter === "All" || a.severity === filter);

  const severityBg = {
    CRITICAL: "bg-red-50 border-red-200",
    HIGH:     "bg-orange-50 border-orange-200",
    MEDIUM:   "bg-yellow-50 border-yellow-200",
  };

  const severityIcon = {
    CRITICAL: "🔴",
    HIGH:     "🟠",
    MEDIUM:   "🟡",
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Outbreak Alerts"
        subtitle={`${alerts.length} active signal${alerts.length!==1?"s":""} · analytics-service`}
        action={
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Auto-refresh 15s
          </div>
        }
      />

      <div className="flex gap-2">
        {["All","CRITICAL","HIGH","MEDIUM"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
              ${filter===s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {s} {s !== "All" && alerts.filter(a => a.severity === s).length > 0 &&
              <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                {alerts.filter(a => a.severity === s).length}
              </span>}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">✅</span>
          <p className="font-semibold text-slate-700">No active alerts</p>
          <p className="text-sm text-slate-400 mt-1">
            {alerts.length === 0
              ? "Create patients via API to trigger threshold alerts"
              : "No alerts matching this filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((a, i) => (
            <Card key={i} className={`p-5 border ${severityBg[a.severity] ?? "border-slate-200"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                    ${a.severity==="CRITICAL"?"bg-red-100":"bg-orange-100"}`}>
                    {severityIcon[a.severity] ?? "⚠"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{a.disease}</p>
                    <p className="text-xs text-slate-400">Auto-generated · analytics-service</p>
                  </div>
                </div>
                <Badge level={a.severity} />
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="p-2 bg-white/60 rounded-xl">
                  <p className="text-xs text-slate-400">Region</p>
                  <p className="text-sm font-semibold text-slate-700">📍 {a.region}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-xl">
                  <p className="text-xs text-slate-400">Cases</p>
                  <p className="text-sm font-semibold text-red-600">📊 {a.cases}</p>
                </div>
                <div className="p-2 bg-white/60 rounded-xl">
                  <p className="text-xs text-slate-400">Threshold</p>
                  <p className="text-sm font-semibold text-slate-700">⚡ {a.threshold}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Capacity</span>
                  <span>{Math.round((a.cases/a.threshold)*100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-200">
                  <div className="h-full rounded-full"
                    style={{
                      width:`${Math.min(100, Math.round((a.cases/a.threshold)*100))}%`,
                      background: a.severity==="CRITICAL"?"#EF4444":"#F59E0B"
                    }} />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <p className="text-xs text-slate-500">
                  {a.cases} cases ≥ threshold {a.threshold} · <span className="font-semibold">Deploy rapid response</span>
                </p>
                <button
                  onClick={() => setInvestigated(prev => ({...prev, [i]: !prev[i]}))}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all
                    ${investigated[i]
                      ? "bg-green-50 text-green-600 border-green-200"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {investigated[i] ? "✓ Investigating" : "Investigate"}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && alerts.length === 0 && (
        <Card className="p-5 border border-blue-200 bg-blue-50">
          <p className="text-sm font-semibold text-blue-700 mb-2">💡 How to trigger alerts</p>
          <p className="text-xs text-blue-600">
            Create patients via POST /patient-service — RabbitMQ sends events to analytics-service.
            When cases exceed the threshold (cholera:10, malaria:50, dengue:20, mpox:5, typhoide:15), alerts appear here automatically.
          </p>
        </Card>
      )}
    </div>
  );
}
