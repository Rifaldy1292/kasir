package pos

import (
	"gin-quickstart/database"
	"time"
)

type CartItemDto struct {
	ProductID      uint    `json:"product_id" binding:"required"`
	Qty            int     `json:"qty" binding:"required,gt=0"`
	DiscountAmount float64 `json:"discount_amount"`
}

type CheckoutDto struct {
	CustomerID     *uint         `json:"customer_id"`
	CashSessionID  *uint         `json:"cash_session_id"`
	Items          []CartItemDto `json:"items" binding:"required,min=1"`
	DiscountAmount float64       `json:"discount_amount"`
	TaxRate        float64       `json:"tax_rate"` // e.g. 11.0 for 11%
	PaidAmount     float64       `json:"paid_amount" binding:"required,min=0"`
	PaymentMethod  string        `json:"payment_method" binding:"required,oneof=CASH QRIS TRANSFER CARD"`
	Notes          string        `json:"notes"`
	IsHold         bool          `json:"is_hold"` // If true, saves as HOLD without stock decrement
}

type VoidRefundDto struct {
	Reason string `json:"reason" binding:"required,min=3"`
}

type TransactionFilterDto struct {
	Search    string
	Status    string
	StartDate *time.Time
	EndDate   *time.Time
	Page      int
	Limit     int
}

type PaginatedTransactionsDto struct {
	Items      []database.Transaction `json:"items"`
	TotalItems int64                  `json:"total_items"`
	Page       int                    `json:"page"`
	Limit      int                    `json:"limit"`
	TotalPages int                    `json:"total_pages"`
}
