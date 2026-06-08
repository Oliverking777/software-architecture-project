import { useState, useEffect } from "react";
import { Card, Spinner, EmptyState, Modal, Input, Select, Alert } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { locationAPI, geoAPI } from "../services/api.js";
import GeoMap from "../components/GeoMap.jsx";
import { loadManualAlerts } from "../utils/manualAlerts.js";

const CAMEROON_REGIONS = [
  "Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral",
  "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest",
];

const emptyForm = { region: "", district: "", latitude: "", longitude: "" };
const ALERT_SEVERITY_TO_GEO = { CRITICAL: "high", HIGH: "high", MEDIUM: "medium" };

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [geoRegions, setGeoRegions] = useState([]);
  const [mapPoints, setMapPoints] = useState([]);
  const [manualAlerts, setManualAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([
      locationAPI.getAll({ size: 100 }),
      geoAPI.getRegions(),
      geoAPI.getMap(),
    ]).then(([locs, geo, map]) => {
      if (locs?.content) setLocations(locs.content);
      if (geo?.regions) setGeoRegions(geo.regions);
      if (map?.points) setMapPoints(map.points);
      setManualAlerts(loadManualAlerts());
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    const onFocus = () => setManualAlerts(loadManualAlerts());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const manualMapPoints = manualAlerts.map(a => {
    const match = locations.find(l => (l.region || "").toLowerCase() === (a.region || "").toLowerCase())
      || geoRegions.find(r => (r.region || "").toLowerCase() === (a.region || "").toLowerCase());
    const lat = match?.latitude ?? match?.coordinates?.lat;
    const lon = match?.longitude ?? match?.coordinates?.lon;
    if (lat == null || lon == null) return null;
    return {
      region: a.region,
      district: match?.district || match?.districts?.[0] || "",
      lat, lon,
      cases: a.cases,
      severity: ALERT_SEVERITY_TO_GEO[a.severity] || "medium",
      disease: a.disease,
      manual: true,
    };
  }).filter(Boolean);

  const combinedMapPoints = [...mapPoints, ...manualMapPoints];

  const flash = (setter, msg) => { setter(msg); setTimeout(() => setter(""), 3000); };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (loc) => {
    setEditing(loc);
    setForm({
      region: loc.region || "",
      district: loc.district || "",
      latitude: loc.latitude ?? "",
      longitude: loc.longitude ?? "",
    });
    setError("");
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.region || !form.district) { setError("Region and district are required."); return; }
    const payload = {
      region: form.region,
      district: form.district,
      latitude: form.latitude === "" ? null : parseFloat(form.latitude),
      longitude: form.longitude === "" ? null : parseFloat(form.longitude),
    };
    const result = editing
      ? await locationAPI.update(editing.id, payload)
      : await locationAPI.create(payload);
    if (result) {
      setShowForm(false);
      flash(setSuccess, editing ? "Location updated!" : "Location added!");
      load();
    } else {
      setError(editing ? "Failed to update location." : "Failed to create location.");
    }
  };

  const handleDelete = async (loc) => {
    if (!window.confirm(`Delete location "${loc.region} / ${loc.district}"?`)) return;
    const ok = await locationAPI.delete(loc.id);
    if (ok) {
      setLocations(prev => prev.filter(l => l.id !== loc.id));
      flash(setSuccess, "Location deleted.");
    } else {
      flash(setError, "Failed to delete location.");
    }
  };

  // Always propose the 10 official regions of Cameroon: real locations are shown as-is,
  // and any region with no recorded location yet gets a read-only placeholder card
  // (using geo-service coordinates when available).
  const presentRegions = new Set(locations.map(l => (l.region || "").toLowerCase()));
  const regionStubs = CAMEROON_REGIONS
    .filter(r => !presentRegions.has(r.toLowerCase()))
    .map(r => {
      const geo = geoRegions.find(g => (g.region || "").toLowerCase() === r.toLowerCase());
      return {
        id: `region-${r}`,
        region: r,
        district: geo?.districts?.[0] || "No location recorded yet",
        latitude: geo?.coordinates?.lat ?? null,
        longitude: geo?.coordinates?.lon ?? null,
        readOnly: true,
      };
    });
  const displayData = [...locations, ...regionStubs];

  const filtered = displayData.filter(l =>
    !search || (l.region||"").toLowerCase().includes(search.toLowerCase())
      || (l.district||"").toLowerCase().includes(search.toLowerCase())
  );

  const GRADIENTS = [
    "linear-gradient(135deg, #0EA5E9 0%, #14B8A6 100%)",
    "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    "linear-gradient(135deg, #10B981 0%, #0EA5E9 100%)",
    "linear-gradient(135deg, #EF4444 0%, #F59E0B 100%)",
    "linear-gradient(135deg, #14B8A6 0%, #8B5CF6 100%)",
    "linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)",
    "linear-gradient(135deg, #10B981 0%, #F59E0B 100%)",
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Locations & Regions"
        subtitle={`${displayData.length} locations · location-service + geo-service`}
        action={<PrimaryBtn onClick={openCreate}>+ New Location</PrimaryBtn>} />

      {success && <Alert type="success" message={success} />}
      {error && !showForm && <Alert type="error" message={error} />}

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-80">
        <span className="text-slate-400">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by region or district..."
          className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
      </div>

      {geoRegions.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2 w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live data from geo-service — {geoRegions.length} regions
        </div>
      )}

      {!loading && combinedMapPoints.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-700">Outbreak Map</p>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:"#EF4444"}}/> High</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:"#F59E0B"}}/> Medium</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{background:"#10B981"}}/> Low</span>
              {manualMapPoints.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed" style={{borderColor:"#8B5CF6"}}/> 🚩 Manually logged
                </span>
              )}
            </div>
          </div>
          <GeoMap points={combinedMapPoints} />
        </Card>
      )}

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="📍" title="No locations found" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((l, i) => (
            <div key={l.id||i} className="rounded-2xl overflow-hidden relative hover:shadow-lg transition-shadow group"
              style={{ background: GRADIENTS[i % GRADIENTS.length], minHeight: 180 }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize:"30px 30px" }} />
              {!l.readOnly && (
                <div className="absolute top-3 right-3 z-20 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(l)}
                    className="w-7 h-7 rounded-lg bg-white/25 backdrop-blur hover:bg-white/40 text-white text-xs flex items-center justify-center" title="Edit">✎</button>
                  <button onClick={() => handleDelete(l)}
                    className="w-7 h-7 rounded-lg bg-white/25 backdrop-blur hover:bg-red-500/70 text-white text-xs flex items-center justify-center" title="Delete">🗑</button>
                </div>
              )}
              <div className="relative z-10 p-5 flex flex-col h-full justify-between">
                <div>
                  <p className="text-white/70 text-xs font-mono">ID-{l.id}</p>
                  <p className="text-white text-2xl font-bold mt-1">{l.region}</p>
                  <p className="text-white/80 text-sm mt-1">📍 {l.district}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="bg-white/15 backdrop-blur rounded-xl p-3">
                    <p className="text-white/60 text-xs">LATITUDE</p>
                    <p className="text-white font-bold text-sm">{l.latitude?.toFixed?.(3) || l.latitude || "—"}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-xl p-3">
                    <p className="text-white/60 text-xs">LONGITUDE</p>
                    <p className="text-white font-bold text-sm">{l.longitude?.toFixed?.(3) || l.longitude || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => { setShowForm(false); setError(""); }}
        title={editing ? "Edit Location" : "Add New Location"}>
        <div className="space-y-4">
          <Select label="Region *" value={form.region} onChange={v=>setForm(f=>({...f,region:v}))}
            options={[{ value: "", label: "Select a region..." }, ...CAMEROON_REGIONS.map(r => ({ value: r, label: r }))]} />
          <Input label="District *" value={form.district} onChange={v=>setForm(f=>({...f,district:v}))} placeholder="e.g. Yaoundé I" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" type="number" value={form.latitude} onChange={v=>setForm(f=>({...f,latitude:v}))} placeholder="3.848" />
            <Input label="Longitude" type="number" value={form.longitude} onChange={v=>setForm(f=>({...f,longitude:v}))} placeholder="11.502" />
          </div>
        </div>
        {error && <div className="mt-3"><Alert type="error" message={error} /></div>}
        <div className="flex gap-3 mt-6">
          <SecondaryBtn onClick={() => setShowForm(false)} className="flex-1">Cancel</SecondaryBtn>
          <PrimaryBtn onClick={handleSubmit} className="flex-1">{editing ? "Save Changes" : "Add Location"}</PrimaryBtn>
        </div>
      </Modal>
    </div>
  );
}
