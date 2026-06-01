package disease_surveillance.location_service.service;

import disease_surveillance.location_service.dto.LocationDto.LocationRequest;
import disease_surveillance.location_service.entity.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface LocationService {

    Location create(LocationRequest request);

    Page<Location> getAll(Pageable pageable);

    Location getById(Long id);

    Location update(Long id, LocationRequest request);

    void delete(Long id);

    Page<Location> getByRegion(String region, Pageable pageable);

    Page<Location> getByDistrict(String district, Pageable pageable);

    Location getByRegionAndDistrict(String region, String district);

    List<Location> searchLocations(String keyword);

    long getTotalLocationsCount();

    boolean existsByRegionAndDistrict(String region, String district);

    List<Location> bulkCreate(List<LocationRequest> requests);

    List<String> getAllRegions();

    List<String> getDistrictsByRegion(String region);

    long countDistrictsByRegion(String region);

    long countLocationsByRegion(String region);

    List<Location> getRecentLocations();
}