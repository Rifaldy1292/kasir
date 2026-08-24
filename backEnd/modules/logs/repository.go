package logs

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type LogRepository interface {
	GetLogs(workspaceID uint, filter LogFilterDto) ([]database.SystemLog, int64, error)
}

type logRepository struct {
	db *gorm.DB
}

func NewLogRepository(db *gorm.DB) LogRepository {
	return &logRepository{db: db}
}

func (r *logRepository) GetLogs(workspaceID uint, filter LogFilterDto) ([]database.SystemLog, int64, error) {
	var logs []database.SystemLog
	var total int64

	query := r.db.Model(&database.SystemLog{}).Where("workspace_id = ?", workspaceID)

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}
	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		// Tambahkan 1 hari agar end_date mencakup seluruh hari tersebut
		endOfDay := filter.EndDate.AddDate(0, 0, 1)
		query = query.Where("created_at < ?", endOfDay)
	}

	// Hitung total sebelum paginasi
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Terapkan batasan dan paginasi
	limit := filter.Limit
	if limit <= 0 || limit > 200 {
		limit = 50
	}
	page := filter.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * limit

	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&logs).Error
	return logs, total, err
}
