package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/raffleberry/server"
)

type Text struct {
	Text string `json:"text"`
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /health", server.WithCtx(healthHandler))
	mux.HandleFunc("/", server.WithCtx(textHandler))
	s := server.New("127.0.0.1:42042", withCORS(mux))
	log.Printf("Listening on %v\n", s.Addr())

	s.Start()
	s.WaitSIGINT()
	log.Println("Shutting down...")

	err := s.Stop()
	if err != nil {
		log.Fatalf("Error stopping server: %v\n", err)
	}
}

func healthHandler(c *server.Context) error {
	return c.JSON(http.StatusOK, "")
}

func textHandler(c *server.Context) error {
	var text Text
	err := json.NewDecoder(c.R.Body).Decode(&text)
	if err != nil {
		return c.Error(http.StatusBadRequest, err.Error())
	}
	fmt.Println("Received text:", text)
	return c.JSON(http.StatusOK, nil)
}

func withCORS(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		handler.ServeHTTP(w, r)
	})
}
