package disease_surveillance.patient_service.event;

import disease_surveillance.patient_service.config.RabbitMQConstants;
import disease_surveillance.patient_service.dto.PatientDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class PatientEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishPatientCreated(PatientDto.CreatePatientResponse patient) {
        PatientEventDto event = buildEvent(patient, "PATIENT_CASE_RECORDED");
        publish(RabbitMQConstants.PATIENT_CREATED_ROUTING_KEY, event);
        log.info("Published PATIENT_CASE_RECORDED event for patientCode={}", patient.patientCode());
    }

    public void publishPatientUpdated(PatientDto.CreatePatientResponse patient) {
        PatientEventDto event = buildEvent(patient, "PATIENT_CASE_UPDATED");
        publish(RabbitMQConstants.PATIENT_UPDATED_ROUTING_KEY, event);
        log.info("Published PATIENT_CASE_UPDATED event for patientCode={}", patient.patientCode());
    }

    public void publishPatientDeleted(Long patientId) {
        PatientEventDto event = PatientEventDto.builder()
                .eventType("PATIENT_CASE_DELETED")
                .eventTime(LocalDateTime.now())
                .patientId(patientId)
                .build();
        publish(RabbitMQConstants.PATIENT_DELETED_ROUTING_KEY, event);
        log.info("Published PATIENT_CASE_DELETED event for patientId={}", patientId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void publish(String routingKey, PatientEventDto event) {
        try {
            rabbitTemplate.convertAndSend(
                    RabbitMQConstants.PATIENT_EXCHANGE,
                    routingKey,
                    event
            );
        } catch (Exception e) {
            // Log the failure but do NOT rethrow — the DB operation already succeeded.
            // A dead-letter queue or retry mechanism can handle this in a later phase.
            log.error("Failed to publish event [{}] for patientId={}: {}",
                    event.getEventType(), event.getPatientId(), e.getMessage());
        }
    }

    private PatientEventDto buildEvent(PatientDto.CreatePatientResponse patient, String eventType) {
        return PatientEventDto.builder()
                .eventType(eventType)
                .eventTime(LocalDateTime.now())
                .patientId(patient.id())
                .patientCode(patient.patientCode())
                .age(patient.age())
                .gender(patient.gender())
                .symptoms(patient.symptoms())
                .diagnosis(patient.diagnosis())
                .disease(patient.disease())
                .region(patient.region())
                .street(patient.street())
                .reportedBy(patient.reportedBy())
                .reportDate(patient.reportedAt())
                .build();
    }
}
