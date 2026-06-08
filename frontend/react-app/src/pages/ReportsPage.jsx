import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, EmptyState, Input } from "../components/UI.jsx";
import { PageHeader, PrimaryBtn } from "../components/UI.jsx";
import { reportAPI, analyticsAPI } from "../services/api.js";

const HISTORY_KEY = "dsas_report_history";
const COLORS = ["#0EA5E9","#EF4444","#14B8A6","#F59E0B","#8B5CF6","#10B981","#EC4899"];
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } };
const saveHistory = (list) => localStorage.setItem(HISTORY_KEY, JSON.stringify(list));

export default function ReportsPage() {
  const [format, setFormat] = useState("pdf");
  const [period, setPeriod] = useState("Weekly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState(loadHistory);
  const [search, setSearch] = useState("");

  useEffect(() => { saveHistory(history); }, [history]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    const stats = await analyticsAPI.getStats();
    const caseCounts = stats?.case_counts || {};
    const data = await reportAPI.generate(format, caseCounts);
    if (data) {
      const entry = {
        id: `r-${Date.now()}`,
        format: format.toUpperCase(),
        period,
        file: data.file || `report.${format}`,
        path: data.path,
        caseCounts,
        total: Object.values(caseCounts).reduce((s, n) => s + n, 0),
        createdAt: new Date().toISOString(),
      };
      setHistory(prev => [entry, ...prev]);
    } else {
      setError("Failed to generate report. Check report-service.");
    }
    setLoading(false);
  };

  const handleClear = (id) => setHistory(prev => prev.filter(r => r.id !== id));

  const q = search.toLowerCase();
  const filtered = history.filter(r =>
    !q || r.format.toLowerCase().includes(q) || r.period.toLowerCase().includes(q) || r.file.toLowerCase().includes(q)
  );

  return (
    <div className="p-6 space-y-5">
      <PageHeader
        title="Reports"
        subtitle="Generate epidemiological reports from report-service"
      />

      <Card className="p-6 max-w-lg">
        <p className="font-semibold text-slate-700 mb-4">Generate Report</p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Format</label>
            <div className="flex gap-3">
              {["pdf", "csv"].map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                    ${format === f ? "bg-sky-500 text-white border-sky-500" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Input label="Period" value={period} onChange={setPeriod} placeholder="e.g. Weekly, Monthly, 2026-W23" />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
              {error}
            </div>
          )}

          <PrimaryBtn onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : `Generate ${format.toUpperCase()} Report`}
          </PrimaryBtn>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <p className="font-semibold text-slate-700">Report History</p>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 w-72">
          <span className="text-slate-400">🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search reports..."
            className="flex-1 text-sm outline-none text-slate-600 bg-transparent" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-5">
          <EmptyState icon="📋" title="No reports generated yet" desc="Generate a report above to see it here" />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map(r => {
            const chartData = Object.entries(r.caseCounts).map(([disease, cases]) => ({ disease, cases }));
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
                      <span className="text-sky-600 text-lg">{r.format === "PDF" ? "📄" : "📊"}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{r.period} Report · {r.format}</p>
                      <p className="text-xs text-slate-400">{r.file} · {new Date(r.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleClear(r.id)}
                    className="text-xs text-slate-400 hover:text-red-500" title="Remove from history">✕</button>
                </div>
                <p className="text-xs text-slate-500 mb-3">{r.total} total cases across {chartData.length} disease{chartData.length!==1?"s":""}</p>
                {chartData.length > 0 && (
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="disease" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="cases" radius={[6,6,0,0]}>
                          {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
