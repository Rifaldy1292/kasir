"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useQuery } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import { useSidebarStore } from "@/lib/sidebar-store"
import { CashDrawerDialog } from "./cash-drawer-dialog"
import { WorkspaceSwitcherDialog } from "./workspace-switcher-dialog"
import {
  LayoutDashboard,
  Store,
  Package,
  Boxes,
  ReceiptText,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Wallet,
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Truck,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { user, workspace, logout } = useAuth()
  const { isCollapsed, isMobileOpen, toggleCollapse, setMobileOpen } = useSidebarStore()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [wsSwitcherOpen, setWsSwitcherOpen] = useState(false)

  // Query shift session for quick drawer indicator
  const { data: sessionData } = useQuery({
    queryKey: ["current-session"],
    queryFn: async () => {
      const res = await apiClient.get("/cash/current-session")
      return res.data.data
    },
  })

  const isShiftOpen = !!sessionData

  const navItems = [
    { label: "Terminal Kasir", href: "/pos", icon: Store },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Produk & Menu", href: "/products", icon: Package },
    { label: "Stok & Inventori", href: "/inventory", icon: Boxes },
    { label: "Prediksi Stok AI", href: "/inventory/ai-prediction", icon: Sparkles, badge: "AI" },
    { label: "Riwayat Transaksi", href: "/transactions", icon: ReceiptText },
    { label: "Pembelian / PO", href: "/purchases", icon: ShoppingCart },
    { label: "Pelanggan", href: "/customers", icon: Users },
    { label: "Pemasok / Supplier", href: "/suppliers", icon: Truck },
    { label: "Laporan & Analitik", href: "/reports", icon: BarChart3 },
    { label: "Audit Log Sistem", href: "/logs", icon: ShieldCheck, roles: ["OWNER", "ADMIN"] },
    { label: "Pengaturan", href: "/settings", icon: Settings },
  ]

  const filteredNavItems = navItems.filter((item) => {
    if (item.roles && !item.roles.includes(user?.role || "")) {
      return false
    }
    if (user?.role === "CASHIER") {
      return ["/pos", "/transactions", "/customers", "/inventory"].includes(item.href)
    }
    return true
  })

  const renderSidebarBody = (collapsed: boolean, isMobile: boolean) => (
    <div className="flex flex-col h-full bg-card select-none">
      {/* Brand / Workspace Header — Click to Switch Workspace */}
      <div className="p-3 border-b border-border flex items-center justify-between gap-2 h-16 shrink-0">
        <button
          onClick={() => setWsSwitcherOpen(true)}
          className={`flex items-center gap-2.5 overflow-hidden text-left rounded-xl p-1 -m-1 transition-colors hover:bg-muted/60 group cursor-pointer ${
            collapsed ? "justify-center w-full" : "flex-1"
          }`}
          title="Klik untuk ganti toko / tambah cabang baru"
        >
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform">
            tK
          </div>
          {!collapsed && (
            <div className="overflow-hidden flex-1">
              <div className="flex items-center justify-between gap-1">
                <h1 className="text-xs font-bold truncate leading-tight text-foreground group-hover:text-primary transition-colors">
                  {workspace?.name || "theKasir App"}
                </h1>
                <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 opacity-70 group-hover:opacity-100" />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Building2 className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground truncate">
                  {workspace?.business_type || "POS System"}
                </span>
              </div>
            </div>
          )}
        </button>

        {/* Mobile Close Button */}
        {isMobile && (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        {/* Desktop Collapse Toggle */}
        {!isMobile && (
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={toggleCollapse}
            title={collapsed ? "Buka Sidebar" : "Tutup/Kecilkan Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Shift / Drawer Status Pill */}
      {!collapsed ? (
        <div className="p-2.5 mx-3 my-2 rounded-xl bg-muted/40 border border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                isShiftOpen ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <div className="text-xs">
              <div className="font-semibold text-[11px] leading-tight">
                {isShiftOpen ? "Kasir Aktif" : "Kasir Tutup"}
              </div>
              <div className="text-[9px] text-muted-foreground">
                {isShiftOpen ? "Shift berjalan" : "Buka shift"}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant={isShiftOpen ? "outline" : "default"}
            className="h-6 text-[11px] px-2 shadow-xs"
            onClick={() => setDrawerOpen(true)}
          >
            <Wallet className="w-3 h-3 mr-1" />
            {isShiftOpen ? "Laci" : "Buka"}
          </Button>
        </div>
      ) : (
        <div className="py-2 flex justify-center shrink-0">
          <Button
            size="icon"
            variant={isShiftOpen ? "outline" : "default"}
            className="h-8 w-8 rounded-lg shadow-xs"
            onClick={() => setDrawerOpen(true)}
            title={isShiftOpen ? "Laci Kasir (Aktif)" : "Buka Shift Kasir"}
          >
            <Wallet className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (item.href !== "/pos" &&
              pathname.startsWith(item.href + "/") &&
              !filteredNavItems.some(
                (other) =>
                  other.href !== item.href &&
                  other.href.startsWith(item.href) &&
                  pathname.startsWith(other.href)
              ))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (isMobile) setMobileOpen(false)
              }}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-primary-foreground" : item.badge ? "text-primary" : "text-muted-foreground"}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 overflow-hidden">
                  <span className="truncate font-medium text-xs">{item.label}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={`text-[9px] px-1 py-0 h-3.5 font-bold ${
                        isActive
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {/* User Info & Logout */}
      <div className="p-2.5 border-t border-border mt-auto shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border">
            <div className="overflow-hidden">
              <div className="text-xs font-bold truncate text-foreground">{user?.name}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[8px] px-1 py-0 h-3.5 bg-background font-mono font-bold"
                >
                  {user?.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={logout}
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={logout}
              title={`Logout (${user?.name})`}
            >
              <LogOut className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen shrink-0 sticky top-0 border-r border-border transition-all duration-200 ${
          isCollapsed ? "w-16" : "w-60"
        }`}
      >
        {renderSidebarBody(isCollapsed, false)}
      </aside>

      {/* Mobile Drawer (Always displays full text & items) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide-out Drawer Panel (Always Full Width & Full Text) */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-50 bg-card animate-in slide-in-from-left duration-200">
            {renderSidebarBody(false, true)}
          </div>
        </div>
      )}

      {/* Cash Drawer Dialog */}
      <CashDrawerDialog open={drawerOpen} onOpenChange={setDrawerOpen} />

      {/* Workspace Switcher & New Branch Dialog */}
      <WorkspaceSwitcherDialog open={wsSwitcherOpen} onOpenChange={setWsSwitcherOpen} />
    </>
  )
}
