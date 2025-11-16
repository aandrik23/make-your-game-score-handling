// server.go
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"server/score"
	"time"

	figlet "github.com/common-nighthawk/go-figure"
)

func main() {
	addr := flag.String("addr", ":8000", "address to listen on")
	dir := flag.String("dir", "../public", "directory to serve")
	dev := flag.Bool("dev", false, "disable caching (for local dev)")
	cors := flag.String("cors", "", "value for Access-Control-Allow-Origin (empty to disable)")
	scoresFile := flag.String("scores", "scores.json", "path to scoreboard JSON file")
	flag.Parse()

	// Ensure directory exists
	if _, err := os.Stat(*dir); err != nil {
		log.Fatalf("serve dir: %v", err)
	}

	// Init scoreboard
	if err := score.Init(*scoresFile); err != nil {
		log.Fatalf("scoreboard init: %v", err)
	}

	// Static file server
	fs := http.FileServer(http.Dir(*dir))

	// Common wrapper to add headers / logging / caching / CORS
	wrap := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()

			// light security headers
			w.Header().Set("X-Content-Type-Options", "nosniff")
			w.Header().Set("Referrer-Policy", "no-referrer")
			w.Header().Set("Cross-Origin-Resource-Policy", "same-origin")

			// Optional CORS
			if *cors != "" {
				w.Header().Set("Access-Control-Allow-Origin", *cors)
				w.Header().Set("Vary", "Origin")
			}

			// Simple caching: off in dev, short cache otherwise
			if *dev {
				w.Header().Set("Cache-Control", "no-store")
			} else {
				// For API responses, handlers may override this if needed
				if w.Header().Get("Cache-Control") == "" {
					w.Header().Set("Cache-Control", "public, max-age=300")
				}
			}

			h.ServeHTTP(w, r)
			log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(start))
		})
	}

	mux := http.NewServeMux()
	// API endpoint
	mux.Handle("/api/scores", wrap(http.HandlerFunc(score.ScoresHandler)))
	// Static files fallback
	mux.Handle("/", wrap(fs))

	// Bind first so we *know* it started
	ln, err := net.Listen("tcp4", *addr)
	if err != nil {
		log.Fatalf("listen: %v", err)
	}

	srv := &http.Server{
		Handler:           mux,
		ReadHeaderTimeout: 5 * time.Second,
	}
	logo()
	fmt.Printf("Serving %s at http://%s\n", absPath(*dir), ln.Addr())

	// Graceful shutdown on Ctrl+C
	idle := make(chan struct{})
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, os.Interrupt)
		<-c
		fmt.Println("\nshutting down...")
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		_ = srv.Shutdown(ctx)
		close(idle)
	}()

	// Serve (blocking)
	if err := srv.Serve(ln); err != nil && err != http.ErrServerClosed {
		log.Fatalf("server: %v", err)
	}
	<-idle
}

func absPath(p string) string {
	ap, err := filepath.Abs(p)
	if err != nil {
		return p
	}
	return ap
}

func logo() {
	// generate ASCII art with a slim font
	banner := figlet.NewFigure("BOMBERMAN", "small", false)
	banner.Print()
}
