package superadmin

import (
	"time"

	"gin-quickstart/database"

	"gorm.io/gorm"
)

type SuperadminRepository interface {
	GetStats() (*SuperadminStatsDto, error)
	GetAllPlans() ([]database.SubscriptionPlan, error)
	GetPlanByID(id uint) (*database.SubscriptionPlan, error)
	UpdatePlan(plan *database.SubscriptionPlan) error
	GetAllTenants(search string, planFilter string) ([]TenantItemDto, error)
	UpdateTenantPlan(userID uint, planCode string, expiresAt *time.Time, status string) error
}

type superadminRepository struct {
	db *gorm.DB
}

func NewSuperadminRepository(db *gorm.DB) SuperadminRepository {
	return &superadminRepository{db: db}
}

func (r *superadminRepository) GetStats() (*SuperadminStatsDto, error) {
	var totalTenants int64
	var totalWorkspaces int64
	var totalStaff int64
	var starterCount int64
	var premiumCount int64
	var platinumCount int64

	// Count owners (tenants)
	_ = r.db.Model(&database.User{}).Where("role = 'OWNER'").Count(&totalTenants).Error
	_ = r.db.Model(&database.Workspace{}).Count(&totalWorkspaces).Error
	_ = r.db.Model(&database.User{}).Where("role != 'SUPERADMIN'").Count(&totalStaff).Error

	_ = r.db.Model(&database.User{}).Where("role = 'OWNER' AND (plan_code = 'STARTER' OR plan_code = '' OR plan_code IS NULL)").Count(&starterCount).Error
	_ = r.db.Model(&database.User{}).Where("role = 'OWNER' AND plan_code = 'PREMIUM'").Count(&premiumCount).Error
	_ = r.db.Model(&database.User{}).Where("role = 'OWNER' AND plan_code = 'PLATINUM'").Count(&platinumCount).Error

	// Fetch active plan prices for MRR estimation
	var premiumPlan database.SubscriptionPlan
	var platinumPlan database.SubscriptionPlan
	_ = r.db.Where("code = 'PREMIUM'").First(&premiumPlan).Error
	_ = r.db.Where("code = 'PLATINUM'").First(&platinumPlan).Error

	premPrice := premiumPlan.PriceMonthly
	if premPrice == 0 {
		premPrice = 89000
	}
	platPrice := platinumPlan.PriceMonthly
	if platPrice == 0 {
		platPrice = 199000
	}

	mrr := (float64(premiumCount) * premPrice) + (float64(platinumCount) * platPrice)

	return &SuperadminStatsDto{
		TotalTenants:    totalTenants,
		TotalWorkspaces: totalWorkspaces,
		TotalStaffUsers: totalStaff,
		EstimatedMRR:    mrr,
		StarterCount:    starterCount,
		PremiumCount:    premiumCount,
		PlatinumCount:   platinumCount,
	}, nil
}

func (r *superadminRepository) GetAllPlans() ([]database.SubscriptionPlan, error) {
	var plans []database.SubscriptionPlan
	err := r.db.Order("price_monthly ASC").Find(&plans).Error
	return plans, err
}

func (r *superadminRepository) GetPlanByID(id uint) (*database.SubscriptionPlan, error) {
	var plan database.SubscriptionPlan
	err := r.db.First(&plan, id).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

func (r *superadminRepository) UpdatePlan(plan *database.SubscriptionPlan) error {
	return r.db.Save(plan).Error
}

func (r *superadminRepository) GetAllTenants(search string, planFilter string) ([]TenantItemDto, error) {
	var users []database.User
	query := r.db.Where("role = 'OWNER'")

	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ? OR phone ILIKE ?", s, s, s)
	}

	if planFilter != "" {
		query = query.Where("plan_code = ?", planFilter)
	}

	if err := query.Order("created_at DESC").Find(&users).Error; err != nil {
		return nil, err
	}

	items := make([]TenantItemDto, len(users))
	for i, u := range users {
		var workspaces []database.Workspace
		_ = r.db.Where("owner_id = ?", u.ID).Find(&workspaces).Error

		var staffCount int64
		if len(workspaces) > 0 {
			wsIDs := make([]uint, len(workspaces))
			for idx, w := range workspaces {
				wsIDs[idx] = w.ID
			}
			_ = r.db.Model(&database.User{}).Where("workspace_id IN ?", wsIDs).Count(&staffCount).Error
		}

		planCode := u.PlanCode
		if planCode == "" {
			planCode = "STARTER"
		}

		items[i] = TenantItemDto{
			ID:             u.ID,
			Name:           u.Name,
			Email:          u.Email,
			Phone:          u.Phone,
			Role:           u.Role,
			Status:         u.Status,
			PlanCode:       planCode,
			PlanExpiresAt:  u.PlanExpiresAt,
			WorkspaceCount: len(workspaces),
			StaffCount:     int(staffCount),
			CreatedAt:      u.CreatedAt,
			Workspaces:     workspaces,
		}
	}

	return items, nil
}

func (r *superadminRepository) UpdateTenantPlan(userID uint, planCode string, expiresAt *time.Time, status string) error {
	updates := map[string]any{
		"plan_code": planCode,
	}
	if expiresAt != nil {
		updates["plan_expires_at"] = expiresAt
	}
	if status != "" {
		updates["status"] = status
	}
	return r.db.Model(&database.User{}).Where("id = ?", userID).Updates(updates).Error
}
