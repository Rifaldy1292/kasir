package auth

type LoginDto struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
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
	WorkspaceID uint   `json:"workspace_id"`
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
