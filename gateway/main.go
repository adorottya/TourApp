package main

import (
	"encoding/json"
	"log"
	"net/http"
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

	stakeholdersURL := serviceURL("STAKEHOLDERS_URL", "http://localhost:8081")
	toursURL := serviceURL("TOURS_URL", "http://localhost:8082")
	blogsURL := serviceURL("BLOGS_URL", "http://blogs:8083")
	followerURL := serviceURL("FOLLOWER_URL", "http://localhost:8084")

	r := gin.Default()
	r.RedirectTrailingSlash = false
	r.Use(middleware.CORS())

	api := r.Group("/api")
	{
        // public — no auth
        api.Any("/auth/*path", proxy.To(stakeholdersURL))
        api.GET("/tours", proxy.To(toursURL))
        api.GET("/tours/:id", proxy.To(toursURL))
        api.GET("/tours/:id/keypoints", proxy.To(toursURL))

        // protected
		protected := api.Group("")
		protected.Use(middleware.Auth(authClient))
		{
			protected.Any("/users", proxy.To(stakeholdersURL))
			protected.Any("/users/*path", proxy.To(stakeholdersURL))
			protected.Any("/tours", proxy.To(toursURL))
			protected.Any("/tours/*path", proxy.To(toursURL))

			// Cart — explicit routes so checkout can be intercepted for gRPC validation
			protected.GET("/cart", proxy.To(toursURL))
			protected.GET("/cart/tokens", proxy.To(toursURL))
			protected.POST("/cart/items", proxy.To(toursURL))
			protected.DELETE("/cart/items/:tourId", proxy.To(toursURL))
			// Checkout: validate every tour in the cart is still PUBLISHED via gRPC
			// before forwarding to the purchase service (second gRPC call alongside
			// the ValidateToken call that runs on every request).
			protected.POST("/cart/checkout", func(c *gin.Context) {
				userID := c.GetHeader("X-User-Id")

				// Fetch the cart from the tours service
				cartReq, _ := http.NewRequest(http.MethodGet, toursURL+"/api/cart", nil)
				cartReq.Header.Set("X-User-Id", userID)
				cartResp, err := http.DefaultClient.Do(cartReq)
				if err != nil {
					c.JSON(http.StatusBadGateway, gin.H{"error": "cart service unavailable"})
					return
				}
				defer cartResp.Body.Close()

				var cart struct {
					Items []struct {
						TourId string `json:"tourId"`
					} `json:"items"`
				}
				if err := json.NewDecoder(cartResp.Body).Decode(&cart); err != nil {
					c.JSON(http.StatusBadGateway, gin.H{"error": "failed to read cart"})
					return
				}

				// Validate each tour via gRPC GetTour (RPC call #2)
				for _, item := range cart.Items {
					resp, err := tourClient.GetTour(item.TourId)
					if err != nil || !resp.Found {
						c.JSON(http.StatusNotFound, gin.H{"error": "tour " + item.TourId + " not found"})
						return
					}
					if resp.Status != "PUBLISHED" {
						c.JSON(http.StatusBadRequest, gin.H{"error": "tour " + item.TourId + " is no longer published"})
						return
					}
				}

				// All tours valid — forward to purchase service
				proxy.To(toursURL)(c)
			})

			protected.Any("/executions", proxy.To(toursURL))
			protected.Any("/executions/*path", proxy.To(toursURL))
			protected.Any("/position", proxy.To(toursURL))
			protected.Any("/position/*path", proxy.To(toursURL))
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
