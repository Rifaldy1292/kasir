package purchase

type PurchaseItemDto struct {
	ProductID uint    `json:"product_id" binding:"required"`
	Qty       int     `json:"qty" binding:"required,gt=0"`
	CostPrice float64 `json:"cost_price" binding:"required,min=0"`
}

type CreatePurchaseDto struct {
	SupplierID *uint             `json:"supplier_id"`
	Items      []PurchaseItemDto `json:"items" binding:"required,min=1"`
	Notes      string            `json:"notes"`
}
