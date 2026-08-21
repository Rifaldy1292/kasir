"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { token, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.replace("/pos")
      } else {
        router.replace("/login")
      }
    }
  }, [token, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground font-black text-xl flex items-center justify-center animate-pulse">
          tK
        </div>
        <p className="text-sm text-muted-foreground font-medium">Memuat theKasir...</p>
      </div>
    </div>
  )
}
