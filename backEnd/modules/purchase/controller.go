package purchase

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type PurchaseController struct {
	service PurchaseService
}

func NewPurchaseController(service PurchaseService) *PurchaseController {
	return &PurchaseController{service: service}
}

func (ctrl *PurchaseController) GetAll(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	purchases, err := ctrl.service.GetPurchases(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar pembelian", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat daftar pembelian", purchases)
}

func (ctrl *PurchaseController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	p, err := ctrl.service.GetPurchaseByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail pembelian", p)
}

func (ctrl *PurchaseController) Create(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto CreatePurchaseDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data pembelian tidak valid", err.Error())
		return
	}

	p, err := ctrl.service.CreatePurchase(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Pembelian berhasil disimpan dan stok otomatis bertambah", p)
}
