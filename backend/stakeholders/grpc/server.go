package grpc

import (
	"context"
	"log"
	"net"
	"os"

	"github.com/golang-jwt/jwt/v5"
	"google.golang.org/grpc"

	authpb "stakeholders-service/gen/auth"
)

type authServer struct {
	authpb.UnimplementedAuthServiceServer
}

type claims struct {
	UserID string `json:"userId"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func (s *authServer) ValidateToken(_ context.Context, req *authpb.ValidateTokenRequest) (*authpb.ValidateTokenResponse, error) {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "secret"
	}
	c := &claims{}
	token, err := jwt.ParseWithClaims(req.Token, c, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return &authpb.ValidateTokenResponse{Valid: false}, nil
	}
	return &authpb.ValidateTokenResponse{
		Valid:  true,
		UserId: c.UserID,
		Role:   c.Role,
	}, nil
}

func StartServer(addr string) {
	lis, err := net.Listen("tcp", addr)
	if err != nil {
		log.Fatalf("gRPC listen %s: %v", addr, err)
	}
	s := grpc.NewServer()
	authpb.RegisterAuthServiceServer(s, &authServer{})
	log.Printf("gRPC server listening on %s", addr)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("gRPC serve: %v", err)
	}
}
