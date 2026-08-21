"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react"

interface CashDrawerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CashDrawerDialog({ open, onOpenChange }: CashDrawerDialogProps) {
  const queryClient = useQueryClient()
  const [openingCash, setOpeningCash] = useState("")
  const [closingCash, setClosingCash] = useState("")
  const [movementType, setMovementType] = useState<"CASH_IN" | "CASH_OUT">("CASH_IN")
  const [movementAmount, setMovementAmount] = useState("")
  const [movementReason, setMovementReason] = useState("")
  const [notes, setNotes] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Fetch active session
  const { data: sessionData, isLoading } = useQuery({
    queryKey: ["current-session"],
    queryFn: async () => {
      const res = await apiClient.get("/cash/current-session")
      return res.data.data
    },
    enabled: open,
  })

  const currentSession = sessionData

  // Mutations
  const openShiftMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(openingCash) || 0
      const res = await apiClient.post("/cash/open-shift", {
        opening_cash: amount,
        notes,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-session"] })
      setOpeningCash("")
      setNotes("")
      setErrorMsg("")
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal membuka sesi kasir")
    },
  })

  const closeShiftMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(closingCash) || 0
      const res = await apiClient.post("/cash/close-shift", {
        actual_cash: amount,
        notes,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-session"] })
      setClosingCash("")
      setNotes("")
      setErrorMsg("")
      onOpenChange(false)
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal menutup sesi kasir")
    },
  })

  const addMovementMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(movementAmount) || 0
      const res = await apiClient.post("/cash/movement", {
        type: movementType,
        amount,
        reason: movementReason,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-session"] })
      setMovementAmount("")
      setMovementReason("")
      setErrorMsg("")
    },
    onError: (err: any) => {
      setErrorMsg(err?.response?.data?.message || "Gagal mencatat arus kas")
    },
  })

  const expectedCash = currentSession
    ? currentSession.opening_cash +
      currentSession.total_sales +
      currentSession.total_cash_in -
      currentSession.total_cash_out
    : 0

  const diffCash = closingCash ? parseFloat(closingCash) - expectedCash : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Laci Kasir & Sesi Kerja</DialogTitle>
              <DialogDescription>
                Kelola modal awal, kas masuk/keluar, dan tutup kasir.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {errorMsg && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground text-sm">Memuat status laci kasir...</div>
        ) : !currentSession ? (
          // Sesi Belum Dibuka
          <div className="space-y-4 py-2">
            <div className="p-4 bg-muted/50 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                  Laci Kasir Belum Dibuka
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Silakan masukkan modal awal laci uang tunai untuk memulai sesi penjualan.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="opening_cash">Modal Awal Kasir (Rp)</Label>
              <Input
                id="opening_cash"
                type="number"
                placeholder="Contoh: 100000"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="open_notes">Catatan Sesi (Opsional)</Label>
              <Input
                id="open_notes"
                placeholder="Catatan shift pagi / kas awal..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button
                disabled={!openingCash || openShiftMutation.isPending}
                onClick={() => openShiftMutation.mutate()}
              >
                {openShiftMutation.isPending ? "Membuka..." : "Buka Sesi Kasir"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // Sesi Sedang Aktif
          <Tabs defaultValue="status" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="status">Status Kas</TabsTrigger>
              <TabsTrigger value="movement">Kas Masuk/Keluar</TabsTrigger>
              <TabsTrigger value="close">Tutup Kasir</TabsTrigger>
            </TabsList>

            {/* Tab Status */}
            <TabsContent value="status" className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/40 rounded-xl border">
                  <span className="text-xs text-muted-foreground">Modal Awal</span>
                  <div className="text-base font-bold mt-1 text-foreground">
                    {formatIDR(currentSession.opening_cash)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Dibuka: {formatDateTime(currentSession.opened_at)}
                  </span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Penjualan Tunai
                  </span>
                  <div className="text-base font-bold mt-1 text-emerald-700 dark:text-emerald-400">
                    {formatIDR(currentSession.total_sales)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">Penjualan sesi aktif</span>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-xs text-blue-700 dark:text-blue-400 font-medium">Kas Masuk (In)</span>
                  <div className="text-base font-bold mt-1 text-blue-700 dark:text-blue-400">
                    +{formatIDR(currentSession.total_cash_in)}
                  </div>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <span className="text-xs text-rose-700 dark:text-rose-400 font-medium">Kas Keluar (Out)</span>
                  <div className="text-base font-bold mt-1 text-rose-700 dark:text-rose-400">
                    -{formatIDR(currentSession.total_cash_out)}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                    Ekspektasi Uang Tunai di Laci
                  </span>
                  <div className="text-2xl font-black text-primary mt-0.5">
                    {formatIDR(expectedCash)}
                  </div>
                </div>
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Shift Berjalan
                </Badge>
              </div>
            </TabsContent>

            {/* Tab Movement */}
            <TabsContent value="movement" className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={movementType === "CASH_IN" ? "default" : "outline"}
                  onClick={() => setMovementType("CASH_IN")}
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowDownRight className="w-4 h-4 text-emerald-500" />
                  Setor / Kas Masuk
                </Button>
                <Button
                  type="button"
                  variant={movementType === "CASH_OUT" ? "default" : "outline"}
                  onClick={() => setMovementType("CASH_OUT")}
                  className="flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4 text-rose-500" />
                  Tarik / Kas Keluar
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mov_amount">Nominal (Rp)</Label>
                <Input
                  id="mov_amount"
                  type="number"
                  placeholder="Contoh: 50000"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mov_reason">Alasan / Keterangan</Label>
                <Input
                  id="mov_reason"
                  placeholder="Contoh: Tambah uang kembalian / Beli bensin operasional"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                disabled={!movementAmount || !movementReason || addMovementMutation.isPending}
                onClick={() => addMovementMutation.mutate()}
              >
                {addMovementMutation.isPending ? "Menyimpan..." : "Simpan Mutasi Kas"}
              </Button>
            </TabsContent>

            {/* Tab Close */}
            <TabsContent value="close" className="space-y-4">
              <div className="p-3 bg-muted/40 rounded-xl border space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ekspektasi Kas Sistem:</span>
                  <span className="font-semibold text-foreground">{formatIDR(expectedCash)}</span>
                </div>
                {closingCash && (
                  <div className="flex justify-between text-sm pt-1 border-t border-border">
                    <span className="text-muted-foreground">Selisih (Diff):</span>
                    <span
                      className={`font-bold ${
                        diffCash === 0
                          ? "text-emerald-600"
                          : diffCash > 0
                          ? "text-blue-600"
                          : "text-rose-600"
                      }`}
                    >
                      {diffCash >= 0 ? `+${formatIDR(diffCash)}` : `-${formatIDR(Math.abs(diffCash))}`}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="close_actual">Uang Fisik Aktual di Laci (Rp)</Label>
                <Input
                  id="close_actual"
                  type="number"
                  placeholder="Hitung uang tunai di laci..."
                  value={closingCash}
                  onChange={(e) => setClosingCash(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="close_notes">Catatan Rekonsiliasi Tutup Kasir</Label>
                <Textarea
                  id="close_notes"
                  placeholder="Keterangan bila ada selisih atau catatan shift..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Button
                variant="destructive"
                className="w-full"
                disabled={!closingCash || closeShiftMutation.isPending}
                onClick={() => closeShiftMutation.mutate()}
              >
                {closeShiftMutation.isPending ? "Menutup..." : "Konfirmasi & Tutup Sesi Kasir"}
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  )
}
