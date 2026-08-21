package pos

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"gin-quickstart/database"
)

type PosService interface {
	Checkout(workspaceID uint, userID uint, dto CheckoutDto) (*database.Transaction, error)
	GetTransactions(workspaceID uint, filter TransactionFilterDto) (*PaginatedTransactionsDto, error)
	GetTransactionByID(id uint, workspaceID uint) (*database.Transaction, error)
	GetTransactionByInvoice(invoice string, workspaceID uint) (*database.Transaction, error)
	VoidTransaction(id uint, workspaceID uint, userID uint, dto VoidRefundDto) error
	RefundTransaction(id uint, workspaceID uint, userID uint, dto VoidRefundDto) error
}

type posService struct {
	repo PosRepository
}

func NewPosService(repo PosRepository) PosService {
	return &posService{repo: repo}
}

func generateInvoiceNumber() string {
	now := time.Now()
	randomNum := rand.Intn(9000) + 1000
	return fmt.Sprintf("INV-%s-%04d", now.Format("20060102150405"), randomNum)
}

func (s *posService) Checkout(workspaceID uint, userID uint, dto CheckoutDto) (*database.Transaction, error) {
	if len(dto.Items) == 0 {
		return nil, errors.New("keranjang belanja tidak boleh kosong")
	}

	productIDs := make([]uint, len(dto.Items))
	for i, it := range dto.Items {
		productIDs[i] = it.ProductID
	}

	productsMap, err := s.repo.FindProductsByIDs(productIDs, workspaceID)
	if err != nil {
		return nil, err
	}

	var subtotal float64 = 0.0
	var totalDiscount float64 = dto.DiscountAmount
	var txItems []database.TransactionItem
	var movements []database.InventoryMovement

	for _, it := range dto.Items {
		p, exists := productsMap[it.ProductID]
		if !exists {
			return nil, fmt.Errorf("produk ID %d tidak ditemukan dalam katalog", it.ProductID)
		}

		if !p.IsActive {
			return nil, fmt.Errorf("produk '%s' sedang nonaktif", p.Name)
		}

		if !dto.IsHold && p.Stock < it.Qty {
			return nil, fmt.Errorf("stok produk '%s' tidak mencukupi (sisa: %d, diminta: %d)", p.Name, p.Stock, it.Qty)
		}

		itemSubtotal := (p.SellPrice * float64(it.Qty)) - it.DiscountAmount
		if itemSubtotal < 0 {
			itemSubtotal = 0
		}
		subtotal += itemSubtotal
		totalDiscount += it.DiscountAmount

		txItems = append(txItems, database.TransactionItem{
			ProductID:      p.ID,
			ProductName:    p.Name,
			Price:          p.SellPrice,
			BuyPrice:       p.BuyPrice,
			Qty:            it.Qty,
			DiscountAmount: it.DiscountAmount,
			Subtotal:       itemSubtotal,
		})

		if !dto.IsHold {
			movements = append(movements, database.InventoryMovement{
				WorkspaceID: workspaceID,
				ProductID:   p.ID,
				UserID:      userID,
				Type:        "SALE",
				Qty:         it.Qty,
				StockBefore: p.Stock,
				StockAfter:  p.Stock - it.Qty,
				Reason:      "Penjualan Kasir POS",
				CreatedAt:   time.Now(),
			})
		}
	}

	taxAmount := 0.0
	if dto.TaxRate > 0 {
		taxAmount = (subtotal * dto.TaxRate) / 100.0
	}

	totalAmount := subtotal + taxAmount
	if totalAmount < 0 {
		totalAmount = 0
	}

	status := "COMPLETED"
	if dto.IsHold {
		status = "HOLD"
	} else if dto.PaymentMethod == "CASH" && dto.PaidAmount < totalAmount {
		return nil, fmt.Errorf("nominal pembayaran (Rp %.0f) kurang dari total tagihan (Rp %.0f)", dto.PaidAmount, totalAmount)
	}

	changeAmount := 0.0
	if !dto.IsHold && dto.PaidAmount > totalAmount {
		changeAmount = dto.PaidAmount - totalAmount
	}

	var sessionID *uint
	if dto.CashSessionID != nil && *dto.CashSessionID > 0 {
		sessionID = dto.CashSessionID
	} else {
		if activeSession, _ := s.repo.GetActiveSession(workspaceID, userID); activeSession != nil {
			sessionID = &activeSession.ID
		}
	}

	txModel := &database.Transaction{
		WorkspaceID:    workspaceID,
		InvoiceNumber:  generateInvoiceNumber(),
		UserID:         userID,
		CashSessionID:  sessionID,
		CustomerID:     dto.CustomerID,
		Subtotal:       subtotal,
		DiscountAmount: totalDiscount,
		TaxAmount:      taxAmount,
		TotalAmount:    totalAmount,
		PaidAmount:     dto.PaidAmount,
		ChangeAmount:   changeAmount,
		PaymentMethod:  dto.PaymentMethod,
		Status:         status,
		Notes:          dto.Notes,
		CreatedAt:      time.Now(),
		Items:          txItems,
	}

	if err := s.repo.CreateTransaction(txModel, movements); err != nil {
		return nil, err
	}

	return s.repo.FindTransactionByID(txModel.ID, workspaceID)
}

func (s *posService) GetTransactions(workspaceID uint, filter TransactionFilterDto) (*PaginatedTransactionsDto, error) {
	return s.repo.FindAllTransactions(workspaceID, filter)
}

func (s *posService) GetTransactionByID(id uint, workspaceID uint) (*database.Transaction, error) {
	t, err := s.repo.FindTransactionByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("transaksi tidak ditemukan")
	}
	return t, nil
}

func (s *posService) GetTransactionByInvoice(invoice string, workspaceID uint) (*database.Transaction, error) {
	t, err := s.repo.FindTransactionByInvoice(invoice, workspaceID)
	if err != nil {
		return nil, errors.New("transaksi dengan nomor invoice tersebut tidak ditemukan")
	}
	return t, nil
}

func (s *posService) VoidTransaction(id uint, workspaceID uint, userID uint, dto VoidRefundDto) error {
	t, err := s.repo.FindTransactionByID(id, workspaceID)
	if err != nil {
		return errors.New("transaksi tidak ditemukan")
	}

	if t.Status == "VOID" || t.Status == "REFUNDED" {
		return fmt.Errorf("transaksi sudah berstatus %s", t.Status)
	}

	if t.Status == "COMPLETED" {
		if err := s.repo.RestoreInventory(id, workspaceID, userID, "Void Transaksi: "+dto.Reason); err != nil {
			return err
		}
	}

	return s.repo.UpdateTransactionStatus(id, workspaceID, "VOID", "Void Reason: "+dto.Reason)
}

func (s *posService) RefundTransaction(id uint, workspaceID uint, userID uint, dto VoidRefundDto) error {
	t, err := s.repo.FindTransactionByID(id, workspaceID)
	if err != nil {
		return errors.New("transaksi tidak ditemukan")
	}

	if t.Status != "COMPLETED" {
		return errors.New("hanya transaksi yang sudah selesai (COMPLETED) yang dapat di-refund")
	}

	if err := s.repo.RestoreInventory(id, workspaceID, userID, "Refund Transaksi: "+dto.Reason); err != nil {
		return err
	}

	return s.repo.UpdateTransactionStatus(id, workspaceID, "REFUNDED", "Refund Reason: "+dto.Reason)
}
