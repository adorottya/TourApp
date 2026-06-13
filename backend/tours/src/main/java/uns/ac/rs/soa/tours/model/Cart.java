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
@Document("carts")
public class Cart {
    @Id
    private String id;
    private String touristId;
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    private double totalPrice;
    private LocalDateTime updatedAt;
}
