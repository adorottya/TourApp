package uns.ac.rs.soa.tours.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uns.ac.rs.soa.tours.model.Keypoint;
import uns.ac.rs.soa.tours.service.KeypointService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tours/{tourId}/keypoints")
@RequiredArgsConstructor
public class KeypointController {

    private final KeypointService keypointService;

    @PostMapping
    public ResponseEntity<Keypoint> create(
            @PathVariable String tourId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody Map<String, Object> body) {
        if (!"guide".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(keypointService.create(tourId, userId, body));
    }

    @GetMapping
    public ResponseEntity<List<Keypoint>> list(@PathVariable String tourId) {
        return ResponseEntity.ok(keypointService.list(tourId));
    }

    @DeleteMapping("/{keypointId}")
    public ResponseEntity<Void> delete(
            @PathVariable String tourId,
            @PathVariable String keypointId,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role) {
        if (!"guide".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        keypointService.delete(tourId, keypointId, userId);
        return ResponseEntity.noContent().build();
    }
}
