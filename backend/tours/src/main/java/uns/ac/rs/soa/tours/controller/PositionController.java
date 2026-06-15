package uns.ac.rs.soa.tours.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uns.ac.rs.soa.tours.model.TouristPosition;
import uns.ac.rs.soa.tours.service.PositionService;

import java.util.Map;

@RestController
@RequestMapping("/api/position")
@RequiredArgsConstructor
public class PositionController {

    private final PositionService positionService;

    @PostMapping("/record")
    public ResponseEntity<Map<String, Object>> record(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(positionService.recordWithExecution(userId, body));
    }

    @GetMapping("/latest")
    public ResponseEntity<TouristPosition> getLatest(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(positionService.getLatest(userId));
    }
}
