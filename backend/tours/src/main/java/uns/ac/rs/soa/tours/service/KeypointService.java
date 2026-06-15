package uns.ac.rs.soa.tours.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uns.ac.rs.soa.tours.model.Keypoint;
import uns.ac.rs.soa.tours.model.Tour;
import uns.ac.rs.soa.tours.repository.KeypointRepository;
import uns.ac.rs.soa.tours.repository.TourRepository;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KeypointService {

    private final KeypointRepository keypointRepository;
    private final TourRepository tourRepository;

    public Keypoint create(String tourId, String guideId, Map<String, Object> body) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
        if (!tour.getGuideId().equals(guideId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your tour");
        }

        int orderIndex = keypointRepository.findByTourId(tourId).size() + 1;

        Keypoint kp = Keypoint.builder()
                .tourId(tourId)
                .name((String) body.get("name"))
                .description((String) body.getOrDefault("description", ""))
                .latitude(((Number) body.get("latitude")).doubleValue())
                .longitude(((Number) body.get("longitude")).doubleValue())
                .image((String) body.getOrDefault("image", ""))
                .orderIndex(orderIndex)
                .build();
        return keypointRepository.save(kp);
    }

    public List<Keypoint> list(String tourId) {
        return keypointRepository.findByTourId(tourId).stream()
                .sorted(Comparator.comparingInt(Keypoint::getOrderIndex))
                .collect(Collectors.toList());
    }

    public List<Keypoint> reorder(String tourId, String guideId, List<String> keypointIds) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
        if (!tour.getGuideId().equals(guideId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your tour");
        }

        List<Keypoint> existing = list(tourId);
        if (keypointIds.size() != existing.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Must provide every keypoint id");
        }

        Map<String, Keypoint> byId = existing.stream()
                .collect(Collectors.toMap(Keypoint::getId, kp -> kp));

        for (String id : keypointIds) {
            if (!byId.containsKey(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown keypoint id: " + id);
            }
        }

        for (int i = 0; i < keypointIds.size(); i++) {
            Keypoint kp = byId.get(keypointIds.get(i));
            kp.setOrderIndex(i + 1);
            keypointRepository.save(kp);
        }

        return list(tourId);
    }

    public void delete(String tourId, String keypointId, String guideId) {
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));
        if (!tour.getGuideId().equals(guideId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your tour");
        }
        keypointRepository.deleteByTourIdAndId(tourId, keypointId);

        List<Keypoint> remaining = list(tourId);
        for (int i = 0; i < remaining.size(); i++) {
            Keypoint kp = remaining.get(i);
            kp.setOrderIndex(i + 1);
            keypointRepository.save(kp);
        }
    }
}
