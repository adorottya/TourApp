package uns.ac.rs.soa.tours.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uns.ac.rs.soa.tours.model.Cart;
import uns.ac.rs.soa.tours.model.TourPurchaseToken;
import uns.ac.rs.soa.tours.service.PurchaseService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final PurchaseService purchaseService;

    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(purchaseService.getCart(userId));
    }

    @GetMapping("/tokens")
    public ResponseEntity<List<TourPurchaseToken>> listTokens(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(purchaseService.listTokens(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<Cart> addItem(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.addItem(userId, body));
    }

    @DeleteMapping("/items/{tourId}")
    public ResponseEntity<Cart> removeItem(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable String tourId) {
        return ResponseEntity.ok(purchaseService.removeItem(userId, tourId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<List<TourPurchaseToken>> checkout(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(purchaseService.checkout(userId));
    }
}
