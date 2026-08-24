package auth

type LoginDto struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// RegisterOwnerDto is used when a new user registers as an OWNER (no workspace yet)
type RegisterOwnerDto struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
}

// CreateWorkspaceDto is used after login when an Owner creates their store / workspace
type CreateWorkspaceDto struct {
	Name         string  `json:"name" binding:"required,min=3"`
	BusinessType string  `json:"business_type"`
	Phone        string  `json:"phone"`
	Email        string  `json:"email"`
	Address      string  `json:"address"`
	Currency     string  `json:"currency"`
	TaxRate      float64 `json:"tax_rate"`
}

type SwitchWorkspaceDto struct {
	WorkspaceID uint `json:"workspace_id" binding:"required"`
}

type RegisterWorkspaceDto struct {
	WorkspaceName string `json:"workspace_name" binding:"required,min=3"`
	BusinessType  string `json:"business_type"`
	OwnerName     string `json:"owner_name" binding:"required,min=2"`
	Email         string `json:"email" binding:"required,email"`
	Password      string `json:"password" binding:"required,min=6"`
	Phone         string `json:"phone"`
}

type UserResponseDto struct {
	ID          uint   `json:"id"`
	WorkspaceID *uint  `json:"workspace_id"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	Status      string `json:"status"`
	Phone       string `json:"phone"`
}

type LoginResponseDto struct {
	Token     string          `json:"token"`
	User      UserResponseDto `json:"user"`
	Workspace any             `json:"workspace"`
}
