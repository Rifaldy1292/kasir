"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
} from "@/components/ui/dialog"
import {
  Crown,
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
  Receipt,
  Search,
  Edit3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Coins,
  Store,
  RefreshCw,
  Phone,
  Mail,
  Zap,
} from "lucide-react"

interface SubscriptionPlan {
  id: number
  code: string
  name: string
  price_monthly: number
  price_yearly: number
  max_users: number
  max_workspaces: number
  features: string
  is_active: boolean
}

interface TenantItem {
  id: number
  name: string
  email: string
  phone: string
  plan_code: string
  plan_expires_at: string | null
  workspaces_count: number
  staff_count: number
  created_at: string
}

interface SuperadminStats {
  total_tenants: number
  total_workspaces: number
  total_staff: number
  total_transactions: number
  estimated_mrr: number
  active_subscribers: number
}

export default function SuperadminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const queryClient = useQueryClient()

  const [searchQuery, setSearchQuery] = useState("")
  const [filterPlan, setFilterPlan] = useState<string>("ALL")
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Edit Plan Dialog State
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [planForm, setPlanForm] = useState({
    name: "",
    price_monthly: 0,
    price_yearly: 0,
    max_users: 2,
    max_workspaces: 1,
  })

  // Edit Tenant Plan Dialog State
  const [selectedTenant, setSelectedTenant] = useState<TenantItem | null>(null)
  const [tenantPlanForm, setTenantPlanForm] = useState({
    plan_code: "PREMIUM",
    duration_months: 1,
  })

  // 1. Fetch Stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery<SuperadminStats>({
    queryKey: ["superadmin-stats"],
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/stats")
      return res.data.data
    },
    enabled: user?.role === "SUPERADMIN",
  })

  // 2. Fetch Plans
  const { data: plans = [], isLoading: plansLoading, refetch: refetchPlans } = useQuery<SubscriptionPlan[]>({
    queryKey: ["superadmin-plans"],
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/plans")
      return res.data.data
    },
    enabled: user?.role === "SUPERADMIN",
  })

  // 3. Fetch Tenants
  const { data: tenants = [], isLoading: tenantsLoading, refetch: refetchTenants } = useQuery<TenantItem[]>({
    queryKey: ["superadmin-tenants"],
    queryFn: async () => {
      const res = await apiClient.get("/superadmin/tenants")
      return res.data.data
    },
    enabled: user?.role === "SUPERADMIN",
  })

  // Mutation: Update Plan
  const updatePlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof planForm }) => {
      const res = await apiClient.put(`/superadmin/plans/${id}`, {
        name: data.name,
        price_monthly: Number(data.price_monthly),
        price_yearly: Number(data.price_yearly),
        max_users: Number(data.max_users),
        max_workspaces: Number(data.max_workspaces),
        is_active: true,
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-plans"] })
      queryClient.invalidateQueries({ queryKey: ["superadmin-stats"] })
      setSelectedPlan(null)
      setSuccessMsg("Harga dan kuota paket berhasil diperbarui!")
      setTimeout(() => setSuccessMsg(""), 4000)
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Gagal memperbarui paket")
      setTimeout(() => setErrorMsg(""), 4000)
    },
  })

  // Mutation: Update Tenant Plan
  const updateTenantPlanMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof tenantPlanForm }) => {
      const res = await apiClient.put(`/superadmin/tenants/${id}/plan`, {
        plan_code: data.plan_code,
        duration_months: Number(data.duration_months),
      })
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["superadmin-tenants"] })
      queryClient.invalidateQueries({ queryKey: ["superadmin-stats"] })
      setSelectedTenant(null)
      setSuccessMsg("Paket langganan tenant berhasil diubah!")
      setTimeout(() => setSuccessMsg(""), 4000)
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Gagal mengubah paket tenant")
      setTimeout(() => setErrorMsg(""), 4000)
    },
  })

  const openEditPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan)
    setPlanForm({
      name: plan.name,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      max_users: plan.max_users,
      max_workspaces: plan.max_workspaces,
    })
  }

  const openEditTenant = (tenant: TenantItem) => {
    setSelectedTenant(tenant)
    setTenantPlanForm({
      plan_code: tenant.plan_code || "STARTER",
      duration_months: 1,
    })
  }

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.phone && t.phone.includes(searchQuery))
    const matchesPlan = filterPlan === "ALL" || t.plan_code === filterPlan
    return matchesSearch && matchesPlan
  })

  // Guard for Superadmin
  if (!authLoading && user && user.role !== "SUPERADMIN") {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-6">
        <Card className="max-w-md w-full text-center p-8 border-destructive/30">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground">Akses Dibatasi</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Halaman ini khusus untuk CEO / Superadmin theKasir SaaS.
          </p>
          <Button className="mt-6 w-full" onClick={() => (window.location.href = "/pos")}>
            Kembali ke Aplikasi Kasir
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader
          title="Portal CEO theKasir"
          subtitle="Kendali SaaS Pusat: Manajemen Harga, Kuota Paket & Pemilik Toko"
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Notifications */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          )}
          {errorMsg && (
            <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
              <button onClick={() => setErrorMsg("")} className="text-muted-foreground hover:text-foreground">
                ✕
              </button>
            </div>
          )}

          {/* Top SaaS KPI Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* MRR Card */}
            <Card className="shadow-xs border-border bg-gradient-to-br from-primary/5 via-card to-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimasi MRR SaaS
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Coins className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-32 rounded-lg" />
                ) : (
                  <>
                    <div className="text-2xl font-black text-primary font-mono">
                      {formatIDR(stats?.estimated_mrr || 0)}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Pendapatan bulanan rutin tenant aktif
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Tenants */}
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pemilik Usaha (Owners)
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <Users className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 rounded-lg" />
                ) : (
                  <>
                    <div className="text-2xl font-black text-foreground">
                      {stats?.total_tenants || 0}{" "}
                      <span className="text-xs font-normal text-muted-foreground">tenant</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {stats?.active_subscribers || 0} langganan berbayar aktif
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Total Workspaces */}
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Gerai &amp; Toko Aktif
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <Store className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 rounded-lg" />
                ) : (
                  <>
                    <div className="text-2xl font-black text-foreground">
                      {stats?.total_workspaces || 0}{" "}
                      <span className="text-xs font-normal text-muted-foreground">cabang</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {stats?.total_staff || 0} staf kasir &amp; admin terdaftar
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Platform Volume */}
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Volume Transaksi
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <Receipt className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-24 rounded-lg" />
                ) : (
                  <>
                    <div className="text-2xl font-black text-foreground font-mono">
                      {stats?.total_transactions || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      Total struk diproses di seluruh toko
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="plans" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <TabsList className="bg-muted/80 p-1 rounded-xl">
                <TabsTrigger value="plans" className="text-xs gap-1.5 px-4">
                  <Coins className="w-3.5 h-3.5" /> Manajemen Harga &amp; Kuota Paket
                </TabsTrigger>
                <TabsTrigger value="tenants" className="text-xs gap-1.5 px-4">
                  <Building2 className="w-3.5 h-3.5" /> Data Pelanggan &amp; Toko Mitra
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => {
                    refetchStats()
                    refetchPlans()
                    refetchTenants()
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Segarkan
                </Button>
              </div>
            </div>

            {/* =========================================================================
                TAB 1: MANAJEMEN HARGA & KUOTA PAKET
               ========================================================================= */}
            <TabsContent value="plans" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plansLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Card key={i} className="p-6 space-y-4">
                      <Skeleton className="h-6 w-3/4 rounded-md" />
                      <Skeleton className="h-10 w-1/2 rounded-md" />
                      <Skeleton className="h-24 w-full rounded-md" />
                    </Card>
                  ))
                ) : (
                  plans.map((plan) => {
                    const isPremium = plan.code === "PREMIUM"
                    const isPlatinum = plan.code === "PLATINUM"

                    return (
                      <Card
                        key={plan.id}
                        className={`flex flex-col justify-between shadow-xs transition-all relative overflow-hidden ${
                          isPremium
                            ? "border-primary shadow-md shadow-primary/5 bg-primary/5"
                            : isPlatinum
                            ? "border-purple-500/40 bg-purple-500/5"
                            : "border-border"
                        }`}
                      >
                        {isPremium && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-black px-3 py-0.5 rounded-bl-lg">
                            REKOMENDASI
                          </div>
                        )}
                        {isPlatinum && (
                          <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-black px-3 py-0.5 rounded-bl-lg">
                            ENTERPRISE
                          </div>
                        )}

                        <CardHeader className="pb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-bold uppercase tracking-wider ${
                                isPlatinum
                                  ? "border-purple-500/40 text-purple-600 bg-purple-500/10"
                                  : isPremium
                                  ? "border-primary/40 text-primary bg-primary/10"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {plan.code}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {plan.code === "STARTER" && "Paket gratis rintisan UMKM toko tunggal."}
                            {plan.code === "PREMIUM" && "Ekspansi bisnis multi-staf dengan AI Gemini."}
                            {plan.code === "PLATINUM" && "Jaringan multi-cabang hingga 10 toko mandiri."}
                          </CardDescription>

                          {/* Pricing Display */}
                          <div className="pt-4 border-t border-border/60">
                            <div className="text-2xl font-black text-foreground font-mono">
                              {formatIDR(plan.price_monthly)}
                              <span className="text-xs font-normal text-muted-foreground"> / bulan</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              atau {formatIDR(plan.price_yearly)} / tahun
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 pt-0">
                          {/* Quota Highlights */}
                          <div className="p-3.5 rounded-xl bg-card border border-border/80 space-y-2.5 text-xs">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary" /> Batas Karyawan:
                              </span>
                              <span className="font-bold text-foreground">
                                {plan.max_users} Staf Berbeda
                              </span>
                            </div>
                            <div className="flex items-center justify-between font-semibold">
                              <span className="text-muted-foreground flex items-center gap-1.5">
                                <Store className="w-3.5 h-3.5 text-primary" /> Batas Cabang Toko:
                              </span>
                              <span className="font-bold text-foreground">
                                {plan.max_workspaces} Workspace
                              </span>
                            </div>
                          </div>

                          {/* Feature Points */}
                          <div className="space-y-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span>Transaksi POS &amp; Cetak Struk</span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              {plan.code !== "STARTER" ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 text-center text-muted-foreground/40 font-bold">✕</span>
                              )}
                              <span className={plan.code === "STARTER" ? "line-through text-muted-foreground" : ""}>
                                Asisten AI Gemini 2.0 &amp; Prediksi Stok
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              {plan.max_workspaces > 1 ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              ) : (
                                <span className="w-3.5 h-3.5 text-center text-muted-foreground/40 font-bold">✕</span>
                              )}
                              <span className={plan.max_workspaces <= 1 ? "line-through text-muted-foreground" : ""}>
                                Manajemen Multi-Cabang ({plan.max_workspaces} Toko)
                              </span>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-xs font-semibold gap-1.5"
                              onClick={() => openEditPlan(plan)}
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Ubah Harga &amp; Kuota
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            </TabsContent>

            {/* =========================================================================
                TAB 2: DATA PELANGGAN & TOKO MITRA (TENANTS)
               ========================================================================= */}
            <TabsContent value="tenants" className="space-y-4">
              <Card className="shadow-xs border-border">
                <CardHeader className="p-4 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border">
                  <div>
                    <CardTitle className="text-base font-bold">Daftar Pemilik Toko &amp; Tenant</CardTitle>
                    <CardDescription className="text-xs">
                      Pantau pemakaian kuota cabang toko dan staf kasir per tenant
                    </CardDescription>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Search */}
                    <div className="relative w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Cari nama, email, no. telp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 text-xs bg-muted/30"
                      />
                    </div>

                    {/* Plan Filter */}
                    <select
                      value={filterPlan}
                      onChange={(e) => setFilterPlan(e.target.value)}
                      className="h-8 rounded-lg border border-input bg-background px-2.5 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="ALL">Semua Paket</option>
                      <option value="STARTER">Starter</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="PLATINUM">Platinum</option>
                    </select>
                  </div>
                </CardHeader>

                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-xs font-bold">Pemilik Akun</TableHead>
                        <TableHead className="text-xs font-bold">Kontak</TableHead>
                        <TableHead className="text-xs font-bold">Paket Aktif</TableHead>
                        <TableHead className="text-xs font-bold">Masa Aktif</TableHead>
                        <TableHead className="text-xs font-bold text-center">Cabang Toko</TableHead>
                        <TableHead className="text-xs font-bold text-center">Staf Kasir</TableHead>
                        <TableHead className="text-xs font-bold">Terdaftar</TableHead>
                        <TableHead className="text-xs font-bold text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tenantsLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <TableRow key={i}>
                            <TableCell colSpan={8}>
                              <Skeleton className="h-8 w-full rounded-md" />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : filteredTenants.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-xs">
                            Tidak ada tenant yang cocok dengan filter.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredTenants.map((t) => {
                          const plan = plans.find((p) => p.code === t.plan_code)
                          const maxWs = plan?.max_workspaces || 1
                          const maxUsers = plan?.max_users || 2

                          return (
                            <TableRow key={t.id} className="text-xs hover:bg-muted/30">
                              <TableCell className="font-semibold text-foreground">
                                <div>{t.name}</div>
                                <div className="text-[11px] text-muted-foreground font-normal">{t.email}</div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {t.phone || "-"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold ${
                                    t.plan_code === "PLATINUM"
                                      ? "border-purple-500/40 text-purple-600 bg-purple-500/10"
                                      : t.plan_code === "PREMIUM"
                                      ? "border-primary/40 text-primary bg-primary/10"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {t.plan_code || "STARTER"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {t.plan_expires_at ? (
                                  <div className="flex items-center gap-1 font-mono text-[11px]">
                                    <Calendar className="w-3 h-3 text-muted-foreground" />
                                    {formatDateTime(t.plan_expires_at)}
                                  </div>
                                ) : (
                                  <span className="text-emerald-600 font-medium">Selamanya</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                <span
                                  className={`font-bold ${
                                    t.workspaces_count >= maxWs ? "text-amber-600" : "text-foreground"
                                  }`}
                                >
                                  {t.workspaces_count}
                                </span>{" "}
                                <span className="text-muted-foreground">/ {maxWs}</span>
                              </TableCell>
                              <TableCell className="text-center font-mono">
                                <span
                                  className={`font-bold ${
                                    t.staff_count >= maxUsers ? "text-amber-600" : "text-foreground"
                                  }`}
                                >
                                  {t.staff_count}
                                </span>{" "}
                                <span className="text-muted-foreground">/ {maxUsers}</span>
                              </TableCell>
                              <TableCell className="text-muted-foreground font-mono text-[11px]">
                                {formatDateTime(t.created_at)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs font-medium px-2.5"
                                  onClick={() => openEditTenant(t)}
                                >
                                  Atur Paket
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: EDIT HARGA & KUOTA PAKET
         ========================================================================= */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" /> Ubah Paket {selectedPlan?.code}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ubah tarif langganan dan batasan kuota cabang &amp; staf untuk paket ini.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedPlan) return
              updatePlanMutation.mutate({ id: selectedPlan.id, data: planForm })
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Nama Paket</Label>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                required
                className="mt-1 h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Harga Bulanan (Rp)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={planForm.price_monthly}
                  onChange={(e) => setPlanForm({ ...planForm, price_monthly: Number(e.target.value) })}
                  required
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Harga Tahunan (Rp)</Label>
                <Input
                  type="number"
                  min="0"
                  step="1000"
                  value={planForm.price_yearly}
                  onChange={(e) => setPlanForm({ ...planForm, price_yearly: Number(e.target.value) })}
                  required
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Maks. Karyawan (Staff)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={planForm.max_users}
                  onChange={(e) => setPlanForm({ ...planForm, max_users: Number(e.target.value) })}
                  required
                  className="mt-1 h-8 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">Akun kasir/admin aktif</span>
              </div>
              <div>
                <Label className="text-xs font-semibold">Maks. Cabang Toko</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={planForm.max_workspaces}
                  onChange={(e) => setPlanForm({ ...planForm, max_workspaces: Number(e.target.value) })}
                  required
                  className="mt-1 h-8 text-xs font-mono"
                />
                <span className="text-[10px] text-muted-foreground">Workspace toko terpisah</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setSelectedPlan(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-semibold gap-1.5"
                disabled={updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          MODAL 2: ATUR PAKET TENANT / OWNER
         ========================================================================= */}
      <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Crown className="w-4 h-4 text-primary" /> Atur Paket Langganan Tenant
            </DialogTitle>
            <DialogDescription className="text-xs">
              Ubah paket untuk <strong>{selectedTenant?.name}</strong> ({selectedTenant?.email})
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!selectedTenant) return
              updateTenantPlanMutation.mutate({ id: selectedTenant.id, data: tenantPlanForm })
            }}
            className="space-y-4 pt-2"
          >
            <div>
              <Label className="text-xs font-semibold">Pilih Paket Langganan</Label>
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                {plans.map((p) => {
                  const isSelected = tenantPlanForm.plan_code === p.code
                  return (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => setTenantPlanForm({ ...tenantPlanForm, plan_code: p.code })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-xs"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className="text-xs font-bold text-foreground">{p.code}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {p.max_users} staf • {p.max_workspaces} ws
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {tenantPlanForm.plan_code !== "STARTER" && (
              <div>
                <Label className="text-xs font-semibold">Durasi Langganan</Label>
                <select
                  value={tenantPlanForm.duration_months}
                  onChange={(e) =>
                    setTenantPlanForm({ ...tenantPlanForm, duration_months: Number(e.target.value) })
                  }
                  className="w-full mt-1.5 h-8 rounded-lg border border-input bg-background px-3 text-xs font-medium text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value={1}>1 Bulan</option>
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={12}>12 Bulan (1 Tahun)</option>
                  <option value={24}>24 Bulan (2 Tahun)</option>
                </select>
              </div>
            )}

            <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 text-muted-foreground">
              <div className="font-semibold text-foreground">Konsekuensi Perubahan:</div>
              {tenantPlanForm.plan_code === "STARTER" ? (
                <div>Owner kembali ke batas gratis: Maks 2 staf, maks 1 cabang toko.</div>
              ) : tenantPlanForm.plan_code === "PREMIUM" ? (
                <div>Owner mendapatkan batas: Hingga 10 staf, maks 2 cabang toko, AI Gemini aktif.</div>
              ) : (
                <div>Owner mendapatkan batas: Hingga 10 staf, hingga 10 cabang toko, AI Gemini aktif.</div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => setSelectedTenant(null)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs font-semibold gap-1.5"
                disabled={updateTenantPlanMutation.isPending}
              >
                {updateTenantPlanMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  "Terapkan Paket"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
