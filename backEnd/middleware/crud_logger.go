package middleware

import (
	"fmt"
	"strings"
	"time"

	"gin-quickstart/database"
	"gin-quickstart/pkg/logger"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// CRUDLoggerMiddleware mencatat semua operasi tulis (POST, PUT, PATCH, DELETE)
// ke file JSON dan tabel system_logs di database.
// GET, HEAD, OPTIONS tidak dicatat karena tidak memiliki nilai audit operasional.
// Endpoint /auth/ dikecualikan karena ditangani oleh login logger tersendiri.
func CRUDLoggerMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method

		// Lewati metode read-only
		if method == "GET" || method == "HEAD" || method == "OPTIONS" {
			c.Next()
			return
		}

		// Lewati endpoint auth — ditangani oleh login logger di controller
		if strings.HasPrefix(c.Request.URL.Path, "/api/v1/auth/") {
			c.Next()
			return
		}

		// Proses request terlebih dahulu
		c.Next()

		// Kumpulkan informasi dari context setelah request diproses
		userID := GetUserID(c)
		workspaceID := GetWorkspaceID(c)
		email := ""
		if v, exists := c.Get(CtxUserEmailKey); exists {
			email = v.(string)
		}

		statusCode := c.Writer.Status()
		entity, entityID := parseCRUDEntity(c)
		action := methodToAction(method)

		message := "Berhasil"
		if statusCode >= 400 {
			message = "Gagal"
		}

		entry := logger.LogEntry{
			WorkspaceID: workspaceID,
			UserID:      userID,
			UserEmail:   email,
			Type:        logger.LogTypeCRUD,
			Method:      method,
			Path:        c.Request.URL.Path,
			Action:      fmt.Sprintf("%s %s", action, entity),
			Entity:      entity,
			EntityID:    entityID,
			StatusCode:  statusCode,
			Message:     message,
			IPAddress:   c.ClientIP(),
			CreatedAt:   time.Now(),
		}

		// Simpan ke file dan DB secara async agar tidak memblokir response
		go logger.WriteLog(entry)
		go saveToDB(db, entry)
	}
}

// parseCRUDEntity mengekstrak nama entitas dan ID dari path request.
// Contoh: /api/v1/products/42  →  entity="Products", entityID="42"
func parseCRUDEntity(c *gin.Context) (entity, entityID string) {
	// FullPath() mengembalikan pola route, misal: /api/v1/products/:id
	fullPath := c.FullPath()
	segments := strings.Split(strings.Trim(fullPath, "/"), "/")

	// Struktur path: ["api", "v1", "entity", ...]
	if len(segments) >= 3 {
		entity = capitalizeFirst(segments[2])
	} else {
		entity = "Unknown"
	}

	entityID = c.Param("id")
	if entityID == "" {
		entityID = "-"
	}

	return entity, entityID
}

// methodToAction mengonversi HTTP method ke nama aksi yang mudah dibaca
func methodToAction(method string) string {
	switch strings.ToUpper(method) {
	case "POST":
		return "Create"
	case "PUT", "PATCH":
		return "Update"
	case "DELETE":
		return "Delete"
	default:
		return method
	}
}

// capitalizeFirst mengubah huruf pertama menjadi kapital
func capitalizeFirst(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

// saveToDB menyimpan LogEntry ke tabel system_logs di database
func saveToDB(db *gorm.DB, e logger.LogEntry) {
	db.Create(&database.SystemLog{
		WorkspaceID: e.WorkspaceID,
		UserID:      e.UserID,
		UserEmail:   e.UserEmail,
		Type:        string(e.Type),
		Method:      e.Method,
		Path:        e.Path,
		Action:      e.Action,
		Entity:      e.Entity,
		EntityID:    e.EntityID,
		StatusCode:  e.StatusCode,
		Message:     e.Message,
		Detail:      e.Detail,
		IPAddress:   e.IPAddress,
		CreatedAt:   e.CreatedAt,
	})
}
