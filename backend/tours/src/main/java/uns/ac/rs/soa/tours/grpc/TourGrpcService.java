package uns.ac.rs.soa.tours.grpc;

import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import uns.ac.rs.soa.tours.repository.TourRepository;

@Service
@RequiredArgsConstructor
public class TourGrpcService extends TourServiceGrpc.TourServiceImplBase {

    private final TourRepository tourRepository;

    @Override
    public void getTour(Tour.GetTourRequest request, StreamObserver<Tour.GetTourResponse> responseObserver) {
        Tour.GetTourResponse response;
        var opt = tourRepository.findById(request.getTourId());
        if (opt.isPresent()) {
            var tour = opt.get();
            response = Tour.GetTourResponse.newBuilder()
                    .setTourId(tour.getId())
                    .setName(tour.getName())
                    .setGuideId(tour.getGuideId())
                    .setStatus(tour.getStatus())
                    .setPrice(tour.getPrice())
                    .setFound(true)
                    .build();
        } else {
            response = Tour.GetTourResponse.newBuilder()
                    .setTourId(request.getTourId())
                    .setFound(false)
                    .build();
        }
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
