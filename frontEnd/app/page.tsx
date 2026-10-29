"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Receipt,
  Printer,
  Boxes,
  Users,
  Building2,
  ChevronDown,
  Shield,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  Wallet,
  TrendingUp,
  Search,
  ScanLine,
  CreditCard,
  QrCode,
  DollarSign,
  AlertTriangle,
  History,
  ShoppingBag,
  CircleDot,
  Terminal,
  Layers,
  BarChart2,
  ChevronRight,
  PackageCheck,
  BadgePercent,
  Cpu,
  Database,
  Cloud,
  CheckCheck,
  SlidersHorizontal,
  FileSpreadsheet,
  Coins,
  Tag,
  Gift,
  Coffee,
  Shirt,
  Scissors,
  Pill,
  HelpCircle,
  ShieldCheck,
  Percent,
  Send,
  Sliders,
  Monitor,
  HardDrive,
} from "lucide-react"

export default function LandingPage() {
  const { token } = useAuth()
  const [selectedIndustry, setSelectedIndustry] = useState<"retail" | "fnb" | "fashion" | "service">("retail")
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const industryData = {
    retail: {
      title: "Minimarket, Toko Sembako & Retail",
      icon: Store,
      badge: "Retail & Kelontong",
      description: "Kasir cepat untuk toko dengan ribuan barang. Scan barcode instan, cetak struk thermal 58mm/80mm, dan notifikasi otomatis saat stok barang mulai habis.",
      features: [
        "Scan barcode kilat via USB atau scanner wireless",
        "Pencatatan varian & satuan bertingkat (Pcs, Lusin, Dus)",
        "Notifikasi stok kritis sebelum barang kosong di rak",
        "Laporan laba kotor dan laba bersih otomatis per item",
      ],
      sampleProducts: [
        { name: "Minyak Goreng Sania 2L", code: "BRG-019", price: "Rp 34.000", stock: 14, tag: "Sembako" },
        { name: "Beras Rojolele 5kg", code: "BRG-042", price: "Rp 72.500", stock: 8, tag: "Sembako" },
        { name: "Gula Pasir Gulaku 1kg", code: "BRG-088", price: "Rp 16.000", stock: 35, tag: "Kebutuhan" },
      ],
    },
    fnb: {
      title: "Cafe, Kedai Kopi, Resto & F&B",
      icon: Coffee,
      badge: "Resto & Minuman",
      description: "Bikin antrean lancar saat jam makan siang. Bisa tahan pesanan (Hold Order), atur kas modal shift kasir, dan pantau menu paling laris tiap hari.",
      features: [
        "Fitur Tahan & Lanjutkan Transaksi (Hold / Resume pesanan)",
        "Pemisahan uang modal laci kasir (Petty Cash) per shift",
        "Hitung HPP bahan baku dan margin profit minuman/makanan",
        "Bisa cetak struk dapur dan struk pelanggan terpisah",
      ],
      sampleProducts: [
        { name: "Kopi Susu Gula Aren", code: "FNB-001", price: "Rp 22.000", stock: 45, tag: "Best Seller" },
        { name: "Roti Bakar Cokelat Keju", code: "FNB-012", price: "Rp 18.000", stock: 20, tag: "Snack" },
        { name: "Matcha Latte Ice", code: "FNB-008", price: "Rp 26.000", stock: 30, tag: "Minuman" },
      ],
    },
    fashion: {
      title: "Distro, Toko Pakaian & Butik",
      icon: Shirt,
      badge: "Fashion & Apparel",
      description: "Kelola pakaian dengan beragam ukuran dan warna tanpa pusing. Catat data member pelanggan dan berikan diskon otomatis saat promo.",
      features: [
        "Manajemen SKU varian ukuran (S, M, L, XL) dan warna",
        "Database pelanggan & pencatatan nomor WhatsApp member",
        "Fitur diskon persen atau nominal langsung di kasir",
        "Cetak barcode label pakaian sendiri",
      ],
      sampleProducts: [
        { name: "Kaos Polos Heavy Cotton (L)", code: "APP-021", price: "Rp 85.000", stock: 16, tag: "T-Shirt" },
        { name: "Kemeja Flannel Tartan (M)", code: "APP-033", price: "Rp 145.000", stock: 6, tag: "Kemeja" },
        { name: "Celana Chino Slim Fit (32)", code: "APP-054", price: "Rp 175.000", stock: 9, tag: "Celana" },
      ],
    },
    service: {
      title: "Barbershop, Laundry & Jasa",
      icon: Scissors,
      badge: "Jasa & Treatment",
      description: "Cocok untuk usaha jasa per layanan. Catat nama pelanggan, pilih staf yang mengerjakan, dan rekap total omzet harian dengan mudah.",
      features: [
        "Pencatatan jenis layanan dan staf yang bertugas",
        "Riwayat kunjungan dan transaksi tiap pelanggan",
        "Rekap setoran kas kasir harian bebas selisih",
        "Bisa diakses dari tablet iPad/Android tanpa install ribet",
      ],
      sampleProducts: [
        { name: "Paket Potong Rambut + Cuci", code: "SRV-001", price: "Rp 45.000", stock: 999, tag: "Haircut" },
        { name: "Hair Spa / Creambath 45 Min", code: "SRV-004", price: "Rp 65.000", stock: 999, tag: "Treatment" },
        { name: "Pewarnaan Rambut Basic", code: "SRV-009", price: "Rp 120.000", stock: 999, tag: "Coloring" },
      ],
    },
  }

  const faqs = [
    {
      q: "Apakah theKasir butuh mesin kasir khusus yang mahal?",
      a: "Tidak perlu. theKasir bisa langsung dibuka dari laptop (Windows/Mac), tablet (iPad/Android), atau smartphone yang sudah Anda miliki lewat browser.",
    },
    {
      q: "Printer dan scanner apa saja yang didukung?",
      a: "theKasir kompatibel dengan hampir semua printer thermal struk 58mm dan 80mm (koneksi USB, Bluetooth, maupun LAN/WiFi), barcode scanner kabel USB maupun wireless, serta laci uang (cash drawer) dengan kabel RJ11.",
    },
    {
      q: "Bagaimana cara kerja AI Assistant di theKasir?",
      a: "Asisten AI terhubung secara read-only dengan data penjualan toko Anda. AI menganalisis produk mana yang paling cepat habis, jam-jam tersibuk kasir, dan memberikan rekomendasi belanja stok tanpa bisa mengubah atau menghapus data toko Anda.",
    },
    {
      q: "Apakah saya bisa punya lebih dari 1 cabang toko?",
      a: "Bisa. Akun Owner dapat membuat dan mengelola banyak cabang toko langsung dari sidebar aplikasi dan berpindah antar cabang dalam 1 klik tanpa harus keluar-masuk akun.",
    },
    {
      q: "Bagaimana pengaturan staf kasir agar tidak bisa melihat laporan keuangan?",
      a: "theKasir membagi akses menjadi 3 tingkatan: Owner (kontrol penuh & tambah cabang), Admin (kelola barang, supplier, dan laporan), serta Kasir (hanya bisa buka terminal POS dan kas laci shift).",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* HEADER / NAVBAR */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo in Royal Blue */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              tK
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">theKasir</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                v2.0 AI
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur Kasir</a>
            <a href="#alur-kerja" className="hover:text-blue-600 transition-colors">Alur Toko</a>
            <a href="#sektor" className="hover:text-blue-600 transition-colors">Jenis Usaha</a>
            <a href="#multi-cabang" className="hover:text-blue-600 transition-colors">Multi-Cabang</a>
            <a href="#hardware" className="hover:text-blue-600 transition-colors">Hardware</a>
            <a href="#harga" className="hover:text-blue-600 transition-colors">Harga</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {token ? (
              <Link href="/pos">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 h-9 rounded-lg gap-1.5 shadow-md shadow-blue-600/20">
                  <Store className="w-3.5 h-3.5" />
                  <span>Buka Terminal Kasir</span>
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 h-9 px-3.5 rounded-lg">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-9 px-4.5 rounded-lg shadow-md shadow-blue-600/20 hover:scale-105 transition-all">
                    Daftar Gratis
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* =========================================================================
          1. [HERO SECTION] BACKGROUND FOTO KASIR NYATA (BLURRED & ATMOSPHERIC)
         ========================================================================= */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Background Real Cashier Image with Clean Blur & Soft Overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img
            src="/cashier-flow.jpg"
            alt="Suasana Kasir Toko"
            className="w-full h-full object-cover object-center filter blur-[2.5px] scale-105 opacity-50"
          />
          {/* Subtle White Gradient Overlay so the image is clearly visible while text is crisp */}
          <div className="absolute inset-0 bg-white/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/50 to-white" />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Floating Feature Chip Left (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl shadow-blue-500/10 absolute top-20 left-0 animate-in fade-in slide-in-from-left duration-500 hover:scale-105 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-900">Scan &lt; 0.2 Detik</div>
              <div className="text-[10px] text-slate-500 font-medium">Barcode Scanner Kilat</div>
            </div>
          </div>

          {/* Floating Feature Chip Right (Desktop) */}
          <div className="hidden lg:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl shadow-blue-500/10 absolute top-20 right-0 animate-in fade-in slide-in-from-right duration-500 hover:scale-105 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="text-xs font-extrabold text-slate-900">Laba Bersih Real-Time</div>
              <div className="text-[10px] text-slate-500 font-medium">HPP &amp; Profit Akurat</div>
            </div>
          </div>

          {/* Top Release Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-blue-200 text-xs font-semibold text-blue-700 mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>theKasir POS Indonesia — Siap untuk Toko Retail &amp; F&amp;B</span>
          </div>

          {/* Real-World Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.12] max-w-4xl mx-auto mb-6">
            Kasir cepat tanpa lemot. <br className="hidden sm:inline" />
            <span className="text-blue-600">Laporan omzet rapi</span> tanpa selisih.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-2xl mx-auto mb-8 leading-relaxed font-medium">
            Aplikasi kasir lengkap untuk minimarket, cafe, distro, dan toko kelontong. Scan barcode kilat, cetak struk thermal, catat shift kas laci, dan pantau multi-cabang dari mana saja.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-12 px-7 rounded-xl text-sm font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-600/25 gap-2 hover:scale-105 transition-all">
                <span>Daftar Akun Owner — Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-6 rounded-xl text-sm font-bold border-slate-300 bg-white/95 hover:bg-slate-50 text-slate-800 shadow-md gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span>Coba Demo Cepat (Kasir / Admin)</span>
              </Button>
            </Link>
          </div>

          {/* Realistic Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-700 mb-12">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
              <span>Mulai tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
              <span>Support printer thermal 58/80mm</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
              <span>Multi-toko dalam 1 akun</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-xs px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
              <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
              <span>Asisten AI Gemini 2.0</span>
            </div>
          </div>

          {/* REAL POS TERMINAL INTERACTIVE SHOWCASE */}
          <div className="max-w-5xl mx-auto rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-600/10 overflow-hidden text-left relative">
            {/* Mockup Window Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <span className="text-xs font-semibold text-slate-700 ml-2 font-mono">
                  theKasir POS — Toko Berkah Mart (Cabang Utama)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Shift: Siti (Kasir 1)
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  Modal Laci: Rp 200.000
                </span>
              </div>
            </div>

            {/* POS Terminal Screen Grid */}
            <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-50/40">
              {/* Product Catalog Grid (Left 7 Cols) */}
              <div className="md:col-span-7 space-y-3">
                {/* Search Bar Barcode Simulation */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 shadow-xs">
                  <ScanLine className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-400 font-mono">Scan barcode atau ketik nama produk... [F2]</span>
                </div>

                {/* Product Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: "Kopi Kenangan Mantan", cat: "Minuman", price: "Rp 18.000", stock: 24 },
                    { name: "Indomie Goreng Jumbo", cat: "Makanan", price: "Rp 4.500", stock: 85 },
                    { name: "Le Minerale 600ml", cat: "Minuman", price: "Rp 3.500", stock: 120 },
                    { name: "Croissant Butter Keju", cat: "Bakery", price: "Rp 16.000", stock: 12 },
                    { name: "Teh Botol Sosro Kotak", cat: "Minuman", price: "Rp 4.000", stock: 48 },
                    { name: "Biskuit Roma Kelapa", cat: "Snack", price: "Rp 10.500", stock: 30 },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-3 bg-white rounded-xl border border-slate-200/90 hover:border-blue-500 shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                          {item.cat}
                        </span>
                        <div className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">{item.name}</div>
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-1.5 border-t border-slate-100">
                        <span className="text-xs font-black text-blue-600">{item.price}</span>
                        <span className="text-[10px] text-slate-400">Stok: {item.stock}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart & Checkout Panel (Right 5 Cols) */}
              <div className="md:col-span-5 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">Struk Transaksi #TK-2026-0841</span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      Pelanggan: Umum
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="py-2.5 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">2x Kopi Kenangan Mantan</div>
                        <div className="text-[10px] text-slate-400">@Rp 18.000</div>
                      </div>
                      <span className="font-bold text-slate-900">Rp 36.000</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">1x Croissant Butter Keju</div>
                        <div className="text-[10px] text-slate-400">@Rp 16.000</div>
                      </div>
                      <span className="font-bold text-slate-900">Rp 16.000</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">2x Le Minerale 600ml</div>
                        <div className="text-[10px] text-slate-400">@Rp 3.500</div>
                      </div>
                      <span className="font-bold text-slate-900">Rp 7.000</span>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal (5 Item)</span>
                    <span className="text-slate-800 font-semibold">Rp 59.000</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>PPN 11%</span>
                    <span className="text-slate-800 font-semibold">Rp 6.490</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-100">
                    <span>TOTAL TAGIHAN</span>
                    <span className="text-base text-blue-600 font-black">Rp 65.490</span>
                  </div>

                {/* Payment Methods */}
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[11px]">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold text-center">
                    💵 Tunai
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-center">
                    📱 QRIS
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-center">
                    💳 Transfer
                  </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 rounded-lg shadow-md shadow-blue-600/20 mt-1">
                  Selesaikan Pembayaran &amp; Cetak Struk (Enter)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* =========================================================================
          2. [IKON] STRIP INTEGRASI PERANGKAT DENGAN PATTERN BACKGROUND IKON
         ========================================================================= */}
      <section className="py-12 bg-blue-50/50 border-y border-blue-100 relative overflow-hidden">
        {/* Background Wallpaper Pattern */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none flex flex-wrap gap-12 justify-around items-center select-none">
          <Printer className="w-20 h-20 text-blue-900" />
          <ScanLine className="w-20 h-20 text-blue-900" />
          <Wallet className="w-20 h-20 text-blue-900" />
          <Building2 className="w-20 h-20 text-blue-900" />
          <Sparkles className="w-20 h-20 text-blue-900" />
          <Cloud className="w-20 h-20 text-blue-900" />
          <QrCode className="w-20 h-20 text-blue-900" />
          <Receipt className="w-20 h-20 text-blue-900" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-6">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-blue-200 shadow-xs">
              Terhubung Langsung dengan Ekosistem Toko
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 text-center">
            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Printer Thermal</span>
              <span className="text-[10px] text-slate-500 font-medium">58mm &amp; 80mm Struk</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ScanLine className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Barcode Scanner</span>
              <span className="text-[10px] text-slate-500 font-medium">1D &amp; 2D QR Code</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Laci Uang Kasir</span>
              <span className="text-[10px] text-slate-500 font-medium">Auto Kick RJ11</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Multi-Cabang</span>
              <span className="text-[10px] text-slate-500 font-medium">1 Akun Banyak Outlet</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">AI Gemini 2.0</span>
              <span className="text-[10px] text-slate-500 font-medium">Prediksi Stok Cerdas</span>
            </div>

            <div className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white border border-blue-100 shadow-sm hover:scale-105 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-900">Cloud Real-Time</span>
              <span className="text-[10px] text-slate-500 font-medium">Backup Otomatis Aman</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. [GAMBAR] ALUR HARIAN TOKO DENGAN GAMBAR KASIR & QRIS NYATA
         ========================================================================= */}
      <section id="alur-kerja" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto relative">
        <div className="text-center space-y-2 mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span>Alur Kerja Nyata</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Dari Buka Shift Pagi Sampai Tutup Buku Malam
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            theKasir menemani seluruh siklus operasional harian toko tanpa ribet.
          </p>
        </div>

        {/* Real Cashier Illustration Showcase Card */}
        <div className="mb-10 rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-full min-h-[300px]">
            <img
              src="/cashier-flow.jpg"
              alt="Alur Transaksi Kasir dan Pelanggan"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden" />
            <div className="absolute bottom-4 left-4 text-white lg:hidden">
              <span className="text-xs font-bold bg-blue-600 px-2.5 py-1 rounded-md">Kasir Live</span>
            </div>
          </div>

          <div className="lg:col-span-6 p-6 sm:p-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Pengalaman Checkout Tanpa Antrean Panjang</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              Kasir Cepat, Pelanggan Puas, Uang Masuk Otomatis
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Pelanggan cukup scan QRIS atau bayar tunai, kasir scan barcode secepat kilat, dan struk belanja langsung tercetak otomatis dalam hitungan detik.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>QRIS Dinamis / Statis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Struk Thermal Otomatis</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Koneksi Scanner Wireless</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Notifikasi Member WhatsApp</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Daily Shift Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4 hover:border-blue-500 transition-all hover:shadow-xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base border border-blue-200 group-hover:scale-110 transition-transform">
              01
            </div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pagi: 08.00 WIB</div>
            <h3 className="text-lg font-bold text-slate-900">Buka Shift &amp; Catat Uang Laci</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kasir memasukkan modal awal kas laci. Sistem langsung mengunci sesi kasir agar tidak ada uang yang tercampur antar penjaga toko.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Modal Awal:</span>
                <span className="font-bold text-blue-600">Rp 200.000</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Status Kasir:</span>
                <span className="text-emerald-600 font-bold">🟢 Aktif &amp; Terkunci</span>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4 hover:border-blue-500 transition-all hover:shadow-xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base border border-blue-200 group-hover:scale-110 transition-transform">
              02
            </div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Siang: 12.30 WIB</div>
            <h3 className="text-lg font-bold text-slate-900">Transaksi Kilat &amp; Tahan Pesanan</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Scan barcode cepat, terima pembayaran QRIS/Tunai, cetak struk otomatis. Jika pelanggan ingin menambah belanjaan, kasir bisa menahan (Hold) struk sementara.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Kecepatan Scan:</span>
                <span className="font-bold text-blue-600">0.2 Detik</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Hold Transaksi:</span>
                <span className="text-amber-600 font-bold">1 Pesanan Tertahan</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-md space-y-4 hover:border-blue-500 transition-all hover:shadow-xl relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-base border border-blue-200 group-hover:scale-110 transition-transform">
              03
            </div>
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider">Malam: 21.30 WIB</div>
            <h3 className="text-lg font-bold text-slate-900">Tutup Shift &amp; Laporan Rekonsiliasi</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Kasir menghitung uang fisik dan mencocokkannya dengan rekap sistem. Owner langsung menerima rekap omzet dan laba bersih di dashboard tanpa menunggu laporan kertas.
            </p>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Rekap Selisih:</span>
                <span className="font-bold text-emerald-600">Rp 0 (Cocok)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Laba Bersih Hari Ini:</span>
                <span className="text-blue-600 font-bold">+ Rp 1.450.000</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. [IKON] FITUR LENGKAP & PILAR UTAMA KASIR (DINDING IKON)
         ========================================================================= */}
      <section id="fitur" className="py-20 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden">
        {/* Background Icon Wall */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-16 justify-between items-center select-none p-12">
          <Zap className="w-24 h-24 text-slate-900" />
          <ShieldCheck className="w-24 h-24 text-slate-900" />
          <Cpu className="w-24 h-24 text-slate-900" />
          <Database className="w-24 h-24 text-slate-900" />
          <BadgePercent className="w-24 h-24 text-slate-900" />
          <Coins className="w-24 h-24 text-slate-900" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-2 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <span>Fitur Lengkap</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Semua Perkakas Toko dalam Satu Aplikasi
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:border-blue-500 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kasir Point-of-Sale (POS) Kilat</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dirancang dengan keyboard shortcut profesional (F2 cari, F9 bayar, Enter cetak). Navigasi tanpa mouse agar antrean pelanggan cepat selesai.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Barcode Scanner Kilat</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Diskon &amp; Pajak Fleksibel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Cetak Struk Thermal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Hold &amp; Resume Transaksi</span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:border-blue-500 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Wallet className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Shift Kasir &amp; Rekonsiliasi Kas Laci</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Catat modal awal kasir, pengeluaran kas kecil (petty cash), hingga setoran akhir shift. Menghilangkan selisih uang yang sering terjadi saat ganti penjaga toko.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Catat Modal Awal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Uang Masuk / Keluar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Rekap Selisih Otomatis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Riwayat Sesi Lengkap</span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 hover:border-blue-500 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Multi-Toko &amp; Multi-Cabang Instan</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Punya 2 toko atau lebih? Cukup buat workspace baru di dalam aplikasi. Beralih antar cabang semudah mengklik nama toko di pojok kiri atas tanpa login ulang.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>1 Akun Owner untuk Semua Toko</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Isolasi Data Database Aman</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Staf Kasir Terpisah Tiap Toko</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Switch Cabang 1 Detik</span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="p-6 sm:p-8 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-sm space-y-4 hover:border-blue-500 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Asisten AI Gemini &amp; Prediksi Stok</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AI menganalisis kecepatan penjualan per produk dan menghitung berapa hari lagi stok akan habis agar Anda bisa memesan ke supplier tepat waktu.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Prediksi Hari Stok Habis</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Tanya Jawab Chatbot AI</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Analisis Jam Ramai Toko</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />
                  <span>Hitung Margin Laba Bersih</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. [GAMBAR] MULTI-CABANG & MANAJEMEN OUTLET DENGAN FOTO MANAGER
         ========================================================================= */}
      <section id="multi-cabang" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 p-6 sm:p-10 space-y-5 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              <Building2 className="w-4 h-4" />
              <span>Multi-Outlet Management</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pantau Banyak Cabang dari Satu Layar Dashboard
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Buka cabang kedua, ketiga, atau gudang baru dengan mudah. Semua data penjualan, stok barang per toko, dan kinerja staf kasir terintegrasi otomatis.
            </p>
            <div className="space-y-2.5 pt-2 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Bebas buat workspace cabang tanpa instalasi server baru</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Laporan konsolidasi omzet seluruh toko dalam 1 klik</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 stroke-[3]" />
                <span>Hak akses kasir terisolasi hanya untuk cabang tempat mereka bertugas</span>
              </div>
            </div>
            <div className="pt-2">
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-md">
                  Mulai Buat Cabang Pertama
                </Button>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 relative h-72 sm:h-96 lg:h-full min-h-[360px] order-1 lg:order-2">
            <img
              src="/multi-branch.jpg"
              alt="Manajemen Multi-Cabang theKasir"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. [IKON] KOMPATIBILITAS HARDWARE DENGAN IKON PERANGKAT
         ========================================================================= */}
      <section id="hardware" className="py-20 bg-blue-50/40 border-t border-slate-200/80 relative overflow-hidden">
        {/* Background Device Icons */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-20 justify-around items-center select-none p-8">
          <Monitor className="w-28 h-28 text-blue-900" />
          <Smartphone className="w-28 h-28 text-blue-900" />
          <Printer className="w-28 h-28 text-blue-900" />
          <ScanLine className="w-28 h-28 text-blue-900" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-2 mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-blue-200 text-xs font-bold text-blue-700 shadow-xs">
              <span>Kompabilitas Perangkat</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Gunakan Perangkat yang Sudah Anda Miliki
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
              Tidak perlu mengganti alat kasir lama. theKasir siap terhubung langsung.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2.5 shadow-sm hover:border-blue-500 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Laptop className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Laptop &amp; PC</h4>
              <p className="text-[11px] text-slate-600">Windows, MacOS, Linux via browser Chrome / Edge.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2.5 shadow-sm hover:border-blue-500 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Tablet &amp; HP</h4>
              <p className="text-[11px] text-slate-600">iPad, Android Tablet, dan smartphone responsif 100%.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2.5 shadow-sm hover:border-blue-500 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Printer className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Printer Thermal</h4>
              <p className="text-[11px] text-slate-600">Kertas 58mm &amp; 80mm via Bluetooth, USB, atau WiFi.</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white text-center space-y-2.5 shadow-sm hover:border-blue-500 hover:scale-105 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <ScanLine className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Barcode Scanner</h4>
              <p className="text-[11px] text-slate-600">Scanner 1D/2D kabel USB maupun wireless Bluetooth.</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. [GAMBAR] TABEL HARGA & PAKET BIAYA TRANSPARAN
         ========================================================================= */}
      <section id="harga" className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            <span>Biaya Transparan</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Investasi Terjangkau untuk Usaha Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Mulai gratis selamanya untuk toko pertama, tambah cabang kapan saja.
          </p>

          {/* Toggle Billing */}
          <div className="inline-flex items-center gap-2 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold mt-4">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-3.5 py-1.5 rounded-md transition-all cursor-pointer ${
                billingPeriod === "monthly" ? "bg-blue-600 text-white font-bold shadow-xs" : "text-slate-600"
              }`}
            >
              Bayar Bulanan
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                billingPeriod === "yearly" ? "bg-blue-600 text-white font-bold shadow-xs" : "text-slate-600"
              }`}
            >
              <span>Bayar Tahunan</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Hemat 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Starter Plan */}
          <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Starter UMKM</h3>
                <p className="text-xs text-slate-500 mt-1">Untuk toko rintisan yang ingin langsung jualan.</p>
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                Rp 0 <span className="text-xs font-normal text-slate-500">/ selamanya</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> 1 Toko / Workspace Aktif</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Hingga 2 Akun Staf Kasir</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Transaksi Kasir Tanpa Batas</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Cetak Struk Bluetooth &amp; USB</div>
                <div className="flex items-center gap-2 text-slate-400 line-through"><Check className="w-4 h-4 text-slate-300" /> Asisten AI Gemini</div>
              </div>
            </div>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs font-bold h-10 rounded-xl border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs">
                Daftar Gratis
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="p-6 sm:p-7 rounded-2xl border-2 border-blue-600 bg-blue-50/30 flex flex-col justify-between space-y-6 shadow-xl shadow-blue-600/10 relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900">Premium Pro + AI</h3>
                <Badge className="bg-blue-600 text-white text-[10px] font-bold border-none">Rekomendasi</Badge>
              </div>
              <p className="text-xs text-slate-600">Untuk bisnis berkembang dengan fitur AI &amp; cabang tambahan.</p>
              <div className="text-3xl font-black text-blue-600 font-mono">
                {billingPeriod === "monthly" ? "Rp 89.000" : "Rp 69.000"}
                <span className="text-xs font-normal text-slate-500"> / bulan</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-800 pt-4 border-t border-blue-100 font-medium">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 font-bold stroke-[3]" /> <strong>Maksimal 2 Cabang Toko (Workspace)</strong></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 font-bold stroke-[3]" /> <strong>Hingga 10 Karyawan Berbeda Login</strong></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Asisten AI Gemini 2.0 &amp; Prediksi Stok</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Laporan HPP &amp; Laba Bersih Real-Time</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Transaksi Kasir Tanpa Batas</div>
              </div>
            </div>
            <Link href="/register">
              <Button className="w-full text-xs font-bold h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25">
                Pilih Paket Premium
              </Button>
            </Link>
          </div>

          {/* Multi Outlet Plan */}
          <div className="p-6 sm:p-7 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Platinum Enterprise</h3>
                <p className="text-xs text-slate-500 mt-1">Solusi komprehensif untuk pemilik jaringan cabang luas.</p>
              </div>
              <div className="text-3xl font-black text-slate-900 font-mono">
                {billingPeriod === "monthly" ? "Rp 199.000" : "Rp 159.000"}
                <span className="text-xs font-normal text-slate-500"> / bulan</span>
              </div>
              <div className="space-y-2.5 text-xs text-slate-700 pt-4 border-t border-slate-100 font-medium">
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> <strong>Hingga 10 Cabang Toko (Workspace)</strong></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> <strong>Hingga 10 Karyawan Berbeda Login</strong></div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Rekap Laporan Gabungan Semua Cabang</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Audit Log Riwayat Staf Lengkap</div>
                <div className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-600 stroke-[3]" /> Bantuan Teknis Prioritas 24/7</div>
              </div>
            </div>
            <Link href="/register">
              <Button variant="outline" className="w-full text-xs font-bold h-10 rounded-xl border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-xs">
                Mulai Platinum
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. [IKON] FAQ (PERTANYAAN POPULER)
         ========================================================================= */}
      <section id="faq" className="py-20 bg-slate-50/70 border-t border-slate-200/80 relative overflow-hidden">
        {/* Background Question Icons */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex flex-wrap gap-20 justify-around items-center select-none p-8">
          <HelpCircle className="w-28 h-28 text-slate-900" />
          <Shield className="w-28 h-28 text-slate-900" />
          <Store className="w-28 h-28 text-slate-900" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center space-y-2 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
              <span>Pertanyaan Populer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition-colors cursor-pointer hover:border-blue-400 shadow-xs"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180 text-blue-600" : ""}`} />
                  </div>
                  {isOpen && (
                    <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. [GAMBAR] FINAL CALL TO ACTION BANNER
         ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-blue-600 text-white p-8 sm:p-12 text-center space-y-6 shadow-2xl shadow-blue-600/30 relative overflow-hidden">
          {/* Decorative Store Vector Silhouette */}
          <div className="absolute -right-12 -bottom-12 opacity-15 pointer-events-none">
            <Store className="w-72 h-72 text-white" />
          </div>

          <div className="max-w-2xl mx-auto space-y-2 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Mulai Pakai theKasir Sekarang
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
              Daftar akun Owner gratis dalam 1 menit. Buat toko pertama Anda dan kelola penjualan harian dengan lebih cepat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10 pt-1">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 px-7 rounded-lg text-xs font-black bg-white text-blue-900 hover:bg-slate-100 shadow-xl hover:scale-105 transition-all">
                Daftar Akun Owner — Gratis
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 px-6 rounded-lg text-xs font-bold bg-blue-700/80 hover:bg-blue-800 text-white border border-blue-400/40">
                Masuk ke Akun Saya
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200/80 py-8 px-4 sm:px-6 text-xs text-slate-500 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600 text-white font-black text-xs flex items-center justify-center">
              tK
            </div>
            <span className="font-bold text-slate-800">theKasir POS</span>
            <span>— Sistem Kasir &amp; Manajemen Toko Indonesia</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} theKasir. Hak cipta dilindungi.
          </div>
        </div>
      </footer>
    </div>
  )
}
