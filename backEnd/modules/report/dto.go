package report

import "time"

type DashboardSummaryDto struct {
	TodaySalesAmount       float64           `json:"today_sales_amount"`
	TodayTransactionCount  int64             `json:"today_transaction_count"`
	MonthSalesAmount       float64           `json:"month_sales_amount"`
	MonthEstimatedProfit   float64           `json:"month_estimated_profit"`
	LowStockCount          int64             `json:"low_stock_count"`
	TotalProductsCount     int64             `json:"total_products_count"`
	RecentTransactions     []any             `json:"recent_transactions"`
	TopSellingProducts     []TopProductDto   `json:"top_selling_products"`
	DailySalesTrends       []DailyTrendDto   `json:"daily_sales_trends"`
	PaymentMethodBreakdown []PaymentSplitDto `json:"payment_method_breakdown"`
}

type TopProductDto struct {
	ProductID   uint    `json:"product_id"`
	ProductName string  `json:"product_name"`
	TotalQty    int64   `json:"total_qty"`
	TotalSales  float64 `json:"total_sales"`
}

type DailyTrendDto struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
	Count  int64   `json:"count"`
}

type PaymentSplitDto struct {
	Method string  `json:"method"`
	Total  float64 `json:"total"`
	Count  int64   `json:"count"`
}

type ReportFilterDto struct {
	StartDate *time.Time
	EndDate   *time.Time
}

type SalesReportItemDto struct {
	Date          string  `json:"date"`
	InvoiceNumber string  `json:"invoice_number"`
	CashierName   string  `json:"cashier_name"`
	CustomerName  string  `json:"customer_name"`
	PaymentMethod string  `json:"payment_method"`
	Subtotal      float64 `json:"subtotal"`
	Discount      float64 `json:"discount"`
	Tax           float64 `json:"tax"`
	Total         float64 `json:"total"`
	Status        string  `json:"status"`
}
