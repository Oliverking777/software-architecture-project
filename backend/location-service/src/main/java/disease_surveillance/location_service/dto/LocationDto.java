package disease_surveillance.location_service.dto;

public class LocationDto {

    public record LocationRequest(
            String region,
            String district,
            Double latitude,
            Double longitude
    ) {}

    public record LocationResponse(
            Long id,
            String region,
            String district,
            Double latitude,
            Double longitude
    ) {}

    public record BulkCreateResponse(
            int requested,
            int created,
            java.util.List<LocationResponse> locations
    ) {}
}
