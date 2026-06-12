package uns.ac.rs.soa.tours.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uns.ac.rs.soa.tours.model.TourExecution;
import uns.ac.rs.soa.tours.service.ExecutionService;

import java.util.Map;

@RestController
@RequestMapping("/api/executions")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;

    @PostMapping
    public ResponseEntity<TourExecution> start(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(executionService.start(userId, body));
    }

    @GetMapping("/active")
    public ResponseEntity<TourExecution> getActive(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(executionService.getActive(userId));
    }

    @GetMapping("/{id}/check-keypoints")
    public ResponseEntity<Map<String, Object>> checkKeypoints(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(executionService.checkKeypoints(id, userId));
    }

    @PostMapping("/{id}/update-position")
    public ResponseEntity<TourExecution> updatePosition(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        double lat = ((Number) body.get("latitude")).doubleValue();
        double lon = ((Number) body.get("longitude")).doubleValue();
        return ResponseEntity.ok(executionService.updatePosition(id, userId, lat, lon));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<TourExecution> complete(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(executionService.complete(id, userId));
    }

    @PostMapping("/{id}/abandon")
    public ResponseEntity<TourExecution> abandon(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(executionService.abandon(id, userId));
    }
}
