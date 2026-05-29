package disease_surveillance.disease_service.exception;

public class DiseaseAlreadyExistsException extends RuntimeException {
    public DiseaseAlreadyExistsException(String message) {
        super(message);
    }
}
