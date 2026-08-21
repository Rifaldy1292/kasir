"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Plus, Search, Edit2, Trash2, Truck, AlertCircle, Phone, Mail, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

export default function SuppliersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" })
  const [errorMsg, setErrorMsg] = useState("")

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers-list", search],
    queryFn: async () => {
      const res = await apiClient.get(`/suppliers?search=${encodeURIComponent(search)}`)
      return res.data.data || []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editingSupplier) {
        return apiClient.post("/suppliers", formData)
      } else {
        return apiClient.put(`/suppliers/${editingSupplier.id}`, formData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] })
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
      setIsDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan data supplier")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/suppliers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers-list"] })
      queryClient.invalidateQueries({ queryKey: ["suppliers"] })
    },
  })

  const resetForm = () => {
    setEditingSupplier(null)
    setFormData({ name: "", phone: "", email: "", address: "" })
    setErrorMsg("")
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (s: any) => {
    setEditingSupplier(s)
    setFormData({
      name: s.name,
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
    })
    setErrorMsg("")
    setIsDialogOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Pemasok / Supplier" subtitle="Daftar vendor penyedia stok barang dagangan">
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs h-9 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Tambah Supplier
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari nama supplier, telepon, kontak..."
              className="pl-9 h-10 bg-card text-xs shadow-xs"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">Nama Perusahaan / Supplier</TableHead>
                  <TableHead className="text-xs">Telepon</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Alamat Gudang / Kantor</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Memuat daftar supplier...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 space-y-2">
                      <Truck className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">Belum ada data supplier</p>
                      <p className="text-[11px] text-muted-foreground">
                        Daftarkan mitra pemasok barang Anda di sini.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.slice((page - 1) * pageSize, page * pageSize).map((s: any) => (
                    <TableRow key={s.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-xs text-foreground">
                        {s.name}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {s.phone ? (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-emerald-500" /> {s.phone}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {s.email ? (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-blue-500" /> {s.email}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {s.address || "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(s)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingSupplier(s)}
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
            {suppliers.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{Math.min(suppliers.length, (page - 1) * pageSize + 1)} - {Math.min(suppliers.length, page * pageSize)}</span> dari <span className="font-semibold text-foreground">{suppliers.length}</span> supplier
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
                    {page} / {Math.ceil(suppliers.length / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(suppliers.length / pageSize)}
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

      {/* Supplier Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingSupplier ? "Edit Data Supplier" : "Tambah Supplier Baru"}
            </DialogTitle>
            <DialogDescription>
              Informasi vendor pemasok untuk pencatatan pesanan pembelian barang.
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="sup_name">Nama Supplier / Perusahaan *</Label>
              <Input
                id="sup_name"
                placeholder="Contoh: PT Indomarco Adi Prima"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sup_phone">Nomor Telepon / Sales</Label>
              <Input
                id="sup_phone"
                placeholder="021-5551234 / 08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sup_email">Email Order</Label>
              <Input
                id="sup_email"
                type="email"
                placeholder="order@supplier.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="sup_addr">Alamat Kantor / Gudang</Label>
              <Input
                id="sup_addr"
                placeholder="Kawasan Industri..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!formData.name || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Menyimpan..." : "Simpan Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingSupplier} onOpenChange={(open) => !open && setDeletingSupplier(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Konfirmasi Hapus Supplier
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus data supplier <strong className="text-foreground">{deletingSupplier?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeletingSupplier(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingSupplier) {
                  deleteMutation.mutate(deletingSupplier.id, {
                    onSettled: () => setDeletingSupplier(null),
                  })
                }
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Supplier"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
