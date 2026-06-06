import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI, locationAPI, analyticsAPI, reportAPI, geoAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";

// ── DISEASES ──────────────────────────────────────────────────
export function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name:"", description:"", thresholdLimit:"10" });
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    diseaseAPI.getAll({ size:100 }).then(d => {
      setDiseases(d?.content || []);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!form.name) { setError("Disease name is required."); return; }
    const result = await diseaseAPI.create({ ...form, thresholdLimit: parseInt(form.thresholdLimit) });
    if (result) {
      setDiseases(prev => [...prev, result]);
      setSuccess("Disease added!");
      setShowForm(false);
      setForm({ name:"", description:"", thresholdLimit:"10" });
    } else {
      setError("Failed to create disease.");
    }
    setTimeout(() => { setSuccess(""); setError(""); }, 3000);
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Disease Catalog" subtitle={`${diseases.length} diseases tracked`}
        action={<PrimaryBtn onClick={() => setShowForm(true)}>+ New Disease</PrimaryBtn>} />
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}
      {loading ? <Spinner /> : diseases.length === 0 ? (
        <EmptyState icon="🦠" title="No diseases found" desc="Add diseases to start tracking" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {diseases.map((d, i) => (
            <Card key={d.id || i} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <span className="text-red-500 text-lg">🦠</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-400">Threshold: {d.thresholdLimit} cases</p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{d.description || "No description"}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Created: {(d.createdAt||"").split("T")[0]}</span>
                <span className="font-mono text-sky-600">ID: {d.id}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal open={showForm} onClose={() => { setShowForm(false); setError(""); }} title="Add New Disease">
        <div className="space-y-4">
          <Input label="Disease Name *" value={form.name} onChange={v => setForm(f=>({...f,name:v}))} placeholder="e.g. Typhoid" />
          <Input label="Description" value={form.description} onChange={v => setForm(f=>({...f,description:v}))} placeholder="Brief description..." />
          <Input label="Alert Threshold (cases)" value={form.thresholdLimit} onChange={v => setForm(f=>({...f,thresholdLimit:v}))} type="number" placeholder="10" />
        </div>
        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
        <div className="flex gap-3 mt-6">
          <SecondaryBtn onClick={() => setShowForm(false)} className="flex-1">Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleCreate} className="flex-1">Add Disease</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}





export default DiseasesPage
