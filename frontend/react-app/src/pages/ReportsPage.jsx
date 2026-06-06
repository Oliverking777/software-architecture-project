import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, Badge, Spinner, Modal, Input, Alert, EmptyState } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { diseaseAPI, locationAPI, analyticsAPI, reportAPI, geoAPI } from "../services/api.js";

const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const fmtNum = (n) => n?.toLocaleString() ?? "—";
//── REPORTS ───────────────────────────────────────────────────
export function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [lastReport, setLastReport] = useState(null);
  const [stats, setStats] = useState(null);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    analyticsAPI.getStats().then(s => { if (s) setStats(s); });
  }, []);

  const handleGenerate = async (format) => {
    setGenerating(true);
    const result = await reportAPI.generate(format, stats?.case_counts || {});
    if (result) {
      setLastReport(result);
      setSuccess(`${format} report generated: ${result.file || "OK"}`);
    } else {
      setSuccess(`${format} report request sent to report-service`);
    }
    setGenerating(false);
    setTimeout(() => setSuccess(""), 5000);
  };

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Reports" subtitle="Generate surveillance reports via report-service."
        action={
          <div className="flex gap-2">
            <SecondaryBtn onClick={() => handleGenerate("CSV")} disabled={generating}>📊 CSV</SecondaryBtn>
            <PrimaryBtn onClick={() => handleGenerate("PDF")} disabled={generating}>
              {generating ? "⟳ Generating..." : "📋 PDF Report"}
            </PrimaryBtn>
          </div>
        }
      />
      {success && <Alert type="success" message={success} />}
      {lastReport && (
        <Card className="p-4 border border-green-200 bg-green-50">
          <p className="text-sm font-semibold text-green-700">✅ Report generated</p>
          <p className="text-xs text-green-600 mt-1">File: {lastReport.file} · Format: {lastReport.format}</p>
        </Card>
      )}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Daily Report",   sub:"Latest 24h",  icon:"📅" },
          { label:"Weekly Report",  sub:"Current week", icon:"📋" },
          { label:"Monthly Report", sub:"Current month",icon:"📄" },
          { label:"Custom Report",  sub:"Date range",   icon:"📊" },
        ].map(r => (
          <Card key={r.label} className="p-5 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGenerate("PDF")}>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">{r.icon}</span>
            </div>
            <p className="font-semibold text-slate-700">{r.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r.sub}</p>
          </Card>
        ))}
      </div>
      <Card className="p-5">
        <p className="font-semibold text-slate-700 mb-4">Report Service Status</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">Endpoint</p>
            <p className="text-xs font-mono text-slate-700 mt-0.5">localhost:8086</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">Output formats</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">PDF + CSV</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500">Storage path</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">/tmp/reports/</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReportsPage
