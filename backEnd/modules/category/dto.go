package category

type CreateCategoryDto struct {
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
}

type UpdateCategoryDto struct {
	Name        string `json:"name" binding:"required,min=2"`
	Description string `json:"description"`
}
