"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import apiClient from "./api-client"

export interface User {
  id: number
  workspace_id: number
  name: string
  email: string
  role: "OWNER" | "ADMIN" | "CASHIER"
  status: "ACTIVE" | "INACTIVE"
  phone: string
}

export interface Workspace {
  id: number
  name: string
  business_type: string
  phone: string
  email: string
  address: string
  currency: string
  tax_rate: number
  receipt_header: string
  receipt_footer: string
}

export interface RegisterOwnerPayload {
  name: string
  email: string
  password: string
  phone?: string
}

export interface CreateWorkspacePayload {
  name: string
  business_type?: string
  phone?: string
  email?: string
  address?: string
  currency?: string
  tax_rate?: number
}

interface AuthContextType {
  user: User | null
  workspace: Workspace | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  registerOwner: (data: RegisterOwnerPayload) => Promise<void>
  createWorkspace: (data: CreateWorkspacePayload) => Promise<void>
  switchWorkspace: (workspaceId: number) => Promise<void>
  registerWorkspace: (data: any) => Promise<void>
  logout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const refreshProfile = async () => {
    try {
      const res = await apiClient.get("/auth/profile")
      if (res.data.success) {
        setUser(res.data.data)
        if (res.data.data.workspace) {
          setWorkspace(res.data.data.workspace)
        }
      }
    } catch {
      // Ignore or logout if invalid
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("thekasir_token")
    const savedUser = localStorage.getItem("thekasir_user")
    const savedWorkspace = localStorage.getItem("thekasir_workspace")

    if (savedToken) {
      setToken(savedToken)
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {}
      }
      if (savedWorkspace) {
        try {
          setWorkspace(JSON.parse(savedWorkspace))
        } catch {}
      }
      refreshProfile().finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !token) {
      // Landing page "/" and auth pages are completely public
      if (pathname !== "/" && !pathname.startsWith("/login") && !pathname.startsWith("/register")) {
        router.push("/login")
      }
    } else if (!isLoading && token && user) {
      if (!user.workspace_id || user.workspace_id === 0) {
        if (!pathname.startsWith("/onboarding")) {
          router.push("/onboarding")
        }
      } else {
        if (pathname.startsWith("/onboarding") || pathname.startsWith("/login") || pathname.startsWith("/register")) {
          router.push("/pos")
        }
      }
    }
  }, [isLoading, token, user, pathname, router])

  const login = async (email: string, password: string) => {
    const res = await apiClient.post("/auth/login", { email, password })
    if (res.data.success) {
      const { token: newToken, user: newUser, workspace: newWorkspace } = res.data.data
      setToken(newToken)
      setUser(newUser)
      setWorkspace(newWorkspace)
      localStorage.setItem("thekasir_token", newToken)
      localStorage.setItem("thekasir_user", JSON.stringify(newUser))
      if (newWorkspace) {
        localStorage.setItem("thekasir_workspace", JSON.stringify(newWorkspace))
      } else {
        localStorage.removeItem("thekasir_workspace")
      }

      if (!newUser.workspace_id || newUser.workspace_id === 0) {
        router.push("/onboarding")
      } else {
        router.push("/pos")
      }
    }
  }

  const registerOwner = async (data: RegisterOwnerPayload) => {
    const res = await apiClient.post("/auth/register", data)
    if (res.data.success) {
      const { token: newToken, user: newUser, workspace: newWorkspace } = res.data.data
      setToken(newToken)
      setUser(newUser)
      setWorkspace(newWorkspace || null)
      localStorage.setItem("thekasir_token", newToken)
      localStorage.setItem("thekasir_user", JSON.stringify(newUser))
      localStorage.removeItem("thekasir_workspace")
      router.push("/onboarding")
    }
  }

  const createWorkspace = async (data: CreateWorkspacePayload) => {
    const res = await apiClient.post("/auth/create-workspace", data)
    if (res.data.success) {
      const { token: newToken, user: newUser, workspace: newWorkspace } = res.data.data
      setToken(newToken)
      setUser(newUser)
      setWorkspace(newWorkspace)
      localStorage.setItem("thekasir_token", newToken)
      localStorage.setItem("thekasir_user", JSON.stringify(newUser))
      localStorage.setItem("thekasir_workspace", JSON.stringify(newWorkspace))
      router.push("/pos")
    }
  }

  const switchWorkspace = async (workspaceId: number) => {
    const res = await apiClient.post("/auth/switch-workspace", { workspace_id: workspaceId })
    if (res.data.success) {
      const { token: newToken, user: newUser, workspace: newWorkspace } = res.data.data
      setToken(newToken)
      setUser(newUser)
      setWorkspace(newWorkspace)
      localStorage.setItem("thekasir_token", newToken)
      localStorage.setItem("thekasir_user", JSON.stringify(newUser))
      localStorage.setItem("thekasir_workspace", JSON.stringify(newWorkspace))
      // Refresh to reload all query caches for new workspace data
      window.location.href = "/pos"
    }
  }

  const registerWorkspace = async (data: any) => {
    const res = await apiClient.post("/auth/register-workspace", data)
    if (res.data.success) {
      const { token: newToken, user: newUser, workspace: newWorkspace } = res.data.data
      setToken(newToken)
      setUser(newUser)
      setWorkspace(newWorkspace)
      localStorage.setItem("thekasir_token", newToken)
      localStorage.setItem("thekasir_user", JSON.stringify(newUser))
      localStorage.setItem("thekasir_workspace", JSON.stringify(newWorkspace))
      router.push("/pos")
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    setWorkspace(null)
    localStorage.removeItem("thekasir_token")
    localStorage.removeItem("thekasir_user")
    localStorage.removeItem("thekasir_workspace")
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        token,
        isLoading,
        login,
        registerOwner,
        createWorkspace,
        switchWorkspace,
        registerWorkspace,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
