package product

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewProductRepository(db)
	service := NewProductService(repo)
	controller := NewProductController(service)

	prodGroup := r.Group("/products", middleware.AuthMiddleware())
	{
		prodGroup.GET("", controller.GetAll)
		prodGroup.GET("/:id", controller.GetByID)
		prodGroup.GET("/barcode/:code", controller.GetByBarcode)
		prodGroup.POST("", middleware.RequireRoles("OWNER", "ADMIN"), controller.Create)
		prodGroup.PUT("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Update)
		prodGroup.DELETE("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Delete)
	}
}
