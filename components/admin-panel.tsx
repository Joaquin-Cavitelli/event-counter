"use client"

import type React from "react"

import { useFirebase } from "@/components/firebase-provider"
import type { Sector } from "@/types"
import { useState } from "react"
import { ArrowLeft, Calendar, Clock, Edit, LogOut, Plus, Users, Home, RefreshCw } from "lucide-react"
import Link from "next/link"
import { SectorModal } from "./sector-modal"
import { formatearFecha } from "@/utils/formatear-fecha"

interface AdminPanelProps {
  onLogout: () => void
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const { sectores, config, totalAsistentes, updateConfig, resetAll } = useFirebase()
  const [fecha, setFecha] = useState(config?.fecha || "")
  const [hora, setHora] = useState(config?.hora || "")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentSector, setCurrentSector] = useState<Sector | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isSavingConfig, setIsSavingConfig] = useState(false)
  const [fechaPreview, setFechaPreview] = useState("")

  // Actualizar la vista previa de la fecha cuando cambia
  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFecha = e.target.value
    setFecha(newFecha)

    if (newFecha) {
      try {
        const [year, month, day] = newFecha.split("-").map(Number)
        const fechaObj = new Date(year, month - 1, day)
        setFechaPreview(formatearFecha(fechaObj))
      } catch (error) {
        setFechaPreview("")
      }
    } else {
      setFechaPreview("")
    }
  }

  const handleSaveConfig = async () => {
    setIsSavingConfig(true)
    try {
      await updateConfig({ fecha, hora })
    } catch (error) {
      console.error("Error al guardar configuración:", error)
    } finally {
      setIsSavingConfig(false)
    }
  }

  const handleResetAll = async () => {
    if (window.confirm("¿Está seguro que desea resetear toda la información? Esta acción no se puede deshacer.")) {
      setIsResetting(true)
      try {
        await resetAll()
        setFecha("")
        setHora("")
        setFechaPreview("")
      } catch (error) {
        console.error("Error al resetear información:", error)
      } finally {
        setIsResetting(false)
      }
    }
  }

  const openAddModal = () => {
    setCurrentSector(null)
    setIsModalOpen(true)
  }

  const openEditModal = (sector: Sector) => {
    setCurrentSector(sector)
    setIsModalOpen(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/" className="mr-3 text-primary hover:text-primary/80 transition-colors flex items-center">
            <ArrowLeft size={20} className="mr-1" />
            <Home size={16} />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
        </div>
        <button
          onClick={onLogout}
          className="text-gray-500 hover:text-gray-700 bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center text-primary">
          <Calendar size={20} className="mr-2" />
          Configuración del Evento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha
            </label>
            <input
              type="date"
              id="fecha"
              value={fecha}
              onChange={handleFechaChange}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {fechaPreview && <p className="text-sm text-gray-500 mt-1">{fechaPreview}</p>}
          </div>

          <div>
            <label htmlFor="hora" className="block text-sm font-medium text-gray-700 mb-1">
              Hora
            </label>
            <input
              type="time"
              id="hora"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSaveConfig}
          disabled={isSavingConfig}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          {isSavingConfig ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            <Clock size={18} className="mr-2" />
          )}
          Guardar Configuración
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center text-primary">
            <Users size={20} className="mr-2" />
            Sectores
          </h2>
          <button
            onClick={openAddModal}
            className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {sectores.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 border border-gray-200">
            No hay sectores configurados
          </div>
        ) : (
          <div className="space-y-3">
            {sectores.map((sector) => (
              <div
                key={sector.id}
                className={`p-4 rounded-lg shadow-sm border ${
                  sector.asistentes ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-800">{sector.nombre}</h3>
                    <div className="flex items-center text-gray-500 text-sm mt-1">
                      <Users size={14} className="mr-1 text-primary" />
                      {sector.encargado}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div
                      className={`text-lg font-semibold mr-4 ${sector.asistentes ? "text-green-600" : "text-gray-400"}`}
                    >
                      {sector.asistentes || 0}
                    </div>
                    <button
                      onClick={() => openEditModal(sector)}
                      className="text-primary hover:text-primary/80 p-1 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-primary flex items-center">
          <Users size={20} className="mr-2" />
          Total de Asistentes: {totalAsistentes}
        </h2>

        <button
          onClick={handleResetAll}
          disabled={isResetting}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
        >
          {isResetting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          ) : (
            <RefreshCw size={18} className="mr-2" />
          )}
          Resetear Toda la Información
        </button>
      </div>

      {isModalOpen && <SectorModal sector={currentSector} onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}
