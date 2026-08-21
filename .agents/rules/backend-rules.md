---
trigger: glob
globs: backEnd/**
---

# Backend API & Database Architecture Standards (Go + GORM)

## 1. Arsitektur Modular (NestJS-Style Pattern)
Setiap fitur backend **WAJIB** menerapkan struktur modular terpisah (*Feature Module Pattern*) seperti standar arsitektur NestJS. Simpan di folder `modules/<feature_name>/` (contoh: `modules/auth/`, `modules/product/`, `modules/transaction/`).

Setiap modul wajib terdiri dari komponen berikut:
- **`controller.go` (Controller Layer):**
  - Bertugas menangani HTTP request dan response (mirip `@Controller()` di NestJS).
  - Melakukan binding dan validasi input dari request (Param, Query, Body).
  - Memanggil method di Service dan mengembalikan response JSON dengan HTTP Status Code yang sesuai.
  - **Dilarang** menaruh business logic atau query database langsung di Controller.
- **`service.go` (Service / Business Logic Layer):**
  - Berisi inti logika bisnis (*Business Logic*) dan orkestrasi data (mirip `@Injectable()` Service di NestJS).
  - Menangani error logic, transaksi bisnis, hashing, manipulasi data.
  - Berkomunikasi dengan Repository Layer.
- **`repository.go` (Repository / Data Access Layer):**
  - Mengelola semua interaksi dan query langsung ke database menggunakan GORM (mirip Prisma Client / TypeORM Repository).
  - **Dilarang** menaruh business logic di Repository.
- **`dto.go` / `dto/` (Data Transfer Objects):**
  - Struct khusus untuk Request Body dan Response format (mirip DTO + `class-validator` di NestJS).
  - Gunakan struct tag validasi Gin (`binding:"required,min=3,email"`, dll.).
  - **Wajib** memisahkan `CreateDto`, `UpdateDto`, dan `ResponseDto`.
- **`router.go` (Module Routing):**
  - Mendaftarkan endpoint routes khusus untuk modul tersebut (mirip `@Module()` route definitions di NestJS).
  - Menerapkan middleware khusus modul (Auth Guard / RBAC / Validator) jika diperlukan.

---

## 2. Standar Dependency Injection (DI Constructor)
Terapkan pola Dependency Injection melalui constructor function di setiap layer:
```go
// Repository
type ProductRepository interface { ... }
func NewProductRepository(db *gorm.DB) ProductRepository { ... }

// Service
type ProductService interface { ... }
func NewProductService(repo ProductRepository) ProductService { ... }

// Controller
type ProductController struct { service ProductService }
func NewProductController(service ProductService) *ProductController { ... }
```

---

## 3. Database & GORM (Prinsip & Filosofi Prisma)

### A. Definisi Schema & Entity Terpusat (Prisma Schema Mindset)
- Definisikan struct Model/Entity secara deklaratif dengan tags GORM dan JSON yang jelas:
  ```go
  type Product struct {
      ID        uint           `gorm:"primaryKey;autoIncrement" json:"id"`
      Name      string         `gorm:"type:varchar(255);not null" json:"name"`
      Price     float64        `gorm:"type:decimal(15,2);not null" json:"price"`
      Stock     int            `gorm:"not null;default:0" json:"stock"`
      CreatedAt time.Time      `json:"created_at"`
      UpdatedAt time.Time      `json:"updated_at"`
      DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
  }
  ```
- **Dilarang** membuat atau memodifikasi tabel langsung via GUI Database tanpa mendefinisikan/memperbarui struct modelnya di kode.

### B. Migrasi Terstruktur (Mirip `prisma migrate`)
- Simpan pendaftaran migrasi secara terpusat (contoh: `database/migration.go` atau `config/migration.go`).
- Gunakan fungsi migrasi terpusat untuk mendaftarkan semua struct model:
  ```go
  func RunMigration(db *gorm.DB) error {
      return db.AutoMigrate(
          &models.User{},
          &models.Product{},
          &models.Category{},
          &models.Transaction{},
      )
  }
  ```

### C. Seeding Data (Mirip `prisma db seed`)
- Buat sistem seeder di folder `database/seeders/` untuk mengisi data awal (seperti Superadmin, Roles, atau Default Settings).
- Pastikan seeder bersifat *idempotent* (tidak membuat duplikasi jika dijalankan berulang kali).

### D. Relasi & Querying (Eksplisit ala Prisma `include`)
- Selalu gunakan `Preload` eksplisit saat membutuhkan relasi data untuk mencegah N+1 query:
  ```go
  // Mirip prisma.order.findMany({ include: { user: true, items: true } })
  db.Preload("User").Preload("Items.Product").Find(&orders)
  ```
- Gunakan `db.Transaction(func(tx *gorm.DB) error { ... })` untuk operasi yang melibatkan banyak tabel guna menjamin integritas data (ACID).

---

## 4. Format Response & Error Handling Terstandar

### A. Format Response Sukses
Semua endpoint wajib mengembalikan struktur JSON yang seragam:
```json
{
  "success": true,
  "message": "Deskripsi singkat keberhasilan",
  "data": {}
}
```

### B. Format Response Gagal / Error
```json
{
  "success": false,
  "message": "Pesan error utama",
  "errors": null
}
```

### C. HTTP Status Code Best Practices
- `200 OK`: Sukses mengambil atau memperbarui data.
- `201 Created`: Sukses membuat resource baru.
- `400 Bad Request`: Validasi input DTO gagal.
- `401 Unauthorized`: Token JWT tidak valid / belum login.
- `403 Forbidden`: User tidak memiliki izin (RBAC).
- `404 Not Found`: Data tidak ditemukan.
- `500 Internal Server Error`: Kesalahan internal server / database failure tak terduga.

---

## 5. Keamanan & Environment
- **DATABASE_URL First:** Selalu ambil konfigurasi database dari `DATABASE_URL` di file `.env`.
- **Sensitive Data Protection:** **Dilarang** menyertakan password hash / secret key ke dalam Response JSON (gunakan tag `json:"-"` atau mapping ke `ResponseDTO`).
- **Password Hashing:** Wajib menggunakan hashing standar industri (`golang.org/x/crypto/bcrypt`).
