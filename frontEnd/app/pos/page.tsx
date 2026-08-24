"use client"

import React, { useState, useEffect, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { useCartStore, CartProduct, HeldCart } from "@/lib/cart-store"
import { formatIDR, getImageUrl } from "@/lib/formatters"
import { AppSidebar } from "@/components/global/app-sidebar"
import { AppHeader } from "@/components/global/app-header"
import { ReceiptModal } from "@/components/global/receipt-modal"
import { AIChatWidget } from "@/components/global/ai-chat-widget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  Search,
  Barcode,
  Trash2,
  Plus,
  Minus,
  Pause,
  Play,
  RotateCcw,
  CreditCard,
  QrCode,
  Banknote,
  Percent,
  CheckCircle2,
  AlertCircle,
  User,
  ShoppingBag,
  ArrowRight,
  Building2,
} from "lucide-react"

export default function PosPage() {
  const queryClient = useQueryClient()
  const { workspace } = useAuth()
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Cart Store
  const {
    items,
    customer,
    taxRate,
    discountAmount,
    notes,
    heldCarts,
    addItem,
    removeItem,
    updateQty,
    setItemDiscount,
    setCustomer,
    setTaxRate,
    setDiscountAmount,
    setNotes,
    clearCart,
    holdCurrentCart,
    resumeCart,
    deleteHeldCart,
    getSubtotal,
    getTaxAmount,
    getTotalAmount,
  } = useCartStore()

  // Local state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isHeldOpen, setIsHeldOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "CARD" | "TRANSFER">("CASH")
  const [paidAmount, setPaidAmount] = useState("")
  const [checkoutError, setCheckoutError] = useState("")
  const [completedTx, setCompletedTx] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [mobileTab, setMobileTab] = useState<"catalog" | "cart">("catalog")

  // Sync workspace tax rate
  useEffect(() => {
    if (workspace && workspace.tax_rate !== undefined) {
      setTaxRate(workspace.tax_rate)
    }
  }, [workspace, setTaxRate])

  // Queries
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiClient.get("/categories")
      return res.data.data || []
    },
  })

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products", selectedCategory, searchQuery],
    queryFn: async () => {
      let url = "/products?is_active=true"
      if (selectedCategory) url += `&category_id=${selectedCategory}`
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`
      const res = await apiClient.get(url)
      return res.data.data || []
    },
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await apiClient.get("/customers")
      return res.data.data || []
    },
  })

  // Barcode / Enter search auto-add
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      const match = products.find(
        (p: CartProduct) =>
          p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      )
      if (match) {
        if (match.stock > 0) {
          addItem(match)
          setSearchQuery("")
        }
      }
    }
  }

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        customer_id: customer ? customer.id : null,
        items: items.map((i) => ({
          product_id: i.product.id,
          qty: i.qty,
          discount_amount: i.discountAmount,
        })),
        discount_amount: discountAmount,
        tax_rate: taxRate,
        paid_amount: paymentMethod === "CASH" ? parseFloat(paidAmount) || getTotalAmount() : getTotalAmount(),
        payment_method: paymentMethod,
        notes,
        is_hold: false,
      }

      const res = await apiClient.post("/pos/checkout", payload)
      return res.data.data
    },
    onSuccess: (data) => {
      setCompletedTx(data)
      setIsCheckoutOpen(false)
      setIsReceiptOpen(true)
      clearCart()
      setPaidAmount("")
      setCheckoutError("")
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["current-session"] })
    },
    onError: (err: any) => {
      setCheckoutError(err?.response?.data?.message || "Gagal memproses pembayaran")
    },
  })

  const subtotal = getSubtotal()
  const tax = getTaxAmount()
  const total = getTotalAmount()
  const paidVal = parseFloat(paidAmount) || 0
  const changeVal = Math.max(0, paidVal - total)

  const handleOpenCheckout = () => {
    if (items.length === 0) return
    setPaidAmount(total.toString())
    setCheckoutError("")
    setIsCheckoutOpen(true)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AppHeader title="Terminal Kasir" subtitle="Sistem Penjualan & Point of Sale">
          {heldCarts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHeldOpen(true)}
              className="gap-2 h-9 text-xs border-amber-500/40 text-amber-600 bg-amber-500/10"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Tertunda ({heldCarts.length})</span>
            </Button>
          )}
        </AppHeader>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden border-b border-border bg-card p-2 gap-2 shrink-0">
          <Button
            variant={mobileTab === "catalog" ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs h-8"
            onClick={() => setMobileTab("catalog")}
          >
            Katalog Produk
          </Button>
          <Button
            variant={mobileTab === "cart" ? "default" : "outline"}
            size="sm"
            className="flex-1 text-xs h-8 gap-1.5"
            onClick={() => setMobileTab("cart")}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Keranjang ({items.reduce((s, i) => s + i.qty, 0)})
          </Button>
        </div>

        {/* Main Split Layout: Catalog (Left) + Cart (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* Left: Product Catalog */}
          <div className={`flex-1 flex-col p-3 sm:p-4 overflow-hidden border-r border-border ${
            mobileTab === "cart" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Search and Category Filter Bar */}
            <div className="space-y-3 pb-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Cari produk berdasarkan nama, barcode, atau scan SKU..."
                  className="pl-9 pr-10 h-11 bg-card border-border shadow-xs"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  autoFocus
                />
                <Barcode className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              </div>

              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <Button
                  size="sm"
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  className="h-8 text-xs font-medium shrink-0 rounded-full"
                >
                  Semua Kategori
                </Button>
                {categories.map((cat: any) => (
                  <Button
                    key={cat.id}
                    size="sm"
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="h-8 text-xs font-medium shrink-0 rounded-full"
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto pr-1">
              {productsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="p-3 rounded-xl border border-border bg-card space-y-2.5">
                      <Skeleton className="w-full h-24 rounded-lg" />
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                      <Skeleton className="h-3 w-1/2 rounded-md" />
                      <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-3 w-8 rounded-md" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-20 text-center space-y-2">
                  <ShoppingBag className="w-10 h-10 mx-auto text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">Tidak ada produk ditemukan</p>
                  <p className="text-xs text-muted-foreground">
                    Coba ubah kata kunci pencarian atau kategori.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {products.map((p: CartProduct) => {
                    const isOutOfStock = p.stock <= 0
                    const isLowStock = p.stock > 0 && p.stock <= 5

                    return (
                      <button
                        key={p.id}
                        disabled={isOutOfStock}
                        onClick={() => addItem(p)}
                        className={`text-left p-3 rounded-xl border bg-card transition-all flex flex-col justify-between group relative overflow-hidden select-none ${
                          isOutOfStock
                            ? "opacity-50 cursor-not-allowed border-dashed bg-muted/40"
                            : "hover:border-primary hover:shadow-md active:scale-[0.98] cursor-pointer"
                        }`}
                      >
                        {/* Image or Placeholder */}
                        <div className="w-full h-24 rounded-lg bg-muted/60 mb-2.5 overflow-hidden flex items-center justify-center relative">
                          {p.image_url ? (
                            <img
                              src={getImageUrl(p.image_url)}
                              alt={p.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ShoppingBag className="w-7 h-7 text-muted-foreground/40" />
                          )}

                          {isOutOfStock ? (
                            <Badge
                              variant="destructive"
                              className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0 h-4"
                            >
                              Habis
                            </Badge>
                          ) : isLowStock ? (
                            <Badge
                              variant="outline"
                              className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium"
                            >
                              Sisa {p.stock}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0 h-4 bg-background/80 backdrop-blur-xs font-mono"
                            >
                              Stok {p.stock}
                            </Badge>
                          )}
                        </div>

                        {/* Title & Info */}
                        <div className="space-y-1 w-full">
                          <h2 className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                            {p.name}
                          </h2>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {p.barcode || p.sku || "-"}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between w-full">
                          <span className="text-xs font-bold text-primary">
                            {formatIDR(p.sell_price)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">/{p.unit || "Pcs"}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Mobile Floating Cart Summary Bar */}
            {mobileTab === "catalog" && items.length > 0 && (
              <div className="lg:hidden p-3 border-t border-border bg-card/95 backdrop-blur-md flex items-center justify-between shadow-lg mt-auto shrink-0">
                <div>
                  <div className="text-[11px] text-muted-foreground">{items.reduce((s, i) => s + i.qty, 0)} Item dipilih</div>
                  <div className="text-sm font-bold text-primary">{formatIDR(total)}</div>
                </div>
                <Button size="sm" onClick={() => setMobileTab("cart")} className="gap-1.5 text-xs font-bold shadow-xs">
                  Lihat Keranjang <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Right: Active Cart Panel */}
          <div className={`w-full lg:w-96 flex-col h-full bg-card shrink-0 ${
            mobileTab === "catalog" ? "hidden lg:flex" : "flex"
          }`}>
            {/* Cart Header */}
            <div className="p-4 border-b border-border space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">Keranjang Kasir</span>
                  <Badge variant="secondary" className="text-xs h-5 px-1.5 font-bold">
                    {items.reduce((s, i) => s + i.qty, 0)}
                  </Badge>
                </div>
                {items.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCart}
                    className="h-7 text-[11px] text-destructive hover:bg-destructive/10 px-2"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" /> Reset
                  </Button>
                )}
              </div>

              {/* Customer Selector */}
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <Select
                    value={customer ? customer.id.toString() : "0"}
                    onValueChange={(val: any) => {
                      const cId = parseInt(val as string)
                      if (!cId || cId === 0) {
                        setCustomer(null)
                      } else {
                        const found = customers.find((c: any) => c.id === cId)
                        setCustomer(found || null)
                      }
                    }}
                  >
                    <SelectTrigger className="w-full text-xs h-8 rounded-lg bg-background border border-border">
                      <SelectValue placeholder="Pilih Pelanggan (Umum)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">-- Umum / Tanpa Pelanggan --</SelectItem>
                      {customers.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.name} {c.phone ? `(${c.phone})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                  <ShoppingBag className="w-10 h-10 opacity-30" />
                  <p className="text-xs font-medium">Keranjang masih kosong</p>
                  <p className="text-[11px] opacity-70">
                    Klik produk di katalog atau scan barcode untuk menambahkan item
                  </p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-foreground line-clamp-1">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {formatIDR(item.product.sell_price)} / {item.product.unit || "Pcs"}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-foreground shrink-0">
                        {formatIDR(item.subtotal)}
                      </span>
                    </div>

                    {/* Quantity Adjustment Controls */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 bg-background border border-border rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateQty(item.product.id, item.qty - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          disabled={item.qty >= item.product.stock}
                          onClick={() => updateQty(item.product.id, item.qty + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeItem(item.product.id)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          title="Hapus Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            <div className="p-4 border-t border-border bg-card space-y-3 shrink-0">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">{formatIDR(subtotal)}</span>
                </div>

                {taxRate > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Pajak (PPN {taxRate}%)</span>
                    <span className="font-semibold text-foreground">+{formatIDR(tax)}</span>
                  </div>
                )}

                {discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600 font-medium">
                    <span>Diskon</span>
                    <span>-{formatIDR(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-border">
                  <span className="text-sm font-bold text-foreground uppercase tracking-wider">
                    Total
                  </span>
                  <span className="text-xl font-black text-primary">{formatIDR(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={items.length === 0}
                  onClick={() => holdCurrentCart()}
                  className="h-10 text-xs font-semibold"
                  title="Simpan sementara pesanan ini"
                >
                  <Pause className="w-3.5 h-3.5 mr-1" /> Tahan
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={items.length === 0}
                  onClick={handleOpenCheckout}
                  className="col-span-2 h-10 text-xs font-bold gap-1.5 shadow-md"
                >
                  Bayar ({formatIDR(total)}) <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Pembayaran Kasir</DialogTitle>
            <DialogDescription>
              Pilih metode pembayaran dan masukkan nominal bayar uang pelanggan.
            </DialogDescription>
          </DialogHeader>

          {checkoutError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="space-y-4 py-1">
            {/* Total Bill Display */}
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">
                Total Tagihan
              </span>
              <div className="text-3xl font-black text-primary mt-1">{formatIDR(total)}</div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <Label>Metode Pembayaran</Label>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  type="button"
                  variant={paymentMethod === "CASH" ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-[11px]"
                  onClick={() => {
                    setPaymentMethod("CASH")
                    setPaidAmount(total.toString())
                  }}
                >
                  <Banknote className="w-4 h-4" /> Tunai
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "QRIS" ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-[11px]"
                  onClick={() => {
                    setPaymentMethod("QRIS")
                    setPaidAmount(total.toString())
                  }}
                >
                  <QrCode className="w-4 h-4" /> QRIS
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "CARD" ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-[11px]"
                  onClick={() => {
                    setPaymentMethod("CARD")
                    setPaidAmount(total.toString())
                  }}
                >
                  <CreditCard className="w-4 h-4" /> Kartu
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === "TRANSFER" ? "default" : "outline"}
                  size="sm"
                  className="h-12 flex flex-col gap-1 text-[11px]"
                  onClick={() => {
                    setPaymentMethod("TRANSFER")
                    setPaidAmount(total.toString())
                  }}
                >
                  <Building2 className="w-4 h-4" /> Transfer
                </Button>
              </div>
            </div>

            {/* Cash Input & Quick Nominals */}
            {paymentMethod === "CASH" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="paid_amount">Nominal Uang Diterima (Rp)</Label>
                  <Input
                    id="paid_amount"
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="text-lg font-bold font-mono h-11"
                    autoFocus
                  />
                </div>

                {/* Quick Nominal Buttons */}
                <div className="grid grid-cols-4 gap-1.5">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setPaidAmount(total.toString())}
                  >
                    Uang Pas
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setPaidAmount("50000")}
                  >
                    50.000
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setPaidAmount("100000")}
                  >
                    100.000
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => setPaidAmount("200000")}
                  >
                    200.000
                  </Button>
                </div>

                {/* Change Display */}
                <div className="p-3 bg-muted/50 rounded-xl border flex justify-between items-center">
                  <span className="text-xs font-semibold text-muted-foreground">Uang Kembalian:</span>
                  <span
                    className={`text-lg font-black font-mono ${
                      paidVal >= total ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {paidVal >= total ? formatIDR(changeVal) : "Kurang " + formatIDR(total - paidVal)}
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === "QRIS" && (
              <div className="p-4 bg-muted/40 rounded-xl border text-center space-y-2">
                <div className="w-32 h-32 bg-white p-2 mx-auto rounded-lg border shadow-xs flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-black" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Arahkan pelanggan untuk memindai QRIS Dinamis melalui aplikasi perbankan/e-wallet.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setIsCheckoutOpen(false)}>
              Batal
            </Button>
            <Button
              disabled={
                checkoutMutation.isPending ||
                (paymentMethod === "CASH" && paidVal < total)
              }
              onClick={() => checkoutMutation.mutate()}
              className="gap-2 font-bold px-6"
            >
              {checkoutMutation.isPending ? "Memproses..." : "Selesaikan Transaksi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Held Carts Modal */}
      <Dialog open={isHeldOpen} onOpenChange={setIsHeldOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Daftar Transaksi Tertunda</DialogTitle>
            <DialogDescription>
              Lanjutkan kembali pesanan yang ditunda sebelumnya.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2.5 max-h-[60vh] overflow-y-auto py-2">
            {heldCarts.length === 0 ? (
              <p className="text-center text-xs text-muted-foreground py-6">
                Tidak ada pesanan tertunda saat ini.
              </p>
            ) : (
              heldCarts.map((held) => (
                <div
                  key={held.id}
                  className="p-3 rounded-xl border border-border bg-card flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-foreground">{held.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {held.items.length} item • Total{" "}
                      {formatIDR(held.items.reduce((s, i) => s + i.subtotal, 0))}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => deleteHeldCart(held.id)}
                    >
                      Hapus
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs gap-1"
                      onClick={() => {
                        resumeCart(held.id)
                        setIsHeldOpen(false)
                      }}
                    >
                      <Play className="w-3 h-3" /> Lanjutkan
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        open={isReceiptOpen}
        onOpenChange={setIsReceiptOpen}
        transaction={completedTx}
      />

      {/* Floating AI Business Assistant Chatbot */}
      <AIChatWidget />
    </div>
  )
}
