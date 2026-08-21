package supplier

import (
	"errors"

	"gin-quickstart/database"
)

type SupplierService interface {
	GetSuppliers(workspaceID uint, search string) ([]database.Supplier, error)
	GetSupplierByID(id uint, workspaceID uint) (*database.Supplier, error)
	CreateSupplier(workspaceID uint, dto CreateSupplierDto) (*database.Supplier, error)
	UpdateSupplier(id uint, workspaceID uint, dto UpdateSupplierDto) (*database.Supplier, error)
	DeleteSupplier(id uint, workspaceID uint) error
}

type supplierService struct {
	repo SupplierRepository
}

func NewSupplierService(repo SupplierRepository) SupplierService {
	return &supplierService{repo: repo}
}

func (s *supplierService) GetSuppliers(workspaceID uint, search string) ([]database.Supplier, error) {
	return s.repo.FindAll(workspaceID, search)
}

func (s *supplierService) GetSupplierByID(id uint, workspaceID uint) (*database.Supplier, error) {
	supplier, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("supplier tidak ditemukan")
	}
	return supplier, nil
}

func (s *supplierService) CreateSupplier(workspaceID uint, dto CreateSupplierDto) (*database.Supplier, error) {
	sup := &database.Supplier{
		WorkspaceID: workspaceID,
		Name:        dto.Name,
		Phone:       dto.Phone,
		Email:       dto.Email,
		Address:     dto.Address,
	}
	if err := s.repo.Create(sup); err != nil {
		return nil, err
	}
	return sup, nil
}

func (s *supplierService) UpdateSupplier(id uint, workspaceID uint, dto UpdateSupplierDto) (*database.Supplier, error) {
	sup, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("supplier tidak ditemukan")
	}

	sup.Name = dto.Name
	sup.Phone = dto.Phone
	sup.Email = dto.Email
	sup.Address = dto.Address

	if err := s.repo.Update(sup); err != nil {
		return nil, err
	}
	return sup, nil
}

func (s *supplierService) DeleteSupplier(id uint, workspaceID uint) error {
	_, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return errors.New("supplier tidak ditemukan")
	}
	return s.repo.Delete(id, workspaceID)
}
