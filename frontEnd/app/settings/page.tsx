"use client"

import React, { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Shield,
  Store,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user, refreshProfile } = useAuth()
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")
  const [staffSearch, setStaffSearch] = useState("")
  const [staffPage, setStaffPage] = useState(1)
  const pageSize = 10

  // Business Form State
  const [workspaceForm, setWorkspaceForm] = useState({
    name: "",
    business_type: "",
    phone: "",
    email: "",
    address: "",
    currency: "IDR",
    tax_rate: 0,
    receipt_header: "",
    receipt_footer: "",
  })

  // Staff Form State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [deletingStaff, setDeletingStaff] = useState<any>(null)
  const [staffForm, setStaffForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CASHIER",
    status: "ACTIVE",
    phone: "",
  })
  const [staffError, setStaffError] = useState("")

  // Queries
  const { data: wsData } = useQuery({
    queryKey: ["workspace-settings"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/workspace")
      return res.data.data
    },
  })

  const { data: staffList = [], isLoading: staffLoading } = useQuery({
    queryKey: ["staff-list"],
    queryFn: async () => {
      const res = await apiClient.get("/settings/staff")
      return res.data.data || []
    },
  })

  useEffect(() => {
    if (wsData) {
      setWorkspaceForm({
        name: wsData.name || "",
        business_type: wsData.business_type || "",
        phone: wsData.phone || "",
        email: wsData.email || "",
        address: wsData.address || "",
        currency: wsData.currency || "IDR",
        tax_rate: wsData.tax_rate || 0,
        receipt_header: wsData.receipt_header || "",
        receipt_footer: wsData.receipt_footer || "",
      })
    }
  }, [wsData])

  // Mutations
  const updateWorkspaceMutation = useMutation({
    mutationFn: async () => {
      return apiClient.put("/settings/workspace", {
        ...workspaceForm,
        tax_rate: parseFloat(workspaceForm.tax_rate.toString()) || 0,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-settings"] })
      refreshProfile()
      setSuccessMsg("Pengaturan bisnis berhasil disimpan")
      setErrorMsg("")
      setTimeout(() => setSuccessMsg(""), 4000)
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menyimpan pengaturan")
    },
  })

  const saveStaffMutation = useMutation({
    mutationFn: async () => {
      if (!editingStaff) {
        return apiClient.post("/settings/staff", staffForm)
      } else {
        return apiClient.put(`/settings/staff/${editingStaff.id}`, {
          name: staffForm.name,
          role: staffForm.role,
          status: staffForm.status,
          phone: staffForm.phone,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] })
      setIsStaffModalOpen(false)
      resetStaffForm()
    },
    onError: (err: any) => {
      setStaffError(err?.response?.data?.message || "Gagal menyimpan akun staf")
    },
  })

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiClient.delete(`/settings/staff/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-list"] })
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Gagal menghapus staf")
    },
  })

  const resetStaffForm = () => {
    setEditingStaff(null)
    setStaffForm({
      name: "",
      email: "",
      password: "",
      role: "CASHIER",
      status: "ACTIVE",
      phone: "",
    })
    setStaffError("")
  }

  const handleOpenAddStaff = () => {
    resetStaffForm()
    setIsStaffModalOpen(true)
  }

  const handleOpenEditStaff = (s: any) => {
    setEditingStaff(s)
    setStaffForm({
      name: s.name,
      email: s.email,
      password: "",
      role: s.role,
      status: s.status,
      phone: s.phone || "",
    })
    setStaffError("")
    setIsStaffModalOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Pengaturan Sistem" subtitle="Profil bisnis, konfigurasi pajak & struk, dan hak akses staf" />

        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="business" className="space-y-6 max-w-4xl">
            <TabsList className="grid grid-cols-2 max-w-md">
              <TabsTrigger value="business" className="text-xs gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Profil & Struk Toko
              </TabsTrigger>
              <TabsTrigger value="staff" className="text-xs gap-1.5">
                <Users className="w-3.5 h-3.5" /> Manajemen Staf & Kasir
              </TabsTrigger>
            </TabsList>

            {/* Business Settings Tab */}
            <TabsContent value="business" className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Card className="shadow-xs border-border">
                <CardHeader>
                  <CardTitle className="text-base font-bold">Identitas & Operasional Toko</CardTitle>
                  <CardDescription>
                    Informasi ini akan dicantumkan pada invoice dan struk belanja pelanggan.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws_name">Nama Toko / Usaha *</Label>
                      <Input
                        id="ws_name"
                        value={workspaceForm.name}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ws_type">Kategori Bisnis</Label>
                      <Input
                        id="ws_type"
                        value={workspaceForm.business_type}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, business_type: e.target.value })}
                        placeholder="Retail / Minimarket / Cafe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws_phone">Nomor Telepon / CS</Label>
                      <Input
                        id="ws_phone"
                        value={workspaceForm.phone}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, phone: e.target.value })}
                        placeholder="08123456789"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ws_email">Email Kontak</Label>
                      <Input
                        id="ws_email"
                        value={workspaceForm.email}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, email: e.target.value })}
                        placeholder="info@bisnis.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="ws_addr">Alamat Lengkap Toko</Label>
                    <Input
                      id="ws_addr"
                      value={workspaceForm.address}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, address: e.target.value })}
                      placeholder="Jl. Sudirman No. 88, Jakarta"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws_tax">Tarif Pajak Penjualan (PPN %)</Label>
                      <Input
                        id="ws_tax"
                        type="number"
                        step="0.1"
                        value={workspaceForm.tax_rate}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, tax_rate: parseFloat(e.target.value) || 0 })}
                        placeholder="0 (jika tanpa pajak) atau 11 untuk PPN 11%"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ws_curr">Mata Uang</Label>
                      <Input
                        id="ws_curr"
                        value={workspaceForm.currency}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, currency: e.target.value })}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-1.5">
                      <Label htmlFor="ws_header">Header Struk Cetak</Label>
                      <Input
                        id="ws_header"
                        value={workspaceForm.receipt_header}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, receipt_header: e.target.value })}
                        placeholder="=== Selamat Berbelanja ==="
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ws_footer">Pesan Footer Struk Cetak</Label>
                      <Textarea
                        id="ws_footer"
                        rows={2}
                        value={workspaceForm.receipt_footer}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, receipt_footer: e.target.value })}
                        placeholder="Terima kasih atas kunjungan Anda!"
                      />
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border pt-4">
                  <Button
                    disabled={updateWorkspaceMutation.isPending || !workspaceForm.name}
                    onClick={() => updateWorkspaceMutation.mutate()}
                  >
                    {updateWorkspaceMutation.isPending ? "Menyimpan..." : "Simpan Perubahan Toko"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Staff Management Tab */}
            <TabsContent value="staff" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative max-w-sm flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama, email, atau peran staf..."
                    className="pl-9 h-10 bg-card text-xs"
                    value={staffSearch}
                    onChange={(e) => {
                      setStaffSearch(e.target.value)
                      setStaffPage(1)
                    }}
                  />
                </div>
                <Button size="sm" onClick={handleOpenAddStaff} className="gap-1.5 text-xs h-9 shadow-xs shrink-0">
                  <Plus className="w-3.5 h-3.5" /> Tambah Staf
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs">Nama Staf</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs">No. Telepon</TableHead>
                      <TableHead className="text-xs text-center">Peran (Role)</TableHead>
                      <TableHead className="text-xs text-center">Status</TableHead>
                      <TableHead className="text-xs text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-16">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground font-medium">Memuat data pengguna & staf...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffList
                        .filter((s: any) => {
                          if (!staffSearch) return true
                          const query = staffSearch.toLowerCase()
                          return (
                            (s.name || "").toLowerCase().includes(query) ||
                            (s.email || "").toLowerCase().includes(query) ||
                            (s.role || "").toLowerCase().includes(query)
                          )
                        })
                        .slice((staffPage - 1) * pageSize, staffPage * pageSize)
                        .map((s: any) => (
                          <TableRow key={s.id} className="hover:bg-muted/30">
                            <TableCell className="font-bold text-xs text-foreground">
                              {s.name}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground font-mono">
                              {s.email}
                            </TableCell>

                            <TableCell className="text-xs text-muted-foreground">
                              {s.phone || "-"}
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  s.role === "OWNER"
                                    ? "bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold"
                                    : s.role === "ADMIN"
                                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold"
                                }`}
                              >
                                {s.role}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-center">
                              <Badge
                                variant={s.status === "ACTIVE" ? "default" : "secondary"}
                                className="text-[10px]"
                              >
                                {s.status}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                {s.role !== "OWNER" && (
                                  <>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                      onClick={() => handleOpenEditStaff(s)}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                      onClick={() => setDeletingStaff(s)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>

                {/* Staff Pagination Footer */}
                {staffList.length > pageSize && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
                    <div className="text-xs text-muted-foreground">
                      Menampilkan <span className="font-semibold text-foreground">{Math.min(staffList.length, (staffPage - 1) * pageSize + 1)} - {Math.min(staffList.length, staffPage * pageSize)}</span> dari <span className="font-semibold text-foreground">{staffList.length}</span> staf
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={staffPage <= 1}
                        onClick={() => setStaffPage((p) => Math.max(1, p - 1))}
                        className="h-8 text-xs gap-1 shadow-xs"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                      </Button>
                      <div className="text-xs font-mono font-bold px-2">
                        {staffPage} / {Math.ceil(staffList.length / pageSize)}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={staffPage >= Math.ceil(staffList.length / pageSize)}
                        onClick={() => setStaffPage((p) => p + 1)}
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

      {/* Staff Modal */}
      <Dialog open={isStaffModalOpen} onOpenChange={setIsStaffModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {editingStaff ? "Edit Data Staf" : "Tambah Akun Staf Baru"}
            </DialogTitle>
            <DialogDescription>
              Tentukan hak akses peran kasir atau administrator untuk operasional POS.
            </DialogDescription>
          </DialogHeader>

          {staffError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{staffError}</span>
            </div>
          )}

          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="staff_name">Nama Lengkap *</Label>
              <Input
                id="staff_name"
                placeholder="Contoh: Siti Kasir"
                value={staffForm.name}
                onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff_email">Email Login *</Label>
              <Input
                id="staff_email"
                type="email"
                placeholder="kasir@toko.com"
                value={staffForm.email}
                disabled={!!editingStaff}
                onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                required
              />
            </div>

            {!editingStaff && (
              <div className="space-y-1.5">
                <Label htmlFor="staff_pass">Password Login *</Label>
                <Input
                  id="staff_pass"
                  type="password"
                  placeholder="Minimal 6 karakter"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="staff_role">Peran (Role)</Label>
                <Select
                  value={staffForm.role}
                  onValueChange={(val: any) => setStaffForm({ ...staffForm, role: val as string })}
                >
                  <SelectTrigger className="w-full text-xs h-9 rounded-lg border border-border bg-background">
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASHIER">CASHIER (Kasir)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Administrator)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingStaff && (
                <div className="space-y-1.5">
                  <Label htmlFor="staff_status">Status Akun</Label>
                  <Select
                    value={staffForm.status}
                    onValueChange={(val: any) => setStaffForm({ ...staffForm, status: val as string })}
                  >
                    <SelectTrigger className="w-full text-xs h-9 rounded-lg border border-border bg-background">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE (Aktif)</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE (Nonaktif)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff_phone">No. Telepon</Label>
              <Input
                id="staff_phone"
                placeholder="08123456789"
                value={staffForm.phone}
                onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStaffModalOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={!staffForm.name || (!editingStaff && !staffForm.password) || saveStaffMutation.isPending}
              onClick={() => saveStaffMutation.mutate()}
            >
              {saveStaffMutation.isPending ? "Menyimpan..." : "Simpan Akun Staf"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Confirmation Dialog */}
      <Dialog open={!!deletingStaff} onOpenChange={(open) => !open && setDeletingStaff(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Konfirmasi Hapus Akun Staf
            </DialogTitle>
            <DialogDescription className="text-xs">
              Apakah Anda yakin ingin menghapus akun staf <strong className="text-foreground">{deletingStaff?.name}</strong>? Akun ini tidak akan bisa login lagi ke sistem.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDeletingStaff(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleteStaffMutation.isPending}
              onClick={() => {
                if (deletingStaff) {
                  deleteStaffMutation.mutate(deletingStaff.id, {
                    onSettled: () => setDeletingStaff(null),
                  })
                }
              }}
            >
              {deleteStaffMutation.isPending ? "Menghapus..." : "Ya, Hapus Akun"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
