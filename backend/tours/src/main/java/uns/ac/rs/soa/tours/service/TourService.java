package uns.ac.rs.soa.tours.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uns.ac.rs.soa.tours.model.Tour;
import uns.ac.rs.soa.tours.repository.TourRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TourService {

    private final TourRepository tourRepository;

    public Tour create(String guideId, Map<String, Object> body) {
        Tour tour = Tour.builder()
                .guideId(guideId)
                .name((String) body.get("name"))
                .description((String) body.getOrDefault("description", ""))
                .difficulty((String) body.getOrDefault("difficulty", "EASY"))
                .tags(body.containsKey("tags") ? (List<String>) body.get("tags") : List.of())
                .status("DRAFT")
                .price(0.0)
                .createdAt(LocalDateTime.now())
                .build();
        return tourRepository.save(tour);
    }

    public List<Tour> getPublished() {
        return tourRepository.findByStatus("PUBLISHED");
    }

    public List<Tour> getByGuide(String guideId) {
        return tourRepository.findByGuideId(guideId);
    }

    public Tour getById(String id) {
        return tourRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
    }

    public Tour update(String id, String guideId, Map<String, Object> body) {
        Tour tour = getById(id);
        if (!tour.getGuideId().equals(guideId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your tour");
        }
        if (body.containsKey("name")) tour.setName((String) body.get("name"));
        if (body.containsKey("description")) tour.setDescription((String) body.get("description"));
        if (body.containsKey("difficulty")) tour.setDifficulty((String) body.get("difficulty"));
        if (body.containsKey("tags")) tour.setTags((List<String>) body.get("tags"));
        if (body.containsKey("status")) tour.setStatus((String) body.get("status"));
        if (body.containsKey("price")) {
            tour.setPrice(((Number) body.get("price")).doubleValue());
        }
        return tourRepository.save(tour);
    }
}
