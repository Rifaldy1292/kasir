package purchase

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type PurchaseRepository interface {
	FindAll(workspaceID uint) ([]database.Purchase, error)
	FindByID(id uint, workspaceID uint) (*database.Purchase, error)
	CreatePurchase(p *database.Purchase, movements []database.InventoryMovement) error
}

type purchaseRepository struct {
	db *gorm.DB
}

func NewPurchaseRepository(db *gorm.DB) PurchaseRepository {
	return &purchaseRepository{db: db}
}

func (r *purchaseRepository) FindAll(workspaceID uint) ([]database.Purchase, error) {
	var purchases []database.Purchase
	err := r.db.Preload("Supplier").Preload("User").Preload("Items.Product").Where("workspace_id = ?", workspaceID).Order("created_at DESC").Find(&purchases).Error
	return purchases, err
}

func (r *purchaseRepository) FindByID(id uint, workspaceID uint) (*database.Purchase, error) {
	var p database.Purchase
	err := r.db.Preload("Supplier").Preload("User").Preload("Items.Product").Where("id = ? AND workspace_id = ?", id, workspaceID).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (r *purchaseRepository) CreatePurchase(p *database.Purchase, movements []database.InventoryMovement) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(p).Error; err != nil {
			return err
		}

		for _, m := range movements {
			m.ReferenceID = p.PurchaseNumber
			if err := tx.Create(&m).Error; err != nil {
				return err
			}

			// Update product stock and optionally update buy_price
			if err := tx.Model(&database.Product{}).Where("id = ? AND workspace_id = ?", m.ProductID, m.WorkspaceID).
				Updates(map[string]interface{}{
					"stock": gorm.Expr("stock + ?", m.Qty),
				}).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
