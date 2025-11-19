// api_scores.go
package score

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"
)

var scoreboard *Scoreboard // initialized in main()

type postScoreRequest struct {
	Name   string `json:"name"`
	Score  int    `json:"score"`
	TimeMs int64  `json:"time_ms"` // game duration in ms
}

type postScoreResponse struct {
	Rank       int     `json:"rank"`
	Percentile float64 `json:"percentile"`
	Total      int     `json:"total"`
}

type getScoresResponse struct {
	Page       int          `json:"page"`
	PerPage    int          `json:"per_page"`
	Total      int          `json:"total"`
	TotalPages int          `json:"total_pages"`
	Scores     []ScoreEntry `json:"scores"`
}

// scoresHandler dispatches GET/POST on /api/scores

func ScoresHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodPost:
		handlePostScore(w, r)
	case http.MethodGet:
		handleGetScores(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func handlePostScore(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	var req struct {
		Name   string `json:"name"`
		Score  int    `json:"score"`
		TimeMs int64  `json:"time_ms"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("ScoresHandler POST decode error: %v", err)
		http.Error(w, "bad json", http.StatusBadRequest)
		return
	}

	// example validation – make sure this matches what you want
	if req.Name == "" {
		req.Name = "Anonymous"
	}
	if req.Score < 0 || req.TimeMs <= 0 {
		log.Printf("ScoresHandler invalid data: score=%d time_ms=%d", req.Score, req.TimeMs)
		http.Error(w, "invalid score", http.StatusBadRequest)
		return
	}

	rank, total, err := scoreboard.AddScore(req.Name, req.Score, req.TimeMs)
	if err != nil {
		log.Printf("ScoresHandler AddScore error: %v", err)
		http.Error(w, "could not store score", http.StatusInternalServerError)
		return
	}

	pct := Percentile(rank, total)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(struct {
		Rank       int     `json:"rank"`
		Percentile float64 `json:"percentile"`
		Total      int     `json:"total"`
	}{
		Rank:       rank,
		Percentile: pct,
		Total:      total,
	})

}

func handleGetScores(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	page := parseIntDefault(q.Get("page"), 1)
	perPage := parseIntDefault(q.Get("per_page"), 5)

	scores, total, totalPages := scoreboard.GetPage(page, perPage)

	// Clamp page in the response so it never says "Page 999/3"
	if totalPages == 0 {
		page = 1
	} else if page > totalPages {
		page = totalPages
	} else if page < 1 {
		page = 1
	}

	// Tell browser: don't cache this
	w.Header().Set("Cache-Control", "no-store")

	resp := getScoresResponse{
		Page:       page,
		PerPage:    perPage,
		Total:      total,
		TotalPages: totalPages,
		Scores:     scores,
	}
	writeJSON(w, http.StatusOK, resp)
}

func parseIntDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil || n <= 0 {
		return def
	}
	return n
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
