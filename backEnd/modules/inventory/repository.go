package inventory

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type InventoryRepository interface {
	GetMovements(workspaceID uint, filter StockHistoryFilterDto) ([]database.InventoryMovement, error)
	AdjustStock(movement *database.InventoryMovement, newStock int) error
	GetLowStockProducts(workspaceID uint) ([]database.Product, error)
	FindProductByID(id uint, workspaceID uint) (*database.Product, error)
}

type inventoryRepository struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) InventoryRepository {
	return &inventoryRepository{db: db}
}

func (r *inventoryRepository) GetMovements(workspaceID uint, filter StockHistoryFilterDto) ([]database.InventoryMovement, error) {
	var movements []database.InventoryMovement
	query := r.db.Preload("Product").Preload("User").Where("workspace_id = ?", workspaceID)

	if filter.ProductID > 0 {
		query = query.Where("product_id = ?", filter.ProductID)
	}

	if filter.Type != "" {
		query = query.Where("type = ?", filter.Type)
	}

	err := query.Order("created_at DESC").Limit(200).Find(&movements).Error
	return movements, err
}

func (r *inventoryRepository) AdjustStock(movement *database.InventoryMovement, newStock int) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&database.Product{}).Where("id = ? AND workspace_id = ?", movement.ProductID, movement.WorkspaceID).Update("stock", newStock).Error; err != nil {
			return err
		}
		return tx.Create(movement).Error
	})
}

func (r *inventoryRepository) GetLowStockProducts(workspaceID uint) ([]database.Product, error) {
	var products []database.Product
	err := r.db.Preload("Category").Where("workspace_id = ? AND stock <= min_stock AND is_active = true", workspaceID).Find(&products).Error
	return products, err
}

func (r *inventoryRepository) FindProductByID(id uint, workspaceID uint) (*database.Product, error) {
	var p database.Product
	err := r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}
