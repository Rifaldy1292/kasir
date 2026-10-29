package superadmin

import (
	"net/http"
	"strconv"

	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type SuperadminController struct {
	service SuperadminService
}

func NewSuperadminController(service SuperadminService) *SuperadminController {
	return &SuperadminController{service: service}
}

func (ctrl *SuperadminController) GetStats(c *gin.Context) {
	stats, err := ctrl.service.GetDashboardStats()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil statistik platform", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Statistik platform berhasil diambil", stats)
}

func (ctrl *SuperadminController) GetPlans(c *gin.Context) {
	plans, err := ctrl.service.GetPlans()
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar paket", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Daftar paket berhasil diambil", plans)
}

func (ctrl *SuperadminController) UpdatePlan(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "ID paket tidak valid", nil)
		return
	}

	var dto UpdatePlanDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Data paket tidak valid", err.Error())
		return
	}

	plan, err := ctrl.service.UpdatePlan(uint(id), dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Paket langganan berhasil diperbarui", plan)
}

func (ctrl *SuperadminController) GetTenants(c *gin.Context) {
	search := c.Query("search")
	planFilter := c.Query("plan")

	tenants, err := ctrl.service.GetTenants(search, planFilter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar toko", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Daftar toko berhasil diambil", tenants)
}

func (ctrl *SuperadminController) UpdateTenantPlan(c *gin.Context) {
	idParam := c.Param("id")
	id, err := strconv.ParseUint(idParam, 10, 32)
	if err != nil {
		response.Error(c, http.StatusBadRequest, "ID tenant tidak valid", nil)
		return
	}

	var dto UpdateTenantPlanDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Data update tenant tidak valid", err.Error())
		return
	}

	if err := ctrl.service.UpdateTenantPlan(uint(id), dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Gagal memperbarui paket tenant: "+err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Paket langganan toko berhasil diperbarui", nil)
}
