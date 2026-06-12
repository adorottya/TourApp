package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	grpcclient "gateway/grpc"
	"gateway/middleware"
	"gateway/proxy"
)

func serviceURL(envKey, fallback string) string {
	if v := os.Getenv(envKey); v != "" {
		return v
	}
	return fallback
}

func main() {
	authClient, err := grpcclient.NewAuthClient()
	if err != nil {
		log.Fatalf("auth gRPC client: %v", err)
	}
	defer authClient.Close()

	tourClient, err := grpcclient.NewTourClient()
	if err != nil {
		log.Fatalf("tour gRPC client: %v", err)
	}
	defer tourClient.Close()

	_ = tourClient // used in checkout handler when implemented

	stakeholdersURL := serviceURL("STAKEHOLDERS_URL", "http://stakeholders:8081")
	toursURL := serviceURL("TOURS_URL", "http://tours:8082")
	blogsURL := serviceURL("BLOGS_URL", "http://blogs:8083")
	followerURL := serviceURL("FOLLOWER_URL", "http://follower:8084")

	r := gin.Default()
	r.RedirectTrailingSlash = false
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
		// public — no auth
		api.Any("/auth/*path", proxy.To(stakeholdersURL))

		// protected
		protected := api.Group("")
		protected.Use(middleware.Auth(authClient))
		{
			protected.Any("/users", proxy.To(stakeholdersURL))
			protected.Any("/users/*path", proxy.To(stakeholdersURL))
			protected.Any("/tours", proxy.To(toursURL))
			protected.Any("/tours/*path", proxy.To(toursURL))
			protected.Any("/blogs", proxy.To(blogsURL))
			protected.Any("/blogs/*path", proxy.To(blogsURL))
			protected.Any("/social", proxy.To(followerURL))
			protected.Any("/social/*path", proxy.To(followerURL))
		}
	}

	if err := r.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}
