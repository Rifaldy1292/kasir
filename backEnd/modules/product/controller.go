package product

import (
	"net/http"
	"strconv"

	"gin-quickstart/middleware"
	"gin-quickstart/pkg/response"

	"github.com/gin-gonic/gin"
)

type ProductController struct {
	service ProductService
}

func NewProductController(service ProductService) *ProductController {
	return &ProductController{service: service}
}

func (ctrl *ProductController) GetAll(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)

	categoryID, _ := strconv.Atoi(c.Query("category_id"))
	lowStock, _ := strconv.ParseBool(c.Query("low_stock"))
	search := c.Query("search")

	filter := ProductFilterDto{
		Search:     search,
		CategoryID: uint(categoryID),
		LowStock:   lowStock,
	}

	if activeQuery := c.Query("is_active"); activeQuery != "" {
		isActive, _ := strconv.ParseBool(activeQuery)
		filter.IsActive = &isActive
	}

	products, err := ctrl.service.GetProducts(wsID, filter)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal mengambil daftar produk", err.Error())
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat daftar produk", products)
}

func (ctrl *ProductController) GetByID(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	p, err := ctrl.service.GetProductByID(uint(id), wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil memuat detail produk", p)
}

func (ctrl *ProductController) GetByBarcode(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	code := c.Param("code")

	p, err := ctrl.service.GetProductByBarcode(code, wsID)
	if err != nil {
		response.Error(c, http.StatusNotFound, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Berhasil menemukan produk", p)
}

func (ctrl *ProductController) Create(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	var dto CreateProductDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal: format data produk tidak valid", err.Error())
		return
	}

	p, err := ctrl.service.CreateProduct(wsID, dto)
	if err != nil {
		response.Error(c, http.StatusInternalServerError, "Gagal menambahkan produk", err.Error())
		return
	}
	response.Success(c, http.StatusCreated, "Produk berhasil ditambahkan", p)
}

func (ctrl *ProductController) Update(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))
	var dto UpdateProductDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		response.Error(c, http.StatusBadRequest, "Validasi gagal", err.Error())
		return
	}

	p, err := ctrl.service.UpdateProduct(uint(id), wsID, dto)
	if err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Produk berhasil diperbarui", p)
}

func (ctrl *ProductController) Delete(c *gin.Context) {
	wsID := middleware.GetWorkspaceID(c)
	id, _ := strconv.Atoi(c.Param("id"))

	if err := ctrl.service.DeleteProduct(uint(id), wsID); err != nil {
		response.Error(c, http.StatusBadRequest, err.Error(), nil)
		return
	}
	response.Success(c, http.StatusOK, "Produk berhasil dihapus", nil)
}
