package pos

import (
	"gin-quickstart/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup, db *gorm.DB) {
	repo := NewPosRepository(db)
	service := NewPosService(repo)
	controller := NewPosController(service)

	posGroup := r.Group("/pos", middleware.AuthMiddleware())
	{
		posGroup.POST("/checkout", controller.Checkout)
		posGroup.GET("/transactions", controller.GetAllTransactions)
		posGroup.GET("/transactions/:id", controller.GetByID)
		posGroup.GET("/transactions/invoice/:invoice", controller.GetByInvoice)
		posGroup.POST("/transactions/:id/void", middleware.RequireRoles("OWNER", "ADMIN"), controller.Void)
		posGroup.POST("/transactions/:id/refund", middleware.RequireRoles("OWNER", "ADMIN"), controller.Refund)
	}
}
