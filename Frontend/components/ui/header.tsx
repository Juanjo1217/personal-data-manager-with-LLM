"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, LogOut, User } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  const navigateToProfile = () => {
    router.push("/profile")
  }

  // Obtener las iniciales del usuario para el fallback del avatar
  const getUserInitials = () => {
    if (!user) return "U"

    const firstInitial = user.first_name ? user.first_name.charAt(0) : ""
    const lastInitial = user.last_name ? user.last_name.charAt(0) : ""

    return (firstInitial + lastInitial).toUpperCase() || user.username.charAt(0).toUpperCase()
  }

  // Nombre completo del usuario
  const fullName = user
    ? `${user.first_name || ""} ${user.segundo_nombre || ""} ${user.last_name || ""}`.trim()
    : "Usuario"

  return (
    <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#334155] shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative">
            <MessageCircle className="h-8 w-8 text-[#38bdf8] group-hover:text-[#0ea5e9] transition-colors" />
            <div className="absolute -inset-1 bg-[#38bdf8]/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xl font-bold text-white">QueryMind</span>
        </Link>

        <nav className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center">
              {/* Grupo de usuario autenticado con el orden: foto → username → botón logout */}
              <div className="flex items-center gap-3">
                {/* 1. Avatar con menú desplegable */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative p-1 h-auto rounded-full hover:bg-[#334155]/50 focus:ring-2 focus:ring-[#38bdf8] focus:ring-offset-2 focus:ring-offset-[#0f172a]"
                      onClick={(e) => {
                        // Evitar que se abra el menú al hacer clic en el avatar
                        e.preventDefault()
                        navigateToProfile()
                      }}
                    >
                      <Avatar className="h-10 w-10 cursor-pointer border-2 border-[#38bdf8]/50 hover:border-[#38bdf8] transition-colors duration-200">
                        <AvatarImage src={user?.foto || ""} alt={fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-[#0ea5e9] to-[#0d9488] text-white">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 bg-[#1e293b] border-[#334155] text-[#e2e8f0]">
                    <DropdownMenuLabel className="flex flex-col gap-1">
                      <span className="font-medium text-white">{fullName}</span>
                      <span className="text-xs text-[#94a3b8] font-normal">@{user?.username}</span>
                      <span className="text-xs text-[#94a3b8] font-normal">{user?.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-[#334155]" />
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-[#334155] focus:bg-[#334155]"
                      onClick={navigateToProfile}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Mi perfil</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 2. Username discreto */}
                <span className="text-[#94a3b8] text-sm font-medium hidden md:inline-block">@{user?.username}</span>

                {/* 3. Botón de cerrar sesión (solo icono) */}
                <Button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-transparent hover:bg-red-500/10 text-[#94a3b8] hover:text-red-400 transition-colors duration-200"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ) : (
            pathname !== "/login" &&
            pathname !== "/signup" && (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="text-[#e2e8f0] hover:text-white hover:bg-[#334155]/50">
                    Iniciar sesión
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0ea5e9] border-0 text-white">
                    Crear cuenta
                  </Button>
                </Link>
              </>
            )
          )}

          {(pathname === "/login" || pathname === "/signup") && (
            <Link href="/">
              <Button variant="ghost" className="text-[#e2e8f0] hover:text-white hover:bg-[#334155]/50">
                Volver al inicio
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
