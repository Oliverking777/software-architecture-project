package disease_surveillance.patient_service.service;

import disease_surveillance.patient_service.dto.PatientDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface PatientService {

    // ── CRUD ─────────────────────────────────────────────────────────────────

    PatientDto.CreatePatientResponse createPatientCase(PatientDto.CreatePatientRequest request, String reportedBy);

    PatientDto.CreatePatientResponse getPatientById(Long id);

    Page<PatientDto.CreatePatientResponse> getAllPatients(Pageable pageable);

    PatientDto.CreatePatientResponse updatePatient(Long id, PatientDto.UpdatePatientRequest request);

    void deletePatient(Long id);

    // ── Filtering / Queries ───────────────────────────────────────────────────

    Page<PatientDto.CreatePatientResponse> getByDisease(String disease, Pageable pageable);

    Page<PatientDto.CreatePatientResponse> getByRegion(String region, Pageable pageable);

    Page<PatientDto.CreatePatientResponse> getByStreet(String street, Pageable pageable);

    Page<PatientDto.CreatePatientResponse> getByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<PatientDto.CreatePatientResponse> getRecentCases(LocalDateTime since, Pageable pageable);

    Page<PatientDto.CreatePatientResponse> searchCases(
            String disease, String region, String symptoms, String reportedBy, Pageable pageable);

    // ── Statistics ────────────────────────────────────────────────────────────

    long getTotalCasesCount();

    long getCasesCountByDisease(String disease);

    long getCasesCountByRegion(String region);

    Page<PatientDto.DiseaseCount> getCasesGroupedByDisease(Pageable pageable);

    Page<PatientDto.RegionCount> getCasesGroupedByRegion(Pageable pageable);
}
