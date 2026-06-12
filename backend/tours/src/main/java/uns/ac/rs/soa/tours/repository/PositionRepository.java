package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.TouristPosition;

import java.util.Optional;

public interface PositionRepository extends MongoRepository<TouristPosition, String> {
    Optional<TouristPosition> findTopByTouristIdOrderByRecordedAtDesc(String touristId);
}
