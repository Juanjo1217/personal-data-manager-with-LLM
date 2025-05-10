"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
// Añadir la importación de API_BASE_URL al inicio del archivo
import { API_BASE_URL } from "@/config/api"

// Definir tipos para nuestro contexto
export interface User {
  id?: number
  username: string
  email: string
  first_name: string
  last_name: string
  segundo_nombre?: string
  fecha_nacimiento?: string
  genero?: string
  celular?: string
  numero_documento?: string
  tipo_documento?: string
  foto?: string
}

export interface AuthState {
  isAuthenticated: boolean
  token: string | null
  user: User | null
  mensaje: string | null
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
  isLoading: boolean
  error: string | null
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}

// Proveedor del contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    token: null,
    user: null,
    mensaje: null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar estado de autenticación desde localStorage al iniciar
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth")
    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth)
        setAuthState(parsedAuth)
      } catch (e) {
        console.error("Error al parsear datos de autenticación:", e)
        localStorage.removeItem("auth")
      }
    }
  }, [])

  // Función para iniciar sesión
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulación para desarrollo local
      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simular respuesta exitosa con todos los campos
        const mockResponse = {
          correcto: true,
          mensaje: "Autenticación exitosa (simulada)",
          token: "token-simulado-123456",
          usuario: {
            username: username,
            email: `${username}@example.com`,
            first_name: "Usuario",
            last_name: "Simulado",
            segundo_nombre: "Test",
            fecha_nacimiento: "1990-01-01",
            genero: "M",
            celular: "3101234567",
            numero_documento: "123456789",
            tipo_documento: "CC",
            foto: "https://res.cloudinary.com/dn5znabtl/image/upload/v1746857862/u6fuiw2vfpnwkzkreprs.webp",
          },
        }

        const newAuthState = {
          isAuthenticated: true,
          token: mockResponse.token,
          user: mockResponse.usuario,
          mensaje: mockResponse.mensaje,
        }

        setAuthState(newAuthState)
        localStorage.setItem("auth", JSON.stringify(newAuthState))
        setIsLoading(false)
        return true
      }

      // Petición real al servidor
      console.log(
        "Iniciando solicitud de login a:",
        "https://89a1-181-235-94-38.ngrok-free.app/api/usuarios/autenticar/",
      )

      // Reemplazar la URL hardcodeada en la función login con la variable API_BASE_URL
      // Buscar esta línea:
      // Y reemplazarla con:
      const response = await fetch(`${API_BASE_URL}/api/usuarios/autenticar/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      console.log("Respuesta recibida:", response.status, response.statusText)

      const data = await response.json()
      console.log("Datos recibidos:", data)

      if (data.correcto) {
        // Login exitoso - guardar todos los datos del usuario
        const newAuthState = {
          isAuthenticated: true,
          token: data.token,
          user: data.usuario,
          mensaje: data.mensaje,
        }

        setAuthState(newAuthState)
        localStorage.setItem("auth", JSON.stringify(newAuthState))
        return true
      } else {
        // Login fallido
        setError(data.mensaje || "Credenciales incorrectas")
        return false
      }
    } catch (err: any) {
      console.error("Error en login:", err)
      setError(err.message || "Error al iniciar sesión. Por favor, intenta nuevamente.")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Función para actualizar datos del usuario
  const updateUser = (userData: Partial<User>) => {
    if (!authState.user) return

    const updatedUser = { ...authState.user, ...userData }
    const updatedAuthState = { ...authState, user: updatedUser }

    setAuthState(updatedAuthState)
    localStorage.setItem("auth", JSON.stringify(updatedAuthState))
  }

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar completamente el estado global
    setAuthState({
      isAuthenticated: false,
      token: null,
      user: null,
      mensaje: null,
    })

    // Eliminar datos de localStorage
    localStorage.removeItem("auth")
    localStorage.removeItem("rememberMe")

    // Redirigir a la página de login
    router.push("/login")
  }

  const value = {
    ...authState,
    login,
    logout,
    updateUser,
    isLoading,
    error,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
