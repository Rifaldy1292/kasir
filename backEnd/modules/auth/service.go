package auth

import (
	"errors"
	"fmt"

	"gin-quickstart/database"
	"gin-quickstart/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(dto LoginDto) (*LoginResponseDto, error)
	RegisterOwner(dto RegisterOwnerDto) (*LoginResponseDto, error)
	CreateWorkspace(ownerID uint, dto CreateWorkspaceDto) (*LoginResponseDto, error)
	RegisterWorkspace(dto RegisterWorkspaceDto) (*LoginResponseDto, error)
	GetProfile(userID uint) (*database.User, error)
	GetMyWorkspaces(userID uint, currentWsID uint) ([]database.Workspace, error)
	SwitchWorkspace(userID uint, targetWorkspaceID uint) (*LoginResponseDto, error)
}

type authService struct {
	repo AuthRepository
}

func NewAuthService(repo AuthRepository) AuthService {
	return &authService{repo: repo}
}

func (s *authService) Login(dto LoginDto) (*LoginResponseDto, error) {
	user, err := s.repo.FindByEmail(dto.Email)
	if err != nil {
		return nil, errors.New("email atau password salah")
	}

	if user.Status != "ACTIVE" {
		return nil, errors.New("akun Anda tidak aktif, hubungi administrator")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(dto.Password)); err != nil {
		return nil, errors.New("email atau password salah")
	}

	var wsID uint = 0
	if user.WorkspaceID != nil {
		wsID = *user.WorkspaceID
	}

	token, err := jwt.GenerateToken(user.ID, wsID, user.Role, user.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDto{
		Token: token,
		User: UserResponseDto{
			ID:          user.ID,
			WorkspaceID: user.WorkspaceID,
			Name:        user.Name,
			Email:       user.Email,
			Role:        user.Role,
			Status:      user.Status,
			Phone:       user.Phone,
			PlanCode:    user.PlanCode,
		},
		Workspace: user.Workspace,
	}, nil
}

func (s *authService) RegisterOwner(dto RegisterOwnerDto) (*LoginResponseDto, error) {
	existing, _ := s.repo.FindByEmail(dto.Email)
	if existing != nil {
		return nil, errors.New("email sudah terdaftar dalam sistem")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	owner := &database.User{
		Name:         dto.Name,
		Email:        dto.Email,
		PasswordHash: string(hashedPassword),
		Role:         "OWNER",
		Status:       "ACTIVE",
		WorkspaceID:  nil, // NULL in PostgreSQL!
		Phone:        dto.Phone,
		PlanCode:     "STARTER",
	}

	if err := s.repo.CreateOwner(owner); err != nil {
		return nil, err
	}

	token, err := jwt.GenerateToken(owner.ID, 0, owner.Role, owner.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDto{
		Token: token,
		User: UserResponseDto{
			ID:          owner.ID,
			WorkspaceID: nil,
			Name:        owner.Name,
			Email:       owner.Email,
			Role:        owner.Role,
			Status:      owner.Status,
			Phone:       owner.Phone,
			PlanCode:    owner.PlanCode,
		},
		Workspace: nil,
	}, nil
}

func (s *authService) CreateWorkspace(ownerID uint, dto CreateWorkspaceDto) (*LoginResponseDto, error) {
	owner, err := s.repo.FindUserByID(ownerID)
	if err != nil {
		return nil, errors.New("akun pengguna tidak ditemukan")
	}

	if owner.Role != "OWNER" && owner.Role != "SUPERADMIN" {
		return nil, errors.New("hanya akun OWNER yang berhak membuat workspace / toko")
	}

	// Cek kuota workspace berdasarkan paket langganan
	wsCount, _ := s.repo.CountWorkspacesByOwner(ownerID)
	maxWorkspaces := 1
	planName := "Starter UMKM"
	if owner.PlanCode == "PREMIUM" {
		maxWorkspaces = 2
		planName = "Premium"
	} else if owner.PlanCode == "PLATINUM" || owner.Role == "SUPERADMIN" {
		maxWorkspaces = 10
		planName = "Platinum"
	}

	if owner.Role != "SUPERADMIN" && int(wsCount) >= maxWorkspaces {
		return nil, fmt.Errorf("kuota toko/workspace mencapai batas maksimal untuk paket %s (maksimal %d workspace). Silakan upgrade ke paket yang lebih tinggi untuk menambah cabang.", planName, maxWorkspaces)
	}

	businessType := dto.BusinessType
	if businessType == "" {
		businessType = "Retail"
	}
	currency := dto.Currency
	if currency == "" {
		currency = "IDR"
	}

	ws := &database.Workspace{
		Name:          dto.Name,
		BusinessType:  businessType,
		Phone:         dto.Phone,
		Email:         dto.Email,
		Address:       dto.Address,
		Currency:      currency,
		TaxRate:       dto.TaxRate,
		ReceiptHeader: "=== " + dto.Name + " ===",
		ReceiptFooter: "Terima kasih atas kunjungan Anda!",
	}

	createdWs, err := s.repo.CreateWorkspaceForOwner(ownerID, ws)
	if err != nil {
		return nil, err
	}

	wsID := createdWs.ID
	owner.WorkspaceID = &wsID
	token, err := jwt.GenerateToken(owner.ID, wsID, owner.Role, owner.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDto{
		Token: token,
		User: UserResponseDto{
			ID:          owner.ID,
			WorkspaceID: &wsID,
			Name:        owner.Name,
			Email:       owner.Email,
			Role:        owner.Role,
			Status:      owner.Status,
			Phone:       owner.Phone,
			PlanCode:    owner.PlanCode,
		},
		Workspace: createdWs,
	}, nil
}

func (s *authService) RegisterWorkspace(dto RegisterWorkspaceDto) (*LoginResponseDto, error) {
	existing, _ := s.repo.FindByEmail(dto.Email)
	if existing != nil {
		return nil, errors.New("email sudah terdaftar dalam sistem")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(dto.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	businessType := dto.BusinessType
	if businessType == "" {
		businessType = "Retail"
	}

	ws := &database.Workspace{
		Name:          dto.WorkspaceName,
		BusinessType:  businessType,
		Currency:      "IDR",
		TaxRate:       0.0,
		ReceiptHeader: "=== " + dto.WorkspaceName + " ===",
		ReceiptFooter: "Terima kasih atas kunjungan Anda!",
	}

	owner := &database.User{
		Name:         dto.OwnerName,
		Email:        dto.Email,
		PasswordHash: string(hashedPassword),
		Role:         "OWNER",
		Status:       "ACTIVE",
		Phone:        dto.Phone,
	}

	if err := s.repo.CreateWorkspaceAndOwner(ws, owner); err != nil {
		return nil, err
	}

	token, err := jwt.GenerateToken(owner.ID, ws.ID, owner.Role, owner.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDto{
		Token: token,
		User: UserResponseDto{
			ID:          owner.ID,
			WorkspaceID: &ws.ID,
			Name:        owner.Name,
			Email:       owner.Email,
			Role:        owner.Role,
			Status:      owner.Status,
			Phone:       owner.Phone,
			PlanCode:    "STARTER",
		},
		Workspace: ws,
	}, nil
}

func (s *authService) GetProfile(userID uint) (*database.User, error) {
	return s.repo.FindUserByID(userID)
}

func (s *authService) GetMyWorkspaces(userID uint, currentWsID uint) ([]database.Workspace, error) {
	return s.repo.GetWorkspacesByOwner(userID, currentWsID)
}

func (s *authService) SwitchWorkspace(userID uint, targetWorkspaceID uint) (*LoginResponseDto, error) {
	user, err := s.repo.FindUserByID(userID)
	if err != nil {
		return nil, errors.New("pengguna tidak ditemukan")
	}

	ws, err := s.repo.FindWorkspaceByID(targetWorkspaceID)
	if err != nil {
		return nil, errors.New("workspace tidak ditemukan")
	}

	// If the user has a specific User row in the target workspace with the same email, switch to that user session:
	targetUser, errTarget := s.repo.FindUserInWorkspaceByEmail(user.Email, targetWorkspaceID)
	if errTarget == nil && targetUser != nil {
		token, err := jwt.GenerateToken(targetUser.ID, targetWorkspaceID, targetUser.Role, targetUser.Email)
		if err != nil {
			return nil, err
		}
		return &LoginResponseDto{
			Token: token,
			User: UserResponseDto{
				ID:          targetUser.ID,
				WorkspaceID: &targetWorkspaceID,
				Name:        targetUser.Name,
				Email:       targetUser.Email,
				Role:        targetUser.Role,
				Status:      targetUser.Status,
				Phone:       targetUser.Phone,
				PlanCode:    targetUser.PlanCode,
			},
			Workspace: ws,
		}, nil
	}

	// Otherwise, verify if this user is the Owner of the target workspace
	if user.Role != "OWNER" || (ws.OwnerID != 0 && ws.OwnerID != user.ID) {
		return nil, errors.New("Anda tidak memiliki akses ke workspace ini")
	}

	if err := s.repo.UpdateUserActiveWorkspace(userID, targetWorkspaceID); err != nil {
		return nil, err
	}

	user.WorkspaceID = &targetWorkspaceID
	token, err := jwt.GenerateToken(user.ID, targetWorkspaceID, user.Role, user.Email)
	if err != nil {
		return nil, err
	}

	return &LoginResponseDto{
		Token: token,
		User: UserResponseDto{
			ID:          user.ID,
			WorkspaceID: &targetWorkspaceID,
			Name:        user.Name,
			Email:       user.Email,
			Role:        user.Role,
			Status:      user.Status,
			Phone:       user.Phone,
			PlanCode:    user.PlanCode,
		},
		Workspace: ws,
	}, nil
}
