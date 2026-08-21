package settings

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewSettingsRepository(db)
	service := NewSettingsService(repo)
	controller := NewSettingsController(service)

	setGroup := r.Group("/settings", middleware.AuthMiddleware())
	{
		setGroup.GET("/workspace", controller.GetWorkspace)
		setGroup.PUT("/workspace", middleware.RequireRoles("OWNER", "ADMIN"), controller.UpdateWorkspace)

		setGroup.GET("/staff", middleware.RequireRoles("OWNER", "ADMIN"), controller.GetStaff)
		setGroup.POST("/staff", middleware.RequireRoles("OWNER", "ADMIN"), controller.AddStaff)
		setGroup.PUT("/staff/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.UpdateStaff)
		setGroup.DELETE("/staff/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.DeleteStaff)
	}
}
