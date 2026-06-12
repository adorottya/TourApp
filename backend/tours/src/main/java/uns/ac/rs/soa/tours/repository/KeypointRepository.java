package uns.ac.rs.soa.tours.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import uns.ac.rs.soa.tours.model.Keypoint;

import java.util.List;

public interface KeypointRepository extends MongoRepository<Keypoint, String> {
    List<Keypoint> findByTourId(String tourId);
    void deleteByTourIdAndId(String tourId, String id);
}
