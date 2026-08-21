package jwt

import (
	"errors"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID      uint   `json:"user_id"`
	WorkspaceID uint   `json:"workspace_id"`
	Role        string `json:"role"`
	Email       string `json:"email"`
	jwt.RegisteredClaims
}

func getSecretKey() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "thekasir-super-secret-key-2026"
	}
	return []byte(secret)
}

// GenerateToken generates a JWT token for the user with 72-hour validity
func GenerateToken(userID, workspaceID uint, role, email string) (string, error) {
	claims := JWTClaims{
		UserID:      userID,
		WorkspaceID: workspaceID,
		Role:        role,
		Email:       email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "theKasir-App",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getSecretKey())
}

// ValidateToken validates a JWT token string and returns the claims
func ValidateToken(tokenString string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return getSecretKey(), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}
