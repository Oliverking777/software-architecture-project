package disease_surveillance.patient_service.controller;

import disease_surveillance.patient_service.dto.PatientDto;
import disease_surveillance.patient_service.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/patient-service")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    // ── CRUD ──────────────────────────────────────────────────────────────────

    /**
     * POST /patient-service
     * Header: X-Reported-By: <reporter-id or username>
     * (JWT integration will replace the header in a later phase)
     */
    @PostMapping
    public ResponseEntity<PatientDto.CreatePatientResponse> createPatient(
            @Valid @RequestBody PatientDto.CreatePatientRequest request,
            @RequestHeader(value = "X-Reported-By", defaultValue = "anonymous") String reportedBy) {

        PatientDto.CreatePatientResponse response = patientService.createPatientCase(request, reportedBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /patient-service/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatientDto.CreatePatientResponse> getPatientById(@PathVariable Long id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    /**
     * GET /patient-service?page=0&size=20&sort=reportDate,desc
     */
    @GetMapping
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getAllPatients(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(patientService.getAllPatients(pageable));
    }

    /**
     * PATCH /patient-service/{id}
     */
    @PatchMapping("/{id}")
    public ResponseEntity<PatientDto.CreatePatientResponse> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDto.UpdatePatientRequest request) {

        return ResponseEntity.ok(patientService.updatePatient(id, request));
    }

    /**
     * DELETE /patient-service/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // ── Filtering / Queries ───────────────────────────────────────────────────

    /**
     * GET /patient-service/filter/disease?name=Cholera&page=0&size=20&sort=reportDate,desc
     */
    @GetMapping("/filter/disease")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getByDisease(
            @RequestParam String name,
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "20")            int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        return ResponseEntity.ok(patientService.getByDisease(name, buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/filter/region?name=Littoral&page=0&size=20&sort=reportDate,desc
     */
    @GetMapping("/filter/region")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getByRegion(
            @RequestParam String name,
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "20")            int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        return ResponseEntity.ok(patientService.getByRegion(name, buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/filter/street?name=Akwa&page=0&size=20&sort=reportDate,desc
     */
    @GetMapping("/filter/street")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getByStreet(
            @RequestParam String name,
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "20")            int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        return ResponseEntity.ok(patientService.getByStreet(name, buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/filter/date-range?from=2025-01-01T00:00:00&to=2025-12-31T23:59:59&sort=reportDate,asc
     */
    @GetMapping("/filter/date-range")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "20")            int size,
            @RequestParam(defaultValue = "reportDate,asc") String sort) {

        return ResponseEntity.ok(patientService.getByDateRange(from, to, buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/filter/recent?since=2025-06-01T00:00:00&sort=reportDate,desc
     */
    @GetMapping("/filter/recent")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> getRecentCases(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since,
            @RequestParam(defaultValue = "0")               int page,
            @RequestParam(defaultValue = "20")              int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        return ResponseEntity.ok(patientService.getRecentCases(since, buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/search?disease=Malaria&region=Centre&symptoms=fever&reportedBy=drsmith&sort=reportDate,desc
     */
    @GetMapping("/search")
    public ResponseEntity<Page<PatientDto.CreatePatientResponse>> searchCases(
            @RequestParam(required = false) String disease,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String symptoms,
            @RequestParam(required = false) String reportedBy,
            @RequestParam(defaultValue = "0")               int page,
            @RequestParam(defaultValue = "20")              int size,
            @RequestParam(defaultValue = "reportDate,desc") String sort) {

        return ResponseEntity.ok(
                patientService.searchCases(disease, region, symptoms, reportedBy, buildPageable(page, size, sort)));
    }

    // ── Statistics ────────────────────────────────────────────────────────────

    /**
     * GET /patient-service/stats/total
     */
    @GetMapping("/stats/total")
    public ResponseEntity<Long> getTotalCount() {
        return ResponseEntity.ok(patientService.getTotalCasesCount());
    }

    /**
     * GET /patient-service/stats/by-disease?name=Cholera
     */
    @GetMapping("/stats/by-disease")
    public ResponseEntity<Long> getCountByDisease(@RequestParam String name) {
        return ResponseEntity.ok(patientService.getCasesCountByDisease(name));
    }

    /**
     * GET /patient-service/stats/by-region?name=Littoral
     */
    @GetMapping("/stats/by-region")
    public ResponseEntity<Long> getCountByRegion(@RequestParam String name) {
        return ResponseEntity.ok(patientService.getCasesCountByRegion(name));
    }

    /**
     * GET /patient-service/stats/grouped-by-disease?page=0&size=10&sort=count,desc
     */
    @GetMapping("/stats/grouped-by-disease")
    public ResponseEntity<Page<PatientDto.DiseaseCount>> getGroupedByDisease(
            @RequestParam(defaultValue = "0")          int page,
            @RequestParam(defaultValue = "10")         int size,
            @RequestParam(defaultValue = "disease,asc") String sort) {

        return ResponseEntity.ok(patientService.getCasesGroupedByDisease(buildPageable(page, size, sort)));
    }

    /**
     * GET /patient-service/stats/grouped-by-region?page=0&size=10&sort=count,desc
     */
    @GetMapping("/stats/grouped-by-region")
    public ResponseEntity<Page<PatientDto.RegionCount>> getGroupedByRegion(
            @RequestParam(defaultValue = "0")          int page,
            @RequestParam(defaultValue = "10")         int size,
            @RequestParam(defaultValue = "region,asc") String sort) {

        return ResponseEntity.ok(patientService.getCasesGroupedByRegion(buildPageable(page, size, sort)));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Pageable buildPageable(int page, int size, String sort) {
        String[] parts = sort.split(",");
        String field = parts[0];
        Sort.Direction direction = (parts.length > 1 && parts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(direction, field));
    }
}
