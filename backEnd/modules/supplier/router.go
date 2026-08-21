package supplier

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewSupplierRepository(db)
	service := NewSupplierService(repo)
	controller := NewSupplierController(service)

	supGroup := r.Group("/suppliers", middleware.AuthMiddleware())
	{
		supGroup.GET("", controller.GetAll)
		supGroup.GET("/:id", controller.GetByID)
		supGroup.POST("", controller.Create)
		supGroup.PUT("/:id", controller.Update)
		supGroup.DELETE("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Delete)
	}
}
