import { useState, useEffect } from "react";
import { Card, Badge, Spinner, EmptyState } from "../components/UI.jsx";
import { PageHeader, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI, diseaseAPI, locationAPI, patientAPI } from "../services/api.js";

const timeAgo = (iso) => {
  if (!iso) return "—";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [diseaseNotifs, setDiseaseNotifs] = useState([]);
  const [locationNotifs, setLocationNotifs] = useState([]);
  const [patientNotifs, setPatientNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [read, setRead] = useState({});

  useEffect(() => {
    Promise.all([
      analyticsAPI.getAlerts(),
      diseaseAPI.getAll({ size: 5, sortBy: "createdAt", sortDir: "desc" }),
      locationAPI.getAll({ size: 5, sort: "id,desc" }),
      patientAPI.getAll({ size: 5, sort: "reportDate,desc" }),
    ]).then(([alertData, diseases, locations, patients]) => {
      setAlerts(alertData?.alerts || []);

      setDiseaseNotifs((diseases?.content || []).map((d, i) => ({
        id: `disease-${d.id ?? i}`, type: "report",
        title: `Disease tracked: ${d.name}`,
        msg: `Alert threshold set at ${d.thresholdLimit} cases · disease-service`,
        time: timeAgo(d.createdAt), iso: d.createdAt, read: false,
      })));

      setLocationNotifs((locations?.content || []).map((l, i) => ({
        id: `location-${l.id ?? i}`, type: "patient",
        title: `Location registered: ${l.region} / ${l.district}`,
        msg: `Coordinates ${l.latitude?.toFixed?.(2) ?? l.latitude}, ${l.longitude?.toFixed?.(2) ?? l.longitude} · location-service`,
        time: "Recently", read: true,
      })));

      setPatientNotifs((patients?.content || []).map((p, i) => ({
        id: `patient-${p.id ?? i}`, type: "patient",
        title: `New case reported: ${p.disease}`,
        msg: `${p.region ?? p.street ?? "Unknown region"} · reported by ${p.reportedBy ?? "field worker"}`,
        time: timeAgo(p.reportedAt), iso: p.reportedAt, read: true,
      })));

      setLoading(false);
    });
  }, []);

  const alertNotifs = alerts.map((a, i) => ({
    id: `alert-${i}`, type:"alert",
    title: `${(a.disease||"").toUpperCase()} outbreak — ${a.region}`,
    msg: `${a.cases} cases detected, threshold: ${a.threshold}`,
    time:"Live", read:false, severity:a.severity,
  }));

  const allNotifs = [...alertNotifs, ...patientNotifs, ...diseaseNotifs, ...locationNotifs];
  const q = search.toLowerCase();
  const filtered = allNotifs.filter(n =>
    !q || n.title.toLowerCase().includes(q) || n.msg.toLowerCase().includes(q)
  );
  const unread = allNotifs.filter(n => !n.read && !read[n.id]).length;

  const iconMap = { alert:"⚠", patient:"👤", warning:"⚡", report:"📄" };
  const bgMap   = { alert:"bg-red-50", patient:"bg-sky-50", warning:"bg-yellow-50", report:"bg-slate-50" };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Notification Center"
        subtitle={`${unread} unread notification${unread!==1?"s":""} · live data from analytics, disease, location & patient services`}
        action={
          <SecondaryBtn onClick={() => setRead(Object.fromEntries(allNotifs.map(n=>[n.id,true])))}>
            ✓ Mark all read
          </SecondaryBtn>
        }
      />

      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-80">
        <span className="text-slate-400">🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search notifications..."
          className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications" desc="You're all caught up" />
      ) : (
        <Card className="divide-y divide-slate-50">
          {filtered.map((n, i) => {
            const isRead = n.read || read[n.id];
            return (
              <div key={n.id||i}
                onClick={() => setRead(r => ({...r,[n.id]:true}))}
                className={`flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${!isRead?"bg-sky-50/30":""}`}>
                <div className={`w-10 h-10 rounded-xl ${bgMap[n.type]||"bg-slate-50"} flex items-center justify-center flex-shrink-0`}>
                  <span>{iconMap[n.type]||"📋"}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                    {!isRead && <span className="w-2 h-2 bg-sky-500 rounded-full flex-shrink-0" />}
                    {n.severity && <Badge level={n.severity} />}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">{n.msg}</p>
                  <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
