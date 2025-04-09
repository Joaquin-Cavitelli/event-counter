"use client"

import { useFirebase } from "@/components/firebase-provider"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, Clock, Save, User, Home } from "lucide-react"
import Link from "next/link"
import { formatearFecha } from "@/utils/formatear-fecha"

export default function SectorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { sectores, config, registrarAsistentes, loading } = useFirebase()
  const [sector, setSector] = useState<any>(null)
  const [asistentes, setAsistentes] = useState<string>("")  // Inicializamos como cadena vacía
  const [eventDateTime, setEventDateTime] = useState<Date | null>(null)
  const [fechaFormateada, setFechaFormateada] = useState("")
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)
  const [eventStarted, setEventStarted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (sectores.length > 0) {
      const currentSector = sectores.find((s) => s.id === id)
      if (currentSector) {
        setSector(currentSector)
        setAsistentes(currentSector.asistentes || "") // Si no hay asistentes, mantener cadena vacía
      } else {
        router.push("/")
      }
    }
  }, [sectores, id, router])

  // First useEffect: Set eventDateTime based on config
  useEffect(() => {
    if (config && config.fecha && config.hora) {
      const [year, month, day] = config.fecha.split("-").map(Number)
      const [hours, minutes] = config.hora.split(":").map(Number)
      const eventDate = new Date(year, month - 1, day, hours, minutes)
      setEventDateTime(eventDate)
      setFechaFormateada(formatearFecha(eventDate))
    } else {
      setEventDateTime(null)
      setFechaFormateada("")
    }
  }, [config]) // Only depend on config

  // Second useEffect: Set up timer to update time remaining
  useEffect(() => {
    if (!eventDateTime) {
      setTimeRemaining(null)
      setEventStarted(false)
      return
    }

    const calculateTimeRemaining = () => {
      const now = new Date()
      const diff = eventDateTime.getTime() - now.getTime()

      if (diff <= 0) {
        setEventStarted(true)
        setTimeRemaining(null)
        return null
      } else {
        setEventStarted(false)
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        return { days, hours, minutes, seconds }
      }
    }

    const initialTimeRemaining = calculateTimeRemaining()
    if (initialTimeRemaining) {
      setTimeRemaining(initialTimeRemaining)
    }

    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining()
      if (remaining) {
        setTimeRemaining(remaining)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [eventDateTime])

  const handleSaveAsistentes = async () => {
    if (!sector) return

    setIsSaving(true)
    try {
      await registrarAsistentes(sector.id, Number(asistentes) || 0) // Convertir asistentes a número
      router.push("/")
    } catch (error) {
      console.error("Error al guardar asistentes:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading || !sector) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <div className="flex items-center mb-6">
        <Link href="/" className="mr-3 text-blue-600 hover:text-blue-600/80 transition-colors flex items-center">
          <ArrowLeft size={20} className="mr-1" />
          <Home size={16} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{sector.nombre}</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
        <div className="flex items-center text-gray-600 mb-2">
          <User size={18} className="mr-2 text-blue-600" />
          <span>Encargado:</span>
        </div>
        <p className="text-lg font-semibold">{sector.encargado}</p>
      </div>

      {!eventDateTime ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
          <p className="text-yellow-700">No se estableció horario para contar</p>
        </div>
      ) : !eventStarted ? (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
            <Clock size={20} className="mr-2" />
            Cuenta regresiva
          </h2>

          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="bg-blue-600 bg-opacity-10 rounded-lg p-3 border border-blue-600 border-opacity-20">
              <div className="text-2xl font-bold text-blue-600">{timeRemaining?.days}</div>
              <div className="text-xs text-gray-600">Días</div>
            </div>
            <div className="bg-blue-600 bg-opacity-10 rounded-lg p-3 border border-blue-600 border-opacity-20">
              <div className="text-2xl font-bold text-blue-600">{timeRemaining?.hours}</div>
              <div className="text-xs text-gray-600">Horas</div>
            </div>
            <div className="bg-blue-600 bg-opacity-10 rounded-lg p-3 border border-blue-600 border-opacity-20">
              <div className="text-2xl font-bold text-blue-600">{timeRemaining?.minutes}</div>
              <div className="text-xs text-gray-600">Min</div>
            </div>
            <div className="bg-blue-600 bg-opacity-10 rounded-lg p-3 border border-blue-600 border-opacity-20">
              <div className="text-2xl font-bold text-blue-600">{timeRemaining?.seconds}</div>
              <div className="text-xs text-gray-600">Seg</div>
            </div>
          </div>

          <p className="mt-4 text-center text-gray-500">
            El conteo se habilitará a las {config?.hora} del {fechaFormateada}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-blue-600">Registro</h2>

          <div className="mb-4">
            <label htmlFor="asistentes" className="block text-sm font-medium text-gray-700 mb-1">
              Cantidad de Asistentes
            </label>
            <input
              type="number"
              id="asistentes"
              value={asistentes}
              onChange={(e) => setAsistentes(e.target.value)} // Guardamos el valor como cadena
              min="0"
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            onClick={handleSaveAsistentes}
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center transition-colors"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Guardar Asistentes
          </button>
        </div>
      )}
    </main>
  )
}
