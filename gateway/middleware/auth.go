package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	grpcclient "gateway/grpc"
)

func Auth(authClient *grpcclient.AuthClient) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		token := strings.TrimPrefix(authHeader, "Bearer ")
		userID, role, err := authClient.ValidateToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		c.Request.Header.Del("Authorization")
		c.Request.Header.Set("X-User-Id", userID)
		c.Request.Header.Set("X-User-Role", role)
		c.Next()
	}
}
