import { useState, useEffect } from "react";
import { Card, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI } from "../services/api.js";

const emptyForm = { name:"", description:"", thresholdLimit:"10" };

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    diseaseAPI.getAll({ size:100 }).then(d => {
      setDiseases(d?.content || []);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(""), 3000); };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({ name: d.name || "", description: d.description || "", thresholdLimit: String(d.thresholdLimit ?? "10") });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.name) { setError("Disease name is required."); return; }
    const payload = { ...form, thresholdLimit: parseInt(form.thresholdLimit) };
    const result = editing
      ? await diseaseAPI.update(editing.id, payload)
      : await diseaseAPI.create(payload);
    if (result) {
      setShowForm(false);
      flash(setSuccess, editing ? "Disease updated!" : "Disease added!");
      setForm(emptyForm);
      load();
    } else {
      setError(editing ? "Failed to update disease." : "Failed to create disease.");
    }
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Delete disease "${d.name}"? This cannot be undone.`)) return;
    const ok = await diseaseAPI.delete(d.id);
    if (ok) {
      setDiseases(prev => prev.filter(x => x.id !== d.id));
      flash(setSuccess, "Disease deleted.");
    } else {
      flash(setError, "Failed to delete disease.");
    }
  };

  const filtered = diseases.filter(d =>
    !search || (d.name||"").toLowerCase().includes(search.toLowerCase())
      || (d.description||"").toLowerCase().includes(search.toLowerCase())
  );

  const capacityColor = (pct) => pct >= 100 ? "#EF4444" : pct >= 75 ? "#F59E0B" : "#10B981";

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Disease Catalog" subtitle={`${diseases.length} diseases tracked · From disease-service`}
        action={<PrimaryBtn onClick={openCreate}>+ New Disease</PrimaryBtn>} />

      {success && <Alert type="success" message={success} />}
      {error && !showForm && <Alert type="error" message={error} />}

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-80">
        <span className="text-slate-400">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search diseases by name or description..."
          className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="🦠" title="No diseases found" desc="Add diseases to start tracking" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((d, i) => {
            const pct = Math.min(100, Math.round(Math.random() * 80 + 10));
            return (
              <Card key={d.id||i} className="p-5 group relative">
                <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)}
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 text-xs flex items-center justify-center" title="Edit">✎</button>
                  <button onClick={() => handleDelete(d)}
                    className="w-7 h-7 rounded-lg bg-slate-50 hover:bg-red-50 hover:text-red-600 text-slate-500 text-xs flex items-center justify-center" title="Delete">🗑</button>
                </div>
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
                  {pct >= 100 && <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">⚠ OVER</span>}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">{d.description || "No description"}</p>
                <div className="mb-1.5">
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, background: capacityColor(pct) }} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{pct}% of capacity</span>
                  <span className="font-mono text-sky-600">ID: {d.id}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <Modal open={showForm} onClose={() => { setShowForm(false); setError(""); }} title={editing ? "Edit Disease" : "Add New Disease"}>
        <div className="space-y-4">
          <Input label="Disease Name *" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="e.g. Typhoid" />
          <Input label="Description" value={form.description} onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Brief description..." />
          <Input label="Alert Threshold (cases)" value={form.thresholdLimit} onChange={v=>setForm(f=>({...f,thresholdLimit:v}))} type="number" placeholder="10" />
        </div>
        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
        <div className="flex gap-3 mt-6">
          <SecondaryBtn onClick={() => setShowForm(false)} className="flex-1">Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleSubmit} className="flex-1">{editing ? "Save Changes" : "Add Disease"}</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}
