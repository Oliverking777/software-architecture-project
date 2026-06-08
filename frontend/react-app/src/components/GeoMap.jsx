import { MapContainer, TileLayer, CircleMarker, Tooltip, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SEVERITY_COLOR = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#10B981",
};

export default function GeoMap({ points = [], height = 360, center = [5.5, 11.5], zoom = 6 }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200" style={{ height }}>
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p, i) => {
          const color = SEVERITY_COLOR[p.severity] || "#0EA5E9";
          const radius = 8 + Math.min(20, (p.cases || 0) * 1.2);
          const isManual = !!p.manual;
          return (
            <CircleMarker key={i} center={[p.lat, p.lon]} radius={radius}
              pathOptions={{
                color: isManual ? "#8B5CF6" : color,
                fillColor: color,
                fillOpacity: isManual ? 0.25 : 0.45,
                weight: isManual ? 3 : 2,
                dashArray: isManual ? "6 4" : null,
              }}>
              <Tooltip direction="top" offset={[0, -radius]} opacity={1}>
                <span className="text-xs font-semibold capitalize">
                  {isManual ? "🚩 " : ""}{p.region}{p.district ? ` / ${p.district}` : ""}
                  {isManual && <em className="block text-[10px] not-italic text-violet-600">Manually logged alert{p.disease ? ` · ${p.disease}` : ""}</em>}
                </span>
              </Tooltip>
              <Popup>
                <div className="text-xs space-y-1">
                  <p className="font-bold capitalize">{p.region}{p.district ? ` — ${p.district}` : ""}</p>
                  {p.disease && <p>Disease: <span className="font-semibold capitalize">{p.disease}</span></p>}
                  <p>Cases: <span className="font-semibold">{p.cases}</span></p>
                  <p>Severity: <span className="font-semibold uppercase" style={{ color }}>{p.severity}</span></p>
                  {isManual && <p className="text-violet-600 font-semibold">🚩 Manually logged alert (this session)</p>}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
