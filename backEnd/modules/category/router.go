package category

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewCategoryRepository(db)
	service := NewCategoryService(repo)
	controller := NewCategoryController(service)

	catGroup := r.Group("/categories", middleware.AuthMiddleware())
	{
		catGroup.GET("", controller.GetAll)
		catGroup.GET("/:id", controller.GetByID)
		catGroup.POST("", middleware.RequireRoles("OWNER", "ADMIN"), controller.Create)
		catGroup.PUT("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Update)
		catGroup.DELETE("/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.Delete)
	}
}
