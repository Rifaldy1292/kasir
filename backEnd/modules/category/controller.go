package category

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type CategoryController struct {
	service CategoryService
}

func NewCategoryController(service CategoryService) *CategoryController {
	return &CategoryController{service: service}
}

func (ctrl *CategoryController) GetAll(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	categories, err := ctrl.service.GetAllCategories(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar kategori", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat kategori", categories)
}

func (ctrl *CategoryController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	cat, err := ctrl.service.GetCategoryByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail kategori", cat)
}

func (ctrl *CategoryController) Create(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	var dto CreateCategoryDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data kategori tidak valid", err.Error())
		return
	}

	cat, err := ctrl.service.CreateCategory(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal membuat kategori", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Kategori berhasil ditambahkan", cat)
}

func (ctrl *CategoryController) Update(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))
	var dto UpdateCategoryDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal", err.Error())
		return
	}

	cat, err := ctrl.service.UpdateCategory(uint(id), wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Kategori berhasil diperbarui", cat)
}

func (ctrl *CategoryController) Delete(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := ctrl.service.DeleteCategory(uint(id), wsID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Kategori berhasil dihapus", nil)
}
