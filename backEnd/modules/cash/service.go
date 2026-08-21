package cash

import (
	"errors"
	"time"

	"gin-quickstart/database"
)

type CashService interface {
	GetActiveSession(workspaceID uint, userID uint) (*database.CashSession, error)
	OpenShift(workspaceID uint, userID uint, dto OpenShiftDto) (*database.CashSession, error)
	CloseShift(workspaceID uint, userID uint, dto CloseShiftDto) (*database.CashSession, error)
	AddMovement(workspaceID uint, userID uint, dto CashMovementDto) (*database.CashMovement, error)
	GetHistory(workspaceID uint) ([]database.CashSession, error)
	GetSessionDetail(id uint, workspaceID uint) (*database.CashSession, error)
}

type cashService struct {
	repo CashRepository
}

func NewCashService(repo CashRepository) CashService {
	return &cashService{repo: repo}
}

func (s *cashService) GetActiveSession(workspaceID uint, userID uint) (*database.CashSession, error) {
	return s.repo.FindActiveSession(workspaceID, userID)
}

func (s *cashService) OpenShift(workspaceID uint, userID uint, dto OpenShiftDto) (*database.CashSession, error) {
	active, _ := s.repo.FindActiveSession(workspaceID, userID)
	if active != nil {
		return nil, errors.New("sesi kasir Anda masih aktif, silakan tutup sesi sebelum membuka yang baru")
	}

	session := &database.CashSession{
		WorkspaceID:  workspaceID,
		UserID:       userID,
		OpeningCash:  dto.OpeningCash,
		ExpectedCash: dto.OpeningCash,
		Status:       "OPEN",
		OpenedAt:     time.Now(),
		Notes:        dto.Notes,
	}

	if err := s.repo.CreateSession(session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *cashService) CloseShift(workspaceID uint, userID uint, dto CloseShiftDto) (*database.CashSession, error) {
	session, err := s.repo.FindActiveSession(workspaceID, userID)
	if err != nil {
		return nil, errors.New("tidak ada sesi kasir aktif yang dapat ditutup")
	}

	now := time.Now()
	expected := session.OpeningCash + session.TotalSales + session.TotalCashIn - session.TotalCashOut
	diff := dto.ActualCash - expected

	session.ClosedAt = &now
	session.Status = "CLOSED"
	session.ExpectedCash = expected
	session.ClosingCash = dto.ActualCash
	session.Difference = diff
	if dto.Notes != "" {
		session.Notes = session.Notes + " | Catatan Tutup: " + dto.Notes
	}

	if err := s.repo.UpdateSession(session); err != nil {
		return nil, err
	}
	return session, nil
}

func (s *cashService) AddMovement(workspaceID uint, userID uint, dto CashMovementDto) (*database.CashMovement, error) {
	session, err := s.repo.FindActiveSession(workspaceID, userID)
	if err != nil {
		return nil, errors.New("sesi kasir aktif diperlukan untuk mencatat kas masuk/keluar")
	}

	mov := &database.CashMovement{
		SessionID: session.ID,
		UserID:    userID,
		Type:      dto.Type,
		Amount:    dto.Amount,
		Reason:    dto.Reason,
		CreatedAt: time.Now(),
	}

	if err := s.repo.CreateMovement(mov); err != nil {
		return nil, err
	}

	if dto.Type == "CASH_IN" {
		session.TotalCashIn += dto.Amount
	} else {
		session.TotalCashOut += dto.Amount
	}
	session.ExpectedCash = session.OpeningCash + session.TotalSales + session.TotalCashIn - session.TotalCashOut
	_ = s.repo.UpdateSession(session)

	return mov, nil
}

func (s *cashService) GetHistory(workspaceID uint) ([]database.CashSession, error) {
	return s.repo.GetSessionHistory(workspaceID)
}

func (s *cashService) GetSessionDetail(id uint, workspaceID uint) (*database.CashSession, error) {
	return s.repo.FindSessionByID(id, workspaceID)
}
