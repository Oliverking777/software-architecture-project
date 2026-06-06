package disease_surveillance.location_service.serviceImpl;

import disease_surveillance.location_service.dto.LocationDto.LocationRequest;
import disease_surveillance.location_service.entity.Location;
import disease_surveillance.location_service.repository.LocationRepository;
import disease_surveillance.location_service.service.LocationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationServiceImpl implements LocationService {

    private final LocationRepository locationRepository;

    // -------------------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public Location create(LocationRequest request) {
        log.info("Creating location: region={}, district={}", request.region(), request.district());

        if (locationRepository.existsByDistrict(request.district())) {
            throw new IllegalArgumentException(
                    "A location with district '" + request.district() + "' already exists.");
        }

        Location location = Location.builder()
                .region(request.region())
                .district(request.district())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .build();

        return locationRepository.save(location);
    }

    // -------------------------------------------------------------------------
    // READ — ALL (paginated)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<Location> getAll(Pageable pageable) {
        log.info("Fetching all locations — page={}, size={}", pageable.getPageNumber(), pageable.getPageSize());
        return locationRepository.findAll(pageable);
    }

    // -------------------------------------------------------------------------
    // READ — BY ID
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Location getById(Long id) {
        log.info("Fetching location by id={}", id);
        return locationRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Location not found with id: " + id));
    }

    // -------------------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public Location update(Long id, LocationRequest request) {
        log.info("Updating location id={}", id);

        Location existing = getById(id);

        // If district is changing, ensure the new district name is not already taken
        if (!existing.getDistrict().equalsIgnoreCase(request.district())
                && locationRepository.existsByDistrict(request.district())) {
            throw new IllegalArgumentException(
                    "District '" + request.district() + "' is already assigned to another location.");
        }

        existing.setRegion(request.region());
        existing.setDistrict(request.district());
        existing.setLatitude(request.latitude());
        existing.setLongitude(request.longitude());

        return locationRepository.save(existing);
    }

    // -------------------------------------------------------------------------
    // DELETE
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting location id={}", id);
        Location existing = getById(id);
        locationRepository.delete(existing);
    }

    // -------------------------------------------------------------------------
    // READ — BY REGION (paginated)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<Location> getByRegion(String region, Pageable pageable) {
        log.info("Fetching locations by region={}", region);
        return locationRepository.findByRegion(region, pageable);
    }

    // -------------------------------------------------------------------------
    // READ — BY DISTRICT (paginated)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Page<Location> getByDistrict(String district, Pageable pageable) {
        log.info("Fetching locations by district={}", district);
        return locationRepository.findByDistrict(district, pageable);
    }

    // -------------------------------------------------------------------------
    // READ — BY REGION AND DISTRICT
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public Location getByRegionAndDistrict(String region, String district) {
        log.info("Fetching location by region={} and district={}", region, district);
        return locationRepository.findByRegionAndDistrict(region, district)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Location not found for region: " + region + " and district: " + district));
    }

    // -------------------------------------------------------------------------
    // SEARCH
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<Location> searchLocations(String keyword) {
        log.info("Searching locations with keyword='{}'", keyword);
        if (keyword == null || keyword.isBlank()) {
            return locationRepository.findAll();
        }
        return locationRepository.searchByKeyword(keyword.trim());
    }

    // -------------------------------------------------------------------------
    // COUNT — TOTAL
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long getTotalLocationsCount() {
        return locationRepository.count();
    }

    // -------------------------------------------------------------------------
    // EXISTS — BY REGION AND DISTRICT
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public boolean existsByRegionAndDistrict(String region, String district) {
        return locationRepository.existsByRegionAndDistrict(region, district);
    }

    // -------------------------------------------------------------------------
    // BULK CREATE
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public List<Location> bulkCreate(List<LocationRequest> requests) {
        log.info("Bulk creating {} locations", requests.size());

        List<Location> locations = requests.stream()
                .filter(req -> !locationRepository.existsByDistrict(req.district()))
                .map(req -> Location.builder()
                        .region(req.region())
                        .district(req.district())
                        .latitude(req.latitude())
                        .longitude(req.longitude())
                        .build())
                .collect(Collectors.toList());

        if (locations.isEmpty()) {
            throw new IllegalArgumentException(
                    "All provided districts already exist. No new locations were created.");
        }

        return locationRepository.saveAll(locations);
    }

    // -------------------------------------------------------------------------
    // ALL REGIONS
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllRegions() {
        log.info("Fetching all distinct regions");
        return locationRepository.findAllDistinctRegions();
    }

    // -------------------------------------------------------------------------
    // DISTRICTS BY REGION
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistrictsByRegion(String region) {
        log.info("Fetching districts for region={}", region);
        return locationRepository.findDistrictsByRegion(region);
    }

    // -------------------------------------------------------------------------
    // COUNT DISTRICTS BY REGION
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long countDistrictsByRegion(String region) {
        return locationRepository.countDistinctDistrictsByRegion(region);
    }

    // -------------------------------------------------------------------------
    // COUNT LOCATIONS BY REGION
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public long countLocationsByRegion(String region) {
        return locationRepository.countByRegion(region);
    }

    // -------------------------------------------------------------------------
    // RECENT LOCATIONS (last 10)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<Location> getRecentLocations() {
        log.info("Fetching 10 most recent locations");
        return locationRepository.findTop10ByOrderByIdDesc();
    }
}
