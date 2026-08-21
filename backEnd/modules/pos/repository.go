package pos

import (
	"fmt"
	"time"

	"gin-quickstart/database"

	"gorm.io/gorm"
)

type PosRepository interface {
	FindProductsByIDs(ids []uint, workspaceID uint) (map[uint]database.Product, error)
	CreateTransaction(txModel *database.Transaction, movements []database.InventoryMovement) error
	FindAllTransactions(workspaceID uint, filter TransactionFilterDto) (*PaginatedTransactionsDto, error)
	FindTransactionByID(id uint, workspaceID uint) (*database.Transaction, error)
	FindTransactionByInvoice(invoice string, workspaceID uint) (*database.Transaction, error)
	UpdateTransactionStatus(id uint, workspaceID uint, status string, notes string) error
	GetActiveSession(workspaceID uint, userID uint) (*database.CashSession, error)
	AddSalesToSession(sessionID uint, amount float64) error
	RestoreInventory(txID uint, workspaceID uint, userID uint, reason string) error
}

type posRepository struct {
	db *gorm.DB
}

func NewPosRepository(db *gorm.DB) PosRepository {
	return &posRepository{db: db}
}

func (r *posRepository) FindProductsByIDs(ids []uint, workspaceID uint) (map[uint]database.Product, error) {
	var products []database.Product
	err := r.db.Where("id IN ? AND workspace_id = ?", ids, workspaceID).Find(&products).Error
	if err != nil {
		return nil, err
	}
	res := make(map[uint]database.Product)
	for _, p := range products {
		res[p.ID] = p
	}
	return res, nil
}

func (r *posRepository) CreateTransaction(txModel *database.Transaction, movements []database.InventoryMovement) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(txModel).Error; err != nil {
			return err
		}

		if txModel.Status == "COMPLETED" {
			for _, m := range movements {
				m.ReferenceID = txModel.InvoiceNumber
				if err := tx.Create(&m).Error; err != nil {
					return err
				}
				if err := tx.Model(&database.Product{}).Where("id = ? AND workspace_id = ?", m.ProductID, m.WorkspaceID).
					Update("stock", gorm.Expr("stock - ?", m.Qty)).Error; err != nil {
					return err
				}
			}

			if txModel.CashSessionID != nil && txModel.PaymentMethod == "CASH" {
				if err := tx.Model(&database.CashSession{}).Where("id = ?", *txModel.CashSessionID).
					Update("total_sales", gorm.Expr("total_sales + ?", txModel.TotalAmount)).Error; err != nil {
					return err
				}
			}
		}
		return nil
	})
}

func (r *posRepository) FindAllTransactions(workspaceID uint, filter TransactionFilterDto) (*PaginatedTransactionsDto, error) {
	var transactions []database.Transaction
	var totalItems int64

	countQuery := r.db.Model(&database.Transaction{}).Where("workspace_id = ?", workspaceID)
	dataQuery := r.db.Preload("User").Preload("Customer").Preload("Items.Product").Where("workspace_id = ?", workspaceID)

	if filter.Search != "" {
		s := "%" + filter.Search + "%"
		countQuery = countQuery.Where("invoice_number ILIKE ?", s)
		dataQuery = dataQuery.Where("invoice_number ILIKE ?", s)
	}

	if filter.Status != "" {
		countQuery = countQuery.Where("status = ?", filter.Status)
		dataQuery = dataQuery.Where("status = ?", filter.Status)
	}

	if filter.StartDate != nil {
		countQuery = countQuery.Where("created_at >= ?", *filter.StartDate)
		dataQuery = dataQuery.Where("created_at >= ?", *filter.StartDate)
	}

	if filter.EndDate != nil {
		countQuery = countQuery.Where("created_at <= ?", *filter.EndDate)
		dataQuery = dataQuery.Where("created_at <= ?", *filter.EndDate)
	}

	if err := countQuery.Count(&totalItems).Error; err != nil {
		return nil, err
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	limit := filter.Limit
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	totalPages := int((totalItems + int64(limit) - 1) / int64(limit))
	if totalPages < 1 {
		totalPages = 1
	}

	err := dataQuery.
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&transactions).Error

	if transactions == nil {
		transactions = make([]database.Transaction, 0)
	}

	return &PaginatedTransactionsDto{
		Items:      transactions,
		TotalItems: totalItems,
		Page:       page,
		Limit:      limit,
		TotalPages: totalPages,
	}, err
}

func (r *posRepository) FindTransactionByID(id uint, workspaceID uint) (*database.Transaction, error) {
	var t database.Transaction
	err := r.db.Preload("User").Preload("Customer").Preload("Items.Product").Where("id = ? AND workspace_id = ?", id, workspaceID).First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *posRepository) FindTransactionByInvoice(invoice string, workspaceID uint) (*database.Transaction, error) {
	var t database.Transaction
	err := r.db.Preload("User").Preload("Customer").Preload("Items.Product").Where("invoice_number = ? AND workspace_id = ?", invoice, workspaceID).First(&t).Error
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *posRepository) UpdateTransactionStatus(id uint, workspaceID uint, status string, notes string) error {
	return r.db.Model(&database.Transaction{}).Where("id = ? AND workspace_id = ?", id, workspaceID).
		Updates(map[string]interface{}{
			"status": status,
			"notes":  notes,
		}).Error
}

func (r *posRepository) GetActiveSession(workspaceID uint, userID uint) (*database.CashSession, error) {
	var s database.CashSession
	err := r.db.Where("workspace_id = ? AND user_id = ? AND status = 'OPEN'", workspaceID, userID).First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *posRepository) AddSalesToSession(sessionID uint, amount float64) error {
	return r.db.Model(&database.CashSession{}).Where("id = ?", sessionID).
		Update("total_sales", gorm.Expr("total_sales + ?", amount)).Error
}

func (r *posRepository) RestoreInventory(txID uint, workspaceID uint, userID uint, reason string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		var transaction database.Transaction
		if err := tx.Preload("Items").Where("id = ? AND workspace_id = ?", txID, workspaceID).First(&transaction).Error; err != nil {
			return err
		}

		for _, item := range transaction.Items {
			var p database.Product
			if err := tx.Where("id = ? AND workspace_id = ?", item.ProductID, workspaceID).First(&p).Error; err != nil {
				continue
			}

			movement := database.InventoryMovement{
				WorkspaceID: workspaceID,
				ProductID:   item.ProductID,
				UserID:      userID,
				Type:        "RETURN",
				Qty:         item.Qty,
				StockBefore: p.Stock,
				StockAfter:  p.Stock + item.Qty,
				Reason:      fmt.Sprintf("%s (Invoice: %s)", reason, transaction.InvoiceNumber),
				ReferenceID: transaction.InvoiceNumber,
				CreatedAt:   time.Now(),
			}

			if err := tx.Create(&movement).Error; err != nil {
				return err
			}

			if err := tx.Model(&database.Product{}).Where("id = ?", item.ProductID).Update("stock", gorm.Expr("stock + ?", item.Qty)).Error; err != nil {
				return err
			}
		}

		return nil
	})
}
