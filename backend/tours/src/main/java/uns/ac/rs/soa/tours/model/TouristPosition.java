package uns.ac.rs.soa.tours.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("position_records")
public class TouristPosition {
    @Id
    private String id;
    private String touristId;
    private double latitude;
    private double longitude;
    private LocalDateTime recordedAt;
}
