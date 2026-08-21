package supplier

type CreateSupplierDto struct {
	Name    string `json:"name" binding:"required,min=2"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
}

type UpdateSupplierDto struct {
	Name    string `json:"name" binding:"required,min=2"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
}
