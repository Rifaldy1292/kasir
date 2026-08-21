package inventory

type StockAdjustmentDto struct {
	ProductID uint   `json:"product_id" binding:"required"`
	Type      string `json:"type" binding:"required,oneof=IN OUT ADJUSTMENT"` // IN (tambah), OUT (kurang), ADJUSTMENT (set stok baru)
	Qty       int    `json:"qty" binding:"required"`
	Reason    string `json:"reason" binding:"required,min=3"`
}

type StockHistoryFilterDto struct {
	ProductID uint
	Type      string
}
