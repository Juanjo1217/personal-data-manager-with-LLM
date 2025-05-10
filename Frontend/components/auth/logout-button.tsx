"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

export default function LogoutButton() {
  const { logout } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </Button>
  )
}
