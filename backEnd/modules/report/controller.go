package report

import (
	"net/http"
	"time"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type ReportController struct {
	service ReportService
}

func NewReportController(service ReportService) *ReportController {
	return &ReportController{service: service}
}

func (ctrl *ReportController) GetDashboard(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	summary, err := ctrl.service.GetDashboard(wsID)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat ringkasan dashboard", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat dashboard", summary)
}

func (ctrl *ReportController) GetSalesReport(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	startStr := c.Query("start_date")
	endStr := c.Query("end_date")

	filter := ReportFilterDto{}
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

	sales, err := ctrl.service.GetSalesReport(wsID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat laporan penjualan", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat laporan penjualan", sales)
}

func (ctrl *ReportController) GetItemReport(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	startStr := c.Query("start_date")
	endStr := c.Query("end_date")

	filter := ReportFilterDto{}
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

	items, err := ctrl.service.GetItemReport(wsID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal memuat performa produk", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat laporan penjualan produk", items)
}
