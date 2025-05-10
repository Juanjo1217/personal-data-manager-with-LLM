/**
 * Configuración global para la API
 */

// URL base para todas las solicitudes API
export const API_BASE_URL = "http://backend:8000"

// Opciones por defecto para fetch
export const DEFAULT_FETCH_OPTIONS: RequestInit = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  mode: "cors",
  credentials: "include",
}
