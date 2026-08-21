package customer

import (
	"gin-quickstart/database"

	"gorm.io/gorm"
)

type CustomerRepository interface {
	FindAll(workspaceID uint, search string) ([]database.Customer, error)
	FindByID(id uint, workspaceID uint) (*database.Customer, error)
	Create(c *database.Customer) error
	Update(c *database.Customer) error
	Delete(id uint, workspaceID uint) error
}

type customerRepository struct {
	db *gorm.DB
}

func NewCustomerRepository(db *gorm.DB) CustomerRepository {
	return &customerRepository{db: db}
}

func (r *customerRepository) FindAll(workspaceID uint, search string) ([]database.Customer, error) {
	var customers []database.Customer
	query := r.db.Where("workspace_id = ?", workspaceID)
	if search != "" {
		s := "%" + search + "%"
		query = query.Where("name ILIKE ? OR phone ILIKE ? OR email ILIKE ?", s, s, s)
	}
	err := query.Order("name ASC").Find(&customers).Error
	return customers, err
}

func (r *customerRepository) FindByID(id uint, workspaceID uint) (*database.Customer, error) {
	var c database.Customer
	err := r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).First(&c).Error
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *customerRepository) Create(c *database.Customer) error {
	return r.db.Create(c).Error
}

func (r *customerRepository) Update(c *database.Customer) error {
	return r.db.Save(c).Error
}

func (r *customerRepository) Delete(id uint, workspaceID uint) error {
	return r.db.Where("id = ? AND workspace_id = ?", id, workspaceID).Delete(&database.Customer{}).Error
}
