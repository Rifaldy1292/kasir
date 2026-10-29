package ai

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewAIRepository(db)
	service := NewAIService(repo)
	controller := NewAIController(service)

	aiGroup := r.Group("/ai", middleware.AuthMiddleware(), middleware.RequirePlan(db, "PREMIUM", "PLATINUM"))
	{
		aiGroup.POST("/chat", controller.Chat)
		aiGroup.GET("/insights", controller.GetInsights)
		aiGroup.GET("/stock-prediction", controller.GetStockPredictions)
		aiGroup.POST("/product-search", controller.SearchProducts)
	}
}
