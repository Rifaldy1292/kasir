"use client"

import React, { useState } from "react"
import Link from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Store, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg("")

    try {
      await login(email, password)
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Email atau password salah")
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword("password123")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-2xl items-center justify-center shadow-lg">
            tK
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">theKasir POS</h1>
          <p className="text-sm text-muted-foreground">
            Sistem Kasir & Manajemen Bisnis Modern
          </p>
        </div>

        <Card className="border-border shadow-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Masuk ke Sistem</CardTitle>
            <CardDescription>
              Gunakan akun staf atau owner untuk mengakses workspace kasir Anda.
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

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@bisnis.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full font-semibold gap-2" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* Demo Account Quick-Fill Buttons */}
            <div className="mt-6 pt-4 border-t border-border space-y-2">
              <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wider block text-center">
                Akun Demo Cepat (Password: password123)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-1"
                  onClick={() => fillDemo("owner@thekasir.com")}
                >
                  <ShieldCheck className="w-3 h-3 mr-1 text-purple-600" />
                  Owner
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-1"
                  onClick={() => fillDemo("admin@thekasir.com")}
                >
                  <UserCheck className="w-3 h-3 mr-1 text-blue-600" />
                  Admin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 px-1"
                  onClick={() => fillDemo("kasir@thekasir.com")}
                >
                  <Store className="w-3 h-3 mr-1 text-emerald-600" />
                  Kasir
                </Button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center border-t border-border pt-4 text-xs text-muted-foreground">
            <span>Ingin membuat toko baru? </span>
            <a href="/register" className="font-semibold text-primary hover:underline ml-1">
              Daftar Workspace Baru
            </a>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
