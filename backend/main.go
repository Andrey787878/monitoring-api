package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

const version = "1.0.0"

var startTime = time.Now()

type HealthResponse struct {
	Status  string `json:"status"`
	Version string `json:"version"`
	Uptime  int64  `json:"uptime_seconds"`
}

type MetricsResponse struct {
	Goroutines    int    `json:"goroutines"`
	MemoryUsageMB uint64 `json:"memory_usage_mb"`
	CPUCores      int    `json:"cpu_cores"`
}

func newRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	r := gin.Default()
	r.GET("/health", healthHandler)
	r.GET("/ready", readyHandler)
	r.GET("/metrics", metricsHandler)

	return r
}

func main() {
	r := newRouter()

	// Корректное завершение
	port := getEnv("PORT", "8080")

	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exiting")
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, HealthResponse{
		Status:  "healthy",
		Version: version,
		Uptime:  int64(time.Since(startTime).Seconds()),
	})
}

func readyHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ready"})
}

func metricsHandler(c *gin.Context) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	c.JSON(http.StatusOK, MetricsResponse{
		Goroutines:    runtime.NumGoroutine(),
		MemoryUsageMB: m.Alloc / 1024 / 1024,
		CPUCores:      runtime.NumCPU(),
	})
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
