package product

type CreateProductDto struct {
	CategoryID  *uint   `json:"category_id"`
	BrandID     *uint   `json:"brand_id"`
	SKU         string  `json:"sku"`
	Barcode     string  `json:"barcode"`
	Name        string  `json:"name" binding:"required,min=2"`
	Description string  `json:"description"`
	BuyPrice    float64 `json:"buy_price"`
	SellPrice   float64 `json:"sell_price" binding:"required"`
	Stock       int     `json:"stock"`
	MinStock    int     `json:"min_stock"`
	Unit        string  `json:"unit"`
	ImageURL    string  `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

type UpdateProductDto struct {
	CategoryID  *uint   `json:"category_id"`
	BrandID     *uint   `json:"brand_id"`
	SKU         string  `json:"sku"`
	Barcode     string  `json:"barcode"`
	Name        string  `json:"name" binding:"required,min=2"`
	Description string  `json:"description"`
	BuyPrice    float64 `json:"buy_price"`
	SellPrice   float64 `json:"sell_price" binding:"required"`
	MinStock    int     `json:"min_stock"`
	Unit        string  `json:"unit"`
	ImageURL    string  `json:"image_url"`
	IsActive    *bool   `json:"is_active"`
}

type ProductFilterDto struct {
	Search     string
	CategoryID uint
	LowStock   bool
	IsActive   *bool
}
