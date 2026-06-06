export const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}>
    {children}
  </div>
);

export const Badge = ({ level }) => {
  const map = {
    Active:"bg-red-100 text-red-700 border border-red-200",
    Recovered:"bg-green-100 text-green-700 border border-green-200",
    Critical:"bg-red-100 text-red-800 border border-red-300",
    CRITICAL:"bg-red-100 text-red-800 border border-red-300",
    Monitoring:"bg-blue-100 text-blue-700 border border-blue-200",
    High:"bg-orange-100 text-orange-700 border border-orange-200",
    HIGH:"bg-orange-100 text-orange-700 border border-orange-200",
    Medium:"bg-yellow-100 text-yellow-700 border border-yellow-200",
    MEDIUM:"bg-yellow-100 text-yellow-700 border border-yellow-200",
    Low:"bg-blue-100 text-blue-700 border border-blue-200",
    ADMIN:"bg-purple-100 text-purple-700 border border-purple-200",
    ANALYST:"bg-teal-100 text-teal-700 border border-teal-200",
    HEALTH_WORKER:"bg-sky-100 text-sky-700 border border-sky-200",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[level] ?? "bg-gray-100 text-gray-600"}`}>
      {level}
    </span>
  );
};

export const StatCard = ({ label, value, icon, sub, color = "#0EA5E9" }) => (
  <Card className="p-5 flex items-start gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: color + "18" }}>
      <span className="text-xl">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </div>
  </Card>
);

export const Spinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export const EmptyState = ({ icon = "📭", title, desc }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    <span className="text-4xl mb-3">{icon}</span>
    <p className="font-semibold text-slate-700">{title}</p>
    {desc && <p className="text-sm text-slate-400 mt-1">{desc}</p>}
  </div>
);

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const PrimaryBtn = ({ children, onClick, className = "", disabled = false }) => (
  <button onClick={onClick} disabled={disabled}
    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 ${className}`}
    style={{ background: "linear-gradient(135deg, #0EA5E9, #14B8A6)" }}>
    {children}
  </button>
);

export const SecondaryBtn = ({ children, onClick, className = "", disabled = false }) => (
  <button onClick={onClick} disabled={disabled}
    className={`flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50 ${className}`}>
    {children}
  </button>
);

export const Input = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>}
    <input type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} required={required}
      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-white" />
  </div>
);

export const Select = ({ label, value, onChange, options }) => (
  <div>
    {label && <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500 bg-white">
      {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
    </select>
  </div>
);

export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 text-lg">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export const Alert = ({ type = "info", message }) => {
  const styles = {
    info:"bg-blue-50 border-blue-200 text-blue-700",
    success:"bg-green-50 border-green-200 text-green-700",
    error:"bg-red-50 border-red-200 text-red-700",
    warning:"bg-yellow-50 border-yellow-200 text-yellow-700",
  };
  return (
    <div className={`border rounded-xl p-3 text-sm ${styles[type]}`}>{message}</div>
  );
};
