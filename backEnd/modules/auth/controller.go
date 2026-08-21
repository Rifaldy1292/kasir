package auth

import (
	"net/http"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	service AuthService
}

func NewAuthController(service AuthService) *AuthController {
	return &AuthController{service: service}
}

func (ctrl *AuthController) Login(c *gin.Context) {
	var dto LoginDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format email atau password tidak sesuai", err.Error())
		return
	}

	result, err := ctrl.service.Login(dto)
	if err != nil {
		response.Error(c, http.StatusUnauthorized, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Login berhasil", result)
}

func (ctrl *AuthController) RegisterWorkspace(c *gin.Context) {
	var dto RegisterWorkspaceDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi pendaftaran gagal", err.Error())
		return
	}

	result, err := ctrl.service.RegisterWorkspace(dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Workspace dan akun Owner berhasil dibuat", result)
}

func (ctrl *AuthController) GetProfile(c *gin.Context) {
	userID := middleware.GetUserID(c)
	user, err := ctrl.service.GetProfile(userID)
	if err != nil {
		response.Error(c, http.StatusNotFound, "Data pengguna tidak ditemukan", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat profil pengguna", user)
}
