"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Minimize2,
  Maximize2,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const QUICK_PROMPTS = [
  { label: "Penjualan Hari Ini", icon: TrendingUp, query: "Berapa total penjualan dan transaksi hari ini?" },
  { label: "Produk Terlaris", icon: Sparkles, query: "Produk apa saja yang paling laku dan paling menguntungkan?" },
  { label: "Stok Menipis", icon: AlertTriangle, query: "Stok produk apa saja yang hampir habis dan perlu segera di-restock?" },
  { label: "Saran Strategi", icon: Lightbulb, query: "Berikan evaluasi performa bisnis dan 3 saran strategi peningkatan omzet." },
]

export function AIChatWidget() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Halo! Saya **theKasir AI Assistant**. Saya siap membantu menganalisis data penjualan, mengecek ketersediaan stok, atau memberikan rekomendasi strategi bisnis Anda secara langsung. Ada yang bisa saya bantu?",
      timestamp: new Date(),
    },
  ])
  const [sessionId] = useState(() => Math.random().toString(36).substring(2, 15))

  // Position coordinates (top-left based)
  const [btnPos, setBtnPos] = useState<{ x: number; y: number } | null>(null)
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingBtn, setIsDraggingBtn] = useState(false)
  const [isDraggingModal, setIsDraggingModal] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize button position on mount
  useEffect(() => {
    setMounted(true)
    if (typeof window === "undefined") return

    const initPos = () => {
      const saved = localStorage.getItem("thekasir_ai_btn_pos")
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (typeof parsed.x === "number" && typeof parsed.y === "number") {
            const clampedX = Math.min(Math.max(16, parsed.x), window.innerWidth - 180)
            const clampedY = Math.min(Math.max(16, parsed.y), window.innerHeight - 70)
            setBtnPos({ x: clampedX, y: clampedY })
            return
          }
        } catch {}
      }
      // Default: bottom-right
      setBtnPos({
        x: Math.max(16, window.innerWidth - 190),
        y: Math.max(16, window.innerHeight - 80),
      })
    }

    initPos()
    window.addEventListener("resize", initPos)
    return () => window.removeEventListener("resize", initPos)
  }, [])

  // Draggable handler for floating button
  const startDragBtn = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default touch scrolling during drag
    const startClientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const startClientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const currentX = btnPos?.x ?? (window.innerWidth - 190)
    const currentY = btnPos?.y ?? (window.innerHeight - 80)

    let hasMoved = false
    setIsDraggingBtn(true)

    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const curX = "touches" in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX
      const curY = "touches" in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY

      const dx = curX - startClientX
      const dy = curY - startClientY

      if (Math.hypot(dx, dy) > 5) {
        hasMoved = true
      }

      const nextX = Math.min(Math.max(12, currentX + dx), window.innerWidth - 180)
      const nextY = Math.min(Math.max(12, currentY + dy), window.innerHeight - 70)

      setBtnPos({ x: nextX, y: nextY })
    }

    const onEnd = () => {
      setIsDraggingBtn(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)

      if (!hasMoved) {
        // Simple click -> open modal
        setIsOpen(true)
      } else {
        // Drag ended -> save position
        setBtnPos((prev) => {
          if (prev) {
            localStorage.setItem("thekasir_ai_btn_pos", JSON.stringify(prev))
          }
          return prev
        })
      }
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseup", onEnd)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onEnd)
  }, [btnPos])

  // Draggable handler for Chat Modal Window Header
  const startDragModal = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button")) return

    const startClientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const startClientY = "touches" in e ? e.touches[0].clientY : e.clientY

    const currentX = modalPos?.x ?? (window.innerWidth - 440)
    const currentY = modalPos?.y ?? (window.innerHeight - 620)

    setIsDraggingModal(true)

    const onMove = (moveEvt: MouseEvent | TouchEvent) => {
      const curX = "touches" in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX
      const curY = "touches" in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY

      const dx = curX - startClientX
      const dy = curY - startClientY

      const modalW = isMinimized ? 320 : 420
      const modalH = isMinimized ? 60 : 580

      const nextX = Math.min(Math.max(10, currentX + dx), window.innerWidth - modalW - 10)
      const nextY = Math.min(Math.max(10, currentY + dy), window.innerHeight - modalH - 10)

      setModalPos({ x: nextX, y: nextY })
    }

    const onEnd = () => {
      setIsDraggingModal(false)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onEnd)
      window.removeEventListener("touchmove", onMove)
      window.removeEventListener("touchend", onEnd)
    }

    window.addEventListener("mousemove", onMove, { passive: true })
    window.addEventListener("mouseup", onEnd)
    window.addEventListener("touchmove", onMove, { passive: true })
    window.addEventListener("touchend", onEnd)
  }, [modalPos, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom()
      inputRef.current?.focus()
    }
  }, [messages, isOpen, isMinimized])

  const handleSend = async (customQuery?: string) => {
    const textToSend = customQuery || input
    if (!textToSend.trim() || isStreaming) return

    const userMessage: Message = {
      id: Math.random().toString(36).substring(2, 9),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    }

    const assistantPlaceholderId = Math.random().toString(36).substring(2, 9)
    const assistantMessage: Message = {
      id: assistantPlaceholderId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    if (!customQuery) setInput("")
    setIsStreaming(true)

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("thekasir_token") : null
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8181/api/v1"

      const response = await fetch(`${apiUrl}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          session_id: sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error("No response body")
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue

          const jsonStr = trimmed.replace(/^data:\s*/, "")
          if (jsonStr === "[DONE]") {
            break
          }

          try {
            const parsed = JSON.parse(jsonStr)
            if (parsed.text) {
              accumulatedText += parsed.text
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              )
            } else if (parsed.error) {
              accumulatedText += `\n\n*(Error: ${parsed.error})*`
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantPlaceholderId
                    ? { ...msg, content: accumulatedText }
                    : msg
                )
              )
            }
          } catch {
            // Partial chunk continue
          }
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Koneksi gagal"
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantPlaceholderId
            ? {
                ...msg,
                content:
                  msg.content ||
                  `Maaf, terjadi kesalahan saat menghubungkan ke AI Assistant: ${errorMessage}. Pastikan GEMINI_API_KEY sudah dikonfigurasi di server backend.`,
              }
            : msg
        )
      )
    } finally {
      setIsStreaming(false)
    }
  }

  const handleClearHistory = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Percakapan telah direset. Ada hal lain tentang bisnis Anda yang ingin dianalisis?",
        timestamp: new Date(),
      },
    ])
  }

  // Format basic markdown
  const renderFormattedContent = (content: string) => {
    if (!content) return null

    return (
      <div className="text-xs leading-relaxed space-y-1.5 break-words">
        {content.split("\n").map((line, i) => {
          if (line.startsWith("### ")) {
            return (
              <h4 key={i} className="font-bold text-foreground text-sm pt-1">
                {line.replace("### ", "")}
              </h4>
            )
          }
          if (line.startsWith("## ")) {
            return (
              <h3 key={i} className="font-bold text-foreground text-sm pt-1">
                {line.replace("## ", "")}
              </h3>
            )
          }
          if (line.startsWith("- ") || line.startsWith("* ")) {
            const item = line.substring(2)
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1">
                <span className="text-primary font-bold">•</span>
                <span>{formatInline(item)}</span>
              </div>
            )
          }
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^\d+\./)?.[0]
            const text = line.replace(/^\d+\.\s*/, "")
            return (
              <div key={i} className="flex items-start gap-1.5 pl-1">
                <span className="font-bold text-primary">{num}</span>
                <span>{formatInline(text)}</span>
              </div>
            )
          }
          if (line.trim() === "") {
            return <div key={i} className="h-1" />
          }
          return <p key={i}>{formatInline(line)}</p>
        })}
      </div>
    )
  }

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return part
    })
  }

  // Prevent SSR hydration mismatch
  if (!mounted) return null

  // Render Closed Floating Button
  if (!isOpen) {
    const posX = btnPos ? btnPos.x : (typeof window !== "undefined" ? window.innerWidth - 190 : 800)
    const posY = btnPos ? btnPos.y : (typeof window !== "undefined" ? window.innerHeight - 80 : 600)

    return (
      <div
        onMouseDown={startDragBtn}
        onTouchStart={startDragBtn}
        style={{
          position: "fixed",
          left: `${posX}px`,
          top: `${posY}px`,
          zIndex: 9999,
          userSelect: "none",
          touchAction: "none",
        }}
        className={`flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-primary to-primary/85 hover:from-primary/95 hover:to-primary text-primary-foreground rounded-full shadow-xl hover:shadow-2xl select-none group border border-primary-foreground/15 ${
          isDraggingBtn ? "cursor-grabbing scale-105" : "cursor-grab hover:scale-105"
        }`}
        title="Klik untuk membuka chat, atau tahan dan geser ke posisi mana saja di layar"
        aria-label="Buka theKasir AI Assistant"
      >
        <GripVertical className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
        <div className="relative">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
        <span className="font-semibold text-xs tracking-wide">AI Assistant</span>
        <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground text-[10px] px-1.5 py-0 font-bold">
          Gemini
        </Badge>
      </div>
    )
  }

  // Render Open Chat Modal
  const modalX = modalPos?.x ?? (btnPos ? Math.max(10, Math.min(typeof window !== "undefined" ? window.innerWidth - 440 : 800, btnPos.x - 220)) : 800)
  const modalY = modalPos?.y ?? (btnPos ? Math.max(10, Math.min(typeof window !== "undefined" ? window.innerHeight - 620 : 600, btnPos.y - 540)) : 200)

  return (
    <div
      style={{
        position: "fixed",
        left: `${modalX}px`,
        top: `${modalY}px`,
        zIndex: 9999,
      }}
      className={`flex flex-col bg-card border border-border shadow-2xl rounded-2xl overflow-hidden ${
        isMinimized
          ? "w-80 h-14"
          : "w-[380px] sm:w-[420px] h-[580px] max-h-[85vh]"
      }`}
    >
      {/* Widget Header - Draggable */}
      <div
        onMouseDown={startDragModal}
        onTouchStart={startDragModal}
        style={{ userSelect: "none", touchAction: "none" }}
        className={`px-4 py-3 bg-primary text-primary-foreground flex items-center justify-between shrink-0 ${
          isDraggingModal ? "cursor-grabbing" : "cursor-grab"
        }`}
        title="Tahan dan geser header untuk memindahkan jendela chat"
      >
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 opacity-70" />
          <div className="w-7 h-7 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs">theKasir AI Assistant</h3>
              <Badge variant="outline" className="text-[9px] border-primary-foreground/30 text-primary-foreground px-1 py-0">
                Live Data
              </Badge>
            </div>
            <p className="text-[10px] text-primary-foreground/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              Geser header untuk pindahkan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!isMinimized && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleClearHistory}
              title="Reset Percakapan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Perbesar" : "Kecilkan"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setIsOpen(false)}
            title="Tutup Chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Widget Body */}
      {!isMinimized && (
        <>
          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-muted/40 border-b border-border flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon
              return (
                <button
                  key={idx}
                  disabled={isStreaming}
                  onClick={() => handleSend(qp.query)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium bg-background hover:bg-primary/10 hover:text-primary text-muted-foreground rounded-full border border-border shrink-0 transition-colors disabled:opacity-50"
                >
                  <Icon className="w-2.5 h-2.5 text-primary" />
                  <span>{qp.label}</span>
                </button>
              )
            })}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-background/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-2xs ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-xs"
                      : "bg-card border border-border text-card-foreground rounded-tl-xs"
                  }`}
                >
                  {msg.role === "user" ? (
                    <p className="text-xs leading-relaxed break-words">{msg.content}</p>
                  ) : msg.content ? (
                    renderFormattedContent(msg.content)
                  ) : (
                    <div className="flex items-center gap-1.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[10px] text-muted-foreground ml-1">Menganalisis data...</span>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-1 text-right ${
                      msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground/60"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {msg.role === "user" && (
                  <div className="w-6 h-6 rounded-md bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-card border-t border-border shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan performa penjualan, stok, dll..."
                disabled={isStreaming}
                className="text-xs h-9 bg-background focus-visible:ring-primary"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming}
                className="h-9 w-9 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </Button>
            </form>
            <p className="text-[9px] text-center text-muted-foreground/70 mt-1.5">
              Didukung oleh Google Gemini • Data langsung dari database toko
            </p>
          </div>
        </>
      )}
    </div>
  )
}
