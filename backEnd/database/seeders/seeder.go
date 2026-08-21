package seeders

import (
	"log"

	"gin-quickstart/database"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// RunSeeder creates initial demo data if database is empty
func RunSeeder(db *gorm.DB) error {
	var workspaceCount int64
	db.Model(&database.Workspace{}).Count(&workspaceCount)
	if workspaceCount > 0 {
		log.Println("Database seeder dilewati (sudah ada data).")
		return nil
	}

	log.Println("Memulai seeding data awal...")

	// 1. Create Default Workspace
	defaultWorkspace := database.Workspace{
		Name:          "theKasir Mart Utama",
		BusinessType:  "Retail & Minimarket",
		Phone:         "081234567890",
		Email:         "support@thekasir.com",
		Address:       "Jl. Sudirman No. 88, Jakarta Pusat",
		Currency:      "IDR",
		TaxRate:       11.0, // PPN 11%
		ReceiptHeader: "=== theKasir Mart Utama ===",
		ReceiptFooter: "Terima kasih atas kunjungan Anda!\nBarang yang sudah dibeli tidak dapat ditukar.",
	}
	if err := db.Create(&defaultWorkspace).Error; err != nil {
		return err
	}

	// 2. Hash Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 3. Create Users
	users := []database.User{
		{
			WorkspaceID:  defaultWorkspace.ID,
			Name:         "Rifky Owner",
			Email:        "owner@thekasir.com",
			PasswordHash: string(hashedPassword),
			Role:         "OWNER",
			Status:       "ACTIVE",
			Phone:        "08111111111",
		},
		{
			WorkspaceID:  defaultWorkspace.ID,
			Name:         "Budi Admin",
			Email:        "admin@thekasir.com",
			PasswordHash: string(hashedPassword),
			Role:         "ADMIN",
			Status:       "ACTIVE",
			Phone:        "08222222222",
		},
		{
			WorkspaceID:  defaultWorkspace.ID,
			Name:         "Siti Kasir",
			Email:        "kasir@thekasir.com",
			PasswordHash: string(hashedPassword),
			Role:         "CASHIER",
			Status:       "ACTIVE",
			Phone:        "08333333333",
		},
	}
	for _, u := range users {
		db.Create(&u)
	}

	// 4. Create Categories
	categories := []database.Category{
		{WorkspaceID: defaultWorkspace.ID, Name: "Makanan", Description: "Produk makanan siap saji dan instan"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Minuman", Description: "Kopi, teh, soda, jus, dan air mineral"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Snack & Cemilan", Description: "Keripik, biskuit, dan cokelat"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Kebutuhan Pokok", Description: "Beras, minyak, gula, dan sembako"},
	}
	for i := range categories {
		db.Create(&categories[i])
	}

	// 5. Create Brands
	brands := []database.Brand{
		{WorkspaceID: defaultWorkspace.ID, Name: "Indofood", Description: "Produsen Indomie, Chitato, dll"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Mayora", Description: "Produsen Torabika, Kopiko, dll"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Nestle", Description: "Produsen Milo, Bear Brand, dll"},
		{WorkspaceID: defaultWorkspace.ID, Name: "Danone", Description: "Produsen Aqua, Mizone, dll"},
	}
	for i := range brands {
		db.Create(&brands[i])
	}

	// 6. Create Products
	products := []database.Product{
		{
			WorkspaceID: defaultWorkspace.ID,
			CategoryID:  &categories[1].ID, // Minuman
			BrandID:     &brands[3].ID,     // Danone
			SKU:         "DRK-AQUA-600",
			Barcode:     "8992753211111",
			Name:        "Aqua Air Mineral 600ml",
			Description: "Air mineral pegunungan botol 600ml",
			BuyPrice:    3000,
			SellPrice:   4500,
			Stock:       120,
			MinStock:    20,
			Unit:        "Botol",
			ImageURL:    "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&q=80",
			IsActive:    true,
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			CategoryID:  &categories[1].ID, // Minuman
			BrandID:     &brands[1].ID,     // Mayora
			SKU:         "DRK-KOPI-TORA",
			Barcode:     "8992753222222",
			Name:        "Kopi Torabika Cappuccino",
			Description: "Kopi sachet nikmat dengan choco granule",
			BuyPrice:    2000,
			SellPrice:   3500,
			Stock:       85,
			MinStock:    15,
			Unit:        "Sachet",
			ImageURL:    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&q=80",
			IsActive:    true,
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			CategoryID:  &categories[0].ID, // Makanan
			BrandID:     &brands[0].ID,     // Indofood
			SKU:         "MKN-IND-GORG",
			Barcode:     "8992753333333",
			Name:        "Indomie Goreng Spesial 85g",
			Description: "Mie instan goreng rasa original legendaris",
			BuyPrice:    2800,
			SellPrice:   3500,
			Stock:       200,
			MinStock:    30,
			Unit:        "Bungkus",
			ImageURL:    "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&q=80",
			IsActive:    true,
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			CategoryID:  &categories[2].ID, // Snack
			BrandID:     &brands[0].ID,     // Indofood
			SKU:         "SNK-CHI-SAPI",
			Barcode:     "8992753444444",
			Name:        "Chitato Sapi Panggang 68g",
			Description: "Keripik kentang renyah bergelombang rasa sapi panggang",
			BuyPrice:    8500,
			SellPrice:   11500,
			Stock:       45,
			MinStock:    10,
			Unit:        "Bungkus",
			ImageURL:    "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80",
			IsActive:    true,
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			CategoryID:  &categories[3].ID, // Kebutuhan Pokok
			SKU:         "POK-MINYAK-2L",
			Barcode:     "8992753555555",
			Name:        "Minyak Goreng Bimoli 2L",
			Description: "Minyak goreng kelapa sawit murni kemasan pouch 2 Liter",
			BuyPrice:    32000,
			SellPrice:   38500,
			Stock:       8, // Low stock demo!
			MinStock:    10,
			Unit:        "Pouch",
			ImageURL:    "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500&q=80",
			IsActive:    true,
		},
	}
	for _, p := range products {
		db.Create(&p)
	}

	// 7. Create Sample Customer
	customers := []database.Customer{
		{
			WorkspaceID: defaultWorkspace.ID,
			Name:        "Andi Pratama",
			Phone:       "085712345678",
			Email:       "andi@gmail.com",
			Address:     "Jl. Kemang Raya No. 12, Jakarta",
			Points:      120,
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			Name:        "Dewi Lestari",
			Phone:       "087887654321",
			Email:       "dewi.lestari@gmail.com",
			Address:     "Jl. Margonda No. 45, Depok",
			Points:      50,
		},
	}
	for _, c := range customers {
		db.Create(&c)
	}

	// 8. Create Sample Supplier
	suppliers := []database.Supplier{
		{
			WorkspaceID: defaultWorkspace.ID,
			Name:        "PT Indomarco Adi Prima",
			Phone:       "021-5551234",
			Email:       "order@indomarco.co.id",
			Address:     "Kawasan Industri Pulogadung, Jakarta Timur",
		},
		{
			WorkspaceID: defaultWorkspace.ID,
			Name:        "CV Berkah Logistik Sembako",
			Phone:       "021-7779876",
			Email:       "berkahsembako@supplier.id",
			Address:     "Pasar Induk Kramat Jati, Jakarta Timur",
		},
	}
	for _, s := range suppliers {
		db.Create(&s)
	}

	log.Println("Seeding database selesai dengan sukses!")
	return nil
}
