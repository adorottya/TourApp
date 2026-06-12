package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.Cart;

import java.util.Optional;

public interface CartRepository extends MongoRepository<Cart, String> {
    Optional<Cart> findByTouristId(String touristId);
}
