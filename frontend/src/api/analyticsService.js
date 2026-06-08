import api from './axios'

// ── Analytics Service ─────────────────────────────────────────
// Talks to: api-gateway → analytics-service (FastAPI, port 8085)
// All endpoints proxied through /api/v1/analytics/*

/**
 * GET /api/v1/analytics/stats
 * Returns: { case_counts: { "disease:region": count }, total_tracked: number }
 */
export const getAnalyticsStats = () =>
  api.get('/analytics-service/api/v1/analytics/stats')

/**
 * GET /api/v1/analytics/thresholds
 * Returns: { disease_name: threshold_limit }
 */
export const getAnalyticsThresholds = () =>
  api.get('/analytics-service/api/v1/analytics/thresholds')

/**
 * GET /api/v1/analytics/kpis
 * Returns aggregated KPI totals derived from case_counts
 * (see analytics main.py — we add this endpoint below)
 */
export const getKpis = () =>
  api.get('/analytics-service/api/v1/analytics/kpis')

/**
 * GET /api/v1/analytics/by-disease
 * Returns: [{ name, value }] — total cases grouped by disease
 */
export const getCasesByDisease = () =>
  api.get('/analytics-service/api/v1/analytics/by-disease')

/**
 * GET /api/v1/analytics/by-region
 * Returns: [{ region, cases }] — total cases grouped by region
 */
export const getCasesByRegion = () =>
  api.get('/analytics-service/api/v1/analytics/by-region')

/**
 * GET /api/v1/analytics/alerts
 * Returns: [{ id, disease, region, caseCount, severity }]
 */
export const getActiveAlerts = () =>
  api.get('/analytics-service/api/v1/analytics/alerts')