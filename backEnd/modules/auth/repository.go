package auth

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type AuthRepository interface {
	FindByEmail(email string) (*database.User, error)
	FindUserByID(id uint) (*database.User, error)
	FindUserInWorkspaceByEmail(email string, workspaceID uint) (*database.User, error)
	CreateOwner(user *database.User) error
	CreateWorkspaceForOwner(ownerID uint, ws *database.Workspace) (*database.Workspace, error)
	CreateWorkspaceAndOwner(ws *database.Workspace, user *database.User) error
	GetWorkspacesByOwner(userID uint, currentWsID uint) ([]database.Workspace, error)
	FindWorkspaceByID(id uint) (*database.Workspace, error)
	UpdateUserActiveWorkspace(userID uint, workspaceID uint) error
	CountWorkspacesByOwner(ownerID uint) (int64, error)
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) FindByEmail(email string) (*database.User, error) {
	var user database.User
	err := r.db.Preload("Workspace").Where("email = ?", email).Order("id ASC").First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindUserByID(id uint) (*database.User, error) {
	var user database.User
	err := r.db.Preload("Workspace").First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) FindUserInWorkspaceByEmail(email string, workspaceID uint) (*database.User, error) {
	var user database.User
	err := r.db.Preload("Workspace").Where("email = ? AND workspace_id = ?", email, workspaceID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *authRepository) GetWorkspacesByOwner(userID uint, currentWsID uint) ([]database.Workspace, error) {
	var user database.User
	if err := r.db.Select("id, email, role").First(&user, userID).Error; err != nil {
		return nil, err
	}

	var workspaces []database.Workspace
	// Workspaces are accessible if:
	// 1. owner_id == userID (user created this workspace)
	// 2. id == currentWsID (currently active workspace)
	// 3. id IN (SELECT workspace_id FROM users WHERE email = user.Email AND workspace_id IS NOT NULL AND deleted_at IS NULL)
	err := r.db.Where(
		"owner_id = ? OR id = ? OR id IN (SELECT workspace_id FROM users WHERE email = ? AND workspace_id IS NOT NULL AND deleted_at IS NULL)",
		userID, currentWsID, user.Email,
	).Order("id ASC").Find(&workspaces).Error

	if err != nil {
		return nil, err
	}
	return workspaces, nil
}

func (r *authRepository) FindWorkspaceByID(id uint) (*database.Workspace, error) {
	var ws database.Workspace
	err := r.db.First(&ws, id).Error
	if err != nil {
		return nil, err
	}
	return &ws, nil
}

func (r *authRepository) UpdateUserActiveWorkspace(userID uint, workspaceID uint) error {
	return r.db.Model(&database.User{}).Where("id = ?", userID).Update("workspace_id", workspaceID).Error
}

func (r *authRepository) CountWorkspacesByOwner(ownerID uint) (int64, error) {
	var count int64
	err := r.db.Model(&database.Workspace{}).Where("owner_id = ?", ownerID).Count(&count).Error
	return count, err
}

func (r *authRepository) CreateOwner(user *database.User) error {
	return r.db.Create(user).Error
}

func (r *authRepository) CreateWorkspaceForOwner(ownerID uint, ws *database.Workspace) (*database.Workspace, error) {
	err := r.db.Transaction(func(tx *gorm.DB) error {
		ws.OwnerID = ownerID
		if err := tx.Create(ws).Error; err != nil {
			return err
		}

		// Update Owner's active workspace_id
		if err := tx.Model(&database.User{}).Where("id = ?", ownerID).Update("workspace_id", ws.ID).Error; err != nil {
			return err
		}

		// Create default starter categories for convenience
		defaultCategories := []database.Category{
			{WorkspaceID: ws.ID, Name: "Umum", Description: "Kategori produk umum"},
			{WorkspaceID: ws.ID, Name: "Makanan", Description: "Produk makanan & camilan"},
			{WorkspaceID: ws.ID, Name: "Minuman", Description: "Produk aneka minuman"},
		}
		for _, cat := range defaultCategories {
			_ = tx.Create(&cat).Error
		}

		return nil
	})

	if err != nil {
		return nil, err
	}
	return ws, nil
}

func (r *authRepository) CreateWorkspaceAndOwner(ws *database.Workspace, user *database.User) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ws).Error; err != nil {
			return err
		}
		user.WorkspaceID = &ws.ID
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		return nil
	})
}
