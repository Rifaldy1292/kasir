package settings

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type SettingsRepository interface {
	GetWorkspace(id uint) (*database.Workspace, error)
	UpdateWorkspace(ws *database.Workspace) error
	GetUsers(workspaceID uint) ([]database.User, error)
	GetUserByID(id uint, workspaceID uint) (*database.User, error)
	CreateUser(u *database.User) error
	UpdateUser(u *database.User) error
	DeleteUser(id uint, workspaceID uint) error
}

type settingsRepository struct {
	db *gorm.DB
}

func NewSettingsRepository(db *gorm.DB) SettingsRepository {
	return &settingsRepository{db: db}
}

func (r *settingsRepository) GetWorkspace(id uint) (*database.Workspace, error) {
	var ws database.Workspace
	err := r.db.First(&ws, id).Error
	if err != nil {
		return nil, err
	}
	return &ws, nil
}

func (r *settingsRepository) UpdateWorkspace(ws *database.Workspace) error {
	return r.db.Save(ws).Error
}

func (r *settingsRepository) GetUsers(workspaceID uint) ([]database.User, error) {
	var users []database.User
	err := r.db.Where("workspace_id = ?", workspaceID).Order("id ASC").Find(&users).Error
	return users, err
}

func (r *settingsRepository) GetUserByID(id uint, workspaceID uint) (*database.User, error) {
	var u database.User
	err := r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).First(&u).Error
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *settingsRepository) CreateUser(u *database.User) error {
	return r.db.Create(u).Error
}

func (r *settingsRepository) UpdateUser(u *database.User) error {
	return r.db.Save(u).Error
}

func (r *settingsRepository) DeleteUser(id uint, workspaceID uint) error {
	return r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).Delete(&database.User{}).Error
}
