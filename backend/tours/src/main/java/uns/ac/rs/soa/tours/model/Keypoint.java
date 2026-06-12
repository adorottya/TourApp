package uns.ac.rs.soa.tours.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("keypoints")
public class Keypoint {
    @Id
    private String id;
    private String tourId;
    private String name;
    private String description;
    private double latitude;
    private double longitude;
    private String image;
    private int orderIndex;
}
