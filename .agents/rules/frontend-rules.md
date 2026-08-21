---
trigger: glob
globs: frontEnd/**
---

# Frontend UI & API Development Standards

## 1. UI Components & Styling
- **Shadcn UI First:** Selalu prioritaskan untuk mencari dan menggunakan komponen UI dari Shadcn UI yang sudah tersedia di folder komponen proyek. Baru diperbolehkan membuat komponen manual jika memang tidak tersedia di Shadcn UI.
- **Desain Modern & Non-AI Look:** Gunakan tampilan UI yang modern, clean, intuitif, dan hindari gaya desain umum yang terlihat seperti "AI-generated standard template".
- **Global CSS & Dynamic Styling:**
  - Untuk perubahan warna tema (seperti mengubah warna `primary` button menjadi ungu), **WAJIB** dilakukan melalui konfigurasi file CSS Global (`globals.css` / Tailwind CSS variables).
  - **Dilarang** melakukan *hardcode* / *rewrite* warna secara berulang di tiap komponen individu jika warna tersebut merupakan bagian dari sistem tema utama.

## 2. API & Data Fetching
- **State Management & Fetching:** **WAJIB** menggunakan **TanStack Query** (React Query) untuk menangani *data fetching*, *caching*, dan *state synchronization*, kecuali jika fitur tersebut sangat sederhana dan tidak membutuhkan query state, baru diperbolehkan menggunakan Axios biasa.
- **Axios Instance:** Semua pemanggilan API ke backend **WAJIB** menggunakan **Axios Instance** terpusat (contoh: `apiClient` / `axiosInstance`) yang menangani `baseURL`, *headers*, *interceptors*, dan penanganan error standar.

## 3. Struktur Component & Colocation
- **Global Components:** Komponen UI yang dibangun di atas Shadcn UI dan digunakan di **lebih dari satu page/halaman** harus disimpan di folder komponen global (misal: `src/components/global/` atau `src/components/common/`).
- **Page-Specific Components:** Komponen yang **hanya digunakan khusus** untuk halaman tertentu harus disimpan di dalam folder komponen lokal milik page tersebut (contoh: `src/pages/dashboard/components/` atau `src/app/dashboard/_components/`).

## 4. Struktur Services & API Routing
- **Global Services:** Jika sebuah panggilan API / Service digunakan di banyak tempat (lintas halaman), simpan di folder service global (misal: `src/services/` atau `src/api/`).
- **Page-Specific Services:** Jika API hanya digunakan untuk page tertentu, simpan file service di dalam folder page tersebut.
- **Sub-pages / Dynamic Routes (`[id]`):** Jika halaman memiliki sub-page (seperti detail `/users/[id]` atau sub-route lain), **tetap gabungkan dan gunakan 1 file service utama** yang berada di dalam folder parent page tersebut (tidak perlu membuat file service terpisah per sub-route).