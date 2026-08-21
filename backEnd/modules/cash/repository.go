package cash

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type CashRepository interface {
	FindActiveSession(workspaceID uint, userID uint) (*database.CashSession, error)
	FindSessionByID(id uint, workspaceID uint) (*database.CashSession, error)
	CreateSession(session *database.CashSession) error
	UpdateSession(session *database.CashSession) error
	CreateMovement(mov *database.CashMovement) error
	GetSessionMovements(sessionID uint) ([]database.CashMovement, error)
	GetSessionHistory(workspaceID uint) ([]database.CashSession, error)
}

type cashRepository struct {
	db *gorm.DB
}

func NewCashRepository(db *gorm.DB) CashRepository {
	return &cashRepository{db: db}
}

func (r *cashRepository) FindActiveSession(workspaceID uint, userID uint) (*database.CashSession, error) {
	var session database.CashSession
	err := r.db.Preload("Movements").Where("workspace_id = ? AND user_id = ? AND status = 'OPEN'", workspaceID, userID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *cashRepository) FindSessionByID(id uint, workspaceID uint) (*database.CashSession, error) {
	var session database.CashSession
	err := r.db.Preload("User").Preload("Movements.User").Preload("Transactions").Where("id = ? AND workspace_id = ?", id, workspaceID).First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *cashRepository) CreateSession(session *database.CashSession) error {
	return r.db.Create(session).Error
}

func (r *cashRepository) UpdateSession(session *database.CashSession) error {
	return r.db.Save(session).Error
}

func (r *cashRepository) CreateMovement(mov *database.CashMovement) error {
	return r.db.Create(mov).Error
}

func (r *cashRepository) GetSessionMovements(sessionID uint) ([]database.CashMovement, error) {
	var movs []database.CashMovement
	err := r.db.Preload("User").Where("session_id = ?", sessionID).Order("created_at DESC").Find(&movs).Error
	return movs, err
}

func (r *cashRepository) GetSessionHistory(workspaceID uint) ([]database.CashSession, error) {
	var sessions []database.CashSession
	err := r.db.Preload("User").Where("workspace_id = ?", workspaceID).Order("opened_at DESC").Limit(50).Find(&sessions).Error
	return sessions, err
}
