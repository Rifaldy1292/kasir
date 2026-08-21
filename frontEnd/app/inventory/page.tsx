"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Boxes,
  AlertTriangle,
  History,
  SlidersHorizontal,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Package,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export default function InventoryPage() {
  const queryClient = useQueryClient()
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [adjustType, setAdjustType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN")
  const [adjustQty, setAdjustQty] = useState("")
  const [adjustReason, setAdjustReason] = useState("")
  const [lowStockPage, setLowStockPage] = useState(1)
  const [historySearch, setHistorySearch] = useState("")
  const [historyPage, setHistoryPage] = useState(1)
  const pageSize = 10
  const [errorMsg, setErrorMsg] = useState("")

  // Queries
  const { data: products = [] } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const res = await apiClient.get("/products")
      return res.data.data || []
    },
  })

  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ["low-stock"],
    queryFn: async () => {
      const res = await apiClient.get("/inventory/low-stock")
      return res.data.data || []
    },
  })

  const { data: movements = [], isLoading: historyLoading } = useQuery({
    queryKey: ["inventory-history"],
    queryFn: async () => {
      const res = await apiClient.get("/inventory/history")
      return res.data.data || []
    },
  })

  // Mutation
  const adjustMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        product_id: parseInt(selectedProductId),
        type: adjustType,
        qty: parseInt(adjustQty),
        reason: adjustReason,
      }
      return apiClient.post("/inventory/adjust", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-history"] })
      queryClient.invalidateQueries({ queryKey: ["low-stock"] })
      queryClient.invalidateQueries({ queryKey: ["products-all"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsAdjustOpen(false)
      setSelectedProductId("")
      setAdjustQty("")
      setAdjustReason("")
      setErrorMsg("")
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan penyesuaian stok")
    },
  })

  const handleOpenAdjustFor = (pId: number) => {
    setSelectedProductId(pId.toString())
    setAdjustType("IN")
    setAdjustQty("")
    setAdjustReason("")
    setErrorMsg("")
    setIsAdjustOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Stok & Inventori" subtitle="Manajemen stok, audit opname, dan histori mutasi">
          <Button
            size="sm"
            onClick={() => {
              setSelectedProductId("")
              setErrorMsg("")
              setIsAdjustOpen(true)
            }}
            className="gap-1.5 text-xs h-9 shadow-xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Penyesuaian Stok
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid grid-cols-2 max-w-xs">
              <TabsTrigger value="overview" className="text-xs">
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Peringatan Stok
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <History className="w-3.5 h-3.5 mr-1.5" /> Riwayat Mutasi
              </TabsTrigger>
            </TabsList>

            {/* Overview / Low stock Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">
                      {lowStockProducts.length} Produk Mencapai Batas Minimum
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Produk di bawah ini memiliki stok sama atau lebih rendah dari batas minimum stok aman.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs">Barcode / SKU</TableHead>
                      <TableHead className="text-xs text-center">Stok Saat Ini</TableHead>
                      <TableHead className="text-xs text-center">Batas Minimum</TableHead>
                      <TableHead className="text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Memuat data stok produk...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : lowStockProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-foreground">
                          Semua stok produk berada di atas batas minimum aman.
                        </TableCell>
                      </TableRow>
                    ) : (
                      lowStockProducts.slice((lowStockPage - 1) * pageSize, lowStockPage * pageSize).map((p: any) => (
                        <TableRow key={p.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="font-bold text-xs text-foreground">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground">{p.category?.name || "Kategori -"}</div>
                          </TableCell>

                          <TableCell className="text-xs font-mono text-muted-foreground">
                            {p.barcode || p.sku || "-"}
                          </TableCell>

                          <TableCell className="text-center">
                            <Badge variant="destructive" className="font-mono text-xs">
                              {p.stock} {p.unit || "Pcs"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-center text-xs font-mono text-muted-foreground">
                            {p.min_stock} {p.unit || "Pcs"}
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs shadow-xs"
                              onClick={() => handleOpenAdjustFor(p.id)}
                            >
                              Restock / Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>

                {lowStockProducts.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                    <div className="text-xs text-muted-foreground">
                      Menampilkan <span className="font-semibold text-foreground">{Math.min(lowStockProducts.length, (lowStockPage - 1) * pageSize + 1)} - {Math.min(lowStockProducts.length, lowStockPage * pageSize)}</span> dari <span className="font-semibold text-foreground">{lowStockProducts.length}</span> produk
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={lowStockPage <= 1}
                        onClick={() => setLowStockPage((p) => Math.max(1, p - 1))}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                      </Button>
                      <div className="text-xs font-mono font-bold px-2">
                        {lowStockPage} / {Math.ceil(lowStockProducts.length / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={lowStockPage >= Math.ceil(lowStockProducts.length / pageSize)}
                        onClick={() => setLowStockPage((p) => p + 1)}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              {/* History Search */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari riwayat produk atau alasan mutasi..."
                    className="pl-9 h-10 bg-card text-xs"
                    value={historySearch}
                    onChange={(e) => {
                      setHistorySearch(e.target.value)
                      setHistoryPage(1)
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">Waktu</TableHead>
                      <TableHead className="text-xs">Produk</TableHead>
                      <TableHead className="text-xs text-center">Tipe Mutasi</TableHead>
                      <TableHead className="text-xs text-center">Jumlah</TableHead>
                      <TableHead className="text-xs text-center">Stok (Sebelum &rarr; Sesudah)</TableHead>
                      <TableHead className="text-xs">Alasan / Keterangan</TableHead>
                      <TableHead className="text-xs">User / Kasir</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyLoading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Memuat riwayat pergerakan stok...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : movements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-12 text-xs text-muted-foreground">
                          Belum ada catatan mutasi stok.
                        </TableCell>
                      </TableRow>
                    ) : (
                      movements
                        .filter((m: any) => {
                          if (!historySearch) return true
                          const s = historySearch.toLowerCase()
                          return (
                            (m.product?.name || "").toLowerCase().includes(s) ||
                            (m.reason || "").toLowerCase().includes(s) ||
                            (m.type || "").toLowerCase().includes(s)
                          )
                        })
                        .slice((historyPage - 1) * pageSize, historyPage * pageSize)
                        .map((m: any) => {
                          const isPlus = m.type === "IN" || m.type === "PURCHASE" || m.type === "RETURN"
                          return (
                            <TableRow key={m.id} className="hover:bg-muted/30">
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                {formatDateTime(m.created_at)}
                              </TableCell>

                              <TableCell>
                                <div className="font-bold text-xs text-foreground">
                                  {m.product?.name || "Produk #" + m.product_id}
                                </div>
                              </TableCell>

                              <TableCell className="text-center">
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] ${
                                    m.type === "SALE"
                                      ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                      : m.type === "PURCHASE" || m.type === "IN"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                      : m.type === "RETURN"
                                      ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  }`}
                                >
                                  {m.type}
                                </Badge>
                              </TableCell>

                              <TableCell className="text-center font-bold font-mono text-xs">
                                <span className={isPlus ? "text-emerald-600" : "text-rose-600"}>
                                  {isPlus ? `+${m.qty}` : `-${Math.abs(m.qty)}`}
                                </span>
                              </TableCell>

                              <TableCell className="text-center text-xs font-mono text-muted-foreground">
                                {m.stock_before} &rarr; <span className="font-bold text-foreground">{m.stock_after}</span>
                              </TableCell>

                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {m.reason}
                              </TableCell>

                              <TableCell className="text-xs text-muted-foreground font-medium">
                                {m.user?.name || "-"}
                              </TableCell>
                            </TableRow>
                          )
                        })
                    )}
                  </TableBody>
                </Table>

                {/* History Pagination Footer */}
                {movements.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                    <div className="text-xs text-muted-foreground">
                      Menampilkan <span className="font-semibold text-foreground">{Math.min(movements.length, (historyPage - 1) * pageSize + 1)} - {Math.min(movements.length, historyPage * pageSize)}</span> dari <span className="font-semibold text-foreground">{movements.length}</span> catatan
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPage <= 1}
                        onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                      </Button>
                      <div className="text-xs font-mono font-bold px-2">
                        {historyPage} / {Math.ceil(movements.length / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={historyPage >= Math.ceil(movements.length / pageSize)}
                        onClick={() => setHistoryPage((p) => p + 1)}
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

      {/* Stock Adjustment Dialog */}
      <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Penyesuaian Stok (Stock Adjustment)</DialogTitle>
            <DialogDescription>
              Catat penambahan, pengurangan fisik, atau hasil opname stok manual.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="adj_prod">Pilih Produk *</Label>
              <Select
                value={selectedProductId || "none"}
                onValueChange={(val: any) => setSelectedProductId(val === "none" ? "" : (val as string))}
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-lg border border-border bg-background">
                  <SelectValue placeholder="Pilih Produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Pilih Produk --</SelectItem>
                  {products.map((p: any) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.name} (Stok: {p.stock} {p.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Tipe Penyesuaian</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={adjustType === "IN" ? "default" : "outline"}
                  onClick={() => setAdjustType("IN")}
                  className="h-8 text-xs gap-1"
                >
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" /> Tambah (IN)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustType === "OUT" ? "default" : "outline"}
                  onClick={() => setAdjustType("OUT")}
                  className="h-8 text-xs gap-1"
                >
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" /> Kurang (OUT)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={adjustType === "ADJUSTMENT" ? "default" : "outline"}
                  onClick={() => setAdjustType("ADJUSTMENT")}
                  className="h-8 text-xs gap-1"
                >
                  Set Opname
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj_qty">
                {adjustType === "ADJUSTMENT" ? "Stok Aktual Baru" : "Jumlah Qty Penyesuaian"} *
              </Label>
              <Input
                id="adj_qty"
                type="number"
                placeholder="Contoh: 10"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                min="0"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adj_reason">Alasan Penyesuaian *</Label>
              <Input
                id="adj_reason"
                placeholder="Contoh: Barang rusak / Selisih stock opname bulanan"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={
                !selectedProductId ||
                !adjustQty ||
                !adjustReason ||
                adjustMutation.isPending
              }
              onClick={() => adjustMutation.mutate()}
            >
              {adjustMutation.isPending ? "Menyimpan..." : "Simpan Penyesuaian"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
