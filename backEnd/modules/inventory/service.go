package inventory

import (
	"errors"
	"fmt"

	"gin-quickstart/database"
)

type InventoryService interface {
	GetHistory(workspaceID uint, filter StockHistoryFilterDto) ([]database.InventoryMovement, error)
	GetLowStock(workspaceID uint) ([]database.Product, error)
	AdjustStock(workspaceID uint, userID uint, dto StockAdjustmentDto) (*database.InventoryMovement, error)
}

type inventoryService struct {
	repo InventoryRepository
}

func NewInventoryService(repo InventoryRepository) InventoryService {
	return &inventoryService{repo: repo}
}

func (s *inventoryService) GetHistory(workspaceID uint, filter StockHistoryFilterDto) ([]database.InventoryMovement, error) {
	return s.repo.GetMovements(workspaceID, filter)
}

func (s *inventoryService) GetLowStock(workspaceID uint) ([]database.Product, error) {
	return s.repo.GetLowStockProducts(workspaceID)
}

func (s *inventoryService) AdjustStock(workspaceID uint, userID uint, dto StockAdjustmentDto) (*database.InventoryMovement, error) {
	product, err := s.repo.FindProductByID(dto.ProductID, workspaceID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	stockBefore := product.Stock
	var stockAfter int
	var qtyChanged int

	switch dto.Type {
	case "IN":
		if dto.Qty <= 0 {
			return nil, errors.New("jumlah penambahan stok harus lebih dari 0")
		}
		stockAfter = stockBefore + dto.Qty
		qtyChanged = dto.Qty
	case "OUT":
		if dto.Qty <= 0 {
			return nil, errors.New("jumlah pengurangan stok harus lebih dari 0")
		}
		if stockBefore < dto.Qty {
			return nil, fmt.Errorf("stok saat ini (%d) tidak mencukupi untuk dikurangi %d", stockBefore, dto.Qty)
		}
		stockAfter = stockBefore - dto.Qty
		qtyChanged = dto.Qty
	case "ADJUSTMENT":
		if dto.Qty < 0 {
			return nil, errors.New("stok baru tidak boleh negatif")
		}
		stockAfter = dto.Qty
		qtyChanged = stockAfter - stockBefore
	default:
		return nil, errors.New("tipe adjustment tidak valid (IN, OUT, ADJUSTMENT)")
	}

	movement := &database.InventoryMovement{
		WorkspaceID: workspaceID,
		ProductID:   dto.ProductID,
		UserID:      userID,
		Type:        dto.Type,
		Qty:         qtyChanged,
		StockBefore: stockBefore,
		StockAfter:  stockAfter,
		Reason:      dto.Reason,
	}

	if err := s.repo.AdjustStock(movement, stockAfter); err != nil {
		return nil, err
	}

	movement.Product = product
	return movement, nil
}
