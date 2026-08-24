package logger

import (
	"log"
	"os"
	"path/filepath"
	"time"
)

// StartCleanupScheduler memulai goroutine background yang secara otomatis
// menghapus file log yang sudah lebih dari 7 hari setiap 24 jam sekali.
func StartCleanupScheduler() {
	go func() {
		// Jalankan sekali saat startup untuk membersihkan log lama
		cleanOldLogs()

		ticker := time.NewTicker(24 * time.Hour)
		defer ticker.Stop()

		for range ticker.C {
			cleanOldLogs()
		}
	}()

	log.Println("[Logger] Cleanup scheduler aktif — file log > 7 hari akan otomatis dihapus setiap 24 jam.")
}

// cleanOldLogs memindai folder ./logs dan menghapus semua file
// yang waktu modifikasi terakhirnya lebih dari 7 hari yang lalu.
func cleanOldLogs() {
	cutoff := time.Now().AddDate(0, 0, -7)

	if _, err := os.Stat("./logs"); os.IsNotExist(err) {
		return
	}

	entries, err := os.ReadDir("./logs")
	if err != nil {
		log.Printf("[Logger] Gagal membaca folder logs: %v", err)
		return
	}

	deletedCount := 0
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			continue
		}

		if info.ModTime().Before(cutoff) {
			path := filepath.Join("./logs", entry.Name())
			if err := os.Remove(path); err != nil {
				log.Printf("[Logger] Gagal menghapus file log lama %s: %v", path, err)
			} else {
				deletedCount++
				log.Printf("[Logger] File log lama dihapus: %s", path)
			}
		}
	}

	if deletedCount > 0 {
		log.Printf("[Logger] Cleanup selesai: %d file log lama berhasil dihapus.", deletedCount)
	}
}
