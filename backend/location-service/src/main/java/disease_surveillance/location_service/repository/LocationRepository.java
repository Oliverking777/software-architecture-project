package disease_surveillance.location_service.repository;

import disease_surveillance.location_service.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    // --- Pageable finders (used by getAll, getByRegion, getByDistrict) ---
    Page<Location> findAll(Pageable pageable);

    Page<Location> findByRegion(String region, Pageable pageable);

    Page<Location> findByDistrict(String district, Pageable pageable);

    // --- Non-pageable finders ---
    List<Location> findByRegion(String region);

    List<Location> findByDistrict(String district);

    Optional<Location> findByRegionAndDistrict(String region, String district);

    boolean existsByRegionAndDistrict(String region, String district);

    boolean existsByDistrict(String district);

    // --- Keyword search across region and district ---
    @Query("SELECT l FROM Location l WHERE " +
            "LOWER(l.region) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(l.district) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Location> searchByKeyword(@Param("keyword") String keyword);

    // --- Count by region ---
    long countByRegion(String region);

    // --- Distinct regions ---
    @Query("SELECT DISTINCT l.region FROM Location l ORDER BY l.region")
    List<String> findAllDistinctRegions();

    // --- Districts within a region ---
    @Query("SELECT l.district FROM Location l WHERE l.region = :region ORDER BY l.district")
    List<String> findDistrictsByRegion(@Param("region") String region);

    // --- Count distinct districts in a region ---
    @Query("SELECT COUNT(DISTINCT l.district) FROM Location l WHERE l.region = :region")
    long countDistinctDistrictsByRegion(@Param("region") String region);

    // --- Most recently inserted locations (last 10 by id desc) ---
    List<Location> findTop10ByOrderByIdDesc();
}
