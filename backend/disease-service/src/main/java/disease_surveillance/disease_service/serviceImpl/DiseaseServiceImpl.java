package disease_surveillance.disease_service.serviceImpl;

import disease_surveillance.disease_service.dto.DiseaseDto;
import disease_surveillance.disease_service.entity.Disease;
import disease_surveillance.disease_service.exception.DiseaseAlreadyExistsException;
import disease_surveillance.disease_service.exception.DiseaseNotFoundException;
import disease_surveillance.disease_service.repository.DiseaseRepository;
import disease_surveillance.disease_service.service.DiseaseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;

    // ── Mapper ────────────────────────────────────────────────────────────────

    private DiseaseDto.DiseaseResponse toResponse(Disease d) {
        return new DiseaseDto.DiseaseResponse(
                d.getId(),
                d.getName(),
                d.getDescription(),
                d.getThresholdLimit(),
                d.getCreatedAt(),
                d.getUpdatedAt()
        );
    }

    private Disease toEntity(DiseaseDto.DiseaseRequest request) {
        return Disease.builder()
                .name(request.name().trim())
                .description(request.description())
                .thresholdLimit(request.thresholdLimit())
                .build();
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public DiseaseDto.DiseaseResponse create(DiseaseDto.DiseaseRequest request) {
        log.info("Creating disease with name: {}", request.name());

        if (diseaseRepository.existsByName(request.name().trim())) {
            throw new DiseaseAlreadyExistsException(
                    "Disease with name '" + request.name() + "' already exists");
        }

        Disease saved = diseaseRepository.save(toEntity(request));
        log.info("Disease created with id: {}", saved.getId());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DiseaseDto.PagedDiseaseResponse getAll(int page, int size, String sortBy, String sortDir) {
        log.info("Fetching diseases – page={}, size={}, sortBy={}, sortDir={}", page, size, sortBy, sortDir);

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name())
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Disease> diseasePage = diseaseRepository.findAll(pageable);

        List<DiseaseDto.DiseaseResponse> content = diseasePage.getContent()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return new DiseaseDto.PagedDiseaseResponse(
                content,
                diseasePage.getNumber(),
                diseasePage.getSize(),
                diseasePage.getTotalElements(),
                diseasePage.getTotalPages(),
                diseasePage.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DiseaseDto.DiseaseResponse getById(Long id) {
        log.info("Fetching disease with id: {}", id);
        return diseaseRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new DiseaseNotFoundException("Disease not found with id: " + id));
    }

    @Override
    @Transactional
    public DiseaseDto.DiseaseResponse update(Long id, DiseaseDto.DiseaseRequest request) {
        log.info("Updating disease with id: {}", id);

        Disease existing = diseaseRepository.findById(id)
                .orElseThrow(() -> new DiseaseNotFoundException("Disease not found with id: " + id));

        // If name is changing, ensure no duplicate
        String newName = request.name().trim();
        if (!existing.getName().equalsIgnoreCase(newName)
                && diseaseRepository.existsByName(newName)) {
            throw new DiseaseAlreadyExistsException(
                    "Disease with name '" + newName + "' already exists");
        }

        existing.setName(newName);
        existing.setDescription(request.description());
        existing.setThresholdLimit(request.thresholdLimit());

        Disease updated = diseaseRepository.save(existing);
        log.info("Disease updated: {}", updated.getId());
        return toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        log.info("Deleting disease with id: {}", id);
        if (!diseaseRepository.existsById(id)) {
            throw new DiseaseNotFoundException("Disease not found with id: " + id);
        }
        diseaseRepository.deleteById(id);
        log.info("Disease deleted: {}", id);
    }

    // ── Lookups ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public DiseaseDto.DiseaseResponse getByName(String name) {
        log.info("Fetching disease by name: {}", name);
        return diseaseRepository.findByName(name)
                .map(this::toResponse)
                .orElseThrow(() -> new DiseaseNotFoundException(
                        "Disease not found with name: " + name));
    }

    // ── Threshold queries ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDto.DiseaseResponse> getDiseasesByThreshold(Integer threshold) {
        log.info("Fetching diseases with threshold: {}", threshold);
        return diseaseRepository.findByThresholdLimit(threshold)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDto.DiseaseResponse> getDiseasesAboveThreshold(Integer threshold) {
        log.info("Fetching diseases above threshold: {}", threshold);
        return diseaseRepository.findByThresholdLimitGreaterThan(threshold)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Search ────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDto.DiseaseResponse> searchDiseases(String keyword) {
        log.info("Searching diseases with keyword: {}", keyword);
        return diseaseRepository.searchByKeyword(keyword.trim())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── Aggregates / utility ──────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public long getTotalDiseasesCount() {
        long count = diseaseRepository.count();
        log.info("Total diseases count: {}", count);
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByName(String name) {
        return diseaseRepository.existsByName(name.trim());
    }

    /**
     * Returns diseases created in the last 30 days, sorted newest-first.
     */
    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDto.DiseaseResponse> getRecentDiseases() {
        LocalDateTime since = LocalDateTime.now().minusDays(30);
        log.info("Fetching diseases created after: {}", since);
        return diseaseRepository.findByCreatedAtAfterOrderByCreatedAtDesc(since)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Integer> getDiseaseThresholds() {
        log.info("Fetching disease threshold map");
        return diseaseRepository.findNamesAndThresholds()
                .stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Integer) row[1],
                        (a, b) -> a,           // keep first on conflict (shouldn't occur)
                        LinkedHashMap::new     // preserve alphabetical order from query
                ));
    }

    // ── Bulk operations ───────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<DiseaseDto.DiseaseResponse> bulkCreate(List<DiseaseDto.DiseaseRequest> requests) {
        log.info("Bulk creating {} diseases", requests.size());

        // Validate no duplicates within the batch itself
        long distinctNames = requests.stream()
                .map(r -> r.name().trim().toLowerCase())
                .distinct()
                .count();
        if (distinctNames < requests.size()) {
            throw new DiseaseAlreadyExistsException(
                    "Bulk request contains duplicate disease names");
        }

        // Validate none already exist in DB
        requests.forEach(r -> {
            if (diseaseRepository.existsByName(r.name().trim())) {
                throw new DiseaseAlreadyExistsException(
                        "Disease with name '" + r.name() + "' already exists");
            }
        });

        List<Disease> entities = requests.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());

        List<Disease> saved = diseaseRepository.saveAll(entities);
        log.info("Bulk created {} diseases", saved.size());

        return saved.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
