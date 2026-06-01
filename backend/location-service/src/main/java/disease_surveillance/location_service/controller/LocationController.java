package disease_surveillance.location_service.controller;

import disease_surveillance.location_service.dto.LocationDto.LocationRequest;
import disease_surveillance.location_service.entity.Location;
import disease_surveillance.location_service.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/location-service")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    // -------------------------------------------------------------------------
    // POST /location-service
    // Create a single location
    // -------------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<Location> create(@RequestBody LocationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(locationService.create(request));
    }

    // -------------------------------------------------------------------------
    // POST /location-service/bulk
    // Bulk create locations
    // -------------------------------------------------------------------------
    @PostMapping("/bulk")
    public ResponseEntity<List<Location>> bulkCreate(@RequestBody List<LocationRequest> requests) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(locationService.bulkCreate(requests));
    }

    // -------------------------------------------------------------------------
    // GET /location-service?page=0&size=10&sort=id,asc
    // Get all locations (paginated)
    // -------------------------------------------------------------------------
    @GetMapping
    public ResponseEntity<Page<Location>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {

        Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(locationService.getAll(pageable));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/{id}
    // Get single location by ID
    // -------------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Location> getById(@PathVariable Long id) {
        return ResponseEntity.ok(locationService.getById(id));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/region/{region}?page=0&size=10
    // Get locations by region (paginated)
    // -------------------------------------------------------------------------
    @GetMapping("/region/{region}")
    public ResponseEntity<Page<Location>> getByRegion(
            @PathVariable String region,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {

        Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(locationService.getByRegion(region, pageable));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/district/{district}?page=0&size=10
    // Get locations by district (paginated)
    // -------------------------------------------------------------------------
    @GetMapping("/district/{district}")
    public ResponseEntity<Page<Location>> getByDistrict(
            @PathVariable String district,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,asc") String[] sort) {

        Pageable pageable = buildPageable(page, size, sort);
        return ResponseEntity.ok(locationService.getByDistrict(district, pageable));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/region/{region}/district/{district}
    // Get a specific location by region + district
    // -------------------------------------------------------------------------
    @GetMapping("/region/{region}/district/{district}")
    public ResponseEntity<Location> getByRegionAndDistrict(
            @PathVariable String region,
            @PathVariable String district) {
        return ResponseEntity.ok(locationService.getByRegionAndDistrict(region, district));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/search?keyword=abc
    // Full-text search across region and district
    // -------------------------------------------------------------------------
    @GetMapping("/search")
    public ResponseEntity<List<Location>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(locationService.searchLocations(keyword));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/recent
    // Get 10 most recently added locations
    // -------------------------------------------------------------------------
    @GetMapping("/recent")
    public ResponseEntity<List<Location>> getRecent() {
        return ResponseEntity.ok(locationService.getRecentLocations());
    }

    // -------------------------------------------------------------------------
    // GET /location-service/regions
    // Get all distinct region names
    // -------------------------------------------------------------------------
    @GetMapping("/regions")
    public ResponseEntity<List<String>> getAllRegions() {
        return ResponseEntity.ok(locationService.getAllRegions());
    }

    // -------------------------------------------------------------------------
    // GET /location-service/region/{region}/districts
    // Get all district names within a region
    // -------------------------------------------------------------------------
    @GetMapping("/region/{region}/districts")
    public ResponseEntity<List<String>> getDistrictsByRegion(@PathVariable String region) {
        return ResponseEntity.ok(locationService.getDistrictsByRegion(region));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/count
    // Get total location count
    // -------------------------------------------------------------------------
    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> getTotalCount() {
        return ResponseEntity.ok(Map.of("total", locationService.getTotalLocationsCount()));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/region/{region}/count
    // Get location count for a specific region
    // -------------------------------------------------------------------------
    @GetMapping("/region/{region}/count")
    public ResponseEntity<Map<String, Long>> countByRegion(@PathVariable String region) {
        return ResponseEntity.ok(Map.of(
                "region", locationService.countLocationsByRegion(region),
                "districts", locationService.countDistrictsByRegion(region)
        ));
    }

    // -------------------------------------------------------------------------
    // GET /location-service/exists?region=X&district=Y
    // Check if a location exists for a region+district pair
    // -------------------------------------------------------------------------
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> exists(
            @RequestParam String region,
            @RequestParam String district) {
        return ResponseEntity.ok(Map.of(
                "exists", locationService.existsByRegionAndDistrict(region, district)
        ));
    }

    // -------------------------------------------------------------------------
    // PUT /location-service/{id}
    // Update a location
    // -------------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<Location> update(
            @PathVariable Long id,
            @RequestBody LocationRequest request) {
        return ResponseEntity.ok(locationService.update(id, request));
    }

    // -------------------------------------------------------------------------
    // DELETE /location-service/{id}
    // Delete a location
    // -------------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        locationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // -------------------------------------------------------------------------
    // Helper — build Pageable from query params
    // -------------------------------------------------------------------------
    private Pageable buildPageable(int page, int size, String[] sort) {
        Sort.Direction direction = (sort.length > 1 && sort[1].equalsIgnoreCase("desc"))
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        String property = sort[0];
        return PageRequest.of(page, size, Sort.by(direction, property));
    }
}
