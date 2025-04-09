"use client"

import { useFirebase } from "@/components/firebase-provider"
import { useEffect, useState } from "react"
import type { AdminCredentials } from "@/types"
import { AdminLogin } from "@/components/admin-login"
import { AdminPanel } from "@/components/admin-panel"

export default function AdminPage() {
  const { loading } = useFirebase()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin credentials exist in localStorage
    const storedCredentials = localStorage.getItem("adminCredentials")
    if (storedCredentials) {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])

  const handleLogin = (credentials: AdminCredentials) => {
    // Store credentials in localStorage
    localStorage.setItem("adminCredentials", JSON.stringify(credentials))
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem("adminCredentials")
    setIsAuthenticated(false)
  }

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      {isAuthenticated ? <AdminPanel onLogout={handleLogout} /> : <AdminLogin onLogin={handleLogin} />}
    </main>
  )
}
