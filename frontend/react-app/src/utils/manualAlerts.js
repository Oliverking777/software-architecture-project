const KEY = "dsas_manual_alerts";

export const loadManualAlerts = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const saveManualAlerts = (list) => localStorage.setItem(KEY, JSON.stringify(list));
