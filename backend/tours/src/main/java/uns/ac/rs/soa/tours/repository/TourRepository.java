package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.Tour;

import java.util.List;

public interface TourRepository extends MongoRepository<Tour, String> {
    List<Tour> findByGuideId(String guideId);
}
