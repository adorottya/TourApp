package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.TourPurchaseToken;

import java.util.List;

public interface TokenRepository extends MongoRepository<TourPurchaseToken, String> {
    boolean existsByTouristIdAndTourId(String touristId, String tourId);
    List<TourPurchaseToken> findByTouristIdAndTourId(String touristId, String tourId);
    List<TourPurchaseToken> findByTouristIdOrderByPurchasedAtDesc(String touristId);
}
