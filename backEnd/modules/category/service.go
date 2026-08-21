package category

import (
	"errors"

	"gin-quickstart/database"
)

type CategoryService interface {
	GetAllCategories(workspaceID uint) ([]database.Category, error)
	GetCategoryByID(id uint, workspaceID uint) (*database.Category, error)
	CreateCategory(workspaceID uint, dto CreateCategoryDto) (*database.Category, error)
	UpdateCategory(id uint, workspaceID uint, dto UpdateCategoryDto) (*database.Category, error)
	DeleteCategory(id uint, workspaceID uint) error
}

type categoryService struct {
	repo CategoryRepository
}

func NewCategoryService(repo CategoryRepository) CategoryService {
	return &categoryService{repo: repo}
}

func (s *categoryService) GetAllCategories(workspaceID uint) ([]database.Category, error) {
	return s.repo.FindAll(workspaceID)
}

func (s *categoryService) GetCategoryByID(id uint, workspaceID uint) (*database.Category, error) {
	cat, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}
	return cat, nil
}

func (s *categoryService) CreateCategory(workspaceID uint, dto CreateCategoryDto) (*database.Category, error) {
	cat := &database.Category{
		WorkspaceID: workspaceID,
		Name:        dto.Name,
		Description: dto.Description,
	}
	if err := s.repo.Create(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *categoryService) UpdateCategory(id uint, workspaceID uint, dto UpdateCategoryDto) (*database.Category, error) {
	cat, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return nil, errors.New("kategori tidak ditemukan")
	}

	cat.Name = dto.Name
	cat.Description = dto.Description

	if err := s.repo.Update(cat); err != nil {
		return nil, err
	}
	return cat, nil
}

func (s *categoryService) DeleteCategory(id uint, workspaceID uint) error {
	_, err := s.repo.FindByID(id, workspaceID)
	if err != nil {
		return errors.New("kategori tidak ditemukan")
	}
	return s.repo.Delete(id, workspaceID)
}
