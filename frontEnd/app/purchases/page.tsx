"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Plus, Trash2, ShoppingCart, Truck, AlertCircle, CheckCircle2, Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function PurchasesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("")
  const [purchaseItems, setPurchaseItems] = useState<Array<{ product_id: number; qty: number; cost_price: number }>>([])
  const [notes, setNotes] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Queries
  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["purchases-list"],
    queryFn: async () => {
      const res = await apiClient.get("/purchases")
      return res.data.data || []
    },
  })

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await apiClient.get("/suppliers")
      return res.data.data || []
    },
  })

  const { data: products = [] } = useQuery({
    queryKey: ["products-all"],
    queryFn: async () => {
      const res = await apiClient.get("/products")
      return res.data.data || []
    },
  })

  // Mutation
  const createPurchaseMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        supplier_id: selectedSupplierId ? parseInt(selectedSupplierId) : null,
        items: purchaseItems,
        notes,
      }
      return apiClient.post("/purchases", payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases-list"] })
      queryClient.invalidateQueries({ queryKey: ["products-all"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["inventory-history"] })
      setIsDialogOpen(false)
      setSelectedSupplierId("")
      setPurchaseItems([])
      setNotes("")
      setErrorMsg("")
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal mencatat pembelian barang")
    },
  })

  const handleAddItem = () => {
    if (products.length === 0) return
    const firstProd = products[0]
    setPurchaseItems([
      ...purchaseItems,
      {
        product_id: firstProd.id,
        qty: 1,
        cost_price: firstProd.buy_price || 0,
      },
    ])
  }

  const handleUpdateItem = (index: number, field: string, val: any) => {
    const updated = [...purchaseItems]
    if (field === "product_id") {
      const pId = parseInt(val)
      const p = products.find((x: any) => x.id === pId)
      updated[index] = {
        ...updated[index],
        product_id: pId,
        cost_price: p?.buy_price || updated[index].cost_price,
      }
    } else if (field === "qty") {
      updated[index] = { ...updated[index], qty: parseInt(val) || 0 }
    } else if (field === "cost_price") {
      updated[index] = { ...updated[index], cost_price: parseFloat(val) || 0 }
    }
    setPurchaseItems(updated)
  }

  const handleRemoveItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index))
  }

  const totalCost = purchaseItems.reduce((sum, item) => sum + item.qty * item.cost_price, 0)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader
          title="Pembelian / PO"
          subtitle="Penerimaan barang masuk dari supplier dan update stok otomatis"
        >
          <Button
            size="sm"
            onClick={() => {
              setSelectedSupplierId("")
              setPurchaseItems([])
              setNotes("")
              setErrorMsg("")
              setIsDialogOpen(true)
            }}
            className="gap-1.5 text-xs h-9 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> Catat Pembelian
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Search Filter Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari nomor PO atau supplier..."
                className="pl-9 h-10 bg-card text-xs"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">No. PO</TableHead>
                  <TableHead className="text-xs">Tanggal</TableHead>
                  <TableHead className="text-xs">Pemasok / Supplier</TableHead>
                  <TableHead className="text-xs">Diterima Oleh</TableHead>
                  <TableHead className="text-xs">Item Produk</TableHead>
                  <TableHead className="text-xs text-right">Total Biaya</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Memuat daftar pembelian...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 space-y-2">
                      <ShoppingCart className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">Belum ada data pembelian</p>
                      <p className="text-[11px] text-muted-foreground">
                        Catat barang masuk dari supplier untuk otomatis menambah stok produk.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases
                    .filter((p: any) => {
                      if (!search) return true
                      const s = search.toLowerCase()
                      return (
                        (p.purchase_number || "").toLowerCase().includes(s) ||
                        (p.supplier?.name || "").toLowerCase().includes(s) ||
                        (p.notes || "").toLowerCase().includes(s)
                      )
                    })
                    .slice((page - 1) * pageSize, page * pageSize)
                    .map((p: any) => (
                      <TableRow key={p.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs font-bold text-foreground">
                          {p.purchase_number}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground font-mono">
                          {formatDateTime(p.created_at)}
                        </TableCell>

                        <TableCell className="text-xs font-medium text-foreground">
                          {p.supplier?.name || "Pemasok Langsung"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {p.user?.name || "-"}
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {p.items?.length || 0} macam item
                        </TableCell>

                        <TableCell className="text-xs text-right font-bold text-foreground font-mono">
                          {formatIDR(p.total_cost)}
                        </TableCell>

                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Diterima
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Footer */}
            {purchases.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{Math.min(purchases.length, (page - 1) * pageSize + 1)} - {Math.min(purchases.length, page * pageSize)}</span> dari <span className="font-semibold text-foreground">{purchases.length}</span> pembelian
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="h-8 text-xs gap-1 shadow-xs"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                  </Button>
                  <div className="text-xs font-mono font-bold px-2">
                    {page} / {Math.ceil(purchases.length / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(purchases.length / pageSize)}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-8 text-xs gap-1 shadow-xs"
                  >
                    Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Purchase Order Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Penerimaan Pembelian Produk</DialogTitle>
            <DialogDescription>
              Stok produk akan otomatis bertambah setelah transaksi pembelian disimpan.
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
              <Label htmlFor="pur_supp">Supplier / Pemasok</Label>
              <Select
                value={selectedSupplierId || "none"}
                onValueChange={(val: any) => setSelectedSupplierId(val === "none" ? "" : (val as string))}
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-lg border border-border bg-background">
                  <SelectValue placeholder="Pilih Supplier / Pemasok" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Tanpa Supplier / Pasar Bebas --</SelectItem>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name} {s.phone ? `(${s.phone})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purchase Item List */}
            <div className="space-y-2 border-t border-b border-border py-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Daftar Barang Masuk</span>
                <Button size="sm" variant="outline" onClick={handleAddItem} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Tambah Item
                </Button>
              </div>

              {purchaseItems.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground text-xs">
                  Klik &quot;Tambah Item&quot; untuk memasukkan produk yang dibeli.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {purchaseItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg border border-border bg-muted/20 flex gap-2 items-center">
                      <div className="flex-1">
                        <Select
                          value={item.product_id ? item.product_id.toString() : ""}
                          onValueChange={(val: any) => handleUpdateItem(idx, "product_id", val as string)}
                        >
                          <SelectTrigger className="w-full text-xs h-8 rounded-md border border-border bg-background">
                            <SelectValue placeholder="Pilih Produk" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((prod: any) => (
                              <SelectItem key={prod.id} value={prod.id.toString()}>
                                {prod.name} (Stok: {prod.stock})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-20">
                        <Input
                          type="number"
                          placeholder="Qty"
                          className="h-8 text-xs text-center"
                          value={item.qty}
                          onChange={(e) => handleUpdateItem(idx, "qty", e.target.value)}
                          min="1"
                        />
                      </div>

                      <div className="w-28">
                        <Input
                          type="number"
                          placeholder="Harga Beli"
                          className="h-8 text-xs text-right"
                          value={item.cost_price}
                          onChange={(e) => handleUpdateItem(idx, "cost_price", e.target.value)}
                        />
                      </div>

                      <div className="w-24 text-right font-mono font-bold text-xs">
                        {formatIDR(item.qty * item.cost_price)}
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleRemoveItem(idx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-foreground">Total Biaya Pembelian:</span>
                <span className="text-base font-black text-primary">{formatIDR(totalCost)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pur_notes">Catatan Pembelian (Opsional)</Label>
              <Input
                id="pur_notes"
                placeholder="Nomor faktur supplier, tanggal jatuh tempo, dll."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={purchaseItems.length === 0 || createPurchaseMutation.isPending}
              onClick={() => createPurchaseMutation.mutate()}
            >
              {createPurchaseMutation.isPending ? "Menyimpan..." : "Simpan Pembelian & Update Stok"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
