package uns.ac.rs.soa.tours.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document("tours")
public class Tour {
    @Id
    private String id;
    private String guideId;
    private String name;
    private String description;
    private String difficulty;
    private List<String> tags;
    private String status;
    private double price;
    private LocalDateTime createdAt;
}
