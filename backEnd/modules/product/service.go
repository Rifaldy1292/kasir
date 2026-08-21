package product

import (
	"errors"

	"gin-quickstart/database"
)

type ProductService interface {
	GetProducts(workspaceID uint, filter ProductFilterDto) ([]database.Product, error)
	GetProductByID(id uint, workspaceID uint) (*database.Product, error)
	GetProductByBarcode(code string, workspaceID uint) (*database.Product, error)
	CreateProduct(workspaceID uint, dto CreateProductDto) (*database.Product, error)
	UpdateProduct(id uint, workspaceID uint, dto UpdateProductDto) (*database.Product, error)
	DeleteProduct(id uint, workspaceID uint) error
}

type productService struct {
	repo ProductRepository
}

func NewProductService(repo ProductRepository) ProductService {
	return &productService{repo: repo}
}

func (s *productService) GetProducts(workspaceID uint, filter ProductFilterDto) ([]database.Product, error) {
	return s.repo.FindAll(workspaceID, filter)
}

func (s *productService) GetProductByID(id uint, workspaceID uint) (*database.Product, error) {
	p, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}
	return p, nil
}

func (s *productService) GetProductByBarcode(code string, workspaceID uint) (*database.Product, error) {
	p, err := s.repo.FindByBarcodeOrSKU(code, workspaceID)
	if err != nil {
		return nil, errors.New("produk dengan barcode tersebut tidak ditemukan")
	}
	return p, nil
}

func (s *productService) CreateProduct(workspaceID uint, dto CreateProductDto) (*database.Product, error) {
	unit := dto.Unit
	if unit == "" {
		unit = "Pcs"
	}
	minStock := dto.MinStock
	if minStock <= 0 {
		minStock = 5
	}
	isActive := true
	if dto.IsActive != nil {
		isActive = *dto.IsActive
	}

	p := &database.Product{
		WorkspaceID: workspaceID,
		CategoryID:  dto.CategoryID,
		BrandID:     dto.BrandID,
		SKU:         dto.SKU,
		Barcode:     dto.Barcode,
		Name:        dto.Name,
		Description: dto.Description,
		BuyPrice:    dto.BuyPrice,
		SellPrice:   dto.SellPrice,
		Stock:       dto.Stock,
		MinStock:    minStock,
		Unit:        unit,
		ImageURL:    dto.ImageURL,
		IsActive:    isActive,
	}

	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *productService) UpdateProduct(id uint, workspaceID uint, dto UpdateProductDto) (*database.Product, error) {
	p, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("produk tidak ditemukan")
	}

	p.CategoryID = dto.CategoryID
	p.BrandID = dto.BrandID
	p.SKU = dto.SKU
	p.Barcode = dto.Barcode
	p.Name = dto.Name
	p.Description = dto.Description
	p.BuyPrice = dto.BuyPrice
	p.SellPrice = dto.SellPrice
	if dto.MinStock > 0 {
		p.MinStock = dto.MinStock
	}
	if dto.Unit != "" {
		p.Unit = dto.Unit
	}
	p.ImageURL = dto.ImageURL
	if dto.IsActive != nil {
		p.IsActive = *dto.IsActive
	}

	if err := s.repo.Update(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *productService) DeleteProduct(id uint, workspaceID uint) error {
	_, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return errors.New("produk tidak ditemukan")
	}
	return s.repo.Delete(id, workspaceID)
}
