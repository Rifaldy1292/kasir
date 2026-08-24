package settings

import (
	"errors"

	"gin-quickstart/database"

	"golang.org/x/crypto/bcrypt"
)

type SettingsService interface {
	GetWorkspaceSettings(workspaceID uint) (*database.Workspace, error)
	UpdateWorkspaceSettings(workspaceID uint, dto UpdateWorkspaceDto) (*database.Workspace, error)
	GetStaffList(workspaceID uint) ([]database.User, error)
	AddStaff(workspaceID uint, dto CreateUserDto) (*database.User, error)
	UpdateStaff(id uint, workspaceID uint, dto UpdateUserDto) (*database.User, error)
	DeleteStaff(id uint, workspaceID uint, callerID uint) error
}

type settingsService struct {
	repo SettingsRepository
}

func NewSettingsService(repo SettingsRepository) SettingsService {
	return &settingsService{repo: repo}
}

func (s *settingsService) GetWorkspaceSettings(workspaceID uint) (*database.Workspace, error) {
	return s.repo.GetWorkspace(workspaceID)
}

func (s *settingsService) UpdateWorkspaceSettings(workspaceID uint, dto UpdateWorkspaceDto) (*database.Workspace, error) {
	ws, err := s.repo.GetWorkspace(workspaceID)
	if err != nil {
		return nil, errors.New("workspace tidak ditemukan")
	}

	ws.Name = dto.Name
	ws.BusinessType = dto.BusinessType
	ws.Phone = dto.Phone
	ws.Email = dto.Email
	ws.Address = dto.Address
	if dto.Currency != "" {
		ws.Currency = dto.Currency
	}
	ws.TaxRate = dto.TaxRate
	ws.ReceiptHeader = dto.ReceiptHeader
	ws.ReceiptFooter = dto.ReceiptFooter

	if err := s.repo.UpdateWorkspace(ws); err != nil {
		return nil, err
	}
	return ws, nil
}

func (s *settingsService) GetStaffList(workspaceID uint) ([]database.User, error) {
	return s.repo.GetUsers(workspaceID)
}

func (s *settingsService) AddStaff(workspaceID uint, dto CreateUserDto) (*database.User, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	role := dto.Role
	if role != "ADMIN" && role != "CASHIER" {
		role = "CASHIER"
	}

	user := &database.User{
		WorkspaceID:  &workspaceID,
		Name:         dto.Name,
		Email:        dto.Email,
		PasswordHash: string(hashedPassword),
		Role:         role,
		Status:       "ACTIVE",
		Phone:        dto.Phone,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, errors.New("gagal menambahkan staf (kemungkinan email sudah digunakan)")
	}
	return user, nil
}

func (s *settingsService) UpdateStaff(id uint, workspaceID uint, dto UpdateUserDto) (*database.User, error) {
	user, err := s.repo.GetUserByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("staf tidak ditemukan")
	}

	user.Name = dto.Name
	user.Role = dto.Role
	user.Status = dto.Status
	user.Phone = dto.Phone

	if err := s.repo.UpdateUser(user); err != nil {
		return nil, err
	}
	return user, nil
}

func (s *settingsService) DeleteStaff(id uint, workspaceID uint, callerID uint) error {
	if id == callerID {
		return errors.New("Anda tidak dapat menghapus akun Anda sendiri")
	}

	user, err := s.repo.GetUserByID(id, workspaceID)
	if err != nil {
		return errors.New("staf tidak ditemukan")
	}

	if user.Role == "OWNER" {
		return errors.New("akun OWNER utama tidak dapat dihapus")
	}

	return s.repo.DeleteUser(id, workspaceID)
}
