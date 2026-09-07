# theKasir

Panduan ringkas untuk build & menjalankan backend dan frontend theKasir.

---

## 1. Backend (Go + Gin + PostgreSQL)

Masuk ke direktori backend:
```bash
cd backEnd
```

### A. Build Binary Backend

**Windows:**
```bash
go build -o main.exe main.go
```

**Linux / macOS:**
```bash
go build -o main main.go
```

---

### B. Migrasi Database (Pertama kali / saat ada update skema)
Jalankan migrasi skema tabel database:

- **Menggunakan Go source code:**
  ```bash
  go run main.go -migrate
  ```
- **Menggunakan Binary yang sudah di-build:**
  ```bash
  # Windows
  ./main.exe -migrate

  # Linux / macOS
  ./main -migrate
  ```

---

### C. Seeding Data Awal (Opsional / Akun Demo)
Mengisi data awal seperti workspace default, kategori, produk, dan akun demo:

- **Menggunakan Go source code:**
  ```bash
  go run main.go -seed
  ```
- **Menggunakan Binary:**
  ```bash
  # Windows
  ./main.exe -seed

  # Linux / macOS
  ./main -seed
  ```

> **Tips:** Anda bisa menjalankan migrasi dan seeder sekaligus:
> ```bash
> go run main.go -migrate -seed
> # atau
> ./main.exe -migrate -seed
> ```

---

### D. Menjalankan Server Backend

- **Mode Development:**
  ```bash
  go run main.go
  ```
- **Mode Production (Menggunakan Binary):**
  ```bash
  # Windows
  ./main.exe

  # Linux / macOS
  ./main
  ```

*Server akan berjalan di `http://localhost:8080` (atau port sesuai environment variable `PORT`).*

---

## 2. Frontend (Next.js)

Masuk ke direktori frontend:
```bash
cd frontEnd
```

### A. Install Dependencies
```bash
npm install
```

### B. Menjalankan Development Server
```bash
npm run dev
```
*Aplikasi frontend dapat diakses di `http://localhost:3000`.*

### C. Build & Menjalankan Mode Production
```bash
# 1. Build project
npm run build

# 2. Jalankan production server
npm run start
```

---

## 3. Akun Demo Default

Jika sudah menjalankan perintah `-seed`:
- **Owner**: `owner@thekasir.com` / `password123`
- **Admin**: `admin@thekasir.com` / `password123`
- **Kasir**: `kasir@thekasir.com` / `password123`
