import { cn } from "@/lib/utils"
import { AlertTriangle, WifiOff } from "lucide-react"

export type MessageType = {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  error?: "timeout" | "unavailable" | "network" | "unauthorized" | "unknown" | null
}

interface MessageProps {
  message: MessageType
}

export default function Message({ message }: MessageProps) {
  const isUser = message.sender === "user"
  const hasError = message.error != null

  // Renderizar indicador de error si es necesario
  const renderErrorIndicator = () => {
    if (!hasError) return null

    let icon = <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />

    if (message.error === "unavailable" || message.error === "network") {
      icon = <WifiOff className="h-4 w-4 text-red-500 mr-1" />
    }

    return (
      <div className="flex items-center mt-1 text-xs text-red-400">
        {icon}
        <span>Error al obtener respuesta</span>
      </div>
    )
  }

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg",
          isUser
            ? "bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] text-white rounded-tr-none"
            : "bg-[#1e293b] border border-[#334155] text-[#e2e8f0] rounded-tl-none",
        )}
      >
        <div className="text-sm">{message.content}</div>
        <div className={cn("text-xs mt-1", isUser ? "text-[#e2e8f0]/70" : "text-[#94a3b8]")}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
        {renderErrorIndicator()}
      </div>
    </div>
  )
}
