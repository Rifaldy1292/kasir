package report

import (
	"time"

	"gin-quickstart/database"

	"gorm.io/gorm"
)

type ReportRepository interface {
	GetDashboardData(workspaceID uint) (*DashboardSummaryDto, error)
	GetSalesReport(workspaceID uint, filter ReportFilterDto) ([]database.Transaction, error)
	GetItemPerformanceReport(workspaceID uint, filter ReportFilterDto) ([]TopProductDto, error)
}

type reportRepository struct {
	db *gorm.DB
}

func NewReportRepository(db *gorm.DB) ReportRepository {
	return &reportRepository{db: db}
}

func (r *reportRepository) GetDashboardData(workspaceID uint) (*DashboardSummaryDto, error) {
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	summary := &DashboardSummaryDto{
		RecentTransactions:     make([]any, 0),
		TopSellingProducts:     make([]TopProductDto, 0),
		DailySalesTrends:       make([]DailyTrendDto, 0),
		PaymentMethodBreakdown: make([]PaymentSplitDto, 0),
	}

	// 1. Today Sales
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfDay).
		Select("COALESCE(SUM(total_amount), 0)").Scan(&summary.TodaySalesAmount)

	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfDay).
		Count(&summary.TodayTransactionCount)

	// 2. Month Sales
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfMonth).
		Select("COALESCE(SUM(total_amount), 0)").Scan(&summary.MonthSalesAmount)

	// 3. Month Profit = Sum(item.subtotal - (item.buy_price * item.qty))
	var monthProfit float64
	r.db.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.workspace_id = ? AND transactions.status = 'COMPLETED' AND transactions.created_at >= ?", workspaceID, startOfMonth).
		Select("COALESCE(SUM(transaction_items.subtotal - (transaction_items.buy_price * transaction_items.qty)), 0)").
		Scan(&monthProfit)
	summary.MonthEstimatedProfit = monthProfit

	// 4. Products and Low Stock
	r.db.Model(&database.Product{}).Where("workspace_id = ? AND is_active = true", workspaceID).Count(&summary.TotalProductsCount)
	r.db.Model(&database.Product{}).Where("workspace_id = ? AND is_active = true AND stock <= min_stock", workspaceID).Count(&summary.LowStockCount)

	// 5. Recent Transactions
	var recentTx []database.Transaction
	r.db.Preload("User").Preload("Customer").Where("workspace_id = ?", workspaceID).Order("created_at DESC").Limit(5).Find(&recentTx)
	for _, tx := range recentTx {
		summary.RecentTransactions = append(summary.RecentTransactions, tx)
	}

	// 6. Top 5 Selling Products
	r.db.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.workspace_id = ? AND transactions.status = 'COMPLETED'", workspaceID).
		Select("transaction_items.product_id, transaction_items.product_name, SUM(transaction_items.qty) as total_qty, SUM(transaction_items.subtotal) as total_sales").
		Group("transaction_items.product_id, transaction_items.product_name").
		Order("total_qty DESC").
		Limit(5).
		Scan(&summary.TopSellingProducts)

	// 7. Last 7 days trends
	sevenDaysAgo := startOfDay.AddDate(0, 0, -6)
	var trends []DailyTrendDto
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, sevenDaysAgo).
		Select("TO_CHAR(created_at, 'YYYY-MM-DD') as date, COALESCE(SUM(total_amount), 0) as amount, COUNT(id) as count").
		Group("TO_CHAR(created_at, 'YYYY-MM-DD')").
		Order("date ASC").
		Scan(&trends)
	summary.DailySalesTrends = trends

	// 8. Payment Method Split
	var paymentSplits []PaymentSplitDto
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfMonth).
		Select("payment_method as method, COALESCE(SUM(total_amount), 0) as total, COUNT(id) as count").
		Group("payment_method").
		Scan(&paymentSplits)
	summary.PaymentMethodBreakdown = paymentSplits

	return summary, nil
}

func (r *reportRepository) GetSalesReport(workspaceID uint, filter ReportFilterDto) ([]database.Transaction, error) {
	var transactions []database.Transaction
	query := r.db.Preload("User").Preload("Customer").Preload("Items.Product").
		Where("workspace_id = ?", workspaceID)

	if filter.StartDate != nil {
		query = query.Where("created_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("created_at <= ?", *filter.EndDate)
	}

	err := query.Order("created_at DESC").Find(&transactions).Error
	return transactions, err
}

func (r *reportRepository) GetItemPerformanceReport(workspaceID uint, filter ReportFilterDto) ([]TopProductDto, error) {
	var result []TopProductDto
	query := r.db.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.workspace_id = ? AND transactions.status = 'COMPLETED'", workspaceID)

	if filter.StartDate != nil {
		query = query.Where("transactions.created_at >= ?", *filter.StartDate)
	}
	if filter.EndDate != nil {
		query = query.Where("transactions.created_at <= ?", *filter.EndDate)
	}

	err := query.Select("transaction_items.product_id, transaction_items.product_name, SUM(transaction_items.qty) as total_qty, SUM(transaction_items.subtotal) as total_sales").
		Group("transaction_items.product_id, transaction_items.product_name").
		Order("total_sales DESC").
		Scan(&result).Error

	return result, err
}
