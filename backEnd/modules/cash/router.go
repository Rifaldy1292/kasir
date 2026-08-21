package cash

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewCashRepository(db)
	service := NewCashService(repo)
	controller := NewCashController(service)

	cashGroup := r.Group("/cash", middleware.AuthMiddleware())
	{
		cashGroup.GET("/current-session", controller.GetCurrentSession)
		cashGroup.POST("/open-shift", controller.OpenShift)
		cashGroup.POST("/close-shift", controller.CloseShift)
		cashGroup.POST("/movement", controller.AddMovement)
		cashGroup.GET("/history", middleware.RequireRoles("OWNER", "ADMIN"), controller.GetHistory)
		cashGroup.GET("/sessions/:id", middleware.RequireRoles("OWNER", "ADMIN"), controller.GetDetail)
	}
}
