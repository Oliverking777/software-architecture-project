import { useState } from "react";
import {
  AlertTriangle,
  Users,
  MapPin,
  CalendarDays,
  TrendingUp,
  Download,
  Plus,
  Stethoscope,
  Bell,
  ArrowUpRight,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const KPI = {
  totalCases: 48320,   totalCasesDelta: 4.2,
  activeAlerts: 17,    activeAlertsDelta: -2,
  diseases: 23,        diseasesDelta: 1,
  regions: 8,
  casesWeek: 1240,     casesWeekDelta: 7.1,
  casesMonth: 5830,    casesMonthDelta: 3.4,
};

const weeklyTrend = [
  { day: "Mon", cases: 320, recovered: 210, deaths: 4 },
  { day: "Tue", cases: 410, recovered: 280, deaths: 6 },
  { day: "Wed", cases: 390, recovered: 260, deaths: 3 },
  { day: "Thu", cases: 520, recovered: 340, deaths: 8 },
  { day: "Fri", cases: 480, recovered: 310, deaths: 5 },
  { day: "Sat", cases: 290, recovered: 200, deaths: 2 },
  { day: "Sun", cases: 350, recovered: 230, deaths: 4 },
];

const diseaseDistribution = [
  { name: "Malaria",  value: 14200, color: "#6366f1" },
  { name: "Cholera",  value: 8900,  color: "#14b8a6" },
  { name: "Typhoid",  value: 6700,  color: "#f59e0b" },
  { name: "COVID-19", value: 5400,  color: "#ef4444" },
  { name: "Dengue",   value: 3800,  color: "#8b5cf6" },
  { name: "Other",    value: 9320,  color: "#cbd5e1" },
];

const regionCases = [
  { region: "Centre",   cases: 9200 },
  { region: "Littoral", cases: 7800 },
  { region: "West",     cases: 6100 },
  { region: "North",    cases: 5400 },
  { region: "South",    cases: 4700 },
  { region: "East",     cases: 4100 },
  { region: "Adamawa",  cases: 3600 },
  { region: "Far North",cases: 3200 },
  { region: "NW",       cases: 2500 },
  { region: "SW",       cases: 2220 },
];

const monthlyGrowth = [
  { month: "Jan", cases: 3800, alerts: 9  },
  { month: "Feb", cases: 4200, alerts: 11 },
  { month: "Mar", cases: 3900, alerts: 8  },
  { month: "Apr", cases: 5100, alerts: 14 },
  { month: "May", cases: 5600, alerts: 16 },
  { month: "Jun", cases: 5830, alerts: 17 },
];

const activityFeed = [
  { id: 1, type: "alert",  text: "New outbreak threshold exceeded — Malaria, Centre Region",       time: "2 min ago"  },
  { id: 2, type: "case",   text: "12 new cases reported — Cholera, Littoral Region",               time: "8 min ago"  },
  { id: 3, type: "report", text: "Weekly epidemiological report submitted by Centre DRSP",         time: "22 min ago" },
  { id: 4, type: "system", text: "Automated alert dispatched to 4 regional offices",               time: "35 min ago" },
  { id: 5, type: "case",   text: "7 recoveries logged — Typhoid, West Region",                    time: "1 hr ago"   },
  { id: 6, type: "alert",  text: "Dengue cluster flagged — South Region",                         time: "2 hr ago"   },
];

const patients = [
  { id: "DSA-0041", disease: "Malaria",  region: "Centre",   district: "Yaoundé IV",  age: 34, status: "Critical"   },
  { id: "DSA-0042", disease: "Cholera",  region: "Littoral", district: "Douala III",  age: 28, status: "Active"     },
  { id: "DSA-0043", disease: "Typhoid",  region: "West",     district: "Bafoussam",   age: 45, status: "Recovering" },
  { id: "DSA-0044", disease: "COVID-19", region: "North",    district: "Garoua",      age: 61, status: "Critical"   },
  { id: "DSA-0045", disease: "Dengue",   region: "South",    district: "Ebolowa",     age: 19, status: "Active"     },
];

const alerts = [
  { id: "ALT-001", disease: "Malaria",  region: "Centre",   caseCount: 142, date: "Jun 08", severity: "Critical" },
  { id: "ALT-002", disease: "Cholera",  region: "Littoral", caseCount: 89,  date: "Jun 07", severity: "High"     },
  { id: "ALT-003", disease: "Dengue",   region: "South",    caseCount: 34,  date: "Jun 07", severity: "Medium"   },
  { id: "ALT-004", disease: "Typhoid",  region: "West",     caseCount: 57,  date: "Jun 06", severity: "High"     },
  { id: "ALT-005", disease: "COVID-19", region: "Adamawa",  caseCount: 21,  date: "Jun 05", severity: "Low"      },
];

// ─── Light-theme design tokens ──────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)",
    color: "#111827",
  },
};

// accent: bg / icon-text / card-border / icon-bg
const ACCENT = {
  primary:     { bg: "#eff6ff", text: "#2746F5", border: "#dbeafe", iconBg: "#dbeafe" },
  destructive: { bg: "#fef2f2", text: "#dc2626", border: "#fecaca", iconBg: "#fecaca" },
  teal:        { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4", iconBg: "#ccfbf1" },
  info:        { bg: "#f0f9ff", text: "#0284c7", border: "#bae6fd", iconBg: "#e0f2fe" },
  warning:     { bg: "#fffbeb", text: "#d97706", border: "#fde68a", iconBg: "#fef3c7" },
  success:     { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", iconBg: "#dcfce7" },
};

const SEVERITY_COLOR = {
  Critical: { bg: "#fef2f2", text: "#dc2626" },
  High:     { bg: "#fffbeb", text: "#d97706" },
  Medium:   { bg: "#eff6ff", text: "#2563eb" },
  Low:      { bg: "#f0fdf4", text: "#16a34a" },
};

// ─── Tiny components ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.Low;
  return (
    <span style={{
      background: c.bg, color: c.text,
      fontSize: 11, fontWeight: 600,
      padding: "2px 9px", borderRadius: 20,
      whiteSpace: "nowrap",
    }}>
      {severity}
    </span>
  );
}

function StatCard({ label, value, delta, icon: Icon, accent, hint, index }) {
  const a = ACCENT[accent] ?? ACCENT.primary;
  const positive = delta > 0;
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${a.border}`,
      borderRadius: 14,
      padding: "16px 18px",
      display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      animationDelay: `${index * 60}ms`,
    }} className="stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ background: a.iconBg, borderRadius: 8, padding: "6px 7px", display: "flex", alignItems: "center" }}>
          <Icon size={15} color={a.text} />
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value}</div>
      {delta !== undefined && (
        <div style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 3, color: positive ? "#16a34a" : "#dc2626" }}>
          {positive ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {Math.abs(delta)}% vs last period
        </div>
      )}
      {hint && <div style={{ fontSize: 11, color: "#9ca3af" }}>{hint}</div>}
    </div>
  );
}

function ChartCard({ title, subtitle, children, actions, style, className }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #f3f4f6",
      borderRadius: 16,
      padding: "20px 22px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      ...style,
    }} className={className}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{subtitle}</div>}
        </div>
        {actions && <div style={{ marginLeft: 12, flexShrink: 0 }}>{actions}</div>}
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function DashboardContent() {
  const heat = Array.from({ length: 7 * 12 }).map((_, i) => ({
    v: Math.round(20 + Math.sin(i * 0.3) * 18 + Math.random() * 50),
  }));

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#111827", background: "#f9fafb", minHeight: "100vh" }}>
      <style>{`
        .stat-card { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

        .grid-kpi { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:768px)  { .grid-kpi { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1280px) { .grid-kpi { grid-template-columns:repeat(6,1fr); } }

        .grid-main { display:grid; grid-template-columns:1fr; gap:16px; margin-top:20px; }
        @media(min-width:1024px) { .grid-main { grid-template-columns:repeat(3,1fr); } }

        .col-span-2 { grid-column:span 1; }
        @media(min-width:1024px) { .col-span-2 { grid-column:span 2; } }

        .grid-bottom { display:grid; grid-template-columns:1fr; gap:16px; margin-top:16px; }
        @media(min-width:1024px) { .grid-bottom { grid-template-columns:1fr 1fr; } }

        .btn { cursor:pointer; border:none; border-radius:8px; font-size:13px; font-weight:500;
               display:inline-flex; align-items:center; gap:6px; padding:7px 14px; transition:opacity 0.15s; }
        .btn:hover { opacity:0.85; }
        .btn-outline { background:#fff; border:1px solid #e5e7eb; color:#374151; }
        .btn-primary { background:#2746F5; color:#fff; }
        .btn-ghost   { background:transparent; color:#9ca3af; font-size:12px; padding:4px 8px; }
        .btn-ghost:hover { color:#374151; }

        .live-badge { display:inline-flex; align-items:center; gap:5px;
                      background:#f0fdf4; color:#16a34a; font-size:11px; font-weight:600;
                      padding:3px 10px; border-radius:20px; }
        .pulse { height:6px; width:6px; border-radius:50%; background:#22c55e; animation:pulse 1.5s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .divide-row { border-top:1px solid #f3f4f6; }
        .divide-row:first-child { border-top:none; }

        .scrollable { max-height:288px; overflow-y:auto; padding-right:4px; }
        .scrollable::-webkit-scrollbar { width:4px; }
        .scrollable::-webkit-scrollbar-thumb { background:#e5e7eb; border-radius:4px; }

        .activity-dot-line {
          position:absolute; left:50%; top:12px; transform:translateX(-50%);
          width:1px; background:#e5e7eb; bottom:0;
        }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        marginBottom: 24, flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 }}>Executive Dashboard</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "4px 0 0" }}>
            Real-time surveillance overview across all regions and reporting units.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline"><Download size={14} /> Export</button>
          <button className="btn btn-primary"><Plus size={14} /> New Report</button>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid-kpi">
        <StatCard label="Total Cases"      value={KPI.totalCases.toLocaleString()} delta={KPI.totalCasesDelta}   icon={Users}        accent="primary"     index={0} />
        <StatCard label="Active Alerts"    value={KPI.activeAlerts}                delta={KPI.activeAlertsDelta} icon={AlertTriangle} accent="destructive"  index={1} />
        <StatCard label="Diseases"         value={KPI.diseases}                    delta={KPI.diseasesDelta}     icon={Stethoscope}   accent="teal"         index={2} />
        <StatCard label="Affected Regions" value={`${KPI.regions}/10`}            icon={MapPin}               accent="info"        hint="Nationwide coverage" index={3} />
        <StatCard label="Cases This Week"  value={KPI.casesWeek.toLocaleString()}  delta={KPI.casesWeekDelta}   icon={CalendarDays}  accent="warning"      index={4} />
        <StatCard label="Cases This Month" value={KPI.casesMonth.toLocaleString()} delta={KPI.casesMonthDelta}  icon={TrendingUp}    accent="success"      index={5} />
      </div>

      {/* ── Main Charts ── */}
      <div className="grid-main">

        {/* Weekly Trend */}
        <ChartCard className="col-span-2" title="Weekly Case Trend" subtitle="Cases, recoveries and fatalities — last 7 days"
          actions={
            <div style={{ display:"flex", gap:10, fontSize:11, color:"#6b7280", alignItems:"center" }}>
              {[["#6366f1","Cases"],["#14b8a6","Recovered"],["#ef4444","Deaths"]].map(([c,l])=>(
                <span key={l} style={{ display:"inline-flex", alignItems:"center", gap:4 }}>
                  <span style={{ height:8, width:8, borderRadius:"50%", background:c, display:"inline-block" }} />{l}
                </span>
              ))}
            </div>
          }
        >
          <div style={{ height: 288 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrend} margin={{ left:-10, right:8, top:8 }}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18}/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.15}/>
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                <XAxis dataKey="day"  tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                <YAxis               tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                <Tooltip {...tooltipStyle}/>
                <Area type="monotone" dataKey="cases"     stroke="#6366f1" strokeWidth={2.5} fill="url(#g1)"/>
                <Area type="monotone" dataKey="recovered" stroke="#14b8a6" strokeWidth={2}   fill="url(#g2)"/>
                <Line type="monotone" dataKey="deaths"    stroke="#ef4444" strokeWidth={2}   dot={{ r:3, fill:"#ef4444" }}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Disease Distribution */}
        <ChartCard title="Disease Distribution" subtitle="Active cases by disease">
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={diseaseDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={2}>
                  {diseaseDistribution.map((d)=><Cell key={d.name} fill={d.color}/>)}
                </Pie>
                <Tooltip {...tooltipStyle}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {diseaseDistribution.map((d)=>(
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                <span style={{ height:8, width:8, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                <span style={{ color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
                <span style={{ marginLeft:"auto", fontWeight:600, color:"#111827" }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Cases by Region */}
        <ChartCard className="col-span-2" title="Cases by Region" subtitle="All 10 administrative regions">
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionCases} margin={{ left:-10, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                <XAxis dataKey="region" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50}/>
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                <Tooltip {...tooltipStyle}/>
                <Bar dataKey="cases" radius={[8,8,0,0]} fill="#2746F5"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Heatmap */}
        <ChartCard title="Outbreak Heatmap" subtitle="Intensity over the last 12 weeks">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:4 }}>
            {heat.map((c,i)=>{
              const op = Math.min(1, c.v/80);
              return (
                <div key={i} title={`${c.v} cases`} style={{
                  aspectRatio:"1", borderRadius:4,
                  background:`rgba(39,70,245,${0.06 + op*0.7})`,
                }}/>
              );
            })}
          </div>
          <div style={{ marginTop:12, display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:11, color:"#9ca3af" }}>
            <span>Less</span>
            <div style={{ display:"flex", gap:4 }}>
              {[0.1,0.25,0.4,0.6,0.85].map((o)=>(
                <span key={o} style={{ height:12, width:16, borderRadius:3, display:"inline-block", background:`rgba(39,70,245,${0.06+o*0.7})` }}/>
              ))}
            </div>
            <span>More</span>
          </div>
        </ChartCard>

        {/* Monthly Growth */}
        <ChartCard className="col-span-2" title="Monthly Growth" subtitle="Cases vs. alerts generated">
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyGrowth} margin={{ left:-10, right:8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                <XAxis dataKey="month" tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                <Tooltip {...tooltipStyle}/>
                <Line type="monotone" dataKey="cases"  stroke="#2746F5" strokeWidth={2.5} dot={{ r:3, fill:"#2746F5" }}/>
                <Line type="monotone" dataKey="alerts" stroke="#ef4444" strokeWidth={2}   dot={{ r:3, fill:"#ef4444" }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Activity Feed */}
        <ChartCard title="Live Activity Feed" subtitle="Real-time system events"
          actions={<span className="live-badge"><span className="pulse"/>Live</span>}
        >
          <div className="scrollable">
            {activityFeed.map((a,i)=>{
              const dotColor =
                a.type==="alert"  ? "#ef4444" :
                a.type==="case"   ? "#2746F5" :
                a.type==="report" ? "#14b8a6" : "#d1d5db";
              return (
                <div key={a.id} style={{ display:"flex", gap:12, fontSize:13, paddingBottom:12 }}>
                  <div style={{ position:"relative", flexShrink:0 }}>
                    <div style={{ marginTop:4, height:8, width:8, borderRadius:"50%", background:dotColor }}/>
                    {i < activityFeed.length-1 && <div className="activity-dot-line"/>}
                  </div>
                  <div style={{ paddingBottom:4 }}>
                    <p style={{ margin:0, lineHeight:1.4, color:"#374151" }}>{a.text}</p>
                    <p style={{ margin:"3px 0 0", fontSize:11, color:"#9ca3af" }}>{a.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid-bottom">

        {/* Recent Cases */}
        <ChartCard title="Recent Cases" subtitle="Latest patient reports"
          actions={<button className="btn btn-ghost">View all <ArrowUpRight size={12}/></button>}
        >
          <div>
            {patients.slice(0,5).map((p)=>(
              <div key={p.id} className="divide-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 4px" }}>
                <div style={{ display:"grid", placeItems:"center", height:36, width:36, borderRadius:8,
                              background:"#eff6ff", color:"#2746F5", fontSize:11, fontWeight:600, flexShrink:0 }}>
                  {p.id.slice(-3)}
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.disease}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{p.region} · {p.district} · {p.age}y</div>
                </div>
                <SeverityBadge severity={p.status==="Critical"?"Critical":p.status==="Active"?"High":"Low"}/>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Active Alerts */}
        <ChartCard title="Active Alerts" subtitle="Outbreak signals requiring attention"
          actions={<button className="btn btn-ghost">View all <ArrowUpRight size={12}/></button>}
        >
          <div>
            {alerts.slice(0,5).map((a)=>(
              <div key={a.id} className="divide-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 4px" }}>
                <div style={{ display:"grid", placeItems:"center", height:36, width:36, borderRadius:8,
                              background:"#fef2f2", color:"#dc2626", flexShrink:0 }}>
                  <Bell size={16}/>
                </div>
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:500, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.disease} · {a.region}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{a.caseCount} cases · {a.date}</div>
                </div>
                <SeverityBadge severity={a.severity}/>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>
    </div>
  );
}