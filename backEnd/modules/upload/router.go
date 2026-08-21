package upload

import (
	"gin-quickstart/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	ctrl := NewUploadController()

	uploadGroup := r.Group("/upload")
	uploadGroup.Use(middleware.AuthMiddleware())
	{
		uploadGroup.POST("", ctrl.UploadImage)
		uploadGroup.POST("/image", ctrl.UploadImage)
	}
}
