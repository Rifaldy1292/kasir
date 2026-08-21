package supplier

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type SupplierController struct {
	service SupplierService
}

func NewSupplierController(service SupplierService) *SupplierController {
	return &SupplierController{service: service}
}

func (ctrl *SupplierController) GetAll(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	search := c.Query("search")

	suppliers, err := ctrl.service.GetSuppliers(wsID, search)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil data supplier", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat supplier", suppliers)
}

func (ctrl *SupplierController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	supplier, err := ctrl.service.GetSupplierByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail supplier", supplier)
}

func (ctrl *SupplierController) Create(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	var dto CreateSupplierDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data supplier tidak valid", err.Error())
		return
	}

	supplier, err := ctrl.service.CreateSupplier(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal menambahkan supplier", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Supplier berhasil ditambahkan", supplier)
}

func (ctrl *SupplierController) Update(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))
	var dto UpdateSupplierDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal", err.Error())
		return
	}

	supplier, err := ctrl.service.UpdateSupplier(uint(id), wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Supplier berhasil diperbarui", supplier)
}

func (ctrl *SupplierController) Delete(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := ctrl.service.DeleteSupplier(uint(id), wsID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Supplier berhasil dihapus", nil)
}
