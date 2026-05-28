package disease_surveillance.patient_service.repository;

import disease_surveillance.patient_service.dto.PatientDto;
import disease_surveillance.patient_service.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface PatientRepository extends JpaRepository<Patient, Long> {

    // ── Filtering ────────────────────────────────────────────────────────────

    Page<Patient> findByDiseaseIgnoreCase(String disease, Pageable pageable);

    Page<Patient> findByRegionIgnoreCase(String region, Pageable pageable);

    Page<Patient> findByStreetIgnoreCase(String street, Pageable pageable);

    Page<Patient> findByReportDateBetween(LocalDateTime from, LocalDateTime to, Pageable pageable);

    Page<Patient> findByReportDateAfter(LocalDateTime since, Pageable pageable);

    @Query("""
            SELECT p FROM Patient p
            WHERE (:disease   IS NULL OR LOWER(p.disease)   LIKE LOWER(CONCAT('%', :disease,   '%')))
              AND (:region    IS NULL OR LOWER(p.region)    LIKE LOWER(CONCAT('%', :region,    '%')))
              AND (:symptoms  IS NULL OR LOWER(p.symptoms)  LIKE LOWER(CONCAT('%', :symptoms,  '%')))
              AND (:reportedBy IS NULL OR LOWER(p.reportedBy) LIKE LOWER(CONCAT('%', :reportedBy, '%')))
            """)
    Page<Patient> searchCases(
            @Param("disease")    String disease,
            @Param("region")     String region,
            @Param("symptoms")   String symptoms,
            @Param("reportedBy") String reportedBy,
            Pageable pageable
    );

    // ── Statistics ───────────────────────────────────────────────────────────

    long countByDiseaseIgnoreCase(String disease);

    long countByRegionIgnoreCase(String region);

    @Query(value = "SELECT new disease_surveillance.patient_service.dto.PatientDto$DiseaseCount(p.disease, COUNT(p)) FROM Patient p GROUP BY p.disease",
            countQuery = "SELECT COUNT(DISTINCT p.disease) FROM Patient p")
    Page<PatientDto.DiseaseCount> countCasesGroupedByDisease(Pageable pageable);

    @Query(value = "SELECT new disease_surveillance.patient_service.dto.PatientDto$RegionCount(p.region, COUNT(p)) FROM Patient p GROUP BY p.region",
            countQuery = "SELECT COUNT(DISTINCT p.region) FROM Patient p")
    Page<PatientDto.RegionCount> countCasesGroupedByRegion(Pageable pageable);

    boolean existsByPatientCode(String patientCode);
}
