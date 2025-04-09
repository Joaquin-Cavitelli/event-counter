"use client"

import type React from "react"

import { useFirebase } from "@/components/firebase-provider"
import type { Sector } from "@/types"
import { useState } from "react"
import { X, Save, Trash } from "lucide-react"

interface SectorModalProps {
  sector: Sector | null
  onClose: () => void
}

export function SectorModal({ sector, onClose }: SectorModalProps) {
  const { addSector, updateSector, deleteSector } = useFirebase()
  const [nombre, setNombre] = useState(sector?.nombre || "")
  const [encargado, setEncargado] = useState(sector?.encargado || "")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nombre || !encargado) {
      setError("Por favor complete todos los campos")
      return
    }

    setIsSubmitting(true)
    try {
      if (sector) {
        await updateSector(sector.id, { nombre, encargado })
      } else {
        await addSector({ nombre, encargado })
      }
      onClose()
    } catch (error) {
      console.error("Error al guardar sector:", error)
      setError("Ocurrió un error al guardar el sector")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!sector) return

    if (window.confirm("¿Está seguro que desea eliminar este sector? Esta acción no se puede deshacer.")) {
      setIsDeleting(true)
      try {
        await deleteSector(sector.id)
        onClose()
      } catch (error) {
        console.error("Error al eliminar sector:", error)
        setError("Ocurrió un error al eliminar el sector")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">{sector ? "Editar Sector" : "Nuevo Sector"}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Sector
            </label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Sector A"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="encargado" className="block text-sm font-medium text-gray-700 mb-1">
              Encargado
            </label>
            <input
              type="text"
              id="encargado"
              value={encargado}
              onChange={(e) => setEncargado(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
            >
              {isSubmitting && (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              )}
              <Save size={18} className="mr-2" />
              {sector ? "Actualizar" : "Crear"}
            </button>

            {sector && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                {isDeleting && (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                )}
                <Trash size={18} className="mr-2" />
                Eliminar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
