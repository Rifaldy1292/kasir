package supplier

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type SupplierRepository interface {
	FindAll(workspaceID uint, search string) ([]database.Supplier, error)
	FindByID(id uint, workspaceID uint) (*database.Supplier, error)
	Create(s *database.Supplier) error
	Update(s *database.Supplier) error
	Delete(id uint, workspaceID uint) error
}

type supplierRepository struct {
	db *gorm.DB
}

func NewSupplierRepository(db *gorm.DB) SupplierRepository {
	return &supplierRepository{db: db}
}

func (r *supplierRepository) FindAll(workspaceID uint, search string) ([]database.Supplier, error) {
	var suppliers []database.Supplier
	query := r.db.Where("workspace_id = ?", workspaceID)
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name ILIKE ? OR phone ILIKE ? OR email ILIKE ?", s, s, s)
	}
	err := query.Order("name ASC").Find(&suppliers).Error
	return suppliers, err
}

func (r *supplierRepository) FindByID(id uint, workspaceID uint) (*database.Supplier, error) {
	var s database.Supplier
	err := r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).First(&s).Error
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *supplierRepository) Create(s *database.Supplier) error {
	return r.db.Create(s).Error
}

func (r *supplierRepository) Update(s *database.Supplier) error {
	return r.db.Save(s).Error
}

func (r *supplierRepository) Delete(id uint, workspaceID uint) error {
	return r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).Delete(&database.Supplier{}).Error
}
