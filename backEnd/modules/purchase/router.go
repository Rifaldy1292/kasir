package purchase

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewPurchaseRepository(db)
	service := NewPurchaseService(repo, db)
	controller := NewPurchaseController(service)

	purGroup := r.Group("/purchases", middleware.AuthMiddleware(), middleware.RequireRoles("OWNER", "ADMIN"))
	{
		purGroup.GET("", controller.GetAll)
		purGroup.GET("/:id", controller.GetByID)
		purGroup.POST("", controller.Create)
	}
}
