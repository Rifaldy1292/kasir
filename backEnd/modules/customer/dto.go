package customer

type CreateCustomerDto struct {
	Name    string `json:"name" binding:"required,min=2"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
}

type UpdateCustomerDto struct {
	Name    string `json:"name" binding:"required,min=2"`
	Phone   string `json:"phone"`
	Email   string `json:"email"`
	Address string `json:"address"`
}
