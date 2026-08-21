export function formatIDR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "Rp 0"
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-"
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-"
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  if (isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function getImageUrl(url?: string | null): string {
  if (!url) return ""
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url
  }
  const backendBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://localhost:8080"
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`
}

