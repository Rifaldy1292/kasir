package auth

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewAuthRepository(db)
	service := NewAuthService(repo)
	controller := NewAuthController(service)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/login", controller.Login)
		authGroup.POST("/register-workspace", controller.RegisterWorkspace)
		authGroup.GET("/profile", middleware.AuthMiddleware(), controller.GetProfile)
	}
}
