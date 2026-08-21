package report

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewReportRepository(db)
	service := NewReportService(repo)
	controller := NewReportController(service)

	repGroup := r.Group("/reports", middleware.AuthMiddleware())
	{
		repGroup.GET("/dashboard", controller.GetDashboard)
		repGroup.GET("/sales", middleware.RequireRoles("OWNER", "ADMIN"), controller.GetSalesReport)
		repGroup.GET("/items", middleware.RequireRoles("OWNER", "ADMIN"), controller.GetItemReport)
	}
}
