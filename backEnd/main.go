package main

import (
	"log"
	"os"
	"time"

	"gin-quickstart/config"
	"gin-quickstart/database"
	"gin-quickstart/database/seeders"
	"gin-quickstart/middleware"
	"gin-quickstart/modules/ai"
	"gin-quickstart/modules/auth"
	"gin-quickstart/modules/cash"
	"gin-quickstart/modules/category"
	"gin-quickstart/modules/customer"
	"gin-quickstart/modules/inventory"
	"gin-quickstart/modules/logs"
	"gin-quickstart/modules/pos"
	"gin-quickstart/modules/product"
	"gin-quickstart/modules/purchase"
	"gin-quickstart/modules/report"
	"gin-quickstart/modules/settings"
	"gin-quickstart/modules/supplier"
	"gin-quickstart/modules/upload"
	"gin-quickstart/pkg/logger"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Initialize PostgreSQL Database
	db := config.InitDB()

	// 2. Run Database Auto Migration
	if err := database.RunMigration(db); err != nil {
		log.Fatalf("Gagal menjalankan migrasi database: %v", err)
	}

	// 3. Run Initial Data Seeder
	if err := seeders.RunSeeder(db); err != nil {
		log.Printf("Peringatan seeder: %v", err)
	}

	// 4. Mulai log cleanup scheduler (hapus file log > 7 hari setiap 24 jam)
	logger.StartCleanupScheduler()

	// 5. Initialize Gin Engine
	router := gin.Default()

	// 6. Setup CORS Middleware
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:3001", "http://localhost:3030", "http://127.0.0.1:3000", "http://127.0.0.1:3030", "*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// 7. Serve Uploaded Static Files
	_ = os.MkdirAll("./uploads", 0755)
	router.Static("/uploads", "./uploads")

	// 8. Health check route
	router.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"app":     "theKasir API Engine",
			"version": "1.0.0",
		})
	})

	// 9. Register Modular Feature Routes
	apiGroup := router.Group("/api/v1")

	// Pasang logger middleware ke seluruh API group
	// Error logger dipasang lebih dulu (berjalan paling akhir = post-processing terluar)
	apiGroup.Use(middleware.ErrorLoggerMiddleware(db))
	apiGroup.Use(middleware.CRUDLoggerMiddleware(db))

	{
		auth.RegisterRoutes(apiGroup, db)
		category.RegisterRoutes(apiGroup, db)
		product.RegisterRoutes(apiGroup, db)
		inventory.RegisterRoutes(apiGroup, db)
		customer.RegisterRoutes(apiGroup, db)
		supplier.RegisterRoutes(apiGroup, db)
		cash.RegisterRoutes(apiGroup, db)
		pos.RegisterRoutes(apiGroup, db)
		purchase.RegisterRoutes(apiGroup, db)
		report.RegisterRoutes(apiGroup, db)
		settings.RegisterRoutes(apiGroup, db)
		upload.RegisterRoutes(apiGroup, db)
		logs.RegisterRoutes(apiGroup, db)
		ai.RegisterRoutes(apiGroup, db)
	}


	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("theKasir Server berjalan di http://0.0.0.0:%s\n", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Gagal menjalankan server: %v", err)
	}
}