package inventory

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type InventoryController struct {
	service InventoryService
}

func NewInventoryController(service InventoryService) *InventoryController {
	return &InventoryController{service: service}
}

func (ctrl *InventoryController) GetHistory(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	productID, _ := strconv.Atoi(c.Query("product_id"))
	moveType := c.Query("type")

	filter := StockHistoryFilterDto{
		ProductID: uint(productID),
		Type:      moveType,
	}

	movements, err := ctrl.service.GetHistory(wsID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil riwayat pergerakan stok", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat riwayat stok", movements)
}

func (ctrl *InventoryController) GetLowStock(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	products, err := ctrl.service.GetLowStock(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat produk stok menipis", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat produk stok menipis", products)
}

func (ctrl *InventoryController) AdjustStock(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto StockAdjustmentDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: data adjustment tidak valid", err.Error())
		return
	}

	movement, err := ctrl.service.AdjustStock(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Penyesuaian stok berhasil disimpan", movement)
}
