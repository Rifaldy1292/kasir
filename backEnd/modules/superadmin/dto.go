package superadmin

import (
	"time"

	"gin-quickstart/database"
)

type SuperadminStatsDto struct {
	TotalTenants    int64   `json:"total_tenants"`
	TotalWorkspaces int64   `json:"total_workspaces"`
	TotalStaffUsers int64   `json:"total_staff_users"`
	EstimatedMRR    float64 `json:"estimated_mrr"`
	StarterCount    int64   `json:"starter_count"`
	PremiumCount    int64   `json:"premium_count"`
	PlatinumCount   int64   `json:"platinum_count"`
}

type UpdatePlanDto struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	PriceMonthly  float64 `json:"price_monthly"`
	PriceYearly   float64 `json:"price_yearly"`
	MaxUsers      int     `json:"max_users" binding:"required,min=1"`
	MaxWorkspaces int     `json:"max_workspaces" binding:"required,min=1"`
	Features      string  `json:"features"`
	IsActive      bool    `json:"is_active"`
}

type UpdateTenantPlanDto struct {
	PlanCode      string     `json:"plan_code" binding:"required"` // STARTER, PREMIUM, PLATINUM
	PlanExpiresAt *time.Time `json:"plan_expires_at"`
	Status        string     `json:"status"` // ACTIVE, INACTIVE
}

type TenantItemDto struct {
	ID             uint                 `json:"id"`
	Name           string               `json:"name"`
	Email          string               `json:"email"`
	Phone          string               `json:"phone"`
	Role           string               `json:"role"`
	Status         string               `json:"status"`
	PlanCode       string               `json:"plan_code"`
	PlanExpiresAt  *time.Time           `json:"plan_expires_at"`
	WorkspaceCount int                  `json:"workspace_count"`
	StaffCount     int                  `json:"staff_count"`
	CreatedAt      time.Time            `json:"created_at"`
	Workspaces     []database.Workspace `json:"workspaces,omitempty"`
}
