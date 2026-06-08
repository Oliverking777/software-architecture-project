import { useState, useEffect } from "react";
import { Card, Badge, Spinner, Modal, Input, Select, Alert } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI, diseaseAPI, locationAPI } from "../services/api.js";
import { loadManualAlerts as loadManual, saveManualAlerts as saveManual } from "../utils/manualAlerts.js";

const emptyForm = { disease: "", region: "", cases: "", threshold: "", severity: "MEDIUM" };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [manualAlerts, setManualAlerts] = useState(loadManual);
  const [diseaseOptions, setDiseaseOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [investigated, setInvestigated] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  useEffect(() => {
    diseaseAPI.getAll({ size: 100 }).then(d => setDiseaseOptions((d?.content || []).map(x => x.name)));
    locationAPI.getRegions().then(r => { if (r?.regions) setRegionOptions(r.regions); });
  }, []);

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(""), 3000); };

  const allAlerts = [...manualAlerts, ...alerts];

  const filtered = allAlerts.filter(a => {
    const matchSeverity = filter === "All" || a.severity === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || (a.disease||"").toLowerCase().includes(q) || (a.region||"").toLowerCase().includes(q);
    return matchSeverity && matchSearch;
  });

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

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const handleCreate = () => {
    if (!form.disease || !form.region || !form.cases || !form.threshold) {
      setError("All fields are required.");
      return;
    }
    const alert = {
      disease: form.disease,
      region: form.region,
      cases: parseInt(form.cases),
      threshold: parseInt(form.threshold),
      severity: form.severity,
      manual: true,
      createdAt: new Date().toISOString(),
    };
    const next = [alert, ...manualAlerts];
    setManualAlerts(next);
    saveManual(next);
    setShowForm(false);
    flash(setSuccess, "Alert created and logged.");
  };

  const handleDismissManual = (idx) => {
    const next = manualAlerts.filter((_, i) => i !== idx);
    setManualAlerts(next);
    saveManual(next);
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Outbreak Alerts"
        subtitle={`${allAlerts.length} active signal${allAlerts.length!==1?"s":""} · analytics-service`}
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Auto-refresh 15s
            </div>
            <PrimaryBtn onClick={openCreate}>+ Create Alert</PrimaryBtn>
          </div>
        }
      />

      {success && <Alert type="success" message={success} />}

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-80">
          <span className="text-slate-400">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search alerts by disease or region..."
            className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
        </div>
        <div className="flex gap-2">
          {["All","CRITICAL","HIGH","MEDIUM"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all
                ${filter===s ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
              {s} {s !== "All" && allAlerts.filter(a => a.severity === s).length > 0 &&
                <span className="ml-1 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                  {allAlerts.filter(a => a.severity === s).length}
                </span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl mb-4 block">✅</span>
          <p className="font-semibold text-slate-700">No active alerts</p>
          <p className="text-sm text-slate-400 mt-1">
            {allAlerts.length === 0
              ? "Create patients via the Patients page to trigger threshold alerts, or log a manual alert above"
              : "No alerts matching this filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((a, i) => {
            const manualIdx = a.manual ? manualAlerts.indexOf(a) : -1;
            return (
            <Card key={i} className={`p-5 border ${severityBg[a.severity] ?? "border-slate-200"}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                    ${a.severity==="CRITICAL"?"bg-red-100":"bg-orange-100"}`}>
                    {severityIcon[a.severity] ?? "⚠"}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 capitalize">{a.disease}</p>
                    <p className="text-xs text-slate-400">
                      {a.manual ? "Manually logged · this session" : "Auto-generated · analytics-service"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge level={a.severity} />
                  {a.manual && (
                    <button onClick={() => handleDismissManual(manualIdx)}
                      className="text-xs text-slate-400 hover:text-red-500" title="Dismiss">✕</button>
                  )}
                </div>
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
          );})}
        </div>
      )}

      {!loading && alerts.length === 0 && manualAlerts.length === 0 && (
        <Card className="p-5 border border-blue-200 bg-blue-50">
          <p className="text-sm font-semibold text-blue-700 mb-2">💡 How to trigger alerts</p>
          <p className="text-xs text-blue-600">
            Create patients via the Patients page — RabbitMQ sends events to analytics-service.
            When cases exceed the disease threshold, alerts appear here automatically. You can also
            log a manual alert with the "+ Create Alert" button above.
          </p>
        </Card>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Create Alert">
        <div className="space-y-4">
          {diseaseOptions.length > 0 ? (
            <Select label="Disease *" value={form.disease}
              onChange={v=>setForm(f=>({...f,disease:v}))}
              options={[{value:"",label:"Select a disease..."}, ...diseaseOptions.map(d=>({value:d,label:d}))]} />
          ) : (
            <Input label="Disease *" value={form.disease} onChange={v=>setForm(f=>({...f,disease:v}))} placeholder="e.g. cholera" />
          )}
          {regionOptions.length > 0 ? (
            <Select label="Region *" value={form.region}
              onChange={v=>setForm(f=>({...f,region:v}))}
              options={[{value:"",label:"Select a region..."}, ...regionOptions.map(r=>({value:r,label:r}))]} />
          ) : (
            <Input label="Region *" value={form.region} onChange={v=>setForm(f=>({...f,region:v}))} placeholder="e.g. Centre" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input label="Reported Cases *" type="number" value={form.cases} onChange={v=>setForm(f=>({...f,cases:v}))} placeholder="e.g. 24" />
            <Input label="Threshold *" type="number" value={form.threshold} onChange={v=>setForm(f=>({...f,threshold:v}))} placeholder="e.g. 10" />
          </div>
          <Select label="Severity" value={form.severity}
            onChange={v=>setForm(f=>({...f,severity:v}))}
            options={[{value:"MEDIUM",label:"MEDIUM"},{value:"HIGH",label:"HIGH"},{value:"CRITICAL",label:"CRITICAL"}]} />
        </div>
        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
        <p className="text-xs text-slate-400 mt-3">
          Note: analytics-service generates alerts automatically from live case data and has no manual-creation
          endpoint. This alert is logged locally for this session so your team can track it alongside live signals.
        </p>
        <div className="flex gap-3 mt-4">
          <SecondaryBtn onClick={() => setShowForm(false)} className="flex-1">Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleCreate} className="flex-1">Create Alert</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}
