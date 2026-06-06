import { useState, useEffect } from "react";
import { Card, Spinner, Alert } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn, SecondaryBtn } from "../components/UI.jsx";
import { analyticsAPI, reportAPI } from "../services/api.js";

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    analyticsAPI.getStats().then(s => { if (s) setStats(s); });
  }, []);

  const handleGenerate = async (format) => {
    setGenerating(true);
    setSuccess("");
    setError("");
    const result = await reportAPI.generate(format, stats?.case_counts || {});
    if (result) {
      const newReport = {
        id: Date.now(),
        file: result.file,
        format: result.format,
        status: result.status,
        path: result.path,
        date: new Date().toLocaleDateString("fr-FR"),
        time: new Date().toLocaleTimeString("fr-FR", { hour:"2-digit", minute:"2-digit" }),
      };
      setReports(prev => [newReport, ...prev]);
      setSuccess(`${format} report generated: ${result.file}`);
    } else {
      setError("Report generation failed. Check report-service logs.");
    }
    setGenerating(false);
    setTimeout(() => setSuccess(""), 5000);
  };

  const REPORT_TYPES = [
    { label:"Daily Report",   sub:"Latest 24h",   icon:"📅", format:"PDF" },
    { label:"Weekly Report",  sub:"Current week", icon:"📋", format:"PDF" },
    { label:"Monthly Report", sub:"Current month",icon:"📄", format:"PDF" },
    { label:"CSV Export",     sub:"Raw data",     icon:"📊", format:"CSV" },
  ];

  return (
    <div className="p-6 space-y-5">
      <PageHeader title="Reports"
        subtitle="Generate surveillance reports via report-service."
        action={
          <div className="flex gap-2">
            <SecondaryBtn onClick={() => handleGenerate("CSV")} disabled={generating}>
              📊 CSV Export
            </SecondaryBtn>
            <PrimaryBtn onClick={() => handleGenerate("PDF")} disabled={generating}>
              {generating ? "⟳ Generating..." : "📋 Generate PDF"}
            </PrimaryBtn>
          </div>
        }
      />

      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-4 gap-4">
        {REPORT_TYPES.map(r => (
          <Card key={r.label} className="p-5 text-center cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGenerate(r.format)}>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">{r.icon}</span>
            </div>
            <p className="font-semibold text-slate-700">{r.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{r.sub}</p>
            <p className="text-xs text-sky-600 mt-2 font-medium">{r.format}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Endpoint</p>
          <p className="text-xs font-mono text-slate-700">POST /api/v1/reports/generate</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Formats</p>
          <p className="text-xs font-semibold text-slate-700">PDF + CSV</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs text-slate-500 font-semibold uppercase mb-1">Storage</p>
          <p className="text-xs font-semibold text-slate-700">/tmp/reports/</p>
        </Card>
      </div>

      {reports.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <p className="font-semibold text-slate-700">Generated Reports</p>
            <p className="text-xs text-slate-400 mt-0.5">Reports generated this session</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["File","Format","Status","Date","Time"].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{r.file}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${r.format==="PDF"?"bg-red-50 text-red-600":"bg-green-50 text-green-600"}`}>
                      {r.format}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      ✓ {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.date}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {stats?.case_counts && Object.keys(stats.case_counts).length > 0 && (
        <Card className="p-5">
          <p className="font-semibold text-slate-700 mb-3">Current Data — Will be included in report</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(stats.case_counts).map(([key, count]) => {
              const [disease, region] = key.split(":");
              return (
                <div key={key} className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 capitalize">{disease}</p>
                  <p className="text-xs text-slate-400">{region}</p>
                  <p className="text-lg font-bold text-slate-800 mt-1">{count} <span className="text-xs text-slate-400">cases</span></p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
