package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"

	"stakeholders-service/db"
	"stakeholders-service/handlers"
	"stakeholders-service/middleware"
	grpcserver "stakeholders-service/grpc"
)

func main() {
	db.Connect()

	go grpcserver.StartServer(":9091")

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		users := api.Group("/users")
		users.Use(middleware.AuthMiddleware())
		{
			users.GET("", middleware.AdminOnly(), handlers.GetAllUsers)
			users.PATCH("/:id/block", middleware.AdminOnly(), handlers.BlockUser)

			users.GET("/profile", handlers.GetProfile)
			users.PUT("/profile", handlers.UpdateProfile)
		}
	}

	if err := r.Run(":8081"); err != nil {
		log.Fatal(err)
	}
}
