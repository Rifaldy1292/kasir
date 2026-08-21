package response

import (
	"github.com/gin-gonic/gin"
)

type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Errors  any    `json:"errors"`
}

// Success returns standardized JSON success response
func Success(c *gin.Context, statusCode int, message string, data any) {
	c.JSON(statusCode, SuccessResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

// Error returns standardized JSON error response
func Error(c *gin.Context, statusCode int, message string, errors any) {
	c.JSON(statusCode, ErrorResponse{
		Success: false,
		Message: message,
		Errors:  errors,
	})
}
