package middleware

import (
	"fmt"
	"time"

	"gin-quickstart/pkg/logger"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// ErrorLoggerMiddleware mencatat semua response dengan HTTP status >= 500
// ke file JSON dan tabel system_logs di database.
// Middleware ini harus didaftarkan SEBELUM CRUDLoggerMiddleware agar berjalan
// setelah semua middleware lain selesai (termasuk gin recovery).
func ErrorLoggerMiddleware(db *gorm.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		statusCode := c.Writer.Status()

		// Hanya log error server (5xx)
		if statusCode < 500 {
			return
		}

		// Kumpulkan informasi setelah request selesai diproses
		userID := GetUserID(c)
		workspaceID := GetWorkspaceID(c)
		email := ""
		if v, exists := c.Get(CtxUserEmailKey); exists {
			email = v.(string)
		}

		// Kumpulkan detail error dari gin error list
		detail := ""
		if len(c.Errors) > 0 {
			detail = c.Errors.String()
		}

		entry := logger.LogEntry{
			WorkspaceID: workspaceID,
			UserID:      userID,
			UserEmail:   email,
			Type:        logger.LogTypeError,
			Method:      c.Request.Method,
			Path:        c.Request.URL.Path,
			Action:      fmt.Sprintf("%s %s", c.Request.Method, c.Request.URL.Path),
			StatusCode:  statusCode,
			Message:     fmt.Sprintf("HTTP %d — Server Error", statusCode),
			Detail:      detail,
			IPAddress:   c.ClientIP(),
			CreatedAt:   time.Now(),
		}

		// Simpan ke file dan DB secara async
		go logger.WriteLog(entry)
		go saveToDB(db, entry)
	}
}
