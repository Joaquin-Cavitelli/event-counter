"use client"

import type React from "react"

import type { AdminCredentials } from "@/types"
import { useState } from "react"
import { ArrowLeft, LogIn, AlertCircle } from "lucide-react"
import Link from "next/link"

interface AdminLoginProps {
  onLogin: (credentials: AdminCredentials) => void
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !password) {
      setError("Por favor complete todos los campos")
      return
    }

    // Validar credenciales específicas
    if (username === "admin" && password === "admin123") {
      onLogin({ username, password })
    } else {
      setError("Usuario o contraseña incorrectos")
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-3 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Acceso Administrativo</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle size={18} className="mr-2" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            <LogIn size={18} className="mr-2" />
            Ingresar
          </button>
        </form>
      </div>
    </div>
  )
}
