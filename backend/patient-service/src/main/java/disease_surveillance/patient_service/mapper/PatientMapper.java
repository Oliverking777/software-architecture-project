package disease_surveillance.patient_service.mapper;

import disease_surveillance.patient_service.dto.PatientDto;
import disease_surveillance.patient_service.entity.Gender;
import disease_surveillance.patient_service.entity.Patient;

public class PatientMapper {

    private PatientMapper() {}

    public static PatientDto.CreatePatientResponse toResponse(Patient patient) {
        return new PatientDto.CreatePatientResponse(
                patient.getId(),
                patient.getPatientCode(),
                patient.getAge(),
                patient.getGender() != null ? patient.getGender().name() : null,
                patient.getSymptoms(),
                patient.getDiagnosis(),
                patient.getDisease(),
                patient.getRegion(),
                patient.getStreet(),
                patient.getReportedBy(),
                patient.getReportDate()
        );
    }

    public static Gender toGenderEnum(String gender) {
        try {
            return Gender.valueOf(gender.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid gender value: '" + gender + "'. Accepted values: MALE, FEMALE");
        }
    }
}
