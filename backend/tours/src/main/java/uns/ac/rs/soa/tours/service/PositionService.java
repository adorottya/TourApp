package uns.ac.rs.soa.tours.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uns.ac.rs.soa.tours.model.TouristPosition;
import uns.ac.rs.soa.tours.repository.PositionRepository;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PositionService {

    private final PositionRepository positionRepository;

    public TouristPosition record(String touristId, Map<String, Object> body) {
        TouristPosition pos = TouristPosition.builder()
                .touristId(touristId)
                .latitude(((Number) body.get("latitude")).doubleValue())
                .longitude(((Number) body.get("longitude")).doubleValue())
                .recordedAt(LocalDateTime.now())
                .build();
        return positionRepository.save(pos);
    }

    public TouristPosition getLatest(String touristId) {
        return positionRepository.findTopByTouristIdOrderByRecordedAtDesc(touristId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No position recorded"));
    }
}
