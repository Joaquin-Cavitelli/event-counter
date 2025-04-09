"use client"

import { useFirebase } from "@/components/firebase-provider"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Clock, User, Users, Settings, CheckCircle } from "lucide-react"
import { formatearFecha } from "@/utils/formatear-fecha"

export default function Home() {
  const { sectores, config, totalAsistentes, loading } = useFirebase()
  const [eventDateTime, setEventDateTime] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [fechaFormateada, setFechaFormateada] = useState("")
  const [todosSectoresContados, setTodosSectoresContados] = useState(false)

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

  // Check if all sectors have been counted
  useEffect(() => {
    if (sectores.length === 0) {
      setTodosSectoresContados(false)
      return
    }

    const todosContados = sectores.every((sector) => sector.asistentes && sector.asistentes > 0)
    setTodosSectoresContados(todosContados)
  }, [sectores])

  // Second useEffect: Set up timer to update currentTime
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, []) // Empty dependency array - only run once

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Asistentes</h1>
        <Link
          href="/admin"
          className="bg-white hover:bg-gray-50 text-primary px-4 py-2 rounded-md text-sm font-medium border border-gray-200 shadow-sm flex items-center transition-colors"
        >
          <Settings size={16} className="mr-2" />
          Admin
        </Link>
      </div>

      {eventDateTime ? (
        <div className="bg-white text-gray-600 rounded-lg shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex items-center gap-2 text-gray-600 mb-2">
            <Clock size={18} className="text-primary" />
            <span>Evento programado para:</span>
          </div>
          <p >
            {fechaFormateada}
          </p>
          <p className="text-xl font-semibold">
          {config?.hora}hs
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-md">
          <p className="text-yellow-700">No se ha configurado la fecha y hora del evento.</p>
        </div>
      )}

      <div
        className={`rounded-lg shadow-md  p-4 mb-6 border ${todosSectoresContados ? "bg-green-50 border-green-200" : "bg-white  border-gray-600 border-opacity-20"}`}
      >
        <h2
          className={`text-xl font-semibold mb-2 flex items-center gap-2 ${todosSectoresContados ? "text-green-600" : "text-gray-600"}`}
        >
          <Users size={20} />
          Total de Asistentes: {totalAsistentes}
        </h2>

        {todosSectoresContados && sectores.length > 0 && (
          <div className="flex items-center text-green-600 mt-2 bg-white p-2 rounded-md">
            <CheckCircle size={18} className="mr-2" />
            <span>¡Todos los sectores han sido contados!</span>
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4 text-gray-800">Sectores</h2>

      {sectores.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500 border border-gray-200">
          No hay sectores configurados
        </div>
      ) : (
        <div className="space-y-3">
          {sectores.map((sector) => (
            <Link
              key={sector.id}
              href={`/sector/${sector.id}`}
              className={`block p-4 rounded-lg shadow-sm border shadow-hover ${
                sector.asistentes ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-gray-800">{sector.nombre}</h3>
                  <div className="flex items-center text-gray-500 text-sm mt-1">
                    <User size={14} className="mr-1 text-primary" />
                    {sector.encargado}
                  </div>
                </div>
                <div className={`text-lg font-semibold ${sector.asistentes ? "text-green-600" : "text-gray-400"}`}>
                  {sector.asistentes || 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
