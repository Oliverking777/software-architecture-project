import { useState } from "react";
import {
  AlertTriangle, Users, MapPin, CalendarDays, TrendingUp,
  Download, Plus, Stethoscope, Bell, ArrowUpRight, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  useKpis, useCasesByDisease, useCasesByRegion,
  useActiveAlerts, usePolledAlerts,
} from "../../../hooks/useDashboard";
import { useDiseases } from "../../../hooks/useDashboard";

// ── Design tokens ────────────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10,
    fontSize: 12, boxShadow: "0 8px 24px -8px rgba(0,0,0,0.12)", color: "#111827",
  },
};

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

// Disease colors for pie chart — mapped by name, fallback to grey
const DISEASE_COLORS = {
  Malaria:  "#6366f1", Cholera:  "#14b8a6", Typhoid:  "#f59e0b",
  "Covid-19": "#ef4444", Dengue: "#8b5cf6", Mpox: "#f97316",
  Typhoide: "#f59e0b",
};
const getFallbackColor = (index) =>
  ["#6366f1","#14b8a6","#f59e0b","#ef4444","#8b5cf6","#f97316","#cbd5e1"][index % 7];

// ── Tiny components ──────────────────────────────────────────────────────────

function SeverityBadge({ severity }) {
  const c = SEVERITY_COLOR[severity] ?? SEVERITY_COLOR.Low;
  return (
    <span style={{
      background: c.bg, color: c.text, fontSize: 11, fontWeight: 600,
      padding: "2px 9px", borderRadius: 20, whiteSpace: "nowrap",
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
      background: "#fff", border: `1px solid ${a.border}`, borderRadius: 14,
      padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)", animationDelay: `${index * 60}ms`,
    }} className="stat-card">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
        <span style={{ background: a.iconBg, borderRadius: 8, padding: "6px 7px", display: "flex", alignItems: "center" }}>
          <Icon size={15} color={a.text} />
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{value ?? "—"}</div>
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
      background: "#fff", border: "1px solid #f3f4f6", borderRadius: 16,
      padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", ...style,
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

function Skeleton({ height = 200 }) {
  return (
    <div style={{
      height, borderRadius: 8, background: "linear-gradient(90deg,#f3f4f6 25%,#e5e7eb 50%,#f3f4f6 75%)",
      backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
    }} />
  );
}

function ErrorMsg({ message }) {
  return (
    <div style={{ color: "#dc2626", fontSize: 12, padding: "8px 0" }}>
      ⚠ {message}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function DashboardContent() {

  // ── Real data hooks ──────────────────────────────────────────
  const { data: kpis,      loading: kpisLoading,    error: kpisError    } = useKpis();
  const { data: byDisease, loading: diseaseLoading, error: diseaseError } = useCasesByDisease();
  const { data: byRegion,  loading: regionLoading,  error: regionError  } = useCasesByRegion();
  const { data: alerts,    loading: alertsLoading,  error: alertsError  } = usePolledAlerts(30000);
  const { data: diseasesPage }                                             = useDiseases(0, 5);

  // Heatmap — still random (no time-series endpoint yet)
  const heat = Array.from({ length: 7 * 12 }).map((_, i) => ({
    v: Math.round(20 + Math.sin(i * 0.3) * 18 + Math.random() * 50),
  }));

  // Enrich byDisease with colors
  const diseaseDistribution = (byDisease || []).map((d, i) => ({
    ...d,
    color: DISEASE_COLORS[d.name] ?? getFallbackColor(i),
  }));

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", color: "#111827", background: "#f9fafb", minHeight: "100vh" }}>
      <style>{`
        .stat-card { animation: fadeUp 0.4s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        .grid-kpi { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:768px)  { .grid-kpi { grid-template-columns:repeat(3,1fr); } }
        @media(min-width:1280px) { .grid-kpi { grid-template-columns:repeat(5,1fr); } }

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
      `}</style>

      {/* ── Header ── */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#111827", margin:0 }}>Executive Dashboard</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>
            Real-time surveillance overview across all regions and reporting units.
          </p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-outline"><Download size={14}/> Export</button>
          <button className="btn btn-primary"><Plus size={14}/> New Report</button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid-kpi">
        {kpisLoading ? (
          Array.from({length:5}).map((_,i) => <Skeleton key={i} height={100}/>)
        ) : kpisError ? (
          <ErrorMsg message={kpisError}/>
        ) : (
          <>
            <StatCard label="Total Cases"       value={kpis?.totalCases?.toLocaleString()}       icon={Users}        accent="primary"     index={0}/>
            <StatCard label="Active Alerts"     value={kpis?.activeAlerts}                       icon={AlertTriangle} accent="destructive" index={1}/>
            <StatCard label="Diseases Tracked"  value={kpis?.diseases}                           icon={Stethoscope}  accent="teal"        index={2}/>
            <StatCard label="Affected Regions"  value={`${kpis?.affectedRegions ?? "—"}/10`}    icon={MapPin}       accent="info"        hint="Nationwide coverage" index={3}/>
            <StatCard label="Cases This Month"  value={kpis?.totalCases?.toLocaleString()}       icon={TrendingUp}   accent="success"     index={4}/>
          </>
        )}
      </div>

      {/* ── Main Charts ── */}
      <div className="grid-main">

        {/* Disease Distribution — from disease-service via analytics */}
        <ChartCard title="Disease Distribution" subtitle="Active cases by disease">
          {diseaseLoading ? <Skeleton/> : diseaseError ? <ErrorMsg message={diseaseError}/> : (
            <>
              <div style={{ height:220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={diseaseDistribution} dataKey="value" nameKey="name" innerRadius={52} outerRadius={88} paddingAngle={2}>
                      {diseaseDistribution.map((d) => <Cell key={d.name} fill={d.color}/>)}
                    </Pie>
                    <Tooltip {...tooltipStyle}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                {diseaseDistribution.map((d) => (
                  <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12 }}>
                    <span style={{ height:8, width:8, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                    <span style={{ color:"#6b7280", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{d.name}</span>
                    <span style={{ marginLeft:"auto", fontWeight:600, color:"#111827" }}>{d.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>

        {/* Cases by Region */}
        <ChartCard className="col-span-2" title="Cases by Region" subtitle="All administrative regions">
          {regionLoading ? <Skeleton height={256}/> : regionError ? <ErrorMsg message={regionError}/> : (
            <div style={{ height:256 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byRegion} margin={{ left:-10, right:8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false}/>
                  <XAxis dataKey="region" tick={{ fontSize:10, fill:"#9ca3af" }} axisLine={false} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50}/>
                  <YAxis tick={{ fontSize:11, fill:"#9ca3af" }} axisLine={false} tickLine={false}/>
                  <Tooltip {...tooltipStyle}/>
                  <Bar dataKey="cases" radius={[8,8,0,0]} fill="#2746F5"/>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Outbreak Heatmap — static until time-series endpoint is added */}
        <ChartCard title="Outbreak Heatmap" subtitle="Intensity over the last 12 weeks">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(12,1fr)", gap:4 }}>
            {heat.map((c,i) => {
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
              {[0.1,0.25,0.4,0.6,0.85].map((o) => (
                <span key={o} style={{ height:12, width:16, borderRadius:3, display:"inline-block", background:`rgba(39,70,245,${0.06+o*0.7})` }}/>
              ))}
            </div>
            <span>More</span>
          </div>
        </ChartCard>

      </div>

      {/* ── Bottom Row ── */}
      <div className="grid-bottom">

        {/* Disease List — from disease-service */}
        <ChartCard title="Registered Diseases" subtitle="Latest from disease-service"
          actions={<button className="btn btn-ghost">View all <ArrowUpRight size={12}/></button>}
        >
          {!diseasesPage ? <Skeleton/> : (
            <div>
              {(diseasesPage?.content || []).map((d) => (
                <div key={d.id} className="divide-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 4px" }}>
                  <div style={{ display:"grid", placeItems:"center", height:36, width:36, borderRadius:8,
                                background:"#eff6ff", color:"#2746F5", fontSize:11, fontWeight:600, flexShrink:0 }}>
                    {d.name?.slice(0,2).toUpperCase()}
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#111827" }}>{d.name}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>Threshold: {d.thresholdLimit} cases</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>

        {/* Active Alerts — from analytics-service, polled every 30s */}
        <ChartCard title="Active Alerts" subtitle="Outbreak signals requiring attention"
          actions={
            <span className="live-badge"><span className="pulse"/>Live</span>
          }
        >
          {alertsLoading ? <Skeleton/> : alertsError ? <ErrorMsg message={alertsError}/> : (
            <div>
              {(alerts || []).slice(0,5).map((a) => (
                <div key={a.id} className="divide-row" style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 4px" }}>
                  <div style={{ display:"grid", placeItems:"center", height:36, width:36, borderRadius:8,
                                background:"#fef2f2", color:"#dc2626", flexShrink:0 }}>
                    <Bell size={16}/>
                  </div>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:500, color:"#111827", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {a.disease} · {a.region}
                    </div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>{a.caseCount} cases</div>
                  </div>
                  <SeverityBadge severity={a.severity}/>
                </div>
              ))}
              {(!alerts || alerts.length === 0) && (
                <p style={{ fontSize:13, color:"#9ca3af", textAlign:"center", padding:"16px 0" }}>No active alerts</p>
              )}
            </div>
          )}
        </ChartCard>

      </div>
    </div>
  );
}