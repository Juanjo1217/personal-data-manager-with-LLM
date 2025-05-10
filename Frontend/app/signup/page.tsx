"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import Header from "@/components/ui/header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Añadir la importación de API_BASE_URL al inicio del archivo
import { API_BASE_URL } from "@/config/api"

// Opciones para los selectores
const GENERO_OPCIONES = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "NB", label: "No binario" },
  { value: "NR", label: "Prefiero no reportar" },
]

const DOCUMENTO_OPCIONES = [
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "CC", label: "Cédula" },
]

export default function SignupPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    segundo_nombre: "",
    fecha_nacimiento: "",
    genero: "",
    celular: "",
    numero_documento: "",
    tipo_documento: "",
  })

  const [foto, setFoto] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<string | null>(null)

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const authData = JSON.parse(localStorage.getItem("auth") || "null")

      if (authData?.isAuthenticated) {
        router.push("/")
      }
    }
  }, [router])

  // Manejar cambios en los campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error específico cuando el usuario modifica un campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Manejar cambios en los selectores
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error específico cuando el usuario modifica un campo
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Manejar selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño de la imagen (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, foto: "La imagen no puede pesar más de 2MB" }))
      e.target.value = "" // Limpiar el input
      return
    }

    setFoto(file)
    setPreviewUrl(URL.createObjectURL(file))

    // Limpiar error de foto si existía
    if (errors.foto) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.foto
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar campos obligatorios
    if (!formData.username.trim()) newErrors.username = "El nombre de usuario es requerido"
    if (!formData.email.trim()) newErrors.email = "El correo electrónico es requerido"
    if (!formData.password.trim()) newErrors.password = "La contraseña es requerida"
    if (formData.password.length < 8) newErrors.password = "La contraseña debe tener al menos 8 caracteres"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Las contraseñas no coinciden"
    if (!formData.first_name.trim()) newErrors.first_name = "El primer nombre es requerido"
    if (!formData.last_name.trim()) newErrors.last_name = "El apellido es requerido"
    if (!formData.segundo_nombre.trim()) newErrors.segundo_nombre = "El segundo nombre es requerido"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es requerida"
    if (!formData.genero) newErrors.genero = "El género es requerido"
    if (!formData.celular.trim()) newErrors.celular = "El número de celular es requerido"
    if (formData.celular.trim() && !/^\d{7}$/.test(formData.celular)) {
      newErrors.celular = "El celular debe tener exactamente 7 dígitos numéricos"
    }
    if (!formData.numero_documento.trim()) newErrors.numero_documento = "El número de documento es requerido"
    if (formData.numero_documento.trim() && !/^\d{8,10}$/.test(formData.numero_documento)) {
      newErrors.numero_documento = "El documento debe tener entre 8 y 10 dígitos numéricos"
    }
    if (!formData.tipo_documento) newErrors.tipo_documento = "El tipo de documento es requerido"
    if (!foto) newErrors.foto = "La foto de perfil es requerida"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setSuccess(null)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Crear FormData para enviar
      const formDataToSend = new FormData()

      // Añadir todos los campos al FormData
      Object.entries(formData).forEach(([key, value]) => {
        // No enviar confirmPassword
        if (key !== "confirmPassword") {
          formDataToSend.append(key, value)
        }
      })

      // Añadir la foto
      if (foto) {
        formDataToSend.append("foto", foto)
      }

      // Simulación para desarrollo local
      if (
        process.env.NODE_ENV === "development" &&
        typeof window !== "undefined" &&
        window.location.hostname === "localhost"
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        console.log("Datos que se enviarían:", Object.fromEntries(formDataToSend))
        setSuccess(`Cuenta creada exitosamente para ${formData.username}. Redirigiendo al inicio de sesión...`)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
        setIsLoading(false)
        return
      }

      console.log("Enviando solicitud de registro...")

      // Realizar la solicitud
      const response = await fetch(`${API_BASE_URL}/api/usuarios/crear/`, {
        method: "POST",
        body: formDataToSend, // FormData se encarga de establecer el Content-Type correcto
      })

      console.log("Respuesta recibida:", response.status)

      // Intentar obtener la respuesta como texto primero
      const responseText = await response.text()
      console.log("Respuesta como texto:", responseText)

      // Intentar parsear como JSON si es posible
      let data
      try {
        data = JSON.parse(responseText)
        console.log("Datos de respuesta:", data)
      } catch (e) {
        console.error("Error al parsear respuesta como JSON:", e)
        data = { mensaje: responseText || "Respuesta no válida del servidor" }
      }

      // Verificar si la respuesta fue exitosa (status 201)
      if (response.status === 201) {
        console.log("Registro exitoso:", data)
        setSuccess(`Cuenta creada exitosamente para ${formData.username}. Redirigiendo al inicio de sesión...`)

        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        // Manejar errores específicos del servidor
        console.error("Error en registro:", data)

        // Procesar errores de campo
        if (typeof data === "object" && data !== null) {
          const fieldErrors: Record<string, string> = {}

          Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value)) {
              fieldErrors[key] = value[0]
            } else if (typeof value === "string") {
              fieldErrors[key] = value
            }
          })

          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors)
          } else if (data.message) {
            setErrors({ general: data.message })
          } else if (data.error) {
            setErrors({ general: data.error })
          } else if (data.detail) {
            setErrors({ general: data.detail })
          } else {
            setErrors({ general: "Error al crear la cuenta. Por favor, intenta nuevamente." })
          }
        } else {
          setErrors({ general: "Error al crear la cuenta. Por favor, intenta nuevamente." })
        }
      }
    } catch (err: any) {
      console.error("Error completo:", err)
      setErrors({
        general: err.message || "Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8 relative">
        {/* Efectos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[25%] w-[20rem] h-[20rem] bg-[#0ea5e9]/10 rounded-full blur-[8rem] opacity-30" />
          <div className="absolute bottom-[20%] left-[25%] w-[15rem] h-[15rem] bg-[#0d9488]/10 rounded-full blur-[8rem] opacity-30" />
        </div>

        <Card className="w-full max-w-4xl shadow-xl border-0 bg-[#1e293b]/80 backdrop-blur-md relative z-10 my-8">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">Crear Cuenta</CardTitle>
            <CardDescription className="text-center text-[#94a3b8]">
              Regístrate para comenzar a usar QueryMind
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {errors.general && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-900/50 text-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-900/20 border-green-900/50 text-green-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Foto de perfil */}
              <div className="flex flex-col items-center space-y-2">
                <Label htmlFor="foto" className="text-sm font-medium text-[#e2e8f0]">
                  Foto de perfil
                </Label>
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <Avatar className="h-24 w-24 border-4 border-[#38bdf8]/50 group-hover:border-[#38bdf8] transition-colors">
                    <AvatarImage src={previewUrl || ""} alt="Foto de perfil" />
                    <AvatarFallback className="bg-gradient-to-br from-[#0ea5e9] to-[#0d9488] text-white text-4xl">
                      +
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Seleccionar foto</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {errors.foto && <span className="text-xs text-red-400">{errors.foto}</span>}
                <span className="text-xs text-[#94a3b8]">Máximo 2MB</span>
              </div>

              {/* Campos del formulario en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de usuario */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-[#e2e8f0]">
                    Nombre de Usuario *
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="usuario123"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.username ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.username && <span className="text-xs text-red-400">{errors.username}</span>}
                </div>

                {/* Correo electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-[#e2e8f0]">
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="tu@email.com"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.email ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.email && <span className="text-xs text-red-400">{errors.email}</span>}
                </div>

                {/* Primer nombre */}
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-[#e2e8f0]">
                    Primer Nombre *
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="Juan"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.first_name ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.first_name && <span className="text-xs text-red-400">{errors.first_name}</span>}
                </div>

                {/* Segundo nombre */}
                <div className="space-y-2">
                  <Label htmlFor="segundo_nombre" className="text-sm font-medium text-[#e2e8f0]">
                    Segundo Nombre *
                  </Label>
                  <Input
                    id="segundo_nombre"
                    name="segundo_nombre"
                    value={formData.segundo_nombre}
                    onChange={handleChange}
                    placeholder="Carlos"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.segundo_nombre ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.segundo_nombre && <span className="text-xs text-red-400">{errors.segundo_nombre}</span>}
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-[#e2e8f0]">
                    Apellido *
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.last_name ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.last_name && <span className="text-xs text-red-400">{errors.last_name}</span>}
                </div>

                {/* Fecha de nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-sm font-medium text-[#e2e8f0]">
                    Fecha de Nacimiento *
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleChange}
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.fecha_nacimiento ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.fecha_nacimiento && <span className="text-xs text-red-400">{errors.fecha_nacimiento}</span>}
                </div>

                {/* Género */}
                <div className="space-y-2">
                  <Label htmlFor="genero" className="text-sm font-medium text-[#e2e8f0]">
                    Género *
                  </Label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleSelectChange}
                    className={`w-full h-10 px-3 py-2 rounded-md bg-[#0f172a]/60 border border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.genero ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Selecciona tu género
                    </option>
                    {GENERO_OPCIONES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.genero && <span className="text-xs text-red-400">{errors.genero}</span>}
                </div>

                {/* Tipo de documento */}
                <div className="space-y-2">
                  <Label htmlFor="tipo_documento" className="text-sm font-medium text-[#e2e8f0]">
                    Tipo de Documento *
                  </Label>
                  <select
                    id="tipo_documento"
                    name="tipo_documento"
                    value={formData.tipo_documento}
                    onChange={handleSelectChange}
                    className={`w-full h-10 px-3 py-2 rounded-md bg-[#0f172a]/60 border border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.tipo_documento ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Selecciona el tipo de documento
                    </option>
                    {DOCUMENTO_OPCIONES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.tipo_documento && <span className="text-xs text-red-400">{errors.tipo_documento}</span>}
                </div>

                {/* Número de documento */}
                <div className="space-y-2">
                  <Label htmlFor="numero_documento" className="text-sm font-medium text-[#e2e8f0]">
                    Número de Documento *
                  </Label>
                  <Input
                    id="numero_documento"
                    name="numero_documento"
                    value={formData.numero_documento}
                    onChange={handleChange}
                    placeholder="Entre 8 y 10 dígitos"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.numero_documento ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.numero_documento && <span className="text-xs text-red-400">{errors.numero_documento}</span>}
                </div>

                {/* Número de celular */}
                <div className="space-y-2">
                  <Label htmlFor="celular" className="text-sm font-medium text-[#e2e8f0]">
                    Número de Celular *
                  </Label>
                  <Input
                    id="celular"
                    name="celular"
                    value={formData.celular}
                    onChange={handleChange}
                    placeholder="7 dígitos"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.celular ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.celular && <span className="text-xs text-red-400">{errors.celular}</span>}
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-[#e2e8f0]">
                    Contraseña *
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.password ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.password && <span className="text-xs text-red-400">{errors.password}</span>}
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-[#e2e8f0]">
                    Confirmar Contraseña *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white ${
                      errors.confirmPassword ? "border-red-500" : ""
                    }`}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && <span className="text-xs text-red-400">{errors.confirmPassword}</span>}
                </div>
              </div>

              <div className="text-center text-xs text-[#94a3b8] mt-2">
                Todos los campos marcados con * son obligatorios
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0ea5e9] border-0 text-white mt-6"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando cuenta...
                  </>
                ) : (
                  "Crear Cuenta"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center text-sm text-[#94a3b8]">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-[#38bdf8] hover:text-[#0ea5e9] font-medium">
                Iniciar sesión
              </Link>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
