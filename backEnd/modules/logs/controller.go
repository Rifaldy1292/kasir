package logs

import (
	"net/http"
	"os"
	"strings"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type LogController struct {
	service LogService
}

func NewLogController(service LogService) *LogController {
	return &LogController{service: service}
}

// GetLogs mengembalikan daftar log sistem dari database dengan filter dan paginasi.
// Hanya dapat diakses oleh OWNER dan ADMIN.
//
// Query params:
//   - type     : LOGIN | CRUD | ERROR (opsional, kosong = semua)
//   - start_date: YYYY-MM-DD (opsional)
//   - end_date  : YYYY-MM-DD (opsional)
//   - page      : int (default 1)
//   - limit     : int (default 50, max 200)
func (ctrl *LogController) GetLogs(c *gin.Context) {
	var filter LogFilterDto
	if err := c.ShouldBindQuery(&filter); err != nil {
		response.Error(c, http.StatusBadRequest, "Parameter query tidak valid", err.Error())
		return
	}

	workspaceID := middleware.GetWorkspaceID(c)
	logs, total, err := ctrl.service.GetLogs(workspaceID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat data log", err.Error())
		return
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
	page := filter.Page
	if page <= 0 {
		page = 1
	}

	response.Success(c, http.StatusOK, "Berhasil memuat data log sistem", LogListResponseDto{
		Data:  logs,
		Total: total,
		Page:  page,
		Limit: limit,
	})
}

// ListLogFiles mengembalikan daftar metadata file log JSON yang ada di folder ./logs.
// Tidak mengembalikan isi file, hanya informasi file (nama, ukuran, tanggal).
func (ctrl *LogController) ListLogFiles(c *gin.Context) {
	var files []LogFileInfo

	entries, err := os.ReadDir("./logs")
	if err != nil {
		if os.IsNotExist(err) {
			response.Success(c, http.StatusOK, "Belum ada file log tersedia", []LogFileInfo{})
			return
		}
		response.Error(c, http.StatusInternalServerError, "Gagal membaca folder log", err.Error())
		return
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}
		info, err := entry.Info()
		if err != nil {
			continue
		}
		files = append(files, LogFileInfo{
			Filename:    entry.Name(),
			SizeBytes:   info.Size(),
			LastUpdated: info.ModTime(),
		})
	}

	if files == nil {
		files = []LogFileInfo{}
	}

	response.Success(c, http.StatusOK, "Berhasil memuat daftar file log", files)
}
