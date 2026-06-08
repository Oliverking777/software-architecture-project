import api from './axios'

// ── Disease Service ───────────────────────────────────────────
// Talks to: api-gateway → disease-service (Spring Boot, port 8083)
// All endpoints proxied through /disease-service/*

/**
 * GET /disease-service?page=0&size=10&sortBy=name&sortDir=asc
 * Returns: PagedDiseaseResponse { content, pageNumber, pageSize, totalElements, totalPages, last }
 */
export const getAllDiseases = (page = 0, size = 10, sortBy = 'name', sortDir = 'asc') =>
  api.get('/disease-service', { params: { page, size, sortBy, sortDir } })

/**
 * GET /disease-service/{id}
 * Returns: DiseaseResponse
 */
export const getDiseaseById = (id) =>
  api.get(`/disease-service/${id}`)

/**
 * GET /disease-service/name/{name}
 */
export const getDiseaseByName = (name) =>
  api.get(`/disease-service/name/${name}`)

/**
 * GET /disease-service/thresholds
 * Returns: { diseaseName: thresholdLimit } — used for dashboard Disease Distribution chart
 */
export const getDiseaseThresholds = () =>
  api.get('/disease-service/thresholds')

/**
 * GET /disease-service/count
 * Returns: number — total diseases registered
 */
export const getTotalDiseaseCount = () =>
  api.get('/disease-service/count')

/**
 * GET /disease-service/recent
 * Returns: DiseaseResponse[] — diseases added in last 30 days
 */
export const getRecentDiseases = () =>
  api.get('/disease-service/recent')

/**
 * GET /disease-service/search?keyword=fever
 */
export const searchDiseases = (keyword) =>
  api.get('/disease-service/search', { params: { keyword } })

/**
 * POST /disease-service
 * Body: DiseaseRequest { name, description, thresholdLimit }
 */
export const createDisease = (data) =>
  api.post('/disease-service', data)

/**
 * PUT /disease-service/{id}
 */
export const updateDisease = (id, data) =>
  api.put(`/disease-service/${id}`, data)

/**
 * DELETE /disease-service/{id}
 */
export const deleteDisease = (id) =>
  api.delete(`/disease-service/${id}`)

/**
 * POST /disease-service/bulk
 * Body: DiseaseRequest[]
 */
export const bulkCreateDiseases = (requests) =>
  api.post('/disease-service/bulk', requests)