package database

import (
	"time"

	"gorm.io/gorm"
)

// Workspace represents a tenant business
type Workspace struct {
	ID            uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	OwnerID       uint           `gorm:"index" json:"owner_id"` // ID of the Owner who created this workspace
	Name          string         `gorm:"type:varchar(255);not null" json:"name"`
	BusinessType  string         `gorm:"type:varchar(100);default:'Retail'" json:"business_type"`
	Phone         string         `gorm:"type:varchar(50)" json:"phone"`
	Email         string         `gorm:"type:varchar(100)" json:"email"`
	Address       string         `gorm:"type:text" json:"address"`
	Currency      string         `gorm:"type:varchar(10);default:'IDR'" json:"currency"`
	TaxRate       float64        `gorm:"type:decimal(5,2);default:0.0" json:"tax_rate"`
	ReceiptHeader string         `gorm:"type:text" json:"receipt_header"`
	ReceiptFooter string         `gorm:"type:text" json:"receipt_footer"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	Users        []User        `gorm:"foreignKey:WorkspaceID" json:"users,omitempty"`
	Products     []Product     `gorm:"foreignKey:WorkspaceID" json:"products,omitempty"`
	Categories   []Category    `gorm:"foreignKey:WorkspaceID" json:"categories,omitempty"`
	Transactions []Transaction `gorm:"foreignKey:WorkspaceID" json:"transactions,omitempty"`
}

// User represents a staff member (Owner, Admin, Cashier)
type User struct {
	ID           uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID  *uint          `gorm:"index" json:"workspace_id"` // NULL if Owner hasn't created a workspace yet
	Name         string         `gorm:"type:varchar(255);not null" json:"name"`
	Email        string         `gorm:"type:varchar(255);not null;index" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Role         string         `gorm:"type:varchar(50);not null;default:'CASHIER'" json:"role"` // SUPERADMIN, OWNER, ADMIN, CASHIER
	Status       string         `gorm:"type:varchar(20);default:'ACTIVE'" json:"status"`         // ACTIVE, INACTIVE
	Phone        string         `gorm:"type:varchar(50)" json:"phone"`
	PlanCode     string         `gorm:"type:varchar(50);default:'STARTER'" json:"plan_code"`     // STARTER, PREMIUM, PLATINUM
	PlanExpiresAt *time.Time    `json:"plan_expires_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Workspace *Workspace `gorm:"foreignKey:WorkspaceID" json:"workspace,omitempty"`
}

// Category for product categorization
type Category struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint           `gorm:"index;not null" json:"workspace_id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Products []Product `gorm:"foreignKey:CategoryID" json:"products,omitempty"`
}

// Brand of products
type Brand struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint           `gorm:"index;not null" json:"workspace_id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Product catalog item
type Product struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint           `gorm:"index;not null" json:"workspace_id"`
	CategoryID  *uint          `gorm:"index" json:"category_id"`
	BrandID     *uint          `gorm:"index" json:"brand_id"`
	SKU         string         `gorm:"type:varchar(100);index" json:"sku"`
	Barcode     string         `gorm:"type:varchar(100);index" json:"barcode"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Description string         `gorm:"type:text" json:"description"`
	BuyPrice    float64        `gorm:"type:decimal(15,2);default:0.0" json:"buy_price"`
	SellPrice   float64        `gorm:"type:decimal(15,2);not null" json:"sell_price"`
	Stock       int            `gorm:"not null;default:0" json:"stock"`
	MinStock    int            `gorm:"not null;default:5" json:"min_stock"`
	Unit        string         `gorm:"type:varchar(50);default:'Pcs'" json:"unit"`
	ImageURL    string         `gorm:"type:text" json:"image_url"`
	IsActive    bool           `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	Category *Category `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Brand    *Brand    `gorm:"foreignKey:BrandID" json:"brand,omitempty"`
}

// InventoryMovement logs all stock changes
type InventoryMovement struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint      `gorm:"index;not null" json:"workspace_id"`
	ProductID   uint      `gorm:"index;not null" json:"product_id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Type        string    `gorm:"type:varchar(50);not null" json:"type"` // IN, OUT, ADJUSTMENT, SALE, PURCHASE, RETURN
	Qty         int       `gorm:"not null" json:"qty"`
	StockBefore int       `gorm:"not null" json:"stock_before"`
	StockAfter  int       `gorm:"not null" json:"stock_after"`
	Reason      string    `gorm:"type:text" json:"reason"`
	ReferenceID string    `gorm:"type:varchar(100)" json:"reference_id"` // Transaction ID or Purchase ID
	CreatedAt   time.Time `json:"created_at"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	User    *User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// Customer details
type Customer struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint           `gorm:"index;not null" json:"workspace_id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Phone       string         `gorm:"type:varchar(50)" json:"phone"`
	Email       string         `gorm:"type:varchar(100)" json:"email"`
	Address     string         `gorm:"type:text" json:"address"`
	Points      int            `gorm:"default:0" json:"points"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// Supplier details
type Supplier struct {
	ID          uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint           `gorm:"index;not null" json:"workspace_id"`
	Name        string         `gorm:"type:varchar(255);not null" json:"name"`
	Phone       string         `gorm:"type:varchar(50)" json:"phone"`
	Email       string         `gorm:"type:varchar(100)" json:"email"`
	Address     string         `gorm:"type:text" json:"address"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

// CashSession tracks a cashier shift and drawer
type CashSession struct {
	ID           uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID  uint           `gorm:"index;not null" json:"workspace_id"`
	UserID       uint           `gorm:"index;not null" json:"user_id"`
	OpeningCash  float64        `gorm:"type:decimal(15,2);not null" json:"opening_cash"`
	ClosingCash  float64        `gorm:"type:decimal(15,2);default:0.0" json:"closing_cash"`
	ExpectedCash float64        `gorm:"type:decimal(15,2);default:0.0" json:"expected_cash"`
	Difference   float64        `gorm:"type:decimal(15,2);default:0.0" json:"difference"`
	TotalSales   float64        `gorm:"type:decimal(15,2);default:0.0" json:"total_sales"`
	TotalCashIn  float64        `gorm:"type:decimal(15,2);default:0.0" json:"total_cash_in"`
	TotalCashOut float64        `gorm:"type:decimal(15,2);default:0.0" json:"total_cash_out"`
	Status       string         `gorm:"type:varchar(20);default:'OPEN'" json:"status"` // OPEN, CLOSED
	OpenedAt     time.Time      `json:"opened_at"`
	ClosedAt     *time.Time     `json:"closed_at"`
	Notes        string         `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	User         *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Movements    []CashMovement `gorm:"foreignKey:SessionID" json:"movements,omitempty"`
	Transactions []Transaction  `gorm:"foreignKey:CashSessionID" json:"transactions,omitempty"`
}

// CashMovement logs manual cash drawer deposits or withdrawals
type CashMovement struct {
	ID        uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	SessionID uint      `gorm:"index;not null" json:"session_id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Type      string    `gorm:"type:varchar(20);not null" json:"type"` // CASH_IN, CASH_OUT
	Amount    float64   `gorm:"type:decimal(15,2);not null" json:"amount"`
	Reason    string    `gorm:"type:text;not null" json:"reason"`
	CreatedAt time.Time `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// Transaction represents a completed, held, or voided POS sale
type Transaction struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID    uint           `gorm:"index;not null" json:"workspace_id"`
	InvoiceNumber  string         `gorm:"type:varchar(100);index;not null" json:"invoice_number"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	CashSessionID  *uint          `gorm:"index" json:"cash_session_id"`
	CustomerID     *uint          `gorm:"index" json:"customer_id"`
	Subtotal       float64        `gorm:"type:decimal(15,2);not null" json:"subtotal"`
	DiscountAmount float64        `gorm:"type:decimal(15,2);default:0.0" json:"discount_amount"`
	TaxAmount      float64        `gorm:"type:decimal(15,2);default:0.0" json:"tax_amount"`
	TotalAmount    float64        `gorm:"type:decimal(15,2);not null" json:"total_amount"`
	PaidAmount     float64        `gorm:"type:decimal(15,2);not null" json:"paid_amount"`
	ChangeAmount   float64        `gorm:"type:decimal(15,2);default:0.0" json:"change_amount"`
	PaymentMethod  string         `gorm:"type:varchar(50);default:'CASH'" json:"payment_method"` // CASH, QRIS, TRANSFER, CARD
	Status         string         `gorm:"type:varchar(20);default:'COMPLETED'" json:"status"`    // COMPLETED, HOLD, VOID, REFUNDED
	Notes          string         `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	User        *User             `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Customer    *Customer         `gorm:"foreignKey:CustomerID" json:"customer,omitempty"`
	CashSession *CashSession      `gorm:"foreignKey:CashSessionID" json:"cash_session,omitempty"`
	Items       []TransactionItem `gorm:"foreignKey:TransactionID" json:"items,omitempty"`
}

// TransactionItem details per product in a sale
type TransactionItem struct {
	ID             uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	TransactionID  uint    `gorm:"index;not null" json:"transaction_id"`
	ProductID      uint    `gorm:"index;not null" json:"product_id"`
	ProductName    string  `gorm:"type:varchar(255);not null" json:"product_name"`
	Price          float64 `gorm:"type:decimal(15,2);not null" json:"price"`
	BuyPrice       float64 `gorm:"type:decimal(15,2);default:0.0" json:"buy_price"`
	Qty            int     `gorm:"not null" json:"qty"`
	DiscountAmount float64 `gorm:"type:decimal(15,2);default:0.0" json:"discount_amount"`
	Subtotal       float64 `gorm:"type:decimal(15,2);not null" json:"subtotal"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// Purchase represents procurement from suppliers
type Purchase struct {
	ID             uint           `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID    uint           `gorm:"index;not null" json:"workspace_id"`
	SupplierID     *uint          `gorm:"index" json:"supplier_id"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	PurchaseNumber string         `gorm:"type:varchar(100);not null" json:"purchase_number"`
	TotalCost      float64        `gorm:"type:decimal(15,2);not null" json:"total_cost"`
	Status         string         `gorm:"type:varchar(30);default:'RECEIVED'" json:"status"` // RECEIVED, PENDING, CANCELLED
	Notes          string         `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	Supplier *Supplier      `gorm:"foreignKey:SupplierID" json:"supplier,omitempty"`
	User     *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Items    []PurchaseItem `gorm:"foreignKey:PurchaseID" json:"items,omitempty"`
}

// PurchaseItem details per product in a purchase
type PurchaseItem struct {
	ID         uint    `gorm:"primaryKey;autoIncrement" json:"id"`
	PurchaseID uint    `gorm:"index;not null" json:"purchase_id"`
	ProductID  uint    `gorm:"index;not null" json:"product_id"`
	Qty        int     `gorm:"not null" json:"qty"`
	CostPrice  float64 `gorm:"type:decimal(15,2);not null" json:"cost_price"`
	Subtotal   float64 `gorm:"type:decimal(15,2);not null" json:"subtotal"`

	Product *Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// AuditLog tracks sensitive system operations
type AuditLog struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint      `gorm:"index;not null" json:"workspace_id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	Action      string    `gorm:"type:varchar(100);not null" json:"action"` // CREATE, UPDATE, DELETE, VOID, ADJUST_STOCK
	Entity      string    `gorm:"type:varchar(100);not null" json:"entity"`
	EntityID    string    `gorm:"type:varchar(100)" json:"entity_id"`
	Details     string    `gorm:"type:text" json:"details"`
	CreatedAt   time.Time `json:"created_at"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// SystemLog mencatat semua event login, CRUD, dan error untuk keperluan audit dan monitoring.
// Data ini dapat diakses melalui API oleh OWNER dan ADMIN.
type SystemLog struct {
	ID          uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	WorkspaceID uint      `gorm:"index" json:"workspace_id"`                   // 0 jika request belum terautentikasi
	UserID      uint      `gorm:"index" json:"user_id"`                        // 0 jika request belum terautentikasi
	UserEmail   string    `gorm:"type:varchar(255)" json:"user_email"`
	Type        string    `gorm:"type:varchar(20);not null;index" json:"type"` // LOGIN, CRUD, ERROR
	Method      string    `gorm:"type:varchar(10)" json:"method"`              // GET, POST, PUT, DELETE, dsb
	Path        string    `gorm:"type:varchar(500)" json:"path"`
	Action      string    `gorm:"type:varchar(200)" json:"action"`             // misal: "Create Products"
	Entity      string    `gorm:"type:varchar(100)" json:"entity"`             // misal: "Products"
	EntityID    string    `gorm:"type:varchar(100)" json:"entity_id"`
	StatusCode  int       `json:"status_code"`
	Message     string    `gorm:"type:text" json:"message"`
	Detail      string    `gorm:"type:text" json:"detail"` // detail error atau keterangan tambahan
	IPAddress   string    `gorm:"type:varchar(50)" json:"ip_address"`
	CreatedAt   time.Time `json:"created_at"`
}

// SubscriptionPlan represents a pricing tier in the SaaS platform
type SubscriptionPlan struct {
	ID            uint      `gorm:"primaryKey;autoIncrement" json:"id"`
	Code          string    `gorm:"type:varchar(50);uniqueIndex;not null" json:"code"` // STARTER, PREMIUM, PLATINUM
	Name          string    `gorm:"type:varchar(100);not null" json:"name"`
	Description   string    `gorm:"type:text" json:"description"`
	PriceMonthly  float64   `gorm:"type:decimal(15,2);not null;default:0.0" json:"price_monthly"`
	PriceYearly   float64   `gorm:"type:decimal(15,2);not null;default:0.0" json:"price_yearly"`
	MaxUsers      int       `gorm:"not null;default:2" json:"max_users"`
	MaxWorkspaces int       `gorm:"not null;default:1" json:"max_workspaces"`
	Features      string    `gorm:"type:text" json:"features"` // comma-separated or JSON list of feature labels
	IsActive      bool      `gorm:"default:true" json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

