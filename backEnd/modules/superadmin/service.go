package superadmin

import (
	"errors"
	"time"

	"gin-quickstart/database"
)

type SuperadminService interface {
	GetDashboardStats() (*SuperadminStatsDto, error)
	GetPlans() ([]database.SubscriptionPlan, error)
	UpdatePlan(id uint, dto UpdatePlanDto) (*database.SubscriptionPlan, error)
	GetTenants(search string, planFilter string) ([]TenantItemDto, error)
	UpdateTenantPlan(userID uint, dto UpdateTenantPlanDto) error
}

type superadminService struct {
	repo SuperadminRepository
}

func NewSuperadminService(repo SuperadminRepository) SuperadminService {
	return &superadminService{repo: repo}
}

func (s *superadminService) GetDashboardStats() (*SuperadminStatsDto, error) {
	return s.repo.GetStats()
}

func (s *superadminService) GetPlans() ([]database.SubscriptionPlan, error) {
	return s.repo.GetAllPlans()
}

func (s *superadminService) UpdatePlan(id uint, dto UpdatePlanDto) (*database.SubscriptionPlan, error) {
	plan, err := s.repo.GetPlanByID(id)
	if err != nil {
		return nil, errors.New("paket langganan tidak ditemukan")
	}

	plan.Name = dto.Name
	plan.Description = dto.Description
	plan.PriceMonthly = dto.PriceMonthly
	plan.PriceYearly = dto.PriceYearly
	plan.MaxUsers = dto.MaxUsers
	plan.MaxWorkspaces = dto.MaxWorkspaces
	plan.Features = dto.Features
	plan.IsActive = dto.IsActive
	plan.UpdatedAt = time.Now()

	if err := s.repo.UpdatePlan(plan); err != nil {
		return nil, err
	}
	return plan, nil
}

func (s *superadminService) GetTenants(search string, planFilter string) ([]TenantItemDto, error) {
	return s.repo.GetAllTenants(search, planFilter)
}

func (s *superadminService) UpdateTenantPlan(userID uint, dto UpdateTenantPlanDto) error {
	return s.repo.UpdateTenantPlan(userID, dto.PlanCode, dto.PlanExpiresAt, dto.Status)
}
