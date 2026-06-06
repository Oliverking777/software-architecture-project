import { useState } from "react";
import { authAPI } from "../services/api.js";

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("admin@dsas.gov");
  const [password, setPassword] = useState("Admin1234!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.login(email, password);
      if (data.accessToken || data.token) {
        const token = data.accessToken || data.token;
        sessionStorage.setItem("dsas_token", token);
        onLogin(token, data);
      } else {
        setError("Login failed. Check your credentials.");
      }
    } catch (err) {
      setError(err.message || "Connection error. Using demo mode.");
      if (email.includes("@")) {
        const role = email.startsWith("admin") ? "ADMIN"
          : email.startsWith("analyst") ? "ANALYST" : "HEALTH_WORKER";
        const name = email.split("@")[0];
        onLogin("demo-token", {
          accessToken: "demo-token", email, role,
          fullName: name.charAt(0).toUpperCase() + name.slice(1),
        });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-1/2 relative flex flex-col justify-between p-12 overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0F2A4A 0%, #0EA5E9 60%, #14B8A6 100%)" }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <span className="text-white">⚕</span>
            </div>
            <div>
              <p className="text-white font-bold">DSAS</p>
              <p className="text-white/70 text-xs">Ministry of Public Health · Cameroon</p>
            </div>
          </div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur rounded-full px-3 py-1.5 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white text-xs font-medium">Live surveillance · 24/7</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              National Disease<br />Intelligence<br />Platform
            </h1>
            <p className="text-white/75 text-base leading-relaxed max-w-sm">
              Monitor outbreaks, detect anomalies, and coordinate public health response across all regions in real time.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[{value:"10",label:"REGIONS"},{value:"8",label:"SERVICES"},{value:"24/7",label:"MONITORING"}].map(s => (
              <div key={s.label} className="bg-white/15 backdrop-blur rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-white/60 text-xs mt-0.5 font-medium tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-white/50 text-xs">🔒 ISO 27001 · End-to-end encrypted · WHO data standards</p>
      </div>

      <div className="w-1/2 flex items-center justify-center bg-white p-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your surveillance account.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                <span className="text-slate-400">✉</span>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-700 bg-transparent"
                  placeholder="admin@dsas.gov" required />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-700">Password</label>
              </div>
              <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-3 py-3 focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                <span className="text-slate-400">🔒</span>
                <input type={showPw ? "text" : "password"} value={password} onChange={e=>setPassword(e.target.value)}
                  className="flex-1 text-sm outline-none text-slate-700 bg-transparent" required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-slate-400 hover:text-slate-600">
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            {error && <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">{error}</div>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #0EA5E9, #14B8A6)" }}>
              {loading ? <><span className="animate-spin">⟳</span> Signing in...</> : <><span>Sign In</span><span>→</span></>}
            </button>
          </form>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-xs font-semibold text-slate-600 mb-2">Demo accounts — click to use:</p>
            <div className="flex flex-col gap-1">
              {["admin@dsas.gov","analyst@dsas.gov","worker@dsas.gov"].map(e => (
                <button key={e} onClick={() => setEmail(e)} className="text-xs text-sky-600 hover:underline text-left">{e}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
