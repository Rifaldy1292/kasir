"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { ReceiptModal } from "@/components/global/receipt-modal"
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
import {
  ReceiptText,
  Search,
  Printer,
  Ban,
  RotateCcw,
  AlertCircle,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

export default function TransactionsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [page, setPage] = useState(1)
  const limit = 10
  const [selectedTx, setSelectedTx] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [isActionModalOpen, setIsActionModalOpen] = useState(false)
  const [actionType, setActionType] = useState<"VOID" | "REFUND">("VOID")
  const [actionReason, setActionReason] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Query transactions with backend pagination
  const { data: txResponse, isLoading } = useQuery({
    queryKey: ["transactions-list", search, statusFilter, page, limit],
    queryFn: async () => {
      let url = `/pos/transactions?page=${page}&limit=${limit}&`
      if (search) url += `search=${encodeURIComponent(search)}&`
      if (statusFilter) url += `status=${statusFilter}&`
      const res = await apiClient.get(url)
      return res.data.data
    },
  })

  const transactions = Array.isArray(txResponse?.items)
    ? txResponse.items
    : Array.isArray(txResponse)
    ? txResponse
    : []
  const totalItems = typeof txResponse?.total_items === "number" ? txResponse.total_items : transactions.length
  const totalPages = typeof txResponse?.total_pages === "number" ? txResponse.total_pages : Math.max(1, Math.ceil(totalItems / limit))

  // Action Mutation
  const actionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTx) return
      const endpoint = actionType === "VOID" ? "void" : "refund"
      return apiClient.post(`/pos/transactions/${selectedTx.id}/${endpoint}`, {
        reason: actionReason,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions-list"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] })
      setIsActionModalOpen(false)
      setSelectedTx(null)
      setActionReason("")
      setErrorMsg("")
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal memproses aksi transaksi")
    },
  })

  const handleOpenReceipt = (tx: any) => {
    setSelectedTx(tx)
    setIsReceiptOpen(true)
  }

  const handleOpenAction = (tx: any, type: "VOID" | "REFUND") => {
    setSelectedTx(tx)
    setActionType(type)
    setActionReason("")
    setErrorMsg("")
    setIsActionModalOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader
          title="Riwayat Transaksi"
          subtitle="Daftar penjualan, pencetakan ulang struk, void, dan refund"
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-1 gap-2 w-full max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Cari nomor invoice / struk..."
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
                  value={statusFilter || "all"}
                  onValueChange={(val: any) => setStatusFilter(val === "all" ? "" : (val as string))}
                >
                  <SelectTrigger className="w-full h-10 text-xs rounded-lg border border-border bg-card">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Status</SelectItem>
                    <SelectItem value="COMPLETED">COMPLETED (Selesai)</SelectItem>
                    <SelectItem value="HOLD">HOLD (Tertunda)</SelectItem>
                    <SelectItem value="VOID">VOID (Dibatalkan)</SelectItem>
                    <SelectItem value="REFUNDED">REFUNDED (Dikembalikan)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="text-xs">No. Invoice</TableHead>
                  <TableHead className="text-xs">Waktu</TableHead>
                  <TableHead className="text-xs">Kasir</TableHead>
                  <TableHead className="text-xs">Pelanggan</TableHead>
                  <TableHead className="text-xs">Metode Bayar</TableHead>
                  <TableHead className="text-xs text-right">Total Transaksi</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">Memuat riwayat transaksi...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 space-y-2">
                      <ReceiptText className="w-8 h-8 mx-auto text-muted-foreground/40" />
                      <p className="text-xs font-semibold text-foreground">Tidak ada transaksi ditemukan</p>
                      <p className="text-[11px] text-muted-foreground">
                        Lakukan penjualan di terminal kasir untuk melihat riwayat di sini.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx: any) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30">
                      <TableCell className="font-mono text-xs font-bold text-foreground">
                        {tx.invoice_number}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDateTime(tx.created_at)}
                      </TableCell>

                      <TableCell className="text-xs text-foreground font-medium">
                        {tx.user?.name || "-"}
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground">
                        {tx.customer?.name || "Umum"}
                      </TableCell>

                      <TableCell className="text-xs">
                        <Badge variant="outline" className="text-[10px] font-mono uppercase">
                          {tx.payment_method}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-xs text-right font-bold text-foreground font-mono">
                        {formatIDR(tx.total_amount)}
                      </TableCell>

                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            tx.status === "COMPLETED"
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold"
                              : tx.status === "HOLD"
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={() => handleOpenReceipt(tx)}
                          >
                            <Printer className="w-3 h-3" /> Struk
                          </Button>

                          {tx.status === "COMPLETED" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-rose-600 hover:bg-rose-500/10"
                                onClick={() => handleOpenAction(tx, "VOID")}
                                title="Void Transaksi"
                              >
                                <Ban className="w-3 h-3" /> Void
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-purple-600 hover:bg-purple-500/10"
                                onClick={() => handleOpenAction(tx, "REFUND")}
                                title="Refund Transaksi"
                              >
                                <RotateCcw className="w-3 h-3" /> Refund
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

            {/* Backend Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 border-t border-border bg-card">
              <div className="text-xs text-muted-foreground">
                Menampilkan <span className="font-semibold text-foreground">{transactions.length}</span> dari <span className="font-semibold text-foreground">{totalItems}</span> transaksi (Halaman {page} dari {totalPages})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1 || isLoading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-8 text-xs gap-1 shadow-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Sebelumnya
                </Button>
                <div className="text-xs font-mono font-bold px-2">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages || isLoading}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-8 text-xs gap-1 shadow-xs"
                >
                  Selanjutnya <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Confirmation Modal (Void / Refund) */}
      <Dialog open={isActionModalOpen} onOpenChange={setIsActionModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-destructive">
              Konfirmasi {actionType === "VOID" ? "Void Transaksi" : "Refund Transaksi"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "VOID"
                ? `Membatalkan invoice ${selectedTx?.invoice_number}. Stok barang akan dikembalikan.`
                : `Memproses pengembalian barang untuk invoice ${selectedTx?.invoice_number}. Stok produk akan diretur ke inventori.`}
            </DialogDescription>
          </DialogHeader>

          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-2 py-2">
            <Label htmlFor="action_reason">Alasan {actionType} *</Label>
            <Input
              id="action_reason"
              placeholder={`Contoh: Kesalahan input kasir / Barang cacat`}
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              disabled={!actionReason || actionMutation.isPending}
              onClick={() => actionMutation.mutate()}
            >
              {actionMutation.isPending ? "Memproses..." : `Ya, Lakukan ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <ReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        transaction={selectedTx}
      />
    </div>
  )
}
