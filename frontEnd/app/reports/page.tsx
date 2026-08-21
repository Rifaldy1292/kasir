"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Calendar, BarChart3, Package, DollarSign, Receipt, Percent, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function ReportsPage() {
  const today = new Date().toISOString().split("T")[0]
  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [salesSearch, setSalesSearch] = useState("")
  const [salesPage, setSalesPage] = useState(1)
  const [productSearch, setProductSearch] = useState("")
  const [productPage, setProductPage] = useState(1)
  const pageSize = 10

  // Queries
  const { data: salesReport = [], isLoading: salesLoading } = useQuery({
    queryKey: ["reports-sales", startDate, endDate],
    queryFn: async () => {
      let url = "/reports/sales?"
      if (startDate) url += `start_date=${startDate}&`
      if (endDate) url += `end_date=${endDate}&`
      const res = await apiClient.get(url)
      return res.data.data || []
    },
  })

  const { data: itemReport = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["reports-items", startDate, endDate],
    queryFn: async () => {
      let url = "/reports/items?"
      if (startDate) url += `start_date=${startDate}&`
      if (endDate) url += `end_date=${endDate}&`
      const res = await apiClient.get(url)
      return res.data.data || []
    },
  })

  // Summary Metrics
  const completedSales = salesReport.filter((t: any) => t.status === "COMPLETED")
  const totalOmzet = completedSales.reduce((sum: number, t: any) => sum + t.total_amount, 0)
  const totalDiscount = completedSales.reduce((sum: number, t: any) => sum + t.discount_amount, 0)
  const totalTax = completedSales.reduce((sum: number, t: any) => sum + t.tax_amount, 0)
  const avgBasket = completedSales.length > 0 ? totalOmzet / completedSales.length : 0

  // Export to CSV
  const handleExportCSV = () => {
    if (salesReport.length === 0) return

    const headers = [
      "No Invoice",
      "Tanggal",
      "Kasir",
      "Pelanggan",
      "Metode Bayar",
      "Subtotal",
      "Diskon",
      "Pajak",
      "Total",
      "Status",
    ]

    const rows = salesReport.map((t: any) => [
      t.invoice_number,
      `"${formatDateTime(t.created_at)}"`,
      `"${t.user?.name || ""}"`,
      `"${t.customer?.name || "Umum"}"`,
      t.payment_method,
      t.subtotal,
      t.discount_amount,
      t.tax_amount,
      t.total_amount,
      t.status,
    ])

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e: any[]) => e.join(","))].join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `Laporan_Penjualan_${startDate}_sd_${endDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const setDatePreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - days)
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Laporan & Rekapitulasi" subtitle="Laporan penjualan, produk terlaris, dan analitik kasir">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={salesReport.length === 0}
            className="gap-1.5 text-xs h-9 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Ekspor CSV
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Date Filter Toolbar */}
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-primary" />
              <div className="flex items-center gap-2 text-xs">
                <div>
                  <Label htmlFor="start_date" className="text-[11px] text-muted-foreground block mb-1">
                    Dari Tanggal
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    className="h-8 text-xs font-mono"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date" className="text-[11px] text-muted-foreground block mb-1">
                    Sampai Tanggal
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    className="h-8 text-xs font-mono"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => setDatePreset(0)}>
                Hari Ini
              </Button>
              <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => setDatePreset(6)}>
                7 Hari
              </Button>
              <Button size="sm" variant="secondary" className="h-8 text-xs" onClick={() => setDatePreset(29)}>
                30 Hari
              </Button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Omzet Penjualan
                </CardTitle>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{formatIDR(totalOmzet)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Dari {completedSales.length} transaksi selesai
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rata-rata Transaksi (AOV)
                </CardTitle>
                <Receipt className="w-4 h-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{formatIDR(avgBasket)}</div>
                <p className="text-xs text-muted-foreground mt-1">Rata-rata nominal per struk</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Diskon Diberikan
                </CardTitle>
                <Percent className="w-4 h-4 text-rose-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-600">{formatIDR(totalDiscount)}</div>
                <p className="text-xs text-muted-foreground mt-1">Potongan harga promo</p>
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Pajak (PPN)
                </CardTitle>
                <Receipt className="w-4 h-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{formatIDR(totalTax)}</div>
                <p className="text-xs text-muted-foreground mt-1">Pajak terkumpul</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs: Sales Log vs Product Performance */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList className="grid grid-cols-2 max-w-xs">
              <TabsTrigger value="sales" className="text-xs gap-1.5">
                <BarChart3 className="w-3.5 h-3.5" /> Rekap Penjualan
              </TabsTrigger>
              <TabsTrigger value="products" className="text-xs gap-1.5">
                <Package className="w-3.5 h-3.5" /> Penjualan Produk
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sales" className="space-y-4">
              {/* Sales Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari no invoice, kasir, atau pelanggan..."
                    className="pl-9 h-10 bg-card text-xs"
                    value={salesSearch}
                    onChange={(e) => {
                      setSalesSearch(e.target.value)
                      setSalesPage(1)
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">No. Invoice</TableHead>
                      <TableHead className="text-xs">Tanggal</TableHead>
                      <TableHead className="text-xs">Kasir</TableHead>
                      <TableHead className="text-xs">Pelanggan</TableHead>
                      <TableHead className="text-xs">Metode</TableHead>
                      <TableHead className="text-xs text-right">Diskon</TableHead>
                      <TableHead className="text-xs text-right">Pajak</TableHead>
                      <TableHead className="text-xs text-right">Total</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesLoading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Memuat laporan transaksi penjualan...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : salesReport.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-12 text-xs text-muted-foreground">
                          Tidak ada data penjualan pada rentang tanggal ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesReport
                        .filter((t: any) => {
                          if (!salesSearch) return true
                          const s = salesSearch.toLowerCase()
                          return (
                            (t.invoice_number || "").toLowerCase().includes(s) ||
                            (t.user?.name || "").toLowerCase().includes(s) ||
                            (t.customer?.name || "").toLowerCase().includes(s) ||
                            (t.payment_method || "").toLowerCase().includes(s)
                          )
                        })
                        .slice((salesPage - 1) * pageSize, salesPage * pageSize)
                        .map((t: any) => (
                          <TableRow key={t.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono text-xs font-bold text-foreground">
                              {t.invoice_number}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {formatDateTime(t.created_at)}
                            </TableCell>
                            <TableCell className="text-xs text-foreground font-medium">
                              {t.user?.name || "-"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {t.customer?.name || "Umum"}
                            </TableCell>
                            <TableCell className="text-xs font-mono uppercase">
                              {t.payment_method}
                            </TableCell>
                            <TableCell className="text-xs text-right text-rose-600 font-mono">
                              {t.discount_amount > 0 ? `-${formatIDR(t.discount_amount)}` : "-"}
                            </TableCell>
                            <TableCell className="text-xs text-right text-muted-foreground font-mono">
                              {t.tax_amount > 0 ? formatIDR(t.tax_amount) : "-"}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-foreground font-mono">
                              {formatIDR(t.total_amount)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[9px] ${
                                  t.status === "COMPLETED"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                }`}
                              >
                                {t.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>

                {/* Sales Pagination Footer */}
                {salesReport.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                    <div className="text-xs text-muted-foreground">
                      Menampilkan <span className="font-semibold text-foreground">{Math.min(salesReport.length, (salesPage - 1) * pageSize + 1)} - {Math.min(salesReport.length, salesPage * pageSize)}</span> dari <span className="font-semibold text-foreground">{salesReport.length}</span> transaksi
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={salesPage <= 1}
                        onClick={() => setSalesPage((p) => Math.max(1, p - 1))}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                      </Button>
                      <div className="text-xs font-mono font-bold px-2">
                        {salesPage} / {Math.ceil(salesReport.length / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={salesPage >= Math.ceil(salesReport.length / pageSize)}
                        onClick={() => setSalesPage((p) => p + 1)}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
              {/* Product Search Bar */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama produk..."
                    className="pl-9 h-10 bg-card text-xs"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      setProductPage(1)
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">No</TableHead>
                      <TableHead className="text-xs">Nama Produk</TableHead>
                      <TableHead className="text-xs text-center">Kuantitas Terjual</TableHead>
                      <TableHead className="text-xs text-right">Total Nilai Penjualan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {itemsLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Memuat laporan penjualan produk...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : itemReport.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-12 text-xs text-muted-foreground">
                          Tidak ada data penjualan produk pada rentang tanggal ini.
                        </TableCell>
                      </TableRow>
                    ) : (
                      itemReport
                        .filter((it: any) => {
                          if (!productSearch) return true
                          return (it.product_name || "").toLowerCase().includes(productSearch.toLowerCase())
                        })
                        .slice((productPage - 1) * pageSize, productPage * pageSize)
                        .map((it: any, idx: number) => (
                          <TableRow key={idx} className="hover:bg-muted/30">
                            <TableCell className="text-xs text-muted-foreground font-mono">{(productPage - 1) * pageSize + idx + 1}</TableCell>
                            <TableCell className="text-xs font-bold text-foreground">{it.product_name}</TableCell>
                            <TableCell className="text-center font-mono font-bold text-xs">
                              {it.total_qty} pcs
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-primary font-mono">
                              {formatIDR(it.total_sales)}
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>

                {/* Product Pagination Footer */}
                {itemReport.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                    <div className="text-xs text-muted-foreground">
                      Menampilkan <span className="font-semibold text-foreground">{Math.min(itemReport.length, (productPage - 1) * pageSize + 1)} - {Math.min(itemReport.length, productPage * pageSize)}</span> dari <span className="font-semibold text-foreground">{itemReport.length}</span> produk
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={productPage <= 1}
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                      </Button>
                      <div className="text-xs font-mono font-bold px-2">
                        {productPage} / {Math.ceil(itemReport.length / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={productPage >= Math.ceil(itemReport.length / pageSize)}
                        onClick={() => setProductPage((p) => p + 1)}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
