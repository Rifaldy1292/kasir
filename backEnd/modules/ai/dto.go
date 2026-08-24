package ai

import "time"

type ChatRequestDto struct {
	Message   string `json:"message" binding:"required"`
	SessionID string `json:"session_id"` // Optional session identifier for conversation continuity
}

type InsightDto struct {
	Type           string `json:"type"`           // trend, warning, opportunity, anomaly
	Title          string `json:"title"`          // Short catchy title
	Description    string `json:"description"`    // Detailed observation
	Recommendation string `json:"recommendation"` // Recommended actionable step
	Severity       string `json:"severity"`       // positive, warning, danger, info
}

type StockPredictionDto struct {
	ProductID              uint    `json:"product_id"`
	ProductName            string  `json:"product_name"`
	CurrentStock           int     `json:"current_stock"`
	AvgDailySales          float64 `json:"avg_daily_sales"`
	EstimatedDaysRemaining int     `json:"estimated_days_remaining"`
	RecommendedRestockDate string  `json:"recommended_restock_date"`
	RecommendedRestockQty  int     `json:"recommended_restock_qty"`
	AINotes                string  `json:"ai_notes"`
}

type ProductSearchRequestDto struct {
	Query string `json:"query" binding:"required"`
}

type TopProductSummary struct {
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	TotalQty    int64   `json:"total_qty"`
	TotalSales  float64 `json:"total_sales"`
}

type LowStockSummary struct {
	ProductID uint   `json:"product_id"`
	Name      string `json:"name"`
	Stock     int    `json:"stock"`
	MinStock  int    `json:"min_stock"`
	Unit      string `json:"unit"`
}

type DailyTrendSummary struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
	Count  int64   `json:"count"`
}

type BusinessSnapshot struct {
	WorkspaceName          string               `json:"workspace_name"`
	Currency               string               `json:"currency"`
	GeneratedAt            time.Time            `json:"generated_at"`
	TodaySalesAmount       float64              `json:"today_sales_amount"`
	TodayTransactionCount  int64                `json:"today_transaction_count"`
	MonthSalesAmount       float64              `json:"month_sales_amount"`
	MonthEstimatedProfit   float64              `json:"month_estimated_profit"`
	TotalProductsCount     int64                `json:"total_products_count"`
	LowStockCount          int64                `json:"low_stock_count"`
	TopSellingProducts     []TopProductSummary  `json:"top_selling_products"`
	LowStockItems          []LowStockSummary    `json:"low_stock_items"`
	DailySalesTrends       []DailyTrendSummary  `json:"daily_sales_trends"`
	PaymentMethodBreakdown []string             `json:"payment_methods"`
}

type ProductVelocityData struct {
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	Category    string  `json:"category"`
	Stock       int     `json:"stock"`
	MinStock    int     `json:"min_stock"`
	Unit        string  `json:"unit"`
	BuyPrice    float64 `json:"buy_price"`
	SellPrice   float64 `json:"sell_price"`
	SoldLast30D int     `json:"sold_last_30_days"`
}

type ProductCatalogSummary struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Category    string  `json:"category,omitempty"`
	Description string  `json:"description,omitempty"`
	Price       float64 `json:"price"`
	Unit        string  `json:"unit"`
}
