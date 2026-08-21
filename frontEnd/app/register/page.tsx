"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Building2, User } from "lucide-react"

export default function RegisterPage() {
  const { registerWorkspace } = useAuth()
  const [formData, setFormData] = useState({
    workspace_name: "",
    business_type: "Retail",
    owner_name: "",
    email: "",
    password: "",
    phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      await registerWorkspace(formData)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Pendaftaran gagal, periksa data kembali")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl items-center justify-center shadow-lg">
            tK
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Daftarkan Toko Baru</h1>
          <p className="text-sm text-muted-foreground">
            Mulai kelola kasir dan stok produk bisnis Anda dalam hitungan menit
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Informasi Bisnis & Akun Owner</CardTitle>
            <CardDescription>
              Buat workspace utama Anda dan akun pemilik bisnis.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3 pb-2 border-b border-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary tracking-wider">
                  <Building2 className="w-4 h-4" /> Informasi Toko / Bisnis
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="workspace_name">Nama Toko / Bisnis</Label>
                    <Input
                      id="workspace_name"
                      placeholder="Contoh: Toko Berkah"
                      value={formData.workspace_name}
                      onChange={(e) => setFormData({ ...formData, workspace_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_type">Jenis Bisnis</Label>
                    <Input
                      id="business_type"
                      placeholder="Retail / F&B / Jasa"
                      value={formData.business_type}
                      onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary tracking-wider">
                  <User className="w-4 h-4" /> Akun Owner Utama
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="owner_name">Nama Pemilik</Label>
                  <Input
                    id="owner_name"
                    placeholder="Nama Lengkap Owner"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Login</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="owner@toko.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input
                      id="phone"
                      placeholder="081234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold mt-2" disabled={loading}>
                {loading ? "Membuat Workspace..." : "Daftar & Masuk ke Kasir"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Sudah memiliki akun? </span>
            <a href="/login" className="font-semibold text-primary hover:underline ml-1">
              Masuk di sini
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
