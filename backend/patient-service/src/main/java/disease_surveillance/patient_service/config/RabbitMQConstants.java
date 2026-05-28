package disease_surveillance.patient_service.config;

public final class RabbitMQConstants {

    private RabbitMQConstants() {}

    // ── Exchange ──────────────────────────────────────────────────────────────
    public static final String PATIENT_EXCHANGE = "patient.exchange";

    // ── Queues ────────────────────────────────────────────────────────────────
    public static final String PATIENT_CREATED_QUEUE = "patient.created.queue";
    public static final String PATIENT_UPDATED_QUEUE = "patient.updated.queue";
    public static final String PATIENT_DELETED_QUEUE = "patient.deleted.queue";

    // ── Routing Keys ──────────────────────────────────────────────────────────
    public static final String PATIENT_CREATED_ROUTING_KEY = "patient.case.recorded";
    public static final String PATIENT_UPDATED_ROUTING_KEY = "patient.case.updated";
    public static final String PATIENT_DELETED_ROUTING_KEY = "patient.case.deleted";
}
