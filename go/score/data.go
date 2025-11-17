package score

import (
	"encoding/json"
	"errors"
	"os"
	"sort"
	"sync"
	"time"
)

type ScoreEntry struct {
	Name      string    `json:"name"`
	Score     int       `json:"score"`
	TimeMs    int64     `json:"time_ms"`    // total time in milliseconds
	CreatedAt time.Time `json:"created_at"` // for tie-breaking / info
}

// This is the JSON format on disk: just a list of scores.
type scoreFile struct {
	Scores []ScoreEntry `json:"scores"`
}

type Scoreboard struct {
	mu     sync.RWMutex
	file   string
	scores []ScoreEntry // always kept sorted by Score DESC, then CreatedAt ASC
}

func NewScoreboard(file string) (*Scoreboard, error) {
	sb := &Scoreboard{file: file}
	if err := sb.load(); err != nil {
		// If file doesn't exist, start empty
		if !errors.Is(err, os.ErrNotExist) {
			return nil, err
		}
	}
	return sb, nil
}

func (sb *Scoreboard) load() error {
	f, err := os.Open(sb.file)
	if err != nil {
		return err
	}
	defer f.Close()

	var sf scoreFile
	if err := json.NewDecoder(f).Decode(&sf); err != nil {
		return err
	}

	// sort descending by score
	sort.Slice(sf.Scores, func(i, j int) bool {
		if sf.Scores[i].Score == sf.Scores[j].Score {
			return sf.Scores[i].CreatedAt.Before(sf.Scores[j].CreatedAt)
		}
		return sf.Scores[i].Score > sf.Scores[j].Score
	})

	sb.scores = sf.Scores
	return nil
}

func (sb *Scoreboard) save() error {
	tmp := sb.file + ".tmp"

	f, err := os.Create(tmp)
	if err != nil {
		return err
	}
	enc := json.NewEncoder(f)
	enc.SetIndent("", "  ")
	if err := enc.Encode(scoreFile{Scores: sb.scores}); err != nil {
		_ = f.Close()
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	return os.Rename(tmp, sb.file)
}

// AddScore inserts a new score, re-sorts, saves, and returns the rank (1-based) and total count.
func (sb *Scoreboard) AddScore(name string, score int, timeMs int64) (rank int, total int, err error) {
	entry := ScoreEntry{
		Name:      name,
		Score:     score,
		TimeMs:    timeMs,
		CreatedAt: time.Now().UTC(),
	}

	sb.mu.Lock()
	defer sb.mu.Unlock()

	// Check if this name already exists
	foundIndex := -1
	for i, s := range sb.scores {
		if s.Name == name {
			foundIndex = i

			// Decide if new result is better:
			// - higher score wins
			// - if scores equal, lower time wins
			if score > s.Score || (score == s.Score && timeMs < s.TimeMs) {
				// New personal best → replace old record
				sb.scores[i] = entry
			} else {
				// Old record is better → keep it, treat that as "entry"
				entry = s
			}
			break
		}
	}

	// If no existing record for this name, append new one
	if foundIndex == -1 {
		sb.scores = append(sb.scores, entry)
	}

	// maintain sorted order
	sort.Slice(sb.scores, func(i, j int) bool {
		if sb.scores[i].Score == sb.scores[j].Score {
			return sb.scores[i].CreatedAt.Before(sb.scores[j].CreatedAt)
		}
		return sb.scores[i].Score > sb.scores[j].Score
	})

	// find rank: first index where this exact entry appears
	for i, s := range sb.scores {
		if s == entry {
			rank = i + 1 // 1-based
			break
		}
	}
	total = len(sb.scores)

	if err := sb.save(); err != nil {
		return rank, total, err
	}
	return rank, total, nil
}

func (sb *Scoreboard) Total() int {
	sb.mu.RLock()
	defer sb.mu.RUnlock()
	return len(sb.scores)
}

// GetPage returns scores for a given page (1-based) and perPage, plus total & totalPages.
func (sb *Scoreboard) GetPage(page, perPage int) (scores []ScoreEntry, total, totalPages int) {
	if perPage <= 0 {
		perPage = 5
	}
	if page <= 0 {
		page = 1
	}

	sb.mu.RLock()
	defer sb.mu.RUnlock()

	total = len(sb.scores)
	if total == 0 {
		return nil, 0, 0
	}

	totalPages = (total + perPage - 1) / perPage
	if page > totalPages {
		page = totalPages
	}

	start := (page - 1) * perPage
	if start >= total {
		return []ScoreEntry{}, total, totalPages
	}
	end := start + perPage
	if end > total {
		end = total
	}

	scores = make([]ScoreEntry, end-start)
	copy(scores, sb.scores[start:end])
	return scores, total, totalPages
}

// Percentile returns "top X%" where higher score = better.
// Simple approximation: smaller rank → better percentile.
func Percentile(rank, total int) float64 {
	if total == 0 {
		return 0
	}
	// Example: rank 1 out of 100 → ~100%, rank 50 → ~50%
	return (1.0 - float64(rank-1)/float64(total)) * 100.0
}
