"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { initializeApp } from "firebase/app"
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot } from "firebase/firestore"
import type { Sector, EventConfig } from "@/types"

// Firebase configuration - replace with your own
const firebaseConfig = {
 apiKey: "AIzaSyBqcRsc_mvY4ntDax1eAd4OhrRdjxkl6dQ",
    authDomain: "new-game-poker.firebaseapp.com",
    projectId: "new-game-poker",
    storageBucket: "new-game-poker.firebasestorage.app",
    messagingSenderId: "955268474970",
    appId: "1:955268474970:web:7d24cb76c1afc686225063"

}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

type FirebaseContextType = {
  sectores: Sector[]
  config: EventConfig | null
  totalAsistentes: number
  addSector: (sector: Omit<Sector, "id">) => Promise<void>
  updateSector: (id: string, data: Partial<Omit<Sector, "id">>) => Promise<void>
  deleteSector: (id: string) => Promise<void>
  updateConfig: (config: EventConfig) => Promise<void>
  resetAll: () => Promise<void>
  registrarAsistentes: (sectorId: string, asistentes: number) => Promise<void>
  loading: boolean
}

const FirebaseContext = createContext<FirebaseContextType | null>(null)

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [sectores, setSectores] = useState<Sector[]>([])
  const [config, setConfig] = useState<EventConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [totalAsistentes, setTotalAsistentes] = useState(0)

  useEffect(() => {
    // Subscribe to sectors collection
    const unsubscribeSectores = onSnapshot(collection(db, "sectores"), (snapshot) => {
      const sectoresData: Sector[] = []
      snapshot.forEach((doc) => {
        sectoresData.push({ id: doc.id, ...doc.data() } as Sector)
      })
      setSectores(sectoresData)

      // Calculate total attendees
      const total = sectoresData.reduce((sum, sector) => sum + (sector.asistentes || 0), 0)
      setTotalAsistentes(total)
    })

    // Subscribe to config document
    const unsubscribeConfig = onSnapshot(doc(db, "config", "evento"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        setConfig(docSnapshot.data() as EventConfig)
      } else {
        setConfig(null)
      }
      setLoading(false)
    })

    return () => {
      unsubscribeSectores()
      unsubscribeConfig()
    }
  }, [])

  const addSector = async (sector: Omit<Sector, "id">) => {
    const newSectorRef = doc(collection(db, "sectores"))
    await setDoc(newSectorRef, sector)
  }

  const updateSector = async (id: string, data: Partial<Omit<Sector, "id">>) => {
    await updateDoc(doc(db, "sectores", id), data)
  }

  const deleteSector = async (id: string) => {
    await deleteDoc(doc(db, "sectores", id))
  }

  const updateConfig = async (configData: EventConfig) => {
    await setDoc(doc(db, "config", "evento"), configData)
  }

  const resetAll = async () => {
    // Reset config
    await setDoc(doc(db, "config", "evento"), { fecha: "", hora: "" })

    // Reset all sectors' attendees count
    const promises = sectores.map((sector) => updateDoc(doc(db, "sectores", sector.id), { asistentes: 0 }))

    await Promise.all(promises)
  }

  const registrarAsistentes = async (sectorId: string, asistentes: number) => {
    await updateDoc(doc(db, "sectores", sectorId), { asistentes })
  }

  return (
    <FirebaseContext.Provider
      value={{
        sectores,
        config,
        totalAsistentes,
        addSector,
        updateSector,
        deleteSector,
        updateConfig,
        resetAll,
        registrarAsistentes,
        loading,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export const useFirebase = () => {
  const context = useContext(FirebaseContext)
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider")
  }
  return context
}
