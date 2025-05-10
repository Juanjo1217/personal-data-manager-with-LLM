"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, Loader2, AlertTriangle, WifiOff } from "lucide-react"
import Message, { type MessageType } from "./message"
import { API_BASE_URL } from "@/config/api"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// Mensajes iniciales para demostración
const initialMessages: MessageType[] = [
  {
    id: "1",
    content: "¡Hola! Soy QueryMind, tu asistente virtual. ¿En qué puedo ayudarte hoy?",
    sender: "bot",
    timestamp: new Date(Date.now() - 60000),
  },
]

// Tipos de error que pueden ocurrir
type ErrorType = "timeout" | "unavailable" | "network" | "unauthorized" | "unknown" | null

export default function ChatInterface() {
  const { token } = useAuth()
  const [messages, setMessages] = useState<MessageType[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ErrorType>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Función para enviar mensaje al servidor
  const sendMessageToServer = async (userMessage: string): Promise<string> => {
    setError(null)
    setIsLoading(true)

    try {
      // Simulación para desarrollo local
      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        // Simular tiempo de respuesta
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simular respuestas basadas en palabras clave
        if (userMessage.toLowerCase().includes("hola")) {
          return "¡Hola! ¿Cómo puedo ayudarte hoy?"
        } else if (userMessage.toLowerCase().includes("gracias")) {
          return "¡De nada! Estoy aquí para ayudarte."
        } else if (userMessage.toLowerCase().includes("ayuda")) {
          return "Puedo ayudarte con información, responder preguntas o simplemente conversar. ¿Qué necesitas?"
        } else if (userMessage.toLowerCase().includes("error")) {
          // Simular error para pruebas
          if (userMessage.toLowerCase().includes("timeout")) {
            throw { status: 504 }
          } else if (userMessage.toLowerCase().includes("unavailable")) {
            throw { status: 503 }
          } else {
            throw { status: 400 }
          }
        } else {
          return "Entiendo. ¿Puedes darme más detalles para poder ayudarte mejor?"
        }
      }

      // Petición real al servidor
      console.log("Enviando mensaje al servidor:", userMessage)

      // Verificar si hay token disponible
      if (!token) {
        console.error("No hay token de autenticación disponible")
        throw { status: 401 }
      }

      const response = await fetch(`${API_BASE_URL}/api/chatbot/pregunta/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ pregunta: userMessage }),
      })

      console.log("Respuesta del servidor:", response.status)

      // Manejar errores HTTP específicos
      if (response.status === 504) {
        throw { status: 504 }
      } else if (response.status === 503) {
        throw { status: 503 }
      } else if (!response.ok) {
        throw { status: response.status }
      }

      // Procesar respuesta exitosa
      const data = await response.json()
      console.log("Datos recibidos:", data)

      return data.respuesta
    } catch (err: any) {
      console.error("Error al enviar mensaje:", err)

      // Determinar tipo de error
      if (err.status === 401) {
        setError("unauthorized")
        return "No estás autorizado para usar este servicio. Por favor, inicia sesión nuevamente."
      } else if (err.status === 504) {
        setError("timeout")
        return "Lo siento, se agotó el tiempo de espera para obtener una respuesta. Por favor, intenta nuevamente."
      } else if (err.status === 503) {
        setError("unavailable")
        return "Lo siento, el servicio de chat no está disponible en este momento. Por favor, intenta más tarde."
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("network")
        return "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente."
      } else {
        setError("unknown")
        return "Ha ocurrido un error inesperado. Por favor, intenta nuevamente."
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Manejar envío de mensaje
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() === "" || isLoading) return

    // Crear y añadir mensaje del usuario
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setError(null)

    try {
      // Enviar mensaje al servidor y obtener respuesta
      const botResponse = await sendMessageToServer(input)

      // Crear y añadir mensaje del bot
      const botMessage: MessageType = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        sender: "bot",
        timestamp: new Date(),
        error: error, // Añadir información de error si existe
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      console.error("Error en handleSendMessage:", err)
    }
  }

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Renderizar mensaje de error apropiado
  const renderErrorAlert = () => {
    if (!error) return null

    let icon = <AlertTriangle className="h-5 w-5 text-yellow-500" />
    let message = "Ha ocurrido un error. Por favor, intenta nuevamente."
    let bgColor = "bg-yellow-900/20 border-yellow-900/50 text-yellow-50"

    if (error === "timeout") {
      message = "Se agotó el tiempo de espera. El servidor tardó demasiado en responder."
      bgColor = "bg-yellow-900/20 border-yellow-900/50 text-yellow-50"
    } else if (error === "unavailable") {
      icon = <WifiOff className="h-5 w-5 text-red-500" />
      message = "El servicio de chat no está disponible en este momento. Por favor, intenta más tarde."
      bgColor = "bg-red-900/20 border-red-900/50 text-red-50"
    } else if (error === "network") {
      icon = <WifiOff className="h-5 w-5 text-red-500" />
      message = "Error de conexión. Por favor, verifica tu conexión a internet."
      bgColor = "bg-red-900/20 border-red-900/50 text-red-50"
    } else if (error === "unauthorized") {
      message = "No estás autorizado para usar este servicio. Por favor, inicia sesión nuevamente."
      bgColor = "bg-red-900/20 border-red-900/50 text-red-50"
    }

    return (
      <Alert className={`mb-4 ${bgColor}`}>
        {icon}
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      {/* Efectos de fondo */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-[30rem] h-[30rem] bg-[#0ea5e9]/10 rounded-full blur-[8rem] opacity-30" />
        <div className="absolute bottom-[10%] right-[15%] w-[25rem] h-[25rem] bg-[#0d9488]/10 rounded-full blur-[8rem] opacity-30" />
      </div>

      {/* Área principal de chat */}
      <main
        ref={chatContainerRef}
        className="flex-grow flex flex-col relative z-10 w-full max-w-5xl mx-auto px-4 pb-32 custom-scrollbar"
      >
        {/* Contenedor de mensajes */}
        <div className="flex-grow py-6 space-y-6">
          {messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-2 text-[#e2e8f0] px-4 py-2 max-w-[80%] rounded-2xl bg-[#1e293b] border border-[#334155] rounded-tl-none">
              <div className="relative">
                <Bot className="h-5 w-5 text-[#38bdf8]" />
                <div className="absolute -inset-1 bg-[#38bdf8]/20 rounded-full blur-sm" />
              </div>
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#38bdf8] rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Barra de entrada fija en la parte inferior */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-[#1e293b]/95 backdrop-blur-md border-t border-[#334155] py-4">
        <div className="max-w-5xl mx-auto px-4">
          {/* Mostrar alerta de error si existe */}
          {renderErrorAlert()}

          <form onSubmit={handleSendMessage} className="flex w-full space-x-2 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isLoading ? "QueryMind está pensando..." : "Escribe tu mensaje aquí..."}
              className={`flex-grow bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white placeholder:text-[#64748b] transition-all duration-300 ${
                isLoading ? "opacity-70 border-[#38bdf8]/30" : ""
              }`}
              disabled={isLoading}
            />

            {isLoading && (
              <div className="absolute right-14 top-1/2 transform -translate-y-1/2 text-[#38bdf8] thinking-pulse">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            )}

            <Button
              type="submit"
              size="icon"
              className={`transition-all duration-300 ${
                isLoading
                  ? "bg-[#334155] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0ea5e9]"
              } border-0`}
              disabled={input.trim() === "" || isLoading}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>

          {isLoading && (
            <div className="text-xs text-[#94a3b8] mt-2 text-center">QueryMind está procesando tu mensaje...</div>
          )}
        </div>
      </div>
    </>
  )
}
