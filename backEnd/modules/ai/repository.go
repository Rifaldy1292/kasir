package ai

import (
	"time"

	"gin-quickstart/database"

	"gorm.io/gorm"
)

type AIRepository interface {
	GetBusinessSnapshot(workspaceID uint) (*BusinessSnapshot, error)
	GetProductVelocityData(workspaceID uint) ([]ProductVelocityData, error)
	GetProductCatalog(workspaceID uint, limit int) ([]ProductCatalogSummary, error)
	GetProductsByIDs(productIDs []uint, workspaceID uint) ([]database.Product, error)
}

type aiRepository struct {
	db *gorm.DB
}

func NewAIRepository(db *gorm.DB) AIRepository {
	return &aiRepository{db: db}
}

func (r *aiRepository) GetBusinessSnapshot(workspaceID uint) (*BusinessSnapshot, error) {
	var ws database.Workspace
	if err := r.db.Select("id, name, currency").First(&ws, workspaceID).Error; err != nil {
		ws.Name = "theKasir Store"
		ws.Currency = "IDR"
	}

	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	sevenDaysAgo := startOfDay.AddDate(0, 0, -6)

	snapshot := &BusinessSnapshot{
		WorkspaceName:          ws.Name,
		Currency:               ws.Currency,
		GeneratedAt:            now,
		TopSellingProducts:     make([]TopProductSummary, 0),
		LowStockItems:          make([]LowStockSummary, 0),
		DailySalesTrends:       make([]DailyTrendSummary, 0),
		PaymentMethodBreakdown: make([]string, 0),
	}

	// 1. Today Sales
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfDay).
		Select("COALESCE(SUM(total_amount), 0)").Scan(&snapshot.TodaySalesAmount)

	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfDay).
		Count(&snapshot.TodayTransactionCount)

	// 2. Month Sales
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfMonth).
		Select("COALESCE(SUM(total_amount), 0)").Scan(&snapshot.MonthSalesAmount)

	// 3. Month Estimated Profit
	r.db.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.workspace_id = ? AND transactions.status = 'COMPLETED' AND transactions.created_at >= ?", workspaceID, startOfMonth).
		Select("COALESCE(SUM(transaction_items.subtotal - (transaction_items.buy_price * transaction_items.qty)), 0)").
		Scan(&snapshot.MonthEstimatedProfit)

	// 4. Products & Low Stock
	r.db.Model(&database.Product{}).
		Where("workspace_id = ? AND is_active = true", workspaceID).
		Count(&snapshot.TotalProductsCount)

	r.db.Model(&database.Product{}).
		Where("workspace_id = ? AND is_active = true AND stock <= min_stock", workspaceID).
		Count(&snapshot.LowStockCount)

	// 5. Low stock list
	var lowStockProds []database.Product
	r.db.Where("workspace_id = ? AND is_active = true AND stock <= min_stock", workspaceID).
		Order("stock ASC").Limit(10).Find(&lowStockProds)
	for _, p := range lowStockProds {
		snapshot.LowStockItems = append(snapshot.LowStockItems, LowStockSummary{
			ProductID: p.ID,
			Name:      p.Name,
			Stock:     p.Stock,
			MinStock:  p.MinStock,
			Unit:      p.Unit,
		})
	}

	// 6. Top 10 Selling Products in Last 30 Days
	thirtyDaysAgo := startOfDay.AddDate(0, 0, -29)
	r.db.Table("transaction_items").
		Joins("JOIN transactions ON transactions.id = transaction_items.transaction_id").
		Where("transactions.workspace_id = ? AND transactions.status = 'COMPLETED' AND transactions.created_at >= ?", workspaceID, thirtyDaysAgo).
		Select("transaction_items.product_id, transaction_items.product_name, SUM(transaction_items.qty) as total_qty, SUM(transaction_items.subtotal) as total_sales").
		Group("transaction_items.product_id, transaction_items.product_name").
		Order("total_qty DESC").
		Limit(10).
		Scan(&snapshot.TopSellingProducts)

	// 7. Last 7 Days Trends
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, sevenDaysAgo).
		Select("TO_CHAR(created_at, 'YYYY-MM-DD') as date, COALESCE(SUM(total_amount), 0) as amount, COUNT(id) as count").
		Group("TO_CHAR(created_at, 'YYYY-MM-DD')").
		Order("date ASC").
		Scan(&snapshot.DailySalesTrends)

	// 8. Payment Method summary
	type splitRow struct {
		Method string
		Total  float64
		Count  int64
	}
	var splits []splitRow
	r.db.Model(&database.Transaction{}).
		Where("workspace_id = ? AND status = 'COMPLETED' AND created_at >= ?", workspaceID, startOfMonth).
		Select("payment_method as method, COALESCE(SUM(total_amount), 0) as total, COUNT(id) as count").
		Group("payment_method").
		Scan(&splits)
	for _, s := range splits {
		snapshot.PaymentMethodBreakdown = append(snapshot.PaymentMethodBreakdown, s.Method)
	}

	return snapshot, nil
}

func (r *aiRepository) GetProductVelocityData(workspaceID uint) ([]ProductVelocityData, error) {
	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)

	type prodRow struct {
		ID           uint
		Name         string
		CategoryName string
		Stock        int
		MinStock     int
		Unit         string
		BuyPrice     float64
		SellPrice    float64
		SoldLast30D  int
	}

	var rows []prodRow
	err := r.db.Table("products").
		Select(`products.id, products.name, COALESCE(categories.name, 'Tanpa Kategori') as category_name,
			products.stock, products.min_stock, products.unit, products.buy_price, products.sell_price,
			COALESCE(SUM(CASE WHEN transactions.status = 'COMPLETED' AND transactions.created_at >= ? THEN transaction_items.qty ELSE 0 END), 0) as sold_last_30_d`, thirtyDaysAgo).
		Joins("LEFT JOIN categories ON categories.id = products.category_id").
		Joins("LEFT JOIN transaction_items ON transaction_items.product_id = products.id").
		Joins("LEFT JOIN transactions ON transactions.id = transaction_items.transaction_id AND transactions.workspace_id = products.workspace_id").
		Where("products.workspace_id = ? AND products.is_active = true", workspaceID).
		Group("products.id, products.name, categories.name, products.stock, products.min_stock, products.unit, products.buy_price, products.sell_price").
		Order("products.stock ASC, sold_last_30_d DESC").
		Limit(50).
		Scan(&rows).Error

	if err != nil {
		return nil, err
	}

	var result []ProductVelocityData
	for _, row := range rows {
		result = append(result, ProductVelocityData{
			ProductID:   row.ID,
			ProductName: row.Name,
			Category:    row.CategoryName,
			Stock:       row.Stock,
			MinStock:    row.MinStock,
			Unit:        row.Unit,
			BuyPrice:    row.BuyPrice,
			SellPrice:   row.SellPrice,
			SoldLast30D: row.SoldLast30D,
		})
	}

	return result, nil
}

func (r *aiRepository) GetProductCatalog(workspaceID uint, limit int) ([]ProductCatalogSummary, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	type catalogRow struct {
		ID          uint
		Name        string
		Category    string
		Description string
		SellPrice   float64
		Unit        string
	}

	var rows []catalogRow
	err := r.db.Table("products").
		Select("products.id, products.name, COALESCE(categories.name, '') as category, products.description, products.sell_price, products.unit").
		Joins("LEFT JOIN categories ON categories.id = products.category_id").
		Where("products.workspace_id = ? AND products.is_active = true", workspaceID).
		Order("products.name ASC").
		Limit(limit).
		Scan(&rows).Error

	if err != nil {
		return nil, err
	}

	var catalog []ProductCatalogSummary
	for _, row := range rows {
		catalog = append(catalog, ProductCatalogSummary{
			ID:          row.ID,
			Name:        row.Name,
			Category:    row.Category,
			Description: row.Description,
			Price:       row.SellPrice,
			Unit:        row.Unit,
		})
	}

	return catalog, nil
}

func (r *aiRepository) GetProductsByIDs(productIDs []uint, workspaceID uint) ([]database.Product, error) {
	if len(productIDs) == 0 {
		return []database.Product{}, nil
	}

	var prods []database.Product
	err := r.db.Preload("Category").
		Where("workspace_id = ? AND id IN ? AND is_active = true", workspaceID, productIDs).
		Find(&prods).Error

	return prods, err
}
