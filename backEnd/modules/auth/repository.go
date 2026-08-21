package auth

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type AuthRepository interface {
	FindByEmail(email string) (*database.User, error)
	FindUserByID(id uint) (*database.User, error)
	CreateWorkspaceAndOwner(ws *database.Workspace, user *database.User) error
}

type authRepository struct {
	db *gorm.DB
}

func NewAuthRepository(db *gorm.DB) AuthRepository {
	return &authRepository{db: db}
}

func (r *authRepository) FindByEmail(email string) (*database.User, error) {
	var user database.User
	err := r.db.Preload("Workspace").Where("email = ?", email).First(&user).Error
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

func (r *authRepository) CreateWorkspaceAndOwner(ws *database.Workspace, user *database.User) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(ws).Error; err != nil {
			return err
		}
		user.WorkspaceID = ws.ID
		if err := tx.Create(user).Error; err != nil {
			return err
		}
		return nil
	})
}
