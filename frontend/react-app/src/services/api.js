const GATEWAY = "/gateway";

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
  // auth-service wraps responses as ApiResponse<LoginResponse>:
  // { status, message, data: { token, tokenType, user: { id, email, fullName, role, createdAt } }, timestamp }
  login: async (email, password) => {
    const res = await fetch(`${GATEWAY}/auth-service/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data?.token) {
      throw new Error(body?.message || "Invalid email or password.");
    }
    const { token, user } = body.data;
    return {
      accessToken: token,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    };
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
  create: async (data, reportedBy = "anonymous") => {
    try {
      const res = await authFetch(`${GATEWAY}/patient-service`, {
        method: "POST",
        headers: { "X-Reported-By": reportedBy },
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
  update: async (id, data) => {
    try {
      const res = await authFetch(`${GATEWAY}/disease-service/${id}`, {
        method: "PUT", body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  delete: async (id) => {
    try {
      const res = await authFetch(`${GATEWAY}/disease-service/${id}`, { method: "DELETE" });
      return res.ok;
    } catch { return false; }
  },
};

export const locationAPI = {
  getAll: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await authFetch(`${GATEWAY}/location-service?${query}`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getRegions: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service/regions`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  create: async (data) => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service`, {
        method: "POST", body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  update: async (id, data) => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service/${id}`, {
        method: "PUT", body: JSON.stringify(data),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  delete: async (id) => {
    try {
      const res = await authFetch(`${GATEWAY}/location-service/${id}`, { method: "DELETE" });
      return res.ok;
    } catch { return false; }
  },
};

export const analyticsAPI = {
  getStats: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/analytics/stats`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getThresholds: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/analytics/thresholds`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getAlerts: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/analytics/alerts`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const geoAPI = {
  getRegions: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/geo/regions`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getStats: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/geo/stats`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
  getMap: async () => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/geo/map`);
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};

export const healthAPI = {
  check: async (path) => {
    try {
      const res = await authFetch(`${GATEWAY}${path}`);
      return res.ok;
    } catch { return false; }
  },
};

export const reportAPI = {
  generate: async (format, caseCounts) => {
    try {
      const res = await authFetch(`${GATEWAY}/api/v1/reports/generate`, {
        method: "POST",
        body: JSON.stringify({ format: format.toUpperCase(), case_counts: caseCounts }),
      });
      return res.ok ? await res.json() : null;
    } catch { return null; }
  },
};
