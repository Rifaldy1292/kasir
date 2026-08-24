"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Store,
  Sparkles,
  AlertCircle,
  ArrowRight,
  LogOut,
  CheckCircle2,
} from "lucide-react"

export default function OnboardingPage() {
  const { user, createWorkspace, logout } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    business_type: "Retail / Minimarket",
    phone: "",
    email: "",
    address: "",
    currency: "IDR",
    tax_rate: 0,
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      await createWorkspace(formData)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Gagal membuat workspace, periksa kembali data toko Anda")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Header Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl items-center justify-center shadow-lg">
            tK
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Langkah Terakhir Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Selamat Datang, {user?.name || "Owner"}!
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            Buat toko / workspace utama Anda sekarang untuk mulai mengelola katalog produk, stok, dan kasir POS.
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-1 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">Informasi Toko / Bisnis</CardTitle>
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">Akun: {user?.email}</span>
            </div>
            <CardDescription className="text-xs">
              Isi data profil toko Anda di bawah ini (dapat diubah kapan saja di menu Pengaturan).
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold">
                    Nama Toko / Bisnis <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Toko Maju Jaya / Kopi Nusantara"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="business_type" className="text-xs font-semibold">
                      Jenis Usaha / Kategori
                    </Label>
                    <Input
                      id="business_type"
                      placeholder="Retail / F&B / Fashion / Jasa"
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                      className="h-10 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold">
                      No. Telepon / WhatsApp Toko
                    </Label>
                    <Input
                      id="phone"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-10 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold">
                    Alamat Lengkap Toko (Opsional)
                  </Label>
                  <Textarea
                    id="address"
                    placeholder="Jl. Raya Utama No. 123, Kota..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="currency" className="text-xs font-semibold">Mata Uang</Label>
                    <Input
                      id="currency"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="h-10 text-xs uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tax_rate" className="text-xs font-semibold">Pajak / PPN (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="h-10 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-11 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                  disabled={loading}
                >
                  {loading ? (
                    "Sedang Menyiapkan Toko..."
                  ) : (
                    <>
                      <span>Buat Toko &amp; Masuk ke Aplikasi</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between items-center border-t border-border/50 pt-4 text-xs text-muted-foreground">
            <span>Masuk sebagai <strong>{user?.name}</strong> (Owner)</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-xs text-destructive hover:bg-destructive/10 h-8 gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
