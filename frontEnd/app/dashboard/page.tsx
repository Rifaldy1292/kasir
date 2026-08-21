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
} from "lucide-react"
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
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["dashboard-data"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/dashboard")
      return res.data.data
    },
  })

  const summary = dashboard || {}
  const trends = summary.daily_sales_trends || []
  const paymentSplits = summary.payment_method_breakdown || []
  const topProducts = summary.top_selling_products || []
  const recentTransactions = summary.recent_transactions || []

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
    </div>
  )
}
