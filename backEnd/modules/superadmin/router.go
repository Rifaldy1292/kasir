package superadmin

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewSuperadminRepository(db)
	service := NewSuperadminService(repo)
	controller := NewSuperadminController(service)

	// Public plan endpoint for landing page pricing display
	r.GET("/plans", controller.GetPlans)

	// Superadmin protected routes (Requires SUPERADMIN role)
	superGroup := r.Group("/superadmin", middleware.AuthMiddleware(), middleware.RequireRoles("SUPERADMIN"))
	{
		superGroup.GET("/stats", controller.GetStats)
		superGroup.GET("/plans", controller.GetPlans)
		superGroup.PUT("/plans/:id", controller.UpdatePlan)
		superGroup.GET("/tenants", controller.GetTenants)
		superGroup.PUT("/tenants/:id/plan", controller.UpdateTenantPlan)
	}
}
