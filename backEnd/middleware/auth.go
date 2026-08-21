package middleware

import (
	"net/http"
	"strings"

	"gin-quickstart/pkg/jwt"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
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
