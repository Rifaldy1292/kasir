package logs

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewLogRepository(db)
	service := NewLogService(repo)
	controller := NewLogController(service)

	// Hanya OWNER dan ADMIN yang dapat mengakses log sistem
	logsGroup := r.Group("/logs", middleware.AuthMiddleware(), middleware.RequireRoles("OWNER", "ADMIN"))
	{
		logsGroup.GET("", controller.GetLogs)            // Query log dari DB (paginasi + filter)
		logsGroup.GET("/files", controller.ListLogFiles) // Daftar metadata file JSON di ./logs
	}
}
