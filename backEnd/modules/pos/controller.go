package pos

import (
	"net/http"
	"strconv"
	"time"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type PosController struct {
	service PosService
}

func NewPosController(service PosService) *PosController {
	return &PosController{service: service}
}

func (ctrl *PosController) Checkout(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto CheckoutDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format checkout tidak valid", err.Error())
		return
	}

	tx, err := ctrl.service.Checkout(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Transaksi berhasil diproses", tx)
}

func (ctrl *PosController) GetAllTransactions(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	search := c.Query("search")
	status := c.Query("status")
	startStr := c.Query("start_date")
	endStr := c.Query("end_date")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	filter := TransactionFilterDto{
		Search: search,
		Status: status,
		Page:   page,
		Limit:  limit,
	}

	if startStr != "" {
		if t, err := time.Parse("2006-01-02", startStr); err == nil {
			filter.StartDate = &t
		}
	}
	if endStr != "" {
		if t, err := time.Parse("2006-01-02", endStr); err == nil {
			t = t.Add(23*time.Hour + 59*time.Minute + 59*time.Second)
			filter.EndDate = &t
		}
	}

	transactions, err := ctrl.service.GetTransactions(wsID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar transaksi", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat transaksi", transactions)
}

func (ctrl *PosController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	tx, err := ctrl.service.GetTransactionByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail transaksi", tx)
}

func (ctrl *PosController) GetByInvoice(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	invoice := c.Param("invoice")

	tx, err := ctrl.service.GetTransactionByInvoice(invoice, wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail transaksi", tx)
}

func (ctrl *PosController) Void(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	var dto VoidRefundDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Alasan void wajib disertakan", err.Error())
		return
	}

	if err := ctrl.service.VoidTransaction(uint(id), wsID, userID, dto); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Transaksi berhasil dibatalkan (VOID)", nil)
}

func (ctrl *PosController) Refund(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	var dto VoidRefundDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Alasan refund wajib disertakan", err.Error())
		return
	}

	if err := ctrl.service.RefundTransaction(uint(id), wsID, userID, dto); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Transaksi berhasil di-refund dan stok dikembalikan", nil)
}
