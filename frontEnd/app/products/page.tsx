"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, getImageUrl } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { Plus, Search, Edit2, Trash2, Barcode, AlertCircle, ShoppingBag, Upload, X, Image as ImageIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [selectedCat, setSelectedCat] = useState<string>("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCatName, setNewCatName] = useState("")
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [deletingProduct, setDeletingProduct] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sku: "",
    barcode: "",
    buy_price: "",
    sell_price: "",
    stock: "0",
    min_stock: "5",
    unit: "Pcs",
    image_url: "",
    description: "",
  })

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories")
      return res.data.data || []
    },
  })

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products-list", search, selectedCat],
    queryFn: async () => {
      let url = "/products?"
      if (search) url += `search=${encodeURIComponent(search)}&`
      if (selectedCat) url += `category_id=${selectedCat}&`
      const res = await apiClient.get(url)
      return res.data.data || []
    },
  })

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        name: formData.name,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        sku: formData.sku,
        barcode: formData.barcode,
        buy_price: parseFloat(formData.buy_price) || 0,
        sell_price: parseFloat(formData.sell_price) || 0,
        min_stock: parseInt(formData.min_stock) || 5,
        unit: formData.unit || "Pcs",
        image_url: formData.image_url,
        description: formData.description,
      }

      if (!editingProduct) {
        payload.stock = parseInt(formData.stock) || 0
        return apiClient.post("/products", payload)
      } else {
        return apiClient.put(`/products/${editingProduct.id}`, payload)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
      setIsDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan data produk")
    },
  })

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products-list"] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })

  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      return apiClient.post("/categories", { name: newCatName })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      setIsCategoryModalOpen(false)
      setNewCatName("")
    },
  })

  const resetForm = () => {
    setEditingProduct(null)
    setErrorMsg("")
    setFormData({
      name: "",
      category_id: "",
      sku: "",
      barcode: "",
      buy_price: "",
      sell_price: "",
      stock: "0",
      min_stock: "5",
      unit: "Pcs",
      image_url: "",
      description: "",
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Ukuran file terlalu besar (maksimal 5MB)")
      return
    }

    try {
      setIsUploading(true)
      setErrorMsg("")
      const uploadData = new FormData()
      uploadData.append("image", file)

      const res = await apiClient.post("/upload/image", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      if (res.data?.data?.url) {
        setFormData((prev) => ({ ...prev, image_url: res.data.data.url }))
      }
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal mengunggah gambar ke server")
    } finally {
      setIsUploading(false)
    }
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p)
    setErrorMsg("")
    setFormData({
      name: p.name,
      category_id: p.category_id ? p.category_id.toString() : "",
      sku: p.sku || "",
      barcode: p.barcode || "",
      buy_price: p.buy_price ? p.buy_price.toString() : "",
      sell_price: p.sell_price.toString(),
      stock: p.stock.toString(),
      min_stock: p.min_stock.toString(),
      unit: p.unit || "Pcs",
      image_url: p.image_url || "",
      description: p.description || "",
    })
    setIsDialogOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Produk & Menu" subtitle="Katalog produk, harga, dan SKU toko">
          <Button size="sm" onClick={() => setIsCategoryModalOpen(true)} variant="outline" className="text-xs h-9">
            + Kategori
          </Button>
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs h-9 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Tambah Produk
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Cari nama produk, barcode, SKU..."
                  className="pl-9 h-10 bg-card text-xs shadow-xs"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                />
              </div>

              <div className="w-48">
                <Select
                  value={selectedCat || "all"}
                  onValueChange={(val: any) => setSelectedCat(val === "all" ? "" : (val as string))}
                >
                  <SelectTrigger className="w-full h-10 text-xs rounded-lg border border-border bg-card">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Kategori</SelectItem>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">Produk</TableHead>
                  <TableHead className="text-xs">Kategori</TableHead>
                  <TableHead className="text-xs">SKU / Barcode</TableHead>
                  <TableHead className="text-xs text-right">Harga Modal</TableHead>
                  <TableHead className="text-xs text-right">Harga Jual</TableHead>
                  <TableHead className="text-xs text-center">Stok</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Memuat katalog produk...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 space-y-2">
                      <ShoppingBag className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">Belum ada produk</p>
                      <p className="text-[11px] text-muted-foreground">
                        Tambahkan produk pertama Anda dengan tombol di atas.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.slice((page - 1) * pageSize, page * pageSize).map((p: any) => (
                    <TableRow key={p.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                            {p.image_url ? (
                              <img src={getImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{p.name}</div>
                            <div className="text-[10px] text-muted-foreground">{p.unit || "Pcs"}</div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" className="font-normal text-[11px]">
                          {p.category?.name || "Tanpa Kategori"}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs font-mono text-muted-foreground">
                        <div>{p.barcode || "-"}</div>
                        {p.sku && <div className="text-[10px] opacity-70">{p.sku}</div>}
                      </TableCell>

                      <TableCell className="text-xs text-right text-muted-foreground font-mono">
                        {formatIDR(p.buy_price)}
                      </TableCell>

                      <TableCell className="text-xs text-right font-bold text-foreground font-mono">
                        {formatIDR(p.sell_price)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant={p.stock <= 0 ? "destructive" : p.stock <= p.min_stock ? "secondary" : "outline"}
                          className="font-mono text-[11px]"
                        >
                          {p.stock}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(p)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingProduct(p)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {products.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{Math.min(products.length, (page - 1) * pageSize + 1)} - {Math.min(products.length, page * pageSize)}</span> dari <span className="font-semibold text-foreground">{products.length}</span> produk
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
                    {page} / {Math.ceil(products.length / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(products.length / pageSize)}
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

      {/* Add / Edit Product Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingProduct ? "Edit Informasi Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              Isi data detail item katalog, harga modal, dan barcode produk.
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
              <Label htmlFor="prod_name">Nama Produk *</Label>
              <Input
                id="prod_name"
                placeholder="Contoh: Kopi Susu Aren 250ml"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category_id">Kategori</Label>
                <Select
                  value={formData.category_id || "none"}
                  onValueChange={(val: any) => setFormData({ ...formData, category_id: val === "none" ? "" : (val as string) })}
                >
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg border border-border bg-background">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-- Tanpa Kategori --</SelectItem>
                    {categories.map((c: any) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="unit">Satuan Unit</Label>
                <Input
                  id="unit"
                  placeholder="Pcs / Botol / Bungkus"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="barcode">Barcode / EAN</Label>
                <Input
                  id="barcode"
                  placeholder="Scan barcode..."
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sku">SKU Produk</Label>
                <Input
                  id="sku"
                  placeholder="Contoh: KOP-AREN-250"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="buy_price">Harga Modal / Beli (Rp)</Label>
                <Input
                  id="buy_price"
                  type="number"
                  placeholder="0"
                  value={formData.buy_price}
                  onChange={(e) => setFormData({ ...formData, buy_price: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sell_price">Harga Jual Kasir (Rp) *</Label>
                <Input
                  id="sell_price"
                  type="number"
                  placeholder="15000"
                  value={formData.sell_price}
                  onChange={(e) => setFormData({ ...formData, sell_price: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {!editingProduct && (
                <div className="space-y-1.5">
                  <Label htmlFor="stock">Stok Awal</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="min_stock">Batas Minimum Stok (Peringatan)</Label>
                <Input
                  id="min_stock"
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                />
              </div>
            </div>

            {/* Image Upload Area */}
            <div className="space-y-1.5">
              <Label>Foto / Gambar Produk (Opsional)</Label>
              {formData.image_url ? (
                <div className="relative w-full h-36 rounded-xl border border-border overflow-hidden group bg-muted/20 flex items-center justify-center">
                  <img
                    src={getImageUrl(formData.image_url)}
                    alt="Preview Produk"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => setFormData({ ...formData, image_url: "" })}
                    >
                      <X className="w-3.5 h-3.5" /> Hapus Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/10 hover:bg-muted/30">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2">
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-foreground">
                    {isUploading ? "Mengunggah gambar ke server..." : "Pilih / Unggah Gambar dari Komputer"}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Format JPG, JPEG, PNG, WEBP, GIF (Maksimal 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
                    className="hidden"
                    disabled={isUploading}
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!formData.name || !formData.sell_price || saveProductMutation.isPending}
              onClick={() => saveProductMutation.mutate()}
            >
              {saveProductMutation.isPending ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Add Category Modal */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Tambah Kategori Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="cat_name">Nama Kategori</Label>
            <Input
              id="cat_name"
              placeholder="Contoh: Frozen Food"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!newCatName || addCategoryMutation.isPending}
              onClick={() => addCategoryMutation.mutate()}
            >
              Simpan Kategori
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Konfirmasi Hapus Produk
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus produk <strong className="text-foreground">{deletingProduct?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeletingProduct(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteProductMutation.isPending}
              onClick={() => {
                if (deletingProduct) {
                  deleteProductMutation.mutate(deletingProduct.id, {
                    onSettled: () => setDeletingProduct(null),
                  })
                }
              }}
            >
              {deleteProductMutation.isPending ? "Menghapus..." : "Ya, Hapus Produk"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
