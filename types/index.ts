export interface Sector {
  id: string
  nombre: string
  encargado: string
  asistentes?: number
}

export interface EventConfig {
  fecha: string
  hora: string
}

export interface AdminCredentials {
  username: string
  password: string
}
