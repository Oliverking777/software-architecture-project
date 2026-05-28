package disease_surveillance.patient_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientEventDto {

    // ── Event metadata ────────────────────────────────────────────────────────
    private String eventType;         // PATIENT_CASE_RECORDED | PATIENT_CASE_UPDATED | PATIENT_CASE_DELETED
    private LocalDateTime eventTime;  // when the event was emitted

    // ── Patient data ──────────────────────────────────────────────────────────
    // Consumers get everything they need here — no callback to Patient Service required.
    private Long   patientId;
    private String patientCode;
    private Integer age;
    private String gender;
    private String symptoms;
    private String diagnosis;
    private String disease;
    private String region;
    private String street;
    private String reportedBy;
    private LocalDateTime reportDate;
}
