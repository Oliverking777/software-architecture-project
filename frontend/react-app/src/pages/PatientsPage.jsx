import { useState, useEffect } from "react";
import { Card, Badge, Spinner, Modal, Input, Select, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { patientAPI, diseaseAPI, locationAPI } from "../services/api.js";

const EMPTY_FORM = { patientCode:"", age:"", gender:"MALE", disease:"", region:"", street:"", symptoms:"", diagnosis:"" };

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [diseaseFilter, setDiseaseFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPatients = async () => {
    setLoading(true);
    const data = await patientAPI.getAll({ page, size: 15 });
    if (data) {
      setPatients(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.totalElements || 0);
    }
    setLoading(false);
  };

  useEffect(() => { loadPatients(); }, [page]);

  useEffect(() => {
    diseaseAPI.getAll({ size: 100 }).then(d => {
      if (d?.content) setDiseases(d.content);
    });
  }, []);

  const handleSubmit = async () => {
    if (!form.age || !form.disease || !form.region || !form.symptoms || !form.diagnosis) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    const result = editPatient
      ? await patientAPI.update(editPatient.id, form)
      : await patientAPI.create({ ...form, age: parseInt(form.age) });
    if (result) {
      setSuccess(editPatient ? "Patient updated!" : "Patient created!");
      setShowForm(false);
      setEditPatient(null);
      setForm(EMPTY_FORM);
      await loadPatients();
    } else {
      setError("Operation failed. Check backend logs.");
    }
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient?")) return;
    await patientAPI.delete(id);
    setPatients(prev => prev.filter(p => p.id !== id));
    setSuccess("Patient deleted");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEdit = (p) => {
    setEditPatient(p);
    setForm({
      patientCode: p.patientCode || "",
      age: String(p.age || ""),
      gender: p.gender || "MALE",
      disease: p.disease || "",
      region: p.region || "",
      street: p.street || "",
      symptoms: p.symptoms || "",
      diagnosis: p.diagnosis || "",
    });
    setShowForm(true);
  };

  const uniqueDiseases = [...new Set(patients.map(p => p.disease).filter(Boolean))];
  const uniqueRegions = [...new Set(patients.map(p => p.region).filter(Boolean))];

  const filtered = patients.filter(p => {
    const s = search.toLowerCase();
    return (!s || (p.patientCode||"").toLowerCase().includes(s) || (p.disease||"").toLowerCase().includes(s) || (p.region||"").toLowerCase().includes(s))
      && (!diseaseFilter || p.disease === diseaseFilter)
      && (!regionFilter || p.region === regionFilter);
  });

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Patient Management" subtitle={`${total} patients in database`}
        action={
          <div className="flex gap-2">
            <SecondaryBtn onClick={loadPatients}>🔄 Refresh</SecondaryBtn>
            <PrimaryBtn onClick={() => { setEditPatient(null); setForm(EMPTY_FORM); setShowForm(true); }}>+ New Patient</PrimaryBtn>
          </div>
        }
      />

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      <Card className="p-4">
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-2.5">
            <span className="text-slate-400">🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search by code, disease, region..."
              className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
          </div>
          <select value={diseaseFilter} onChange={e=>setDiseaseFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none bg-white">
            <option value="">All diseases</option>
            {uniqueDiseases.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={regionFilter} onChange={e=>setRegionFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none bg-white">
            <option value="">All regions</option>
            {uniqueRegions.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {loading ? <Spinner /> : filtered.length === 0 ? (
          <EmptyState icon="👤" title="No patients found" desc="Add a new patient or change filters" />
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Code","Disease","Region","District","Age","Gender","Date","Actions"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id||i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">{p.patientCode}</td>
                    <td className="px-4 py-3 font-semibold text-slate-700">{p.disease}</td>
                    <td className="px-4 py-3 text-slate-600">{p.region}</td>
                    <td className="px-4 py-3 text-sky-600">{p.street || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{p.age}</td>
                    <td className="px-4 py-3 text-slate-600">{p.gender}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{(p.reportDate||p.reportedAt||"").toString().split("T")[0]}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(p)} className="text-slate-400 hover:text-amber-500 transition-colors">✏</button>
                        <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-red-500 transition-colors">🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100">
                <p className="text-xs text-slate-500">Page {page+1} of {totalPages} · {total} total</p>
                <div className="flex gap-2">
                  <button disabled={page===0} onClick={()=>setPage(p=>p-1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-50">← Prev</button>
                  <button disabled={page>=totalPages-1} onClick={()=>setPage(p=>p+1)}
                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs disabled:opacity-40 hover:bg-slate-50">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditPatient(null); setError(""); }}
        title={editPatient ? "Edit Patient" : "New Patient Case"}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Age *" value={form.age} onChange={v=>setForm(f=>({...f,age:v}))} placeholder="25" type="number" />
          <Select label="Gender *" value={form.gender} onChange={v=>setForm(f=>({...f,gender:v}))} options={["MALE","FEMALE","OTHER"]} />
          <Select label="Disease *" value={form.disease} onChange={v=>setForm(f=>({...f,disease:v}))}
            options={[{value:"",label:"Select disease..."}, ...diseases.map(d=>({value:d.name,label:d.name}))]} />
          <Select label="Region *" value={form.region} onChange={v=>setForm(f=>({...f,region:v}))}
            options={[{value:"",label:"Select region..."}, ...uniqueRegions.map(r=>({value:r,label:r}))]} />
          <Input label="District/Street" value={form.street} onChange={v=>setForm(f=>({...f,street:v}))} placeholder="Douala III" />
          <Input label="Patient Code" value={form.patientCode} onChange={v=>setForm(f=>({...f,patientCode:v}))} placeholder="Auto-generated" />
          <div className="col-span-2">
            <Input label="Symptoms *" value={form.symptoms} onChange={v=>setForm(f=>({...f,symptoms:v}))} placeholder="Fever, vomiting..." />
          </div>
          <div className="col-span-2">
            <Input label="Diagnosis *" value={form.diagnosis} onChange={v=>setForm(f=>({...f,diagnosis:v}))} placeholder="Confirmed cholera..." />
          </div>
        </div>
        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
        <div className="flex gap-3 mt-6">
          <SecondaryBtn onClick={()=>{setShowForm(false);setEditPatient(null);}} className="flex-1">Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleSubmit} disabled={saving} className="flex-1">
            {saving ? "Saving..." : editPatient ? "Update" : "Save Patient"}
          </PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}
