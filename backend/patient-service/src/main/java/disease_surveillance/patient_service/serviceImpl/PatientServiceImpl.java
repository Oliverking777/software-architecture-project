package disease_surveillance.patient_service.serviceImpl;

import disease_surveillance.patient_service.dto.PatientDto;
import disease_surveillance.patient_service.entity.Patient;
import disease_surveillance.patient_service.event.PatientEventPublisher;
import disease_surveillance.patient_service.exception.PatientNotFoundException;
import disease_surveillance.patient_service.mapper.PatientMapper;
import disease_surveillance.patient_service.repository.PatientRepository;
import disease_surveillance.patient_service.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientEventPublisher eventPublisher;

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public PatientDto.CreatePatientResponse createPatientCase(PatientDto.CreatePatientRequest request, String reportedBy) {
        // Auto-generate patientCode if not provided
        String code = (request.patientCode() != null && !request.patientCode().isBlank())
                ? request.patientCode()
                : "PAT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        if (patientRepository.existsByPatientCode(code)) {
            throw new IllegalArgumentException("Patient code already exists: " + code);
        }

        Patient patient = Patient.builder()
                .patientCode(code)
                .age(request.age())
                .gender(PatientMapper.toGenderEnum(request.gender()))
                .symptoms(request.symptoms())
                .diagnosis(request.diagnosis())
                .disease(request.disease())
                .region(request.region())
                .street(request.street())
                .reportedBy(reportedBy)
                .reportDate(LocalDateTime.now())
                .build();

        PatientDto.CreatePatientResponse response = PatientMapper.toResponse(patientRepository.save(patient));
        eventPublisher.publishPatientCreated(response);
        return response;
    }

    @Override
    public PatientDto.CreatePatientResponse getPatientById(Long id) {
        return patientRepository.findById(id)
                .map(PatientMapper::toResponse)
                .orElseThrow(() -> new PatientNotFoundException(id));
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    @Transactional
    public PatientDto.CreatePatientResponse updatePatient(Long id, PatientDto.UpdatePatientRequest request) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(id));

        if (request.age()      != null) patient.setAge(request.age());
        if (request.gender()   != null) patient.setGender(PatientMapper.toGenderEnum(request.gender()));
        if (request.symptoms() != null) patient.setSymptoms(request.symptoms());
        if (request.diagnosis()!= null) patient.setDiagnosis(request.diagnosis());
        if (request.disease()  != null) patient.setDisease(request.disease());
        if (request.region()   != null) patient.setRegion(request.region());
        if (request.street()   != null) patient.setStreet(request.street());

        PatientDto.CreatePatientResponse response = PatientMapper.toResponse(patientRepository.save(patient));
        eventPublisher.publishPatientUpdated(response);
        return response;
    }

    @Override
    @Transactional
    public void deletePatient(Long id) {
        if (!patientRepository.existsById(id)) {
            throw new PatientNotFoundException(id);
        }
        patientRepository.deleteById(id);
        eventPublisher.publishPatientDeleted(id);
    }

    // ── Filtering / Queries ───────────────────────────────────────────────────

    @Override
    public Page<PatientDto.CreatePatientResponse> getByDisease(String disease, Pageable pageable) {
        return patientRepository.findByDiseaseIgnoreCase(disease, pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> getByRegion(String region, Pageable pageable) {
        return patientRepository.findByRegionIgnoreCase(region, pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> getByStreet(String street, Pageable pageable) {
        return patientRepository.findByStreetIgnoreCase(street, pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> getByDateRange(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must be before 'to' date");
        }
        return patientRepository.findByReportDateBetween(from, to, pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> getRecentCases(LocalDateTime since, Pageable pageable) {
        return patientRepository.findByReportDateAfter(since, pageable)
                .map(PatientMapper::toResponse);
    }

    @Override
    public Page<PatientDto.CreatePatientResponse> searchCases(
            String disease, String region, String symptoms, String reportedBy, Pageable pageable) {
        return patientRepository.searchCases(disease, region, symptoms, reportedBy, pageable)
                .map(PatientMapper::toResponse);
    }

    // ── Statistics ────────────────────────────────────────────────────────────

    @Override
    public long getTotalCasesCount() {
        return patientRepository.count();
    }

    @Override
    public long getCasesCountByDisease(String disease) {
        return patientRepository.countByDiseaseIgnoreCase(disease);
    }

    @Override
    public long getCasesCountByRegion(String region) {
        return patientRepository.countByRegionIgnoreCase(region);
    }

    @Override
    public Page<PatientDto.DiseaseCount> getCasesGroupedByDisease(Pageable pageable) {
        return patientRepository.countCasesGroupedByDisease(pageable);
    }

    @Override
    public Page<PatientDto.RegionCount> getCasesGroupedByRegion(Pageable pageable) {
        return patientRepository.countCasesGroupedByRegion(pageable);
    }
}