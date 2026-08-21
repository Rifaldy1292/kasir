package category

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	FindAll(workspaceID uint) ([]database.Category, error)
	FindByID(id uint, workspaceID uint) (*database.Category, error)
	Create(cat *database.Category) error
	Update(cat *database.Category) error
	Delete(id uint, workspaceID uint) error
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) FindAll(workspaceID uint) ([]database.Category, error) {
	var categories []database.Category
	err := r.db.Preload("Products").Where("workspace_id = ?", workspaceID).Order("name ASC").Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) FindByID(id uint, workspaceID uint) (*database.Category, error) {
	var cat database.Category
	err := r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).First(&cat).Error
	if err != nil {
		return nil, err
	}
	return &cat, nil
}

func (r *categoryRepository) Create(cat *database.Category) error {
	return r.db.Create(cat).Error
}

func (r *categoryRepository) Update(cat *database.Category) error {
	return r.db.Save(cat).Error
}

func (r *categoryRepository) Delete(id uint, workspaceID uint) error {
	return r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).Delete(&database.Category{}).Error
}
