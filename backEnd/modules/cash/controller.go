package cash

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type CashController struct {
	service CashService
}

func NewCashController(service CashService) *CashController {
	return &CashController{service: service}
}

func (ctrl *CashController) GetCurrentSession(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	session, err := ctrl.service.GetActiveSession(wsID, userID)
	if err != nil {
		response.Success(c, http.StatusOK, "Tidak ada sesi aktif", nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat sesi aktif", session)
}

func (ctrl *CashController) OpenShift(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto OpenShiftDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format modal awal tidak valid", err.Error())
		return
	}

	session, err := ctrl.service.OpenShift(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Sesi kasir berhasil dibuka", session)
}

func (ctrl *CashController) CloseShift(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto CloseShiftDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: nominal kas akhir tidak valid", err.Error())
		return
	}

	session, err := ctrl.service.CloseShift(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Sesi kasir berhasil ditutup dan direkonsiliasi", session)
}

func (ctrl *CashController) AddMovement(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	userID := middleware.GetUserID(c)

	var dto CashMovementDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format kas masuk/keluar tidak valid", err.Error())
		return
	}

	mov, err := ctrl.service.AddMovement(wsID, userID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Arus kas berhasil dicatat", mov)
}

func (ctrl *CashController) GetHistory(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	sessions, err := ctrl.service.GetHistory(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil riwayat sesi kasir", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat riwayat sesi kasir", sessions)
}

func (ctrl *CashController) GetDetail(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	session, err := ctrl.service.GetSessionDetail(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Sesi tidak ditemukan", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail sesi kasir", session)
}
