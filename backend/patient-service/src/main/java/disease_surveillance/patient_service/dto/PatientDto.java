package disease_surveillance.patient_service.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class PatientDto {

    public record CreatePatientRequest(
            String patientCode,

            @NotNull(message = "Age is required")
            @Min(value = 0, message = "Age must be >= 0")
            @Max(value = 150, message = "Age must be <= 150")
            Integer age,

            @NotBlank(message = "Gender is required")
            String gender,

            @NotBlank(message = "Symptoms are required")
            String symptoms,

            @NotBlank(message = "Diagnosis is required")
            String diagnosis,

            @NotBlank(message = "Disease is required")
            String disease,

            @NotBlank(message = "Region is required")
            String region,

            String street
    ) {}

    public record UpdatePatientRequest(
            Integer age,
            String gender,
            String symptoms,
            String diagnosis,
            String disease,
            String region,
            String street
    ) {}

    public record CreatePatientResponse(
            Long id,
            String patientCode,
            Integer age,
            String gender,
            String symptoms,
            String diagnosis,
            String disease,
            String region,
            String street,
            String reportedBy,
            LocalDateTime reportedAt
    ) {}

    public record PatientSummary(
            Long id,
            String patientCode,
            String disease,
            String region,
            String gender,
            Integer age,
            LocalDateTime reportedAt
    ) {}

    public record DiseaseCount(String disease, Long count) {}

    public record RegionCount(String region, Long count) {}
}