package uns.ac.rs.soa.tours.grpc;

import io.grpc.Server;
import io.grpc.ServerBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GrpcServerRunner implements CommandLineRunner {

    private final TourGrpcService tourGrpcService;

    @Value("${grpc.port:9092}")
    private int grpcPort;

    @Override
    public void run(String... args) throws Exception {
        Server server = ServerBuilder.forPort(grpcPort)
                .addService(tourGrpcService)
                .build()
                .start();

        log.info("gRPC server started on port {}", grpcPort);

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            log.info("Shutting down gRPC server");
            server.shutdown();
        }));
    }
}
