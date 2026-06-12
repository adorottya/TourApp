package uns.ac.rs.soa.tours.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("tour_executions")
public class TourExecution {
    @Id
    private String id;
    private String touristId;
    private String tourId;
    private String tokenId;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime endedAt;
    @Builder.Default
    private List<String> visitedKeypoints = new ArrayList<>();
    private double lastKnownLat;
    private double lastKnownLong;
    private LocalDateTime lastActivity;
}
