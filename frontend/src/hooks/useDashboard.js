import { useState, useEffect, useCallback } from 'react'
import { getKpis, getCasesByDisease, getCasesByRegion, getActiveAlerts } from '../api/analyticsService'
import { getAllDiseases, getTotalDiseaseCount } from '../api/diseaseService'

// ── Shared fetch helper ───────────────────────────────────────
function useFetch(fetchFn, deps = []) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// ── KPI totals for dashboard header cards ────────────────────
// Returns: { totalCases, activeAlerts, diseases, affectedRegions }
export function useKpis() {
  return useFetch(() => getKpis())
}

// ── Disease distribution for pie chart ───────────────────────
// Returns: [{ name, value }]
export function useCasesByDisease() {
  return useFetch(() => getCasesByDisease())
}

// ── Cases by region for bar chart ────────────────────────────
// Returns: [{ region, cases }]
export function useCasesByRegion() {
  return useFetch(() => getCasesByRegion())
}

// ── Active alerts for alerts table ───────────────────────────
// Returns: [{ id, disease, region, caseCount, severity }]
export function useActiveAlerts() {
  return useFetch(() => getActiveAlerts())
}

// ── All diseases (paginated) ──────────────────────────────────
// Returns: PagedDiseaseResponse { content, totalElements, totalPages, ... }
export function useDiseases(page = 0, size = 10, sortBy = 'name', sortDir = 'asc') {
  return useFetch(() => getAllDiseases(page, size, sortBy, sortDir), [page, size, sortBy, sortDir])
}

// ── Total disease count — for "Diseases" KPI card ────────────
export function useTotalDiseaseCount() {
  return useFetch(() => getTotalDiseaseCount())
}

// ── Poll analytics on an interval (for Live Activity Feed) ───
export function usePolledAlerts(intervalMs = 30000) {
  const { data, loading, error, refetch } = useActiveAlerts()

  useEffect(() => {
    const interval = setInterval(refetch, intervalMs)
    return () => clearInterval(interval)
  }, [refetch, intervalMs])

  return { data, loading, error, refetch }
}