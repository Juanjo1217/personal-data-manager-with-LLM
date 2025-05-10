"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import Header from "@/components/ui/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  })
  const [localError, setLocalError] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setLocalError("El nombre de usuario es requerido")
      return false
    }
    if (!formData.password.trim()) {
      setLocalError("La contraseña es requerida")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!validateForm()) return

    // Intentar iniciar sesión
    const success = await login(formData.username, formData.password)

    if (success) {
      // Si el login fue exitoso, el useEffect se encargará de la redirección
      if (formData.rememberMe) {
        localStorage.setItem("rememberMe", "true")
      }
    }
  }

  // Mostrar el error del contexto o el error local
  const displayError = error || localError

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative">
        {/* Efectos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[25%] w-[20rem] h-[20rem] bg-[#0ea5e9]/10 rounded-full blur-[8rem] opacity-30" />
          <div className="absolute bottom-[20%] right-[25%] w-[15rem] h-[15rem] bg-[#0d9488]/10 rounded-full blur-[8rem] opacity-30" />
        </div>

        <Card className="w-full max-w-md shadow-xl border-0 bg-[#1e293b]/80 backdrop-blur-md relative z-10">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-[#94a3b8]">
              Ingresa tus credenciales para acceder a QueryMind
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-50">
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-[#e2e8f0]">
                  Nombre de Usuario
                </label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="usuario123"
                  className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-[#e2e8f0]">
                    Contraseña
                  </label>
                  <Link href="#" className="text-xs text-[#38bdf8] hover:text-[#0ea5e9]">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  className="border-[#334155] data-[state=checked]:bg-[#0ea5e9] data-[state=checked]:border-[#0ea5e9]"
                />
                <label
                  htmlFor="rememberMe"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#e2e8f0]"
                >
                  Recordarme
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0ea5e9] border-0 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Iniciando sesión...
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-[#94a3b8]">
              ¿No tienes una cuenta?{" "}
              <Link href="/signup" className="text-[#38bdf8] hover:text-[#0ea5e9] font-medium">
                Crear cuenta
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
