package customer

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type CustomerController struct {
	service CustomerService
}

func NewCustomerController(service CustomerService) *CustomerController {
	return &CustomerController{service: service}
}

func (ctrl *CustomerController) GetAll(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	search := c.Query("search")

	customers, err := ctrl.service.GetCustomers(wsID, search)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil data pelanggan", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat pelanggan", customers)
}

func (ctrl *CustomerController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	cust, err := ctrl.service.GetCustomerByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail pelanggan", cust)
}

func (ctrl *CustomerController) Create(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	var dto CreateCustomerDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data pelanggan tidak valid", err.Error())
		return
	}

	cust, err := ctrl.service.CreateCustomer(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal menambahkan pelanggan", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Pelanggan berhasil ditambahkan", cust)
}

func (ctrl *CustomerController) Update(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))
	var dto UpdateCustomerDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal", err.Error())
		return
	}

	cust, err := ctrl.service.UpdateCustomer(uint(id), wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Pelanggan berhasil diperbarui", cust)
}

func (ctrl *CustomerController) Delete(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := ctrl.service.DeleteCustomer(uint(id), wsID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Pelanggan berhasil dihapus", nil)
}
