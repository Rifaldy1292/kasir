package product

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type ProductRepository interface {
	FindAll(workspaceID uint, filter ProductFilterDto) ([]database.Product, error)
	FindByID(id uint, workspaceID uint) (*database.Product, error)
	FindByBarcodeOrSKU(code string, workspaceID uint) (*database.Product, error)
	Create(p *database.Product) error
	Update(p *database.Product) error
	Delete(id uint, workspaceID uint) error
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) FindAll(workspaceID uint, filter ProductFilterDto) ([]database.Product, error) {
	var products []database.Product
	query := r.db.Preload("Category").Preload("Brand").Where("workspace_id = ?", workspaceID)

	if filter.Search != "" {
		searchPattern := "%" + filter.Search + "%"
		query = query.Where("name ILIKE ? OR barcode ILIKE ? OR sku ILIKE ?", searchPattern, searchPattern, searchPattern)
	}

	if filter.CategoryID > 0 {
		query = query.Where("category_id = ?", filter.CategoryID)
	}

	if filter.LowStock {
		query = query.Where("stock <= min_stock")
	}

	if filter.IsActive != nil {
		query = query.Where("is_active = ?", *filter.IsActive)
	}

	err := query.Order("created_at DESC").Find(&products).Error
	return products, err
}

func (r *productRepository) FindByID(id uint, workspaceID uint) (*database.Product, error) {
	var p database.Product
	err := r.db.Preload("Category").Preload("Brand").Where("id = ? AND workspace_id = ?", id, workspaceID).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *productRepository) FindByBarcodeOrSKU(code string, workspaceID uint) (*database.Product, error) {
	var p database.Product
	err := r.db.Preload("Category").Preload("Brand").Where("workspace_id = ? AND (barcode = ? OR sku = ?)", workspaceID, code, code).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *productRepository) Create(p *database.Product) error {
	return r.db.Create(p).Error
}

func (r *productRepository) Update(p *database.Product) error {
	return r.db.Save(p).Error
}

func (r *productRepository) Delete(id uint, workspaceID uint) error {
	return r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).Delete(&database.Product{}).Error
}
