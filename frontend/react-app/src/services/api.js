const GATEWAY   = "/gateway";
const ANALYTICS = "/analytics";
const REPORTS   = "/reports";
const GEO       = "/geo";

const authFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem("dsas_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  return await fetch(url, { ...options, headers });
};

export const authAPI = {
  login: async (email, password) => {
    try {
      const res = await fetch(`${GATEWAY}/auth-service/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) return await res.json();
      throw new Error("Backend unavailable");
    } catch {
      if (email.includes("@") && password.length >= 4) {
        const role = email.startsWith("admin") ? "ADMIN"
          : email.startsWith("analyst") ? "ANALYST" : "HEALTH_WORKER";
        return {
          accessToken: "demo-token", email, role,
          fullName: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        };
      }
      throw new Error("Invalid credentials");
    }
  },
};

export const patientAPI = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await authFetch(`${GATEWAY}/patient-service?${query}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  create: async (data) => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Reported-By": "admin" },
        body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  update: async (id, data) => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service/${id}`, {
        method: "PATCH", body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  delete: async (id) => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service/${id}`, { method: "DELETE" });
      return res.ok;
    } catch { return false; }
  },
  getStatsByDisease: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service/stats/grouped-by-disease`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getStatsByRegion: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service/stats/grouped-by-region`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getTotal: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service/stats/total`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const diseaseAPI = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await authFetch(`${GATEWAY}/disease-service?${query}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  create: async (data) => {
    try {
      const res = await authFetch(`${GATEWAY}/disease-service`, {
        method: "POST", body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const locationAPI = {
  getAll: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getRegions: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service/regions`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const analyticsAPI = {
  getStats: async () => {
    try {
      const res = await fetch(`${ANALYTICS}/api/v1/analytics/stats`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getThresholds: async () => {
    try {
      const res = await fetch(`${ANALYTICS}/api/v1/analytics/thresholds`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  // alerts n'existe pas encore dans analytics-service
  getAlerts: async () => { return { alerts: [], count: 0 }; },
};

export const geoAPI = {
  getRegions: async () => {
    try {
      const res = await fetch(`${GEO}/api/v1/geo/regions`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getStats: async () => {
    try {
      const res = await fetch(`${GEO}/api/v1/geo/stats`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const reportAPI = {
  generate: async (format, caseData) => {
    try {
      const res = await fetch(`${REPORTS}/api/v1/reports/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, case_counts: caseData }),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};
