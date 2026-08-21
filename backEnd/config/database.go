package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB menginisialisasi koneksi database PostgreSQL menggunakan DATABASE_URL dari .env
func InitDB() *gorm.DB {
	// Otomatis membaca file .env
	_ = godotenv.Load()

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL tidak ditemukan di environment variable atau file .env")
	}

	var err error
	DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database PostgreSQL: ", err)
	}

	fmt.Println("Koneksi PostgreSQL Berhasil!")
	return DB
}
