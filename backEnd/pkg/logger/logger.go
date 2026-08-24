package logger

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

// LogType mendefinisikan kategori log
type LogType string

const (
	LogTypeLogin LogType = "LOGIN"
	LogTypeCRUD  LogType = "CRUD"
	LogTypeError LogType = "ERROR"
)

// LogEntry adalah struktur data yang ditulis ke file JSON
type LogEntry struct {
	WorkspaceID uint      `json:"workspace_id"`
	UserID      uint      `json:"user_id"`
	UserEmail   string    `json:"user_email"`
	Type        LogType   `json:"type"`
	Method      string    `json:"method"`
	Path        string    `json:"path"`
	Action      string    `json:"action"`
	Entity      string    `json:"entity"`
	EntityID    string    `json:"entity_id"`
	StatusCode  int       `json:"status_code"`
	Message     string    `json:"message"`
	Detail      string    `json:"detail"`
	IPAddress   string    `json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

// mu melindungi akses concurrent ke operasi tulis file log
var mu sync.Mutex

// WriteLog menulis log entry ke file JSON mingguan yang sesuai.
// Nama file: logs/{YEAR}-W{WEEK}-{TYPE}.json
// Fungsi ini thread-safe.
func WriteLog(entry LogEntry) {
	mu.Lock()
	defer mu.Unlock()

	if err := os.MkdirAll("./logs", 0755); err != nil {
		return
	}

	year, week := entry.CreatedAt.ISOWeek()
	filename := fmt.Sprintf("./logs/%d-W%02d-%s.json", year, week, string(entry.Type))

	// Baca entri yang sudah ada (jika file sudah ada)
	var entries []LogEntry
	if data, err := os.ReadFile(filename); err == nil {
		_ = json.Unmarshal(data, &entries)
	}

	// Tambahkan entri baru
	entries = append(entries, entry)

	// Tulis kembali seluruh array ke file
	data, err := json.MarshalIndent(entries, "", "  ")
	if err != nil {
		return
	}

	_ = os.WriteFile(filename, data, 0644)
}
