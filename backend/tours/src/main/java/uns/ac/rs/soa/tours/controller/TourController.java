package uns.ac.rs.soa.tours.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uns.ac.rs.soa.tours.model.Tour;
import uns.ac.rs.soa.tours.service.TourService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tours")
@RequiredArgsConstructor
public class TourController {

    private final TourService tourService;

    @PostMapping
    public ResponseEntity<Tour> create(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody Map<String, Object> body) {
        if (!"guide".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(tourService.create(userId, body));
    }

    @GetMapping
    public ResponseEntity<List<Tour>> listPublished() {
        return ResponseEntity.ok(tourService.getPublished());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Tour>> myTours(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(tourService.getByGuide(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Tour> getById(@PathVariable String id) {
        return ResponseEntity.ok(tourService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tour> update(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader("X-User-Role") String role,
            @RequestBody Map<String, Object> body) {
        if (!"guide".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(tourService.update(id, userId, body));
    }
}
