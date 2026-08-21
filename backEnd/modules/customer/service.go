package customer

import (
	"errors"

	"gin-quickstart/database"
)

type CustomerService interface {
	GetCustomers(workspaceID uint, search string) ([]database.Customer, error)
	GetCustomerByID(id uint, workspaceID uint) (*database.Customer, error)
	CreateCustomer(workspaceID uint, dto CreateCustomerDto) (*database.Customer, error)
	UpdateCustomer(id uint, workspaceID uint, dto UpdateCustomerDto) (*database.Customer, error)
	DeleteCustomer(id uint, workspaceID uint) error
}

type customerService struct {
	repo CustomerRepository
}

func NewCustomerService(repo CustomerRepository) CustomerService {
	return &customerService{repo: repo}
}

func (s *customerService) GetCustomers(workspaceID uint, search string) ([]database.Customer, error) {
	return s.repo.FindAll(workspaceID, search)
}

func (s *customerService) GetCustomerByID(id uint, workspaceID uint) (*database.Customer, error) {
	c, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("pelanggan tidak ditemukan")
	}
	return c, nil
}

func (s *customerService) CreateCustomer(workspaceID uint, dto CreateCustomerDto) (*database.Customer, error) {
	c := &database.Customer{
		WorkspaceID: workspaceID,
		Name:        dto.Name,
		Phone:       dto.Phone,
		Email:       dto.Email,
		Address:     dto.Address,
	}
	if err := s.repo.Create(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *customerService) UpdateCustomer(id uint, workspaceID uint, dto UpdateCustomerDto) (*database.Customer, error) {
	c, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("pelanggan tidak ditemukan")
	}

	c.Name = dto.Name
	c.Phone = dto.Phone
	c.Email = dto.Email
	c.Address = dto.Address

	if err := s.repo.Update(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *customerService) DeleteCustomer(id uint, workspaceID uint) error {
	_, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return errors.New("pelanggan tidak ditemukan")
	}
	return s.repo.Delete(id, workspaceID)
}
