package auth

import (
	"net/http"
	"time"

	"gin-quickstart/database"
	"gin-quickstart/middleware"
	"gin-quickstart/pkg/logger"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthController struct {
	service AuthService
	db      *gorm.DB
}

func NewAuthController(service AuthService, db *gorm.DB) *AuthController {
	return &AuthController{service: service, db: db}
}

func (ctrl *AuthController) Login(c *gin.Context) {
	var dto LoginDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format email atau password tidak sesuai", err.Error())
		return
	}

	result, loginErr := ctrl.service.Login(dto)

	// Tangkap nilai dari context sebelum goroutine dimulai
	// (gin.Context bisa di-recycle setelah handler selesai)
	clientIP := c.ClientIP()

	// Catat percobaan login secara async — berhasil maupun gagal
	go func() {
		statusCode := http.StatusOK
		message := "Login berhasil"
		detail := ""
		var userID uint
		var workspaceID uint

		if loginErr != nil {
			statusCode = http.StatusUnauthorized
			message = "Login gagal"
			detail = loginErr.Error()
		} else if result != nil {
			userID = result.User.ID
			if result.User.WorkspaceID != nil {
				workspaceID = *result.User.WorkspaceID
			}
		}

		entry := logger.LogEntry{
			WorkspaceID: workspaceID,
			UserID:      userID,
			UserEmail:   dto.Email,
			Type:        logger.LogTypeLogin,
			Method:      "POST",
			Path:        "/api/v1/auth/login",
			Action:      "Login",
			Entity:      "Auth",
			StatusCode:  statusCode,
			Message:     message,
			Detail:      detail,
			IPAddress:   clientIP,
			CreatedAt:   time.Now(),
		}

		// Simpan ke file JSON
		logger.WriteLog(entry)

		// Simpan ke database
		ctrl.db.Create(&database.SystemLog{
			WorkspaceID: entry.WorkspaceID,
			UserID:      entry.UserID,
			UserEmail:   entry.UserEmail,
			Type:        string(entry.Type),
			Method:      entry.Method,
			Path:        entry.Path,
			Action:      entry.Action,
			Entity:      entry.Entity,
			StatusCode:  entry.StatusCode,
			Message:     entry.Message,
			Detail:      entry.Detail,
			IPAddress:   entry.IPAddress,
			CreatedAt:   entry.CreatedAt,
		})
	}()

	if loginErr != nil {
		response.Error(c, http.StatusUnauthorized, loginErr.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Login berhasil", result)
}

func (ctrl *AuthController) RegisterOwner(c *gin.Context) {
	var dto RegisterOwnerDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi data pendaftaran owner gagal", err.Error())
		return
	}

	result, err := ctrl.service.RegisterOwner(dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Pendaftaran akun Owner berhasil", result)
}

func (ctrl *AuthController) CreateWorkspace(c *gin.Context) {
	var dto CreateWorkspaceDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi data workspace gagal", err.Error())
		return
	}

	ownerID := middleware.GetUserID(c)
	result, err := ctrl.service.CreateWorkspace(ownerID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusCreated, "Workspace / Toko berhasil dibuat", result)
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

func (ctrl *AuthController) GetMyWorkspaces(c *gin.Context) {
	userID := middleware.GetUserID(c)
	currentWsID := middleware.GetWorkspaceID(c)
	workspaces, err := ctrl.service.GetMyWorkspaces(userID, currentWsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat daftar workspace", err.Error())
		return
	}

	response.Success(c, http.StatusOK, "Berhasil memuat daftar workspace", workspaces)
}

func (ctrl *AuthController) SwitchWorkspace(c *gin.Context) {
	var dto SwitchWorkspaceDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi ID workspace gagal", err.Error())
		return
	}

	userID := middleware.GetUserID(c)
	result, err := ctrl.service.SwitchWorkspace(userID, dto.WorkspaceID)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	response.Success(c, http.StatusOK, "Berhasil berpindah workspace", result)
}
