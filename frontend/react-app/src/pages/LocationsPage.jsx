import { useState, useEffect } from "react";
import { Card, Spinner, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn } from "../components/UI.jsx";
import { locationAPI, geoAPI } from "../services/api.js";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [geoRegions, setGeoRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      locationAPI.getAll({ size: 100 }),
      geoAPI.getRegions(),
    ]).then(([locs, geo]) => {
      if (locs?.content) setLocations(locs.content);
      if (geo?.regions) setGeoRegions(geo.regions);
      setLoading(false);
    });
  }, []);

  const displayData = locations.length > 0 ? locations : geoRegions.map((r, i) => ({
    id: i+1,
    region: r.region.charAt(0).toUpperCase() + r.region.slice(1),
    district: r.districts?.[0] || "",
    latitude: r.coordinates?.lat,
    longitude: r.coordinates?.lon,
  }));

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
        action={<PrimaryBtn>+ New Location</PrimaryBtn>} />

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

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="📍" title="No locations found" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((l, i) => (
            <div key={l.id||i} className="rounded-2xl overflow-hidden relative hover:shadow-lg transition-shadow"
              style={{ background: GRADIENTS[i % GRADIENTS.length], minHeight: 180 }}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize:"30px 30px" }} />
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
    </div>
  );
}
