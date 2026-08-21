package settings

type UpdateWorkspaceDto struct {
	Name          string  `json:"name" binding:"required,min=2"`
	BusinessType  string  `json:"business_type"`
	Phone         string  `json:"phone"`
	Email         string  `json:"email"`
	Address       string  `json:"address"`
	Currency      string  `json:"currency"`
	TaxRate       float64 `json:"tax_rate"`
	ReceiptHeader string  `json:"receipt_header"`
	ReceiptFooter string  `json:"receipt_footer"`
}

type CreateUserDto struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Role     string `json:"role" binding:"required,oneof=ADMIN CASHIER"`
	Phone    string `json:"phone"`
}

type UpdateUserDto struct {
	Name   string `json:"name" binding:"required,min=2"`
	Role   string `json:"role" binding:"required,oneof=ADMIN CASHIER OWNER"`
	Status string `json:"status" binding:"required,oneof=ACTIVE INACTIVE"`
	Phone  string `json:"phone"`
}
