package disease_surveillance.disease_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDateTime;
import java.util.List;

public class DiseaseDto {

    // ── Requests ──────────────────────────────────────────────────────────────

    public record DiseaseRequest(
            @NotBlank(message = "Name is required")
            String name,

            String description,

            @NotNull(message = "Threshold limit is required")
            @Positive(message = "Threshold limit must be positive")
            Integer thresholdLimit
    ) {}

    // ── Responses ─────────────────────────────────────────────────────────────

    public record DiseaseResponse(
            Long id,
            String name,
            String description,
            Integer thresholdLimit,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {}

    /** Paginated wrapper returned by getAll() */
    public record PagedDiseaseResponse(
            List<DiseaseResponse> content,
            int pageNumber,
            int pageSize,
            long totalElements,
            int totalPages,
            boolean last
    ) {}

    // ── Legacy aliases kept for backward compatibility ─────────────────────

    /** @deprecated Use {@link DiseaseRequest} instead */
    @Deprecated
    public record CreateDiseaseRequest(String name, String description, Integer thresholdLimit) {}

    /** @deprecated Use {@link DiseaseResponse} instead */
    @Deprecated
    public record CreateDiseaseResponse(Long id, String name, String description, Integer thresholdLimit) {}
}