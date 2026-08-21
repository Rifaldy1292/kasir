package upload

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gin-quickstart/pkg/response"
	"github.com/gin-gonic/gin"
)

type UploadController struct{}

func NewUploadController() *UploadController {
	return &UploadController{}
}

func (ctrl *UploadController) UploadImage(c *gin.Context) {
	// Try getting "image" field or fallback to "file"
	file, err := c.FormFile("image")
	if err != nil {
		file, err = c.FormFile("file")
		if err != nil {
			response.Error(c, http.StatusBadRequest, "File gambar tidak ditemukan dalam request (gunakan key 'image' atau 'file')", nil)
			return
		}
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		response.Error(c, http.StatusBadRequest, "Ukuran gambar terlalu besar (maksimal 5MB)", nil)
		return
	}

	// Validate extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".png":  true,
		".jpg":  true,
		".jpeg": true,
		".webp": true,
		".gif":  true,
	}

	if !allowedExts[ext] {
		response.Error(c, http.StatusBadRequest, "Format file tidak didukung. Harap unggah format JPG, JPEG, PNG, WEBP, atau GIF", nil)
		return
	}

	// Ensure uploads directory exists
	uploadDir := "./uploads"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal menyiapkan direktori penyimpanan", err.Error())
		return
	}

	// Generate safe unique filename
	filename := fmt.Sprintf("prod_%d%s", time.Now().UnixNano(), ext)
	dst := filepath.Join(uploadDir, filename)

	// Save the uploaded file
	if err := c.SaveUploadedFile(file, dst); err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal menyimpan file gambar ke server", err.Error())
		return
	}

	fileURL := fmt.Sprintf("/uploads/%s", filename)

	response.Success(c, http.StatusOK, "Gambar berhasil diunggah", gin.H{
		"url":      fileURL,
		"filename": filename,
	})
}
