package disease_surveillance.disease_service.controller;

import disease_surveillance.disease_service.dto.DiseaseDto;
import disease_surveillance.disease_service.service.DiseaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/disease-service")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseService diseaseService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * POST /disease-service
     * Create a single disease.
     */
    @PostMapping
    public ResponseEntity<DiseaseDto.DiseaseResponse> create(
            @Valid @RequestBody DiseaseDto.DiseaseRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(diseaseService.create(request));
    }

    /**
     * GET /disease-service?page=0&size=10&sortBy=name&sortDir=asc
     * Paginated list of all diseases.
     */
    @GetMapping
    public ResponseEntity<DiseaseDto.PagedDiseaseResponse> getAll(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc")  String sortDir) {
        return ResponseEntity.ok(diseaseService.getAll(page, size, sortBy, sortDir));
    }

    /**
     * GET /disease-service/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<DiseaseDto.DiseaseResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(diseaseService.getById(id));
    }

    /**
     * PUT /disease-service/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<DiseaseDto.DiseaseResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody DiseaseDto.DiseaseRequest request) {
        return ResponseEntity.ok(diseaseService.update(id, request));
    }

    /**
     * DELETE /disease-service/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        diseaseService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── Lookups ───────────────────────────────────────────────────────────────

    /**
     * GET /disease-service/name/{name}
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<DiseaseDto.DiseaseResponse> getByName(@PathVariable String name) {
        return ResponseEntity.ok(diseaseService.getByName(name));
    }

    /**
     * GET /disease-service/exists?name=Malaria
     */
    @GetMapping("/exists")
    public ResponseEntity<Boolean> existsByName(@RequestParam String name) {
        return ResponseEntity.ok(diseaseService.existsByName(name));
    }

    // ── Threshold queries ─────────────────────────────────────────────────────

    /**
     * GET /disease-service/threshold?value=100
     * Diseases whose threshold equals the given value.
     */
    @GetMapping("/threshold")
    public ResponseEntity<List<DiseaseDto.DiseaseResponse>> getByThreshold(
            @RequestParam Integer value) {
        return ResponseEntity.ok(diseaseService.getDiseasesByThreshold(value));
    }

    /**
     * GET /disease-service/threshold/above?value=100
     * Diseases whose threshold is strictly above the given value.
     */
    @GetMapping("/threshold/above")
    public ResponseEntity<List<DiseaseDto.DiseaseResponse>> getAboveThreshold(
            @RequestParam Integer value) {
        return ResponseEntity.ok(diseaseService.getDiseasesAboveThreshold(value));
    }

    /**
     * GET /disease-service/thresholds
     * Returns { diseaseName → thresholdLimit } map.
     */
    @GetMapping("/thresholds")
    public ResponseEntity<Map<String, Integer>> getDiseaseThresholds() {
        return ResponseEntity.ok(diseaseService.getDiseaseThresholds());
    }

    // ── Search ────────────────────────────────────────────────────────────────

    /**
     * GET /disease-service/search?keyword=fever
     */
    @GetMapping("/search")
    public ResponseEntity<List<DiseaseDto.DiseaseResponse>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(diseaseService.searchDiseases(keyword));
    }

    // ── Aggregates / utility ──────────────────────────────────────────────────

    /**
     * GET /disease-service/count
     */
    @GetMapping("/count")
    public ResponseEntity<Long> getTotalCount() {
        return ResponseEntity.ok(diseaseService.getTotalDiseasesCount());
    }

    /**
     * GET /disease-service/recent
     * Diseases created in the last 30 days, newest-first.
     */
    @GetMapping("/recent")
    public ResponseEntity<List<DiseaseDto.DiseaseResponse>> getRecent() {
        return ResponseEntity.ok(diseaseService.getRecentDiseases());
    }

    // ── Bulk ──────────────────────────────────────────────────────────────────

    /**
     * POST /disease-service/bulk
     * Create multiple diseases in one request.
     */
    @PostMapping("/bulk")
    public ResponseEntity<List<DiseaseDto.DiseaseResponse>> bulkCreate(
            @Valid @RequestBody List<DiseaseDto.DiseaseRequest> requests) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(diseaseService.bulkCreate(requests));
    }
}