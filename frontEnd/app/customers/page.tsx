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
import { Plus, Search, Edit2, Trash2, Users, AlertCircle, Phone, Mail, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

export default function CustomersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<any>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<any>(null)
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", address: "" })
  const [errorMsg, setErrorMsg] = useState("")

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["customers-list", search],
    queryFn: async () => {
      const res = await apiClient.get(`/customers?search=${encodeURIComponent(search)}`)
      return res.data.data || []
    },
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!editingCustomer) {
        return apiClient.post("/customers", formData)
      } else {
        return apiClient.put(`/customers/${editingCustomer.id}`, formData)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers-list"] })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      setIsDialogOpen(false)
      resetForm()
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan data pelanggan")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/customers/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers-list"] })
      queryClient.invalidateQueries({ queryKey: ["customers"] })
    },
  })

  const resetForm = () => {
    setEditingCustomer(null)
    setFormData({ name: "", phone: "", email: "", address: "" })
    setErrorMsg("")
  }

  const handleOpenAdd = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (c: any) => {
    setEditingCustomer(c)
    setFormData({
      name: c.name,
      phone: c.phone || "",
      email: c.email || "",
      address: c.address || "",
    })
    setErrorMsg("")
    setIsDialogOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Pelanggan" subtitle="Database kontak pelanggan dan data loyalty">
          <Button size="sm" onClick={handleOpenAdd} className="gap-1.5 text-xs h-9 shadow-xs">
            <Plus className="w-3.5 h-3.5" /> Tambah Pelanggan
          </Button>
        </AppHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Cari nama, no. telp, atau email pelanggan..."
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
                  <TableHead className="text-xs">Nama Pelanggan</TableHead>
                  <TableHead className="text-xs">No. WhatsApp / HP</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Alamat</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Memuat daftar pelanggan...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 space-y-2">
                      <Users className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">Belum ada pelanggan</p>
                      <p className="text-[11px] text-muted-foreground">
                        Tambahkan pelanggan baru untuk pencatatan transaksi lebih personal.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.slice((page - 1) * pageSize, page * pageSize).map((c: any) => (
                    <TableRow key={c.id} className="hover:bg-muted/30">
                      <TableCell className="font-bold text-xs text-foreground">
                        {c.name}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {c.phone ? (
                          <span className="flex items-center gap-1.5 font-mono">
                            <Phone className="w-3 h-3 text-emerald-500" /> {c.phone}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {c.email ? (
                          <span className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-blue-500" /> {c.email}
                          </span>
                        ) : (
                          "-"
                        )}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                        {c.address || "-"}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeletingCustomer(c)}
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
            {customers.length > pageSize && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                <div className="text-xs text-muted-foreground">
                  Menampilkan <span className="font-semibold text-foreground">{Math.min(customers.length, (page - 1) * pageSize + 1)} - {Math.min(customers.length, page * pageSize)}</span> dari <span className="font-semibold text-foreground">{customers.length}</span> pelanggan
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
                    {page} / {Math.ceil(customers.length / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(customers.length / pageSize)}
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

      {/* Customer Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingCustomer ? "Edit Data Pelanggan" : "Tambah Pelanggan Baru"}
            </DialogTitle>
            <DialogDescription>
              Informasi kontak pelanggan untuk pencatatan transaksi kasir.
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
              <Label htmlFor="cust_name">Nama Lengkap *</Label>
              <Input
                id="cust_name"
                placeholder="Contoh: Budi Santoso"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust_phone">No. WhatsApp / HP</Label>
              <Input
                id="cust_phone"
                placeholder="08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust_email">Email</Label>
              <Input
                id="cust_email"
                type="email"
                placeholder="budi@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cust_addr">Alamat Lengkap</Label>
              <Input
                id="cust_addr"
                placeholder="Jl. Contoh No. 123"
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
              {saveMutation.isPending ? "Menyimpan..." : "Simpan Pelanggan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Konfirmasi Hapus Pelanggan
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus data pelanggan <strong className="text-foreground">{deletingCustomer?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeletingCustomer(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deletingCustomer) {
                  deleteMutation.mutate(deletingCustomer.id, {
                    onSettled: () => setDeletingCustomer(null),
                  })
                }
              }}
            >
              {deleteMutation.isPending ? "Menghapus..." : "Ya, Hapus Pelanggan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
