package customer

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewCustomerRepository(db)
	service := NewCustomerService(repo)
	controller := NewCustomerController(service)

	custGroup := r.Group("/customers", middleware.AuthMiddleware())
	{
		custGroup.GET("", controller.GetAll)
		custGroup.GET("/:id", controller.GetByID)
		custGroup.POST("", controller.Create)
		custGroup.PUT("/:id", controller.Update)
		custGroup.DELETE("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Delete)
	}
}
