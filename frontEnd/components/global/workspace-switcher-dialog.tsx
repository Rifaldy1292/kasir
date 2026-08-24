"use client"

import React, { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Store,
  Check,
  Plus,
  ArrowRightLeft,
  Building2,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
} from "lucide-react"

interface WorkspaceSwitcherDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkspaceSwitcherDialog({ open, onOpenChange }: WorkspaceSwitcherDialogProps) {
  const queryClient = useQueryClient()
  const { user, workspace: currentWorkspace, switchWorkspace, createWorkspace } = useAuth()
  const [isCreating, setIsCreating] = useState(false)
  const [switchingId, setSwitchingId] = useState<number | null>(null)
  const [errorMsg, setErrorMsg] = useState("")

  // Form for creating new workspace
  const [newWsForm, setNewWsForm] = useState({
    name: "",
    business_type: "Retail / Minimarket",
    phone: "",
    address: "",
    currency: "IDR",
    tax_rate: 0,
  })
  const [createLoading, setCreateLoading] = useState(false)

  // Fetch all accessible workspaces
  const { data: workspaces = [], isLoading, refetch } = useQuery({
    queryKey: ["my-workspaces"],
    queryFn: async () => {
      const res = await apiClient.get("/auth/my-workspaces")
      return res.data.data || []
    },
    enabled: open,
  })

  const handleSwitch = async (wsId: number) => {
    if (wsId === currentWorkspace?.id) return
    setSwitchingId(wsId)
    setErrorMsg("")
    try {
      await switchWorkspace(wsId)
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal berpindah workspace")
      setSwitchingId(null)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateLoading(true)
    setErrorMsg("")
    try {
      await createWorkspace(newWsForm)
      setIsCreating(false)
      setNewWsForm({
        name: "",
        business_type: "Retail / Minimarket",
        phone: "",
        address: "",
        currency: "IDR",
        tax_rate: 0,
      })
      refetch()
      onOpenChange(false)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal membuat toko baru")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-border bg-card shadow-2xl">
        <DialogHeader className="p-4 pb-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            <div>
              <DialogTitle className="text-base font-bold">Pilih Toko / Workspace</DialogTitle>
              <DialogDescription className="text-xs">
                Kelola atau beralih ke toko / cabang bisnis Anda
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isCreating ? (
            <>
              {/* Workspaces List */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Daftar Toko Tersedia ({workspaces.length})
                </div>

                {isLoading ? (
                  <div className="py-8 flex flex-col items-center justify-center text-muted-foreground text-xs gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span>Memuat daftar toko...</span>
                  </div>
                ) : workspaces.length === 0 ? (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    Belum ada toko lain yang terdaftar.
                  </div>
                ) : (
                  workspaces.map((ws: any) => {
                    const isActive = ws.id === currentWorkspace?.id
                    const isBusy = switchingId === ws.id

                    return (
                      <div
                        key={ws.id}
                        onClick={() => !isActive && !isBusy && handleSwitch(ws.id)}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          isActive
                            ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-xs"
                            : "bg-background border-border hover:border-primary/40 hover:bg-muted/40 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {ws.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs truncate text-foreground">
                                {ws.name}
                              </span>
                              {isActive && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[9px] px-1.5 py-0 h-4 border-none font-semibold">
                                  Aktif
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span className="flex items-center gap-1 truncate">
                                <Building2 className="w-2.5 h-2.5" />
                                {ws.business_type || "Retail"}
                              </span>
                              {ws.address && (
                                <span className="flex items-center gap-1 truncate max-w-[140px]">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {ws.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          {isActive ? (
                            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 px-2.5 shadow-xs"
                              disabled={isBusy}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSwitch(ws.id)
                              }}
                            >
                              {isBusy ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <ArrowRightLeft className="w-3 h-3" />
                                  <span>Pilih</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Add Workspace Button (Only for OWNER) */}
              {user?.role === "OWNER" && (
                <div className="pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    className="w-full h-9 text-xs font-semibold gap-2 border-dashed hover:border-primary hover:text-primary"
                    onClick={() => setIsCreating(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Buat Toko / Cabang Baru</span>
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Create New Workspace Sub-Form */
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles className="w-3.5 h-3.5" />
                  Buat Toko / Cabang Baru
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[11px] px-2 text-muted-foreground"
                  onClick={() => setIsCreating(false)}
                >
                  Batal
                </Button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="space-y-1">
                  <Label htmlFor="create_ws_name" className="text-xs font-semibold">Nama Toko *</Label>
                  <Input
                    id="create_ws_name"
                    placeholder="Contoh: Toko Berkah Cabang 2"
                    value={newWsForm.name}
                    onChange={(e) => setNewWsForm({ ...newWsForm, name: e.target.value })}
                    required
                    className="h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label htmlFor="create_ws_type" className="text-xs">Jenis Usaha</Label>
                    <Input
                      id="create_ws_type"
                      placeholder="Retail / F&B"
                      value={newWsForm.business_type}
                      onChange={(e) => setNewWsForm({ ...newWsForm, business_type: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="create_ws_phone" className="text-xs">No. Telepon</Label>
                    <Input
                      id="create_ws_phone"
                      placeholder="081234567890"
                      value={newWsForm.phone}
                      onChange={(e) => setNewWsForm({ ...newWsForm, phone: e.target.value })}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="create_ws_addr" className="text-xs">Alamat Toko</Label>
                  <Input
                    id="create_ws_addr"
                    placeholder="Jl. Raya No. 123"
                    value={newWsForm.address}
                    onChange={(e) => setNewWsForm({ ...newWsForm, address: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-1/3 h-9 text-xs"
                  onClick={() => setIsCreating(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="flex-1 h-9 text-xs font-bold gap-1.5"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Buat &amp; Buka Toko</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
