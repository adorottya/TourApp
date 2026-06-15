package uns.ac.rs.soa.tours.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uns.ac.rs.soa.tours.model.Keypoint;
import uns.ac.rs.soa.tours.model.TourExecution;
import uns.ac.rs.soa.tours.repository.ExecutionRepository;
import uns.ac.rs.soa.tours.repository.KeypointRepository;
import uns.ac.rs.soa.tours.repository.TokenRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    static final double KEYPOINT_RADIUS_METERS = 200.0;

    private final ExecutionRepository executionRepository;
    private final TokenRepository tokenRepository;
    private final KeypointRepository keypointRepository;

    public TourExecution start(String touristId, Map<String, Object> body) {
        String tokenId = (String) body.get("tokenId");

        if (!tokenRepository.existsById(tokenId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Token not found");
        }

        var token = tokenRepository.findById(tokenId).get();
        if (!token.getTouristId().equals(touristId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Token does not belong to you");
        }

        if (executionRepository.existsByTouristIdAndStatus(touristId, "ACTIVE")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have an active execution");
        }

        LocalDateTime now = LocalDateTime.now();
        TourExecution execution = TourExecution.builder()
                .touristId(touristId)
                .tourId(token.getTourId())
                .tokenId(tokenId)
                .status("ACTIVE")
                .startedAt(now)
                .lastActivity(now)
                .visitedKeypoints(new ArrayList<>())
                .build();
        return executionRepository.save(execution);
    }

    public Map<String, Object> trackProgress(String executionId, String touristId, double lat, double lon) {
        TourExecution execution = findActive(executionId, touristId);
        execution.setLastKnownLat(lat);
        execution.setLastKnownLong(lon);

        List<String> visited = new ArrayList<>(ensureVisitedList(execution));
        List<Keypoint> keypoints = keypointRepository.findByTourId(execution.getTourId());

        for (Keypoint kp : keypoints) {
            if (!visited.contains(kp.getId())) {
                double dist = haversine(lat, lon, kp.getLatitude(), kp.getLongitude());
                if (dist < KEYPOINT_RADIUS_METERS) {
                    visited.add(kp.getId());
                }
            }
        }

        execution.setVisitedKeypoints(visited);
        execution.setLastActivity(LocalDateTime.now());
        executionRepository.save(execution);

        return Map.of(
                "visitedKeypoints", visited,
                "totalKeypoints", keypoints.size(),
                "lastKnownLat", lat,
                "lastKnownLon", lon
        );
    }

    public Map<String, Object> checkKeypoints(String executionId, String touristId) {
        TourExecution execution = findActive(executionId, touristId);
        return trackProgress(
                executionId,
                touristId,
                execution.getLastKnownLat(),
                execution.getLastKnownLong()
        );
    }

    public TourExecution updatePosition(String executionId, String touristId, double lat, double lon) {
        trackProgress(executionId, touristId, lat, lon);
        return findActive(executionId, touristId);
    }

    public TourExecution complete(String executionId, String touristId) {
        TourExecution execution = findActive(executionId, touristId);
        LocalDateTime now = LocalDateTime.now();
        execution.setStatus("COMPLETED");
        execution.setEndedAt(now);
        execution.setLastActivity(now);
        return executionRepository.save(execution);
    }

    public TourExecution abandon(String executionId, String touristId) {
        TourExecution execution = findActive(executionId, touristId);
        LocalDateTime now = LocalDateTime.now();
        execution.setStatus("ABANDONED");
        execution.setEndedAt(now);
        execution.setLastActivity(now);
        return executionRepository.save(execution);
    }

    public TourExecution getActive(String touristId) {
        TourExecution execution = executionRepository.findByTouristIdAndStatus(touristId, "ACTIVE")
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No active execution"));
        if (execution.getVisitedKeypoints() == null) {
            execution.setVisitedKeypoints(new ArrayList<>());
            executionRepository.save(execution);
        }
        return execution;
    }

    private TourExecution findActive(String executionId, String touristId) {
        TourExecution execution = executionRepository.findById(executionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Execution not found"));
        if (!execution.getTouristId().equals(touristId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your execution");
        }
        if (!"ACTIVE".equals(execution.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Execution is not active");
        }
        return execution;
    }

    private List<String> ensureVisitedList(TourExecution execution) {
        if (execution.getVisitedKeypoints() == null) {
            return new ArrayList<>();
        }
        return execution.getVisitedKeypoints();
    }

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
