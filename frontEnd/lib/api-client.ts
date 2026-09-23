import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy"

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to attach JWT Token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("thekasir_token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to format errors and handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("thekasir_token")
        localStorage.removeItem("thekasir_user")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
