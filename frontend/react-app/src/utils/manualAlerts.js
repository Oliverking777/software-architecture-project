const KEY = "dsas_manual_alerts";

export const loadManualAlerts = () => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "[]"); } catch { return []; }
};

export const saveManualAlerts = (list) => sessionStorage.setItem(KEY, JSON.stringify(list));
