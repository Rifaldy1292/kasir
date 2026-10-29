"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { formatIDR, formatDateTime } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  ArrowUpRight,
  Sparkles,
  Bot,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ArrowRight,
  Crown,
  Lock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { AIChatWidget } from "@/components/global/ai-chat-widget"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"]

export default function DashboardPage() {
  const { user } = useAuth()
  const isPaidPlan =
    user?.role === "SUPERADMIN" ||
    user?.plan_code === "PREMIUM" ||
    user?.plan_code === "PLATINUM"

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/dashboard")
      return res.data.data
    },
  })

  const {
    data: insightsData,
    isLoading: isInsightsLoading,
    refetch: fetchInsights,
    isFetching: isInsightsFetching,
    error: insightsError,
  } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => {
      const res = await apiClient.get("/ai/insights")
      return res.data.data
    },
    enabled: false, // triggered on user request
  })

  const summary = dashboard || {}
  const trends = summary.daily_sales_trends || []
  const paymentSplits = summary.payment_method_breakdown || []
  const topProducts = summary.top_selling_products || []
  const recentTransactions = summary.recent_transactions || []
  const aiInsights = insightsData || []

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Dashboard Bisnis" subtitle="Ringkasan Kinerja & Metrik Penjualan" />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Penjualan Hari Ini
                </CardTitle>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-40 rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-foreground">
                      {formatIDR(summary.today_sales_amount)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {summary.today_transaction_count || 0} transaksi selesai hari ini
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Penjualan Bulan Ini
                </CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-36 rounded-lg" />
                    <Skeleton className="h-3 w-44 rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-foreground">
                      {formatIDR(summary.month_sales_amount)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total omzet bulan berjalan</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Estimasi Laba Kotor
                </CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-32 rounded-lg" />
                    <Skeleton className="h-3 w-48 rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-purple-600">
                      {formatIDR(summary.month_estimated_profit)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Selisih harga jual vs harga modal</p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-xs border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Peringatan Stok
                </CardTitle>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-24 rounded-lg" />
                    <Skeleton className="h-3 w-36 rounded-md" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-black text-amber-600">
                      {summary.low_stock_count || 0}{" "}
                      <span className="text-sm font-normal text-muted-foreground">
                        / {summary.total_products_count || 0} produk
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Produk perlu restock segera</p>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* AI Strategic Insights Section */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm overflow-hidden">
            <CardHeader className="p-5 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-xs shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-bold text-foreground">
                      AI Business Intelligence & Insights
                    </CardTitle>
                    <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20 font-semibold px-2 py-0">
                      Gemini 2.0
                    </Badge>
                  </div>
                  <CardDescription className="text-xs mt-0.5">
                    Analisis pintar otomatis dari pola penjualan, margin, dan pergerakan stok toko Anda
                  </CardDescription>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/inventory/ai-prediction">
                  <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border hover:bg-muted">
                    <Package className="w-3.5 h-3.5 text-primary" />
                    <span>Prediksi Stok AI</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </Link>

                {!isPaidPlan ? (
                  <Link href="/#harga">
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 shadow-xs"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Paket Premium</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => fetchInsights()}
                    disabled={isInsightsFetching}
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isInsightsFetching ? "animate-spin" : ""}`} />
                    <span>{aiInsights.length > 0 ? "Perbarui Analisis" : "Analisis Sekarang"}</span>
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {!isPaidPlan ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-background/50 border border-primary/15 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Crown className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        Wawasan Bisnis AI Gemini 2.0 (Eksklusif Premium &amp; Platinum)
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Toko Anda saat ini menggunakan paket <strong>{user?.plan_code || "STARTER"}</strong>. Dapatkan evaluasi otomatis margin laba, tren penjualan, dan saran strategis dengan beralih ke paket Premium.
                      </p>
                    </div>
                  </div>
                  <Link href="/#harga" className="shrink-0">
                    <Button size="sm" className="h-8 text-xs font-semibold bg-primary text-primary-foreground shadow-xs">
                      Upgrade Paket
                    </Button>
                  </Link>
                </div>
              ) : isInsightsFetching ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28 rounded-md" />
                        <Skeleton className="h-4 w-16 rounded-full" />
                      </div>
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-12 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              ) : aiInsights.length === 0 ? (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5">
                  <div className="flex items-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                      <Lightbulb className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Belum ada analisis yang dijalankan untuk sesi ini
                      </h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Klik tombol <strong>&quot;Analisis Sekarang&quot;</strong> di atas untuk meminta AI mengevaluasi tren omzet, produk unggulan, dan peringatan stok secara instan.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => fetchInsights()}
                    size="sm"
                    variant="outline"
                    className="shrink-0 text-xs border-primary/30 text-primary hover:bg-primary/10"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Minta Wawasan AI
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {aiInsights.map((ins: any, idx: number) => {
                    const isPositive = ins.severity === "positive"
                    const isWarning = ins.severity === "warning" || ins.severity === "danger"

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all duration-200 hover:shadow-xs ${
                          isPositive
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : isWarning
                            ? "bg-amber-500/5 border-amber-500/20"
                            : "bg-card border-border"
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              {isPositive ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ) : isWarning ? (
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                              ) : (
                                <Lightbulb className="w-3 h-3 text-primary" />
                              )}
                              {ins.type || "Insight"}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 h-4 capitalize ${
                                isPositive
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                  : isWarning
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  : "bg-primary/10 text-primary border-primary/30"
                              }`}
                            >
                              {ins.severity || "Info"}
                            </Badge>
                          </div>

                          <h4 className="text-xs font-bold text-foreground leading-snug">
                            {ins.title}
                          </h4>

                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {ins.description}
                          </p>
                        </div>

                        {ins.recommendation && (
                          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-start gap-1.5">
                            <span className="text-[10px] font-semibold text-primary shrink-0 mt-0.5">Saran:</span>
                            <p className="text-[11px] text-foreground font-medium leading-tight">
                              {ins.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Trend Bar Chart (2 Cols) */}
            <Card className="lg:col-span-2 shadow-xs border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold">Tren Penjualan 7 Hari Terakhir</CardTitle>
                <CardDescription>Grafik pergerakan nominal omzet harian</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[280px] w-full rounded-xl" />
                ) : (
                  <div className="h-[280px] w-full">
                    {trends.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                        Belum ada data transaksi dalam 7 hari terakhir.
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trends} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            tickFormatter={(val) => `${val / 1000}k`}
                          />
                          <Tooltip
                            formatter={(value: any) => [formatIDR(Number(value)), "Omzet"]}
                            labelFormatter={(label) => `Tanggal: ${label}`}
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              borderColor: "var(--border)",
                              borderRadius: "8px",
                              fontSize: "12px",
                            }}
                          />
                          <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method Distribution (1 Col) */}
            <Card className="shadow-xs border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold">Metode Pembayaran</CardTitle>
                <CardDescription>Distribusi nominal transaksi per channel</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-[180px] w-full rounded-full mx-auto max-w-[180px]" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full rounded-md" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-[200px] w-full">
                      {paymentSplits.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                          Belum ada data pembayaran bulan ini.
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={paymentSplits}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={80}
                              paddingAngle={3}
                              dataKey="total"
                              nameKey="method"
                            >
                              {paymentSplits.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value: any) => [formatIDR(Number(value)), "Total"]}
                              contentStyle={{
                                backgroundColor: "var(--card)",
                                borderColor: "var(--border)",
                                borderRadius: "8px",
                                fontSize: "12px",
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>

                    <div className="mt-4 space-y-1.5">
                      {paymentSplits.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="font-medium text-foreground">{item.method}</span>
                          </div>
                          <span className="font-bold">{formatIDR(item.total)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Tables Row: Top Products & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            {/* Top 5 Products */}
            <Card className="shadow-xs border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" /> Top 5 Produk Terlaris
                </CardTitle>
                <CardDescription>Berdasarkan kuantitas terjual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))
                  ) : topProducts.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      Belum ada data penjualan produk.
                    </p>
                  ) : (
                    topProducts.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-foreground">{item.product_name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              Terjual {item.total_qty} pcs
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-primary">
                          {formatIDR(item.total_sales)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="shadow-xs border-border">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-primary" /> Transaksi Terbaru
                </CardTitle>
                <CardDescription>Aktivitas penjualan kasir terkini</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))
                  ) : recentTransactions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">
                      Belum ada riwayat transaksi.
                    </p>
                  ) : (
                    recentTransactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-muted/20"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold font-mono text-foreground">
                              {tx.invoice_number}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 h-4 ${
                                tx.status === "COMPLETED"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : tx.status === "HOLD"
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                              }`}
                            >
                              {tx.status}
                            </Badge>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {formatDateTime(tx.created_at)} • Kasir: {tx.user?.name || "-"}
                          </div>
                        </div>

                        <span className="text-xs font-bold text-foreground">
                          {formatIDR(tx.total_amount)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating AI Business Assistant Chatbot */}
      <AIChatWidget />
    </div>
  )
}
