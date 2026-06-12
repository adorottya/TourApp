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
@Document("tour_purchase_tokens")
public class TourPurchaseToken {
    @Id
    private String id;
    private String touristId;
    private String tourId;
    private String tourName;
    private double price;
    private LocalDateTime purchasedAt;
}
