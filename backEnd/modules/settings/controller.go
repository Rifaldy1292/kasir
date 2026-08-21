package settings

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type SettingsController struct {
	service SettingsService
}

func NewSettingsController(service SettingsService) *SettingsController {
	return &SettingsController{service: service}
}

func (ctrl *SettingsController) GetWorkspace(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	ws, err := ctrl.service.GetWorkspaceSettings(wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Workspace tidak ditemukan", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat pengaturan bisnis", ws)
}

func (ctrl *SettingsController) UpdateWorkspace(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	var dto UpdateWorkspaceDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data profil bisnis tidak valid", err.Error())
		return
	}

	ws, err := ctrl.service.UpdateWorkspaceSettings(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Pengaturan bisnis berhasil diperbarui", ws)
}

func (ctrl *SettingsController) GetStaff(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	users, err := ctrl.service.GetStaffList(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat daftar staf", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat daftar staf", users)
}

func (ctrl *SettingsController) AddStaff(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	var dto CreateUserDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data staf tidak valid", err.Error())
		return
	}

	user, err := ctrl.service.AddStaff(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusCreated, "Staf baru berhasil ditambahkan", user)
}

func (ctrl *SettingsController) UpdateStaff(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	var dto UpdateUserDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal", err.Error())
		return
	}

	user, err := ctrl.service.UpdateStaff(uint(id), wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Data staf berhasil diperbarui", user)
}

func (ctrl *SettingsController) DeleteStaff(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	callerID := middleware.GetUserID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := ctrl.service.DeleteStaff(uint(id), wsID, callerID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Staf berhasil dinonaktifkan/dihapus", nil)
}
