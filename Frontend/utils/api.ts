// Reemplazar la definición actual de API_BASE_URL con la importación desde config/api.ts
import { API_BASE_URL, DEFAULT_FETCH_OPTIONS } from "@/config/api"

/**
 * Utilidad para manejar solicitudes API con mejor manejo de errores
 */

// Opciones por defecto para fetch
const defaultOptions: RequestInit = DEFAULT_FETCH_OPTIONS

/**
 * Función para realizar solicitudes a la API con manejo de errores mejorado
 */
export async function apiRequest<T>(endpoint: string, method = "GET", data?: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`

  const options: RequestInit = {
    ...defaultOptions,
    method,
  }

  // Añadir cuerpo a la solicitud si hay datos
  if (data) {
    options.body = JSON.stringify(data)
  }

  try {
    console.log(`Iniciando solicitud ${method} a: ${url}`)

    const response = await fetch(url, options)
    console.log(`Respuesta recibida: ${response.status} ${response.statusText}`)

    // Intentar obtener el cuerpo como JSON
    let responseData
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      responseData = await response.json()
      console.log("Datos de respuesta:", responseData)
    } else {
      const textResponse = await response.text()
      console.log("Respuesta como texto:", textResponse)

      // Intentar parsear el texto como JSON de todos modos
      try {
        responseData = JSON.parse(textResponse)
      } catch {
        // Si no es JSON, crear un objeto con el texto
        responseData = { message: textResponse || "No hay datos disponibles" }
      }
    }

    // Manejar errores HTTP
    if (!response.ok) {
      throw {
        status: response.status,
        message: responseData.error || responseData.message || responseData.detail || "Error en la solicitud",
        data: responseData,
      }
    }

    return responseData as T
  } catch (error) {
    console.error("Error en solicitud API:", error)

    // Verificar si es un error de red
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      console.error("Error de red - No se pudo conectar al servidor")
      throw {
        status: 0,
        message: "No se pudo conectar al servidor. Verifica tu conexión a internet.",
        originalError: error,
      }
    }

    // Reenviar el error para que se maneje en el componente
    throw error
  }
}

/**
 * Verificar si el servidor está disponible
 */
export async function checkServerAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health-check`, {
      method: "GET",
      mode: "cors",
    })
    return response.ok
  } catch (error) {
    console.error("Error al verificar disponibilidad del servidor:", error)
    return false
  }
}

/**
 * Funciones específicas para autenticación
 */
export const authAPI = {
  register: (userData: { username: string; email: string; password: string }) =>
    apiRequest("/accounts/register/", "POST", userData),

  login: (credentials: { username: string; password: string }) => apiRequest("/accounts/login/", "POST", credentials),

  logout: () => apiRequest("/accounts/logout/", "POST"),
}
