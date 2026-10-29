package database

import (
	"log"

	"gorm.io/gorm"
)

// RunMigration menjalankan auto migration database.
// Untuk deployment baru: membuat semua tabel dari awal.
// Untuk deployment existing: melewati migrasi penuh tapi tetap membuat tabel-tabel baru
// yang ditambahkan setelah deployment awal (additive migration).
func RunMigration(db *gorm.DB) error {
	if db.Migrator().HasTable(&Workspace{}) && db.Migrator().HasTable(&User{}) && db.Migrator().HasTable(&Product{}) {
		log.Println("Database schema sudah ada (melewati proses migrasi penuh).")
	} else {
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
			&SystemLog{},
			&SubscriptionPlan{},
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

	// Additive migration: selalu pastikan kolom dan tabel-tabel baru ada,
	// bahkan di deployment existing. AutoMigrate bersifat idempotent (aman diulang).
	_ = db.Exec("ALTER TABLE users ALTER COLUMN workspace_id DROP NOT NULL").Error
	_ = db.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key").Error
	_ = db.Exec("ALTER TABLE users DROP CONSTRAINT IF EXISTS uni_users_email").Error
	_ = db.Exec("DROP INDEX IF EXISTS uni_users_email").Error

	newTables := []any{
		&Workspace{},
		&User{},
		&SystemLog{},
		&SubscriptionPlan{},
	}
	for _, model := range newTables {
		if err := db.AutoMigrate(model); err != nil {
			log.Printf("Error saat additive migration model %T: %v\n", model, err)
			return err
		}
	}
	log.Println("Additive migration selesai: tabel baru dan kolom telah dipastikan tersedia.")

	return nil
}

