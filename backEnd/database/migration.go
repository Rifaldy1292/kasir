package database

import (
	"log"

	"gorm.io/gorm"
)

// RunMigration registers and migrates all database models if not already migrated
func RunMigration(db *gorm.DB) error {
	// Cek jika tabel-tabel utama sudah ada di database, lewati proses migrasi
	if db.Migrator().HasTable(&Workspace{}) && db.Migrator().HasTable(&User{}) && db.Migrator().HasTable(&Product{}) {
		log.Println("Database schema sudah lengkap (melewati proses migrasi).")
		return nil
	}

	log.Println("Menjalankan inisialisasi tabel database pertama kali...")

	models := []any{
		&Workspace{},
		&User{},
		&Category{},
		&Brand{},
		&Product{},
		&InventoryMovement{},
		&Customer{},
		&Supplier{},
		&CashSession{},
		&CashMovement{},
		&Transaction{},
		&TransactionItem{},
		&Purchase{},
		&PurchaseItem{},
		&AuditLog{},
	}

	for _, model := range models {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Error saat migrasi model %T: %v\n", model, err)
			return err
		}
	}

	log.Println("Inisialisasi database berhasil diselesaikan 100%.")
	return nil
}
