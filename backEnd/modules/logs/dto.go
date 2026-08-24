package logs

import (
	"time"

	"gin-quickstart/database"
)

// LogFilterDto merepresentasikan query parameter untuk filter log sistem
type LogFilterDto struct {
	Type      string     `form:"type"`                                      // LOGIN, CRUD, ERROR (kosong = semua)
	StartDate *time.Time `form:"start_date" time_format:"2006-01-02"`
	EndDate   *time.Time `form:"end_date"   time_format:"2006-01-02"`
	Page      int        `form:"page,default=1"`
	Limit     int        `form:"limit,default=50"`
}

// LogListResponseDto adalah response paginasi untuk query log
type LogListResponseDto struct {
	Data  []database.SystemLog `json:"data"`
	Total int64                `json:"total"`
	Page  int                  `json:"page"`
	Limit int                  `json:"limit"`
}

// LogFileInfo merepresentasikan metadata sebuah file log JSON
type LogFileInfo struct {
	Filename    string    `json:"filename"`
	SizeBytes   int64     `json:"size_bytes"`
	LastUpdated time.Time `json:"last_updated"`
}
