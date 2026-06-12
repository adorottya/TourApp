package grpc

import (
	"context"
	"fmt"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	tourpb "gateway/gen/tour"
)

type TourClient struct {
	client tourpb.TourServiceClient
	conn   *grpc.ClientConn
}

func NewTourClient() (*TourClient, error) {
	addr := os.Getenv("TOURS_GRPC_ADDR")
	if addr == "" {
		addr = "tours:9092"
	}
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("connect to tours gRPC: %w", err)
	}
	return &TourClient{client: tourpb.NewTourServiceClient(conn), conn: conn}, nil
}

func (t *TourClient) GetTour(tourID string) (*tourpb.GetTourResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	return t.client.GetTour(ctx, &tourpb.GetTourRequest{TourId: tourID})
}

func (t *TourClient) Close() { t.conn.Close() }
