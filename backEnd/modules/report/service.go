package report

import (
	"gin-quickstart/database"
)

type ReportService interface {
	GetDashboard(workspaceID uint) (*DashboardSummaryDto, error)
	GetSalesReport(workspaceID uint, filter ReportFilterDto) ([]database.Transaction, error)
	GetItemReport(workspaceID uint, filter ReportFilterDto) ([]TopProductDto, error)
}

type reportService struct {
	repo ReportRepository
}

func NewReportService(repo ReportRepository) ReportService {
	return &reportService{repo: repo}
}

func (s *reportService) GetDashboard(workspaceID uint) (*DashboardSummaryDto, error) {
	return s.repo.GetDashboardData(workspaceID)
}

func (s *reportService) GetSalesReport(workspaceID uint, filter ReportFilterDto) ([]database.Transaction, error) {
	return s.repo.GetSalesReport(workspaceID, filter)
}

func (s *reportService) GetItemReport(workspaceID uint, filter ReportFilterDto) ([]TopProductDto, error) {
	return s.repo.GetItemPerformanceReport(workspaceID, filter)
}
