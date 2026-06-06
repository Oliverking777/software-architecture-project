package disease_surveillance.disease_service.exception;

// ── DiseaseNotFoundException ──────────────────────────────────────────────────

public class DiseaseNotFoundException extends RuntimeException {
    public DiseaseNotFoundException(String message) {
        super(message);
    }
}