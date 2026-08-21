package auth

import (
	"errors"

	"gin-quickstart/database"
	"gin-quickstart/pkg/jwt"

	"golang.org/x/crypto/bcrypt"
)

type AuthService interface {
	Login(dto LoginDto) (*LoginResponseDto, error)
	RegisterWorkspace(dto RegisterWorkspaceDto) (*LoginResponseDto, error)
	GetProfile(userID uint) (*database.User, error)
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

	token, err := jwt.GenerateToken(user.ID, user.WorkspaceID, user.Role, user.Email)
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
		},
		Workspace: user.Workspace,
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
			WorkspaceID: ws.ID,
			Name:        owner.Name,
			Email:       owner.Email,
			Role:        owner.Role,
			Status:      owner.Status,
			Phone:       owner.Phone,
		},
		Workspace: ws,
	}, nil
}

func (s *authService) GetProfile(userID uint) (*database.User, error) {
	return s.repo.FindUserByID(userID)
}
