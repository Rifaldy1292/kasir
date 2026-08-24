"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { AIChatWidget } from "@/components/global/ai-chat-widget"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sparkles,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShoppingCart,
  ArrowLeft,
  Calendar,
  Layers,
  AlertCircle,
} from "lucide-react"

interface StockPrediction {
  product_id: number
  product_name: string
  current_stock: number
  avg_daily_sales: number
  estimated_days_remaining: number
  recommended_restock_date: string
  recommended_restock_qty: number
  ai_notes: string
}

export default function AIPredictionPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "CRITICAL" | "WARNING" | "SAFE">("ALL")

  const {
    data: predictionsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["ai-stock-predictions"],
    queryFn: async () => {
      const res = await apiClient.get("/ai/stock-prediction")
      return res.data.data as StockPrediction[]
    },
  })

  const predictions = predictionsData || []

  // Metrics calculation
  const criticalCount = predictions.filter((p) => p.estimated_days_remaining <= 3).length
  const warningCount = predictions.filter(
    (p) => p.estimated_days_remaining > 3 && p.estimated_days_remaining <= 7
  ).length
  const safeCount = predictions.filter((p) => p.estimated_days_remaining > 7).length

  // Filter items
  const filteredPredictions = predictions.filter((p) => {
    const matchesSearch = p.product_name.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false

    if (statusFilter === "CRITICAL") return p.estimated_days_remaining <= 3
    if (statusFilter === "WARNING")
      return p.estimated_days_remaining > 3 && p.estimated_days_remaining <= 7
    if (statusFilter === "SAFE") return p.estimated_days_remaining > 7

    return true
  })

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader
          title="Prediksi & Proyeksi Stok AI"
          subtitle="Estimasi waktu habis dan rekomendasi kuantitas restock berbasis kecerdasan buatan"
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Banner & Quick Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border border-primary/20">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-foreground">AI Stock Depletion Forecasting</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                    Gemini Intelligence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Menganalisis kecepatan penjualan 30 hari terakhir untuk memprediksi tanggal stok habis.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link href="/inventory">
                <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-border">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Kembali ke Stok</span>
                </Button>
              </Link>
              <Button
                onClick={() => refetch()}
                disabled={isFetching}
                size="sm"
                className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
                <span>{isFetching ? "Menghitung..." : "Perbarui Prediksi"}</span>
              </Button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Produk Dianalisis
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Layers className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-foreground">{predictions.length}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Katalog produk aktif</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Kritis (≤ 3 Hari)
                </CardTitle>
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-rose-600">{criticalCount}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Perlu restock hari ini juga</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Waspada (4 - 7 Hari)
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-amber-600">{warningCount}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Siapkan purchase order</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stok Aman (&gt; 7 Hari)
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 rounded-lg" />
                ) : (
                  <div className="text-2xl font-black text-emerald-600">{safeCount}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Persediaan mencukupi</p>
              </CardContent>
            </Card>
          </div>

          {/* Table Card */}
          <Card className="shadow-xs border-border">
            <CardHeader className="p-5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border">
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Rekomendasi Restock &amp; Proyeksi Stok
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Daftar produk dengan analisis kecepatan keluar barang dan saran pemesanan ulang
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    placeholder="Cari nama produk..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-9 text-xs bg-muted/30 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border">
                  <Button
                    size="sm"
                    variant={statusFilter === "ALL" ? "default" : "ghost"}
                    className="h-7 text-xs px-2.5"
                    onClick={() => setStatusFilter("ALL")}
                  >
                    Semua
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "CRITICAL" ? "default" : "ghost"}
                    className={`h-7 text-xs px-2.5 ${
                      statusFilter === "CRITICAL" ? "bg-rose-600 text-white" : "text-rose-600"
                    }`}
                    onClick={() => setStatusFilter("CRITICAL")}
                  >
                    Kritis
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "WARNING" ? "default" : "ghost"}
                    className={`h-7 text-xs px-2.5 ${
                      statusFilter === "WARNING" ? "bg-amber-600 text-white" : "text-amber-600"
                    }`}
                    onClick={() => setStatusFilter("WARNING")}
                  >
                    Waspada
                  </Button>
                  <Button
                    size="sm"
                    variant={statusFilter === "SAFE" ? "default" : "ghost"}
                    className={`h-7 text-xs px-2.5 ${
                      statusFilter === "SAFE" ? "bg-emerald-600 text-white" : "text-emerald-600"
                    }`}
                    onClick={() => setStatusFilter("SAFE")}
                  >
                    Aman
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="text-xs font-bold text-foreground">Nama Produk</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Stok Saat Ini</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Laju Penjualan</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Estimasi Habis</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-center">Saran Restock</TableHead>
                      <TableHead className="text-xs font-bold text-foreground">Catatan &amp; Analisis AI</TableHead>
                      <TableHead className="text-xs font-bold text-foreground text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-32 rounded-md" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-4 w-12 mx-auto rounded-md" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-4 w-16 mx-auto rounded-md" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-6 w-20 mx-auto rounded-full" /></TableCell>
                          <TableCell className="text-center"><Skeleton className="h-4 w-24 mx-auto rounded-md" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-48 rounded-md" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto rounded-md" /></TableCell>
                        </TableRow>
                      ))
                    ) : filteredPredictions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                          Tidak ada produk yang cocok dengan filter.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPredictions.map((item) => {
                        const isCritical = item.estimated_days_remaining <= 3
                        const isWarning = item.estimated_days_remaining > 3 && item.estimated_days_remaining <= 7

                        return (
                          <TableRow key={item.product_id} className="hover:bg-muted/20">
                            <TableCell className="font-semibold text-xs text-foreground">
                              {item.product_name}
                            </TableCell>

                            <TableCell className="text-center">
                              <span
                                className={`text-xs font-bold ${
                                  item.current_stock <= 5 ? "text-rose-600" : "text-foreground"
                                }`}
                              >
                                {item.current_stock}
                              </span>
                            </TableCell>

                            <TableCell className="text-center text-xs text-muted-foreground">
                              {item.avg_daily_sales.toFixed(1)} / hari
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold px-2 py-0.5 ${
                                  isCritical
                                    ? "bg-rose-500/10 text-rose-600 border-rose-500/30"
                                    : isWarning
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                }`}
                              >
                                <Clock className="w-3 h-3 mr-1 inline" />
                                {item.estimated_days_remaining === 999
                                  ? "Stok Aman"
                                  : item.estimated_days_remaining === 0
                                  ? "Habis"
                                  : `~${item.estimated_days_remaining} Hari`}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center text-xs">
                              {item.recommended_restock_qty > 0 ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold text-primary">
                                    +{item.recommended_restock_qty} pcs
                                  </span>
                                  <div className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {item.recommended_restock_date}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">Belum perlu</span>
                              )}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                              {item.ai_notes || "-"}
                            </TableCell>

                            <TableCell className="text-right">
                              <Link href={`/purchases?product_id=${item.product_id}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
                                >
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>Pesan</span>
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating AI Business Assistant Chatbot */}
      <AIChatWidget />
    </div>
  )
}
