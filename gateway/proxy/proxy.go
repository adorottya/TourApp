package proxy

import (
	"net/http/httputil"
	"net/url"

	"github.com/gin-gonic/gin"
)

func To(target string) gin.HandlerFunc {
	targetURL, err := url.Parse(target)
	if err != nil {
		panic("invalid proxy target: " + target)
	}
	rp := httputil.NewSingleHostReverseProxy(targetURL)
	return func(c *gin.Context) {
		c.Request.URL.Path = c.Param("path")
		rp.ServeHTTP(c.Writer, c.Request)
	}
}
