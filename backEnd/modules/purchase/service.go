package purchase

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"gin-quickstart/database"

	"gorm.io/gorm"
)

type PurchaseService interface {
	GetPurchases(workspaceID uint) ([]database.Purchase, error)
	GetPurchaseByID(id uint, workspaceID uint) (*database.Purchase, error)
	CreatePurchase(workspaceID uint, userID uint, dto CreatePurchaseDto) (*database.Purchase, error)
}

type purchaseService struct {
	repo PurchaseRepository
	db   *gorm.DB
}

func NewPurchaseService(repo PurchaseRepository, db *gorm.DB) PurchaseService {
	return &purchaseService{repo: repo, db: db}
}

func (s *purchaseService) GetPurchases(workspaceID uint) ([]database.Purchase, error) {
	return s.repo.FindAll(workspaceID)
}

func (s *purchaseService) GetPurchaseByID(id uint, workspaceID uint) (*database.Purchase, error) {
	p, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("data pembelian tidak ditemukan")
	}
	return p, nil
}

func (s *purchaseService) CreatePurchase(workspaceID uint, userID uint, dto CreatePurchaseDto) (*database.Purchase, error) {
	if len(dto.Items) == 0 {
		return nil, errors.New("daftar produk yang dibeli tidak boleh kosong")
	}

	var totalCost float64 = 0.0
	var purchaseItems []database.PurchaseItem
	var movements []database.InventoryMovement

	now := time.Now()
	randomNum := rand.Intn(9000) + 1000
	purchaseNumber := fmt.Sprintf("PO-%s-%04d", now.Format("20060102150405"), randomNum)

	for _, it := range dto.Items {
		var p database.Product
		if err := s.db.Where("id = ? AND workspace_id = ?", it.ProductID, workspaceID).First(&p).Error; err != nil {
			return nil, fmt.Errorf("produk ID %d tidak ditemukan", it.ProductID)
		}

		itemTotal := it.CostPrice * float64(it.Qty)
		totalCost += itemTotal

		purchaseItems = append(purchaseItems, database.PurchaseItem{
			ProductID: it.ProductID,
			Qty:       it.Qty,
			CostPrice: it.CostPrice,
			Subtotal:  itemTotal,
		})

		movements = append(movements, database.InventoryMovement{
			WorkspaceID: workspaceID,
			ProductID:   it.ProductID,
			UserID:      userID,
			Type:        "PURCHASE",
			Qty:         it.Qty,
			StockBefore: p.Stock,
			StockAfter:  p.Stock + it.Qty,
			Reason:      "Penerimaan Pembelian PO: " + purchaseNumber,
			CreatedAt:   time.Now(),
		})
	}

	purchaseModel := &database.Purchase{
		WorkspaceID:    workspaceID,
		SupplierID:     dto.SupplierID,
		UserID:         userID,
		PurchaseNumber: purchaseNumber,
		TotalCost:      totalCost,
		Status:         "RECEIVED",
		Notes:          dto.Notes,
		CreatedAt:      time.Now(),
		Items:          purchaseItems,
	}

	if err := s.repo.CreatePurchase(purchaseModel, movements); err != nil {
		return nil, err
	}

	return s.repo.FindByID(purchaseModel.ID, workspaceID)
}
