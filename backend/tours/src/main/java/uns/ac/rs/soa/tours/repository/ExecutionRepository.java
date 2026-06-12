package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.TourExecution;

import java.util.Optional;

public interface ExecutionRepository extends MongoRepository<TourExecution, String> {
    Optional<TourExecution> findByTouristIdAndStatus(String touristId, String status);
    boolean existsByTouristIdAndStatus(String touristId, String status);
}
