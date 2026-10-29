"use client"

import React, { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useSidebarStore } from "@/lib/sidebar-store"
import { CashDrawerDialog } from "./cash-drawer-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Menu, PanelLeft, Crown, Sparkles, Shield } from "lucide-react"

interface AppHeaderProps {
  title?: string
  subtitle?: string
  children?: React.ReactNode
}

export function AppHeader({ title = "theKasir", subtitle, children }: AppHeaderProps) {
  const { user } = useAuth()
  const { toggleMobile, toggleCollapse } = useSidebarStore()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { data: sessionData } = useQuery({
    queryKey: ["current-session"],
    queryFn: async () => {
      const res = await apiClient.get("/cash/current-session")
      return res.data.data
    },
  })

  const isShiftOpen = !!sessionData

  return (
    <>
      <header className="h-16 border-b border-border bg-card/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 shrink-0 gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9 text-muted-foreground shrink-0"
            onClick={toggleMobile}
            title="Menu Navigasi"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Desktop Sidebar Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
            onClick={toggleCollapse}
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </Button>

          <div className="overflow-hidden">
            <h1 className="text-sm sm:text-base font-bold text-foreground leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-[11px] text-muted-foreground truncate hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {children}

          {/* SaaS Plan Badge */}
          {user?.role === "SUPERADMIN" ? (
            <Badge className="bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full border-0 shadow-xs flex items-center gap-1">
              <Shield className="w-3 h-3 fill-current" />
              <span>Superadmin</span>
            </Badge>
          ) : user?.plan_code === "PLATINUM" ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full border-0 shadow-xs flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" />
              <span>Platinum</span>
            </Badge>
          ) : user?.plan_code === "PREMIUM" ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-[10px] sm:text-xs px-2.5 py-1 rounded-full border-0 shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>Premium</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold text-[10px] sm:text-xs px-2 py-0.5 rounded-full border border-border">
              Starter
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            className="gap-1.5 h-8 sm:h-9 text-xs font-medium px-2.5 sm:px-3 shadow-xs"
          >
            <Wallet className="w-3.5 h-3.5 text-primary" />
            <span className="hidden sm:inline">Laci Kasir</span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 h-4 border-0 font-bold ${
                isShiftOpen
                  ? "bg-emerald-500/15 text-emerald-600"
                  : "bg-amber-500/15 text-amber-600"
              }`}
            >
              {isShiftOpen ? "Buka" : "Tutup"}
            </Badge>
          </Button>
        </div>
      </header>

      {/* Cash Drawer Dialog */}
      <CashDrawerDialog open={drawerOpen} onOpenChange={setDrawerOpen} />
    </>
  )
}
