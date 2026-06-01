package disease_surveillance.disease_service.service;

import disease_surveillance.disease_service.dto.DiseaseDto;

import java.util.List;
import java.util.Map;

public interface DiseaseService {

    // ── CRUD ──────────────────────────────────────────────────────────────────

    DiseaseDto.DiseaseResponse create(DiseaseDto.DiseaseRequest request);

    /** Returns a paginated list of all diseases. */
    DiseaseDto.PagedDiseaseResponse getAll(int page, int size, String sortBy, String sortDir);

    DiseaseDto.DiseaseResponse getById(Long id);

    DiseaseDto.DiseaseResponse update(Long id, DiseaseDto.DiseaseRequest request);

    void delete(Long id);

    // ── Lookups ───────────────────────────────────────────────────────────────

    DiseaseDto.DiseaseResponse getByName(String name);

    // ── Threshold queries ─────────────────────────────────────────────────────

    List<DiseaseDto.DiseaseResponse> getDiseasesByThreshold(Integer threshold);

    List<DiseaseDto.DiseaseResponse> getDiseasesAboveThreshold(Integer threshold);

    // ── Search ────────────────────────────────────────────────────────────────

    List<DiseaseDto.DiseaseResponse> searchDiseases(String keyword);

    // ── Aggregates / utility ──────────────────────────────────────────────────

    long getTotalDiseasesCount();

    boolean existsByName(String name);

    List<DiseaseDto.DiseaseResponse> getRecentDiseases();

    /** Returns a map of { diseaseName → thresholdLimit } for all diseases. */
    Map<String, Integer> getDiseaseThresholds();

    // ── Bulk operations ───────────────────────────────────────────────────────

    List<DiseaseDto.DiseaseResponse> bulkCreate(List<DiseaseDto.DiseaseRequest> requests);
}
