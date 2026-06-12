package uns.ac.rs.soa.tours.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import uns.ac.rs.soa.tours.model.Cart;
import uns.ac.rs.soa.tours.model.OrderItem;
import uns.ac.rs.soa.tours.model.Tour;
import uns.ac.rs.soa.tours.model.TourPurchaseToken;
import uns.ac.rs.soa.tours.repository.CartRepository;
import uns.ac.rs.soa.tours.repository.TokenRepository;
import uns.ac.rs.soa.tours.repository.TourRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final CartRepository cartRepository;
    private final TokenRepository tokenRepository;
    private final TourRepository tourRepository;

    public Cart getCart(String touristId) {
        return cartRepository.findByTouristId(touristId).orElse(
                Cart.builder().touristId(touristId).items(new ArrayList<>()).build()
        );
    }

    public Cart addItem(String touristId, Map<String, Object> body) {
        String tourId = (String) body.get("tourId");
        Tour tour = tourRepository.findById(tourId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tour not found"));

        if (!"PUBLISHED".equals(tour.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only published tours can be purchased");
        }

        Cart cart = cartRepository.findByTouristId(touristId)
                .orElse(Cart.builder().touristId(touristId).items(new ArrayList<>()).build());

        boolean alreadyInCart = cart.getItems().stream()
                .anyMatch(i -> i.getTourId().equals(tourId));
        if (!alreadyInCart) {
            cart.getItems().add(OrderItem.builder()
                    .tourId(tour.getId())
                    .tourName(tour.getName())
                    .price(tour.getPrice())
                    .build());
        }
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public Cart removeItem(String touristId, String tourId) {
        Cart cart = cartRepository.findByTouristId(touristId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart not found"));
        cart.getItems().removeIf(i -> i.getTourId().equals(tourId));
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    public List<TourPurchaseToken> checkout(String touristId) {
        Cart cart = cartRepository.findByTouristId(touristId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty"));
        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cart is empty");
        }

        List<TourPurchaseToken> tokens = new ArrayList<>();
        for (OrderItem item : cart.getItems()) {
            TourPurchaseToken token = TourPurchaseToken.builder()
                    .touristId(touristId)
                    .tourId(item.getTourId())
                    .tourName(item.getTourName())
                    .price(item.getPrice())
                    .purchasedAt(LocalDateTime.now())
                    .build();
            tokens.add(tokenRepository.save(token));
        }

        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);

        return tokens;
    }
}
