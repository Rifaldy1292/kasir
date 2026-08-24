"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, User, ShieldCheck, ArrowRight } from "lucide-react"

export default function RegisterPage() {
  const { registerOwner } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
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
      await registerOwner(formData)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Pendaftaran gagal, periksa kembali email & password Anda")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl items-center justify-center shadow-lg">
            tK
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Daftar Akun Pemilik (Owner)</h1>
          <p className="text-xs text-muted-foreground">
            Mulai kelola bisnis, cabang toko, dan staf kasir Anda dalam satu platform cerdas
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Hak Akses Utama (Owner)
            </div>
            <CardTitle className="text-lg">Informasi Akun Pemilik</CardTitle>
            <CardDescription className="text-xs">
              Setelah mendaftar, Anda dapat membuat toko/workspace dan menambahkan staf admin &amp; kasir di dalam aplikasi.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Nama Lengkap Pemilik</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Budi Santoso"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email Login</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@bisnis.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Nomor WhatsApp / HP (Opsional)</Label>
                  <Input
                    id="phone"
                    placeholder="081234567890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-10 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    minLength={6}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold h-10 text-xs gap-2 mt-2" disabled={loading}>
                <span>{loading ? "Mendaftarkan..." : "Daftar Sebagai Owner"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Sudah memiliki akun? </span>
            <Link href="/login" className="font-semibold text-primary hover:underline ml-1">
              Masuk di sini
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
