package auth

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewAuthRepository(db)
	service := NewAuthService(repo)
	controller := NewAuthController(service, db)

	authGroup := r.Group("/auth")
	{
		authGroup.POST("/login", controller.Login)
		authGroup.POST("/register", controller.RegisterOwner)
		authGroup.POST("/register-owner", controller.RegisterOwner)
		authGroup.POST("/register-workspace", controller.RegisterWorkspace)
		authGroup.POST("/create-workspace", middleware.AuthMiddleware(), controller.CreateWorkspace)
		authGroup.GET("/profile", middleware.AuthMiddleware(), controller.GetProfile)
		authGroup.GET("/my-workspaces", middleware.AuthMiddleware(), controller.GetMyWorkspaces)
		authGroup.POST("/switch-workspace", middleware.AuthMiddleware(), controller.SwitchWorkspace)
	}
}
