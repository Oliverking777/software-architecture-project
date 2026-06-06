import { useState, useEffect } from "react";

import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI, locationAPI, analyticsAPI, reportAPI, geoAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";
// ── NOTIFICATIONS ─────────────────────────────────────────────
export function NotificationsPage() {
  const [alerts, setAlerts] = useState([]);
  const [read, setRead] = useState({});

  useEffect(() => {
    analyticsAPI.getAlerts().then(d => {
      if (d?.alerts) setAlerts(d.alerts);
    });
  }, []);

  const staticNotifs = [
    { id:"n1", type:"patient", title:"Patient-service connected",    msg:"25 patients loaded from dsas_patients", time:"Just now",  read:false },
    { id:"n2", type:"report",  title:"Disease catalog loaded",       msg:"8 diseases available in disease-service", time:"2m ago", read:false },
    { id:"n3", type:"warning", title:"Auth service 403",             msg:"Login endpoint needs SecurityConfig fix", time:"5m ago", read:true  },
    { id:"n4", type:"report",  title:"RabbitMQ healthy",             msg:"All queues connected and consuming",      time:"10m ago",read:true  },
  ];

  const alertNotifs = alerts.map((a, i) => ({
    id: `alert-${i}`, type:"alert",
    title: `${a.disease.toUpperCase()} outbreak — ${a.region}`,
    msg: `${a.cases} cases detected, threshold: ${a.threshold}`,
    time:"Live", read:false, severity:a.severity,
  }));

  const allNotifs = [...alertNotifs, ...staticNotifs];
  const unread = allNotifs.filter(n => !n.read && !read[n.id]).length;

  const iconMap = { alert:"⚠", patient:"👤", warning:"⚡", report:"📄" };
  const bgMap = { alert:"bg-red-50", patient:"bg-sky-50", warning:"bg-yellow-50", report:"bg-slate-50" };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Notification Center" subtitle={`${unread} unread notification${unread!==1?"s":""}`}
        action={<SecondaryBtn onClick={() => setRead(Object.fromEntries(allNotifs.map(n=>[n.id,true])))}>✓ Mark all read</SecondaryBtn>} />
      <Card className="divide-y divide-slate-50">
        {allNotifs.map((n, i) => {
          const isRead = n.read || read[n.id];
          return (
            <div key={n.id||i} onClick={() => setRead(r => ({...r,[n.id]:true}))}
              className={`flex items-start gap-4 p-4 hover:bg-slate-50/50 transition-colors cursor-pointer ${!isRead?"bg-sky-50/30":""}`}>
              <div className={`w-10 h-10 rounded-xl ${bgMap[n.type]||"bg-slate-50"} flex items-center justify-center flex-shrink-0`}>
                <span>{iconMap[n.type]||"📋"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800">{n.title}</p>
                  {!isRead && <span className="w-2 h-2 bg-sky-500 rounded-full" />}
                  {n.severity && <Badge level={n.severity} />}
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{n.msg}</p>
                <p className="text-xs text-slate-400 mt-1">{n.time}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

export default NotificationsPage
