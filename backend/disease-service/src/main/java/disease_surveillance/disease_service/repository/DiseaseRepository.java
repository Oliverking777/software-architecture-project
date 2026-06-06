package disease_surveillance.disease_service.repository;

import disease_surveillance.disease_service.entity.Disease;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DiseaseRepository extends JpaRepository<Disease, Long> {

    // ── Lookup ────────────────────────────────────────────────────────────────

    Optional<Disease> findByName(String name);

    boolean existsByName(String name);

    // ── Paginated list (used by getAll) ───────────────────────────────────────

    Page<Disease> findAll(Pageable pageable);

    // ── Threshold queries ─────────────────────────────────────────────────────

    /** Diseases whose threshold equals the given value */
    List<Disease> findByThresholdLimit(Integer thresholdLimit);

    /** Diseases whose threshold is strictly above the given value */
    List<Disease> findByThresholdLimitGreaterThan(Integer thresholdLimit);

    // ── Full-text keyword search across name and description ──────────────────

    @Query("SELECT d FROM Disease d WHERE " +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Disease> searchByKeyword(@Param("keyword") String keyword);

    // ── Aggregate / projection ────────────────────────────────────────────────

    /** Returns all (name, thresholdLimit) pairs – used for the threshold map */
    @Query("SELECT d.name, d.thresholdLimit FROM Disease d ORDER BY d.name")
    List<Object[]> findNamesAndThresholds();

    // ── Recent diseases (last 30 days, newest first) ──────────────────────────

    List<Disease> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime since);
}
