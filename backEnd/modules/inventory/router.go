package inventory

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewInventoryRepository(db)
	service := NewInventoryService(repo)
	controller := NewInventoryController(service)

	invGroup := r.Group("/inventory", middleware.AuthMiddleware())
	{
		invGroup.GET("/history", controller.GetHistory)
		invGroup.GET("/low-stock", controller.GetLowStock)
		invGroup.POST("/adjust", middleware.RequireRoles("OWNER", "ADMIN"), controller.AdjustStock)
	}
}
