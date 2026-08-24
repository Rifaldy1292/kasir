package gemini

import (
	"fmt"
)

func BuildBusinessChatSystemPrompt(businessName, currency string, contextData string) string {
	return fmt.Sprintf(`Anda adalah theKasir AI Assistant, asisten kecerdasan bisnis cerdas untuk aplikasi Point of Sale (POS) "%s".
Tugas Anda adalah membantu pemilik toko (Owner/Admin) dan kasir dalam memahami performa bisnis, mengelola stok, menganalisis penjualan, serta memberikan rekomendasi strategis secara ramah, profesional, dan to-the-point dalam Bahasa Indonesia.

Mata uang yang digunakan: %s.

Berikut adalah SNAPSHOT DATA BISNIS REAL-TIME SAAT INI:
----------------------------------------
%s
----------------------------------------

Pedoman Jawaban:
1. Jawablah berdasarkan data nyata di atas. Jangan mengarang angka atau data yang tidak ada di snapshot.
2. Jika ditanya data yang tidak tersedia di snapshot, jelaskan dengan sopan bahwa data spesifik tersebut belum tercatat atau belum tersedia.
3. Berikan jawaban yang ringkas, terstruktur (gunakan bullet points jika membantu), dan mudah dipahami.
4. Jika menemukan anomali atau stok menipis, ingatkan pengguna secara proaktif dengan solusi praktis.
5. Format nominal uang dengan format yang rapi (misalnya: Rp 150.000).`, businessName, currency, contextData)
}

func BuildInsightsPrompt(businessName string, contextData string) string {
	return fmt.Sprintf(`Analisis data bisnis "%s" berikut dan berikan wawasan bisnis (insights) strategis yang dapat ditindaklanjuti.

DATA BISNIS:
%s

Kembalikan HANYA format JSON murni berupa array of objects (tanpa markdown backticks, tanpa teks pengantar):
[
  {
    "type": "trend | warning | opportunity | anomaly",
    "title": "Judul singkat dan menarik",
    "description": "Deskripsi insight berdasarkan fakta data",
    "recommendation": "Saran aksi konkret yang perlu diambil",
    "severity": "positive | warning | danger | info"
  }
]

Hasilkan antara 3 sampai 6 insight yang paling penting dan berdampak nyata bagi bisnis.`, businessName, contextData)
}

func BuildStockPredictionPrompt(businessName string, contextData string) string {
	return fmt.Sprintf(`Analisis data stok dan riwayat penjualan produk untuk toko "%s" berikut.
Hitung dan prediksikan estimasi sisa hari sebelum stok habis, tanggal restock yang disarankan, kuantitas restock optimal, dan catatan analitis.

DATA PRODUK & PENJUALAN:
%s

Kembalikan HANYA format JSON murni berupa array of objects (tanpa markdown backticks, tanpa teks pengantar):
[
  {
    "product_id": 1,
    "product_name": "Nama Produk",
    "current_stock": 10,
    "avg_daily_sales": 2.5,
    "estimated_days_remaining": 4,
    "recommended_restock_date": "YYYY-MM-DD",
    "recommended_restock_qty": 30,
    "ai_notes": "Analisis singkat kenapa perlu restock atau pola penjualannya"
  }
]`, businessName, contextData)
}

func BuildProductSearchPrompt(query string, catalogJSON string) string {
	return fmt.Sprintf(`Tugas Anda adalah melakukan semantic search pada katalog produk POS berdasarkan kebutuhan pencarian kasir/pelanggan.
Cari produk yang paling relevan dengan kueri: "%s"

KATALOG PRODUK:
%s

Kembalikan HANYA format JSON murni berupa array ID produk yang paling relevan (diurutkan dari yang paling cocok hingga yang kurang cocok, maksimal 10 produk):
[1, 5, 12]

Jika tidak ada produk yang cocok sama sekali, kembalikan: []`, query, catalogJSON)
}
