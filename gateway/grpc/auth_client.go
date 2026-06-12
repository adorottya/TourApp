package grpc

import (
	"context"
	"fmt"
	"os"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	authpb "gateway/gen/auth"
)

type AuthClient struct {
	client authpb.AuthServiceClient
	conn   *grpc.ClientConn
}

func NewAuthClient() (*AuthClient, error) {
	addr := os.Getenv("STAKEHOLDERS_GRPC_ADDR")
	if addr == "" {
		addr = "stakeholders:9091"
	}
	conn, err := grpc.NewClient(addr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, fmt.Errorf("connect to stakeholders gRPC: %w", err)
	}
	return &AuthClient{client: authpb.NewAuthServiceClient(conn), conn: conn}, nil
}

func (a *AuthClient) ValidateToken(token string) (userID, role string, err error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	resp, err := a.client.ValidateToken(ctx, &authpb.ValidateTokenRequest{Token: token})
	if err != nil {
		return "", "", err
	}
	if !resp.Valid {
		return "", "", fmt.Errorf("invalid token")
	}
	return resp.UserId, resp.Role, nil
}

func (a *AuthClient) Close() { a.conn.Close() }
