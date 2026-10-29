package middleware

import (
	"net/http"
	"strings"
	"time"

	"gin-quickstart/database"
	"gin-quickstart/pkg/jwt"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

const (
	CtxUserIDKey      = "user_id"
	CtxWorkspaceIDKey = "workspace_id"
	CtxUserRoleKey    = "user_role"
	CtxUserEmailKey   = "user_email"
)

// AuthMiddleware validates JWT Bearer Token and stores claims in context
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Error(c, http.StatusUnauthorized, "Authorization token diperlukan", nil)
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			response.Error(c, http.StatusUnauthorized, "Format token invalid (gunakan Bearer <token>)", nil)
			c.Abort()
			return
		}

		claims, err := jwt.ValidateToken(parts[1])
		if err != nil {
			response.Error(c, http.StatusUnauthorized, "Token kadaluarsa atau tidak valid", err.Error())
			c.Abort()
			return
		}

		c.Set(CtxUserIDKey, claims.UserID)
		c.Set(CtxWorkspaceIDKey, claims.WorkspaceID)
		c.Set(CtxUserRoleKey, claims.Role)
		c.Set(CtxUserEmailKey, claims.Email)

		c.Next()
	}
}

// RequireRoles restricts endpoint access to specified roles
func RequireRoles(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get(CtxUserRoleKey)
		if !exists {
			response.Error(c, http.StatusUnauthorized, "Sesi tidak terotorisasi", nil)
			c.Abort()
			return
		}

		userRole := roleVal.(string)
		for _, r := range allowedRoles {
			if strings.EqualFold(userRole, r) {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, "Akses ditolak: Anda tidak memiliki izin untuk tindakan ini", nil)
		c.Abort()
	}
}

// RequirePlan restricts endpoint access to specific subscription plans (e.g. PREMIUM, PLATINUM)
func RequirePlan(db *gorm.DB, allowedPlans ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleVal, exists := c.Get(CtxUserRoleKey)
		if !exists {
			response.Error(c, http.StatusUnauthorized, "Sesi tidak terotorisasi", nil)
			c.Abort()
			return
		}

		userRole := roleVal.(string)
		// Superadmin always has full access
		if strings.EqualFold(userRole, "SUPERADMIN") {
			c.Next()
			return
		}

		workspaceID := GetWorkspaceID(c)
		userID := GetUserID(c)

		var owner database.User
		var err error

		if strings.EqualFold(userRole, "OWNER") {
			err = db.Where("id = ?", userID).First(&owner).Error
		} else if workspaceID > 0 {
			// Find owner of this workspace via OwnerID
			var ws database.Workspace
			if errWs := db.Select("id, owner_id").Where("id = ?", workspaceID).First(&ws).Error; errWs == nil && ws.OwnerID > 0 {
				err = db.Where("id = ?", ws.OwnerID).First(&owner).Error
			} else {
				err = db.Where("workspace_id = ? AND role = ?", workspaceID, "OWNER").First(&owner).Error
			}
		} else {
			err = db.Where("id = ?", userID).First(&owner).Error
		}

		if err != nil {
			response.Error(c, http.StatusForbidden, "Tidak dapat memverifikasi paket langganan akun", nil)
			c.Abort()
			return
		}

		planCode := owner.PlanCode
		if planCode == "" {
			planCode = "STARTER"
		}

		// Check expiration
		if owner.PlanExpiresAt != nil && owner.PlanExpiresAt.Before(time.Now()) {
			planCode = "STARTER"
		}

		for _, p := range allowedPlans {
			if strings.EqualFold(planCode, p) {
				c.Next()
				return
			}
		}

		response.Error(c, http.StatusForbidden, "Fitur ini hanya tersedia untuk paket langganan Premium atau Platinum", gin.H{
			"current_plan":   planCode,
			"required_plans": allowedPlans,
		})
		c.Abort()
	}
}

// Helper methods to extract context in handlers
func GetUserID(c *gin.Context) uint {
	if val, exists := c.Get(CtxUserIDKey); exists {
		return val.(uint)
	}
	return 0
}

func GetWorkspaceID(c *gin.Context) uint {
	if val, exists := c.Get(CtxWorkspaceIDKey); exists {
		return val.(uint)
	}
	return 0
}

func GetUserRole(c *gin.Context) string {
	if val, exists := c.Get(CtxUserRoleKey); exists {
		return val.(string)
	}
	return ""
}
