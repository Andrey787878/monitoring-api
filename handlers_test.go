package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return newRouter()
}

func TestHealth(t *testing.T) {
	r := setupRouter()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/health", nil)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var resp HealthResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal body: %v", err)
	}

	if resp.Status != "healthy" {
		t.Errorf("expected status healthy, got %q", resp.Status)
	}
	if resp.Version != version {
		t.Errorf("expected version %q, got %q", version, resp.Version)
	}

	// В CI аптайм может быть 0 секунд, если тест запускается сразу после старта.
	if resp.Uptime < 0 {
		t.Errorf("expected non-negative uptime, got %d", resp.Uptime)
	}
}

func TestReady(t *testing.T) {
	r := setupRouter()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/ready", nil)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var body map[string]string
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to unmarshal body: %v", err)
	}

	if body["status"] != "ready" {
		t.Errorf("expected status ready, got %q", body["status"])
	}
}

func TestMetrics(t *testing.T) {
	r := setupRouter()

	w := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)

	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d", http.StatusOK, w.Code)
	}

	var resp MetricsResponse
	if err := json.Unmarshal(w.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to unmarshal body: %v", err)
	}

	if resp.Goroutines <= 0 {
		t.Errorf("expected positive goroutines, got %d", resp.Goroutines)
	}
	if resp.CPUCores < 1 {
		t.Errorf("expected at least 1 CPU core, got %d", resp.CPUCores)
	}
}

func TestGetEnv(t *testing.T) {
	const key = "TEST_PORT"

	// когда переменная установлена
	if err := os.Setenv(key, "9000"); err != nil {
		t.Fatalf("failed to set env: %v", err)
	}
	if v := getEnv(key, "8080"); v != "9000" {
		t.Errorf("expected 9000, got %s", v)
	}

	// когда переменная не установлена
	if err := os.Unsetenv(key); err != nil {
		t.Fatalf("failed to unset env: %v", err)
	}
	if v := getEnv(key, "8080"); v != "8080" {
		t.Errorf("expected fallback 8080, got %s", v)
	}
}
