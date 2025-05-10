"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import Header from "@/components/ui/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, CheckCircle2 } from "lucide-react"

// Añadir la importación de API_BASE_URL al inicio del archivo
import { API_BASE_URL } from "@/config/api"

// Opciones de género según los requisitos
const GENERO_OPCIONES = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "NB", label: "No binario" },
  { value: "NR", label: "Prefiero no reportar" },
]

export default function ProfilePage() {
  const { isAuthenticated, user, token, updateUser } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado para el formulario
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    segundo_nombre: "",
    fecha_nacimiento: "",
    genero: "",
    password: "",
  })

  // Estado para la imagen seleccionada
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [originalData, setOriginalData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formChanged, setFormChanged] = useState(false)

  // Cargar datos del usuario cuando el componente se monta
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      console.log("Cargando datos de usuario:", user)

      // Formatear la fecha de nacimiento si existe
      let formattedDate = ""
      if (user.fecha_nacimiento) {
        try {
          formattedDate = user.fecha_nacimiento
        } catch (e) {
          console.error("Error al formatear la fecha:", e)
        }
      }

      const initialData = {
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        segundo_nombre: user.segundo_nombre || "",
        fecha_nacimiento: formattedDate,
        genero: user.genero || "",
        password: "", // La contraseña siempre empieza vacía
      }

      console.log("Datos iniciales del formulario:", initialData)

      setFormData(initialData)
      setOriginalData(JSON.parse(JSON.stringify(initialData))) // Copia profunda para evitar referencias
      setPreviewUrl(user.foto || null)
    }
  }, [isAuthenticated, user, router])

  // Verificar si el formulario ha cambiado
  useEffect(() => {
    // Crear una copia profunda de formData para comparación
    const currentFormData = JSON.parse(JSON.stringify(formData))
    const originalFormData = JSON.parse(JSON.stringify(originalData))

    // Eliminar la contraseña vacía para la comparación
    if (currentFormData.password === "") {
      delete currentFormData.password
    }
    if (originalFormData.password === "") {
      delete originalFormData.password
    }

    // Comparar los objetos como strings JSON
    const hasFormChanged = JSON.stringify(currentFormData) !== JSON.stringify(originalFormData)

    // También considerar si se ha seleccionado una nueva imagen
    const hasChanged = hasFormChanged || selectedImage !== null

    console.log("Formulario actual:", currentFormData)
    console.log("Formulario original:", originalFormData)
    console.log("¿El formulario ha cambiado?", hasChanged)

    setFormChanged(hasChanged)
  }, [formData, selectedImage, originalData])

  // Manejar cambios en los campos de texto
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejar cambios en el selector de género
  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target
    console.log("Género seleccionado:", value)
    setFormData((prev) => ({ ...prev, genero: value }))
  }

  // Manejar cambios en la fecha
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setFormData((prev) => ({ ...prev, fecha_nacimiento: value }))
  }

  // Manejar selección de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tamaño de la imagen (2MB máximo)
    if (file.size > 2 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 2MB")
      e.target.value = "" // Limpiar el input
      return
    }

    setSelectedImage(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validar que al menos un campo haya cambiado
    if (!formChanged) {
      setError("No se han realizado cambios en el perfil")
      return
    }

    // Validar contraseña si se ha ingresado
    if (formData.password && formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setIsLoading(true)

    try {
      // Crear FormData para enviar
      const formDataToSend = new FormData()

      // Añadir solo los campos que han cambiado
      Object.keys(formData).forEach((key) => {
        // @ts-ignore
        if (key === "password" && formData[key] === "") return // No enviar contraseña vacía

        // @ts-ignore
        if (formData[key] !== originalData[key]) {
          // @ts-ignore
          formDataToSend.append(key, formData[key])
        }
      })

      // Añadir la imagen si se ha seleccionado una nueva
      if (selectedImage) {
        formDataToSend.append("foto", selectedImage)
      }

      // Simulación para desarrollo local
      if (
        false
        // process.env.NODE_ENV === "development" ||
        // (typeof window !== "undefined" && window.location.hostname === "localhost")
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simular respuesta exitosa
        console.log("Datos que se enviarían:", Object.fromEntries(formDataToSend))

        // Actualizar el estado global con los datos simulados
        const updatedUserData = { ...user }

        // Actualizar cada campo modificado
        Object.keys(formData).forEach((key) => {
          // @ts-ignore
          if (key === "password" && formData[key] === "") return

          // @ts-ignore
          if (formData[key] !== originalData[key]) {
            // @ts-ignore
            updatedUserData[key] = formData[key]
          }
        })

        // Si hay una nueva imagen, actualizar la URL (simulada)
        if (selectedImage) {
          updatedUserData.foto = previewUrl
        }

        // Actualizar el estado global
        updateUser(updatedUserData)

        setSuccess("Perfil actualizado correctamente (simulado)")

        // Actualizar originalData para reflejar los nuevos valores
        setOriginalData(JSON.parse(JSON.stringify(formData)))
        setSelectedImage(null) // Resetear la selección de imagen

        setIsLoading(false)
        return
      }

      // Verificar que el token existe
      if (!token) {
        throw new Error("No hay token de autenticación. Por favor, inicia sesión nuevamente.")
      }

      console.log("Enviando solicitud de actualización con token:", token)

      // Reemplazar la URL hardcodeada en la función handleSubmit con la variable API_BASE_URL
      const response = await fetch(`${API_BASE_URL}/api/usuarios/actualizar/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          // No incluir Content-Type aquí, FormData lo establece automáticamente con el boundary
        },
        body: formDataToSend,
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

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
        // Si no es JSON, usar el texto como mensaje
        data = { mensaje: responseText || "Respuesta no válida del servidor" }
      }

      if (response.ok) {
        // Actualizar el estado global con los datos actualizados
        if (data.usuario) {
          updateUser(data.usuario)
        } else {
          // Si el servidor no devuelve los datos actualizados, actualizamos con lo que enviamos
          const updatedUserData = { ...user }

          Object.keys(formData).forEach((key) => {
            // @ts-ignore
            if (key === "password" && formData[key] === "") return

            // @ts-ignore
            if (formData[key] !== originalData[key]) {
              // @ts-ignore
              updatedUserData[key] = formData[key]
            }
          })

          if (selectedImage && previewUrl) {
            updatedUserData.foto = previewUrl
          }

          updateUser(updatedUserData)
        }

        setSuccess(data.mensaje || "Perfil actualizado correctamente")

        // Actualizar originalData para reflejar los nuevos valores
        setOriginalData(JSON.parse(JSON.stringify(formData)))
        setSelectedImage(null) // Resetear la selección de imagen
      } else {
        // Manejar errores específicos
        if (data.mensaje) {
          throw new Error(data.mensaje)
        } else if (data.error) {
          throw new Error(data.error)
        } else if (data.detail) {
          throw new Error(data.detail)
        } else {
          throw new Error("Error al actualizar el perfil")
        }
      }
    } catch (err: any) {
      console.error("Error completo al actualizar perfil:", err)
      setError(err.message || "Error al actualizar el perfil. Por favor, intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // Obtener las iniciales del usuario para el fallback del avatar
  const getUserInitials = () => {
    if (!user) return "U"

    const firstInitial = user.first_name ? user.first_name.charAt(0) : ""
    const lastInitial = user.last_name ? user.last_name.charAt(0) : ""

    return (firstInitial + lastInitial).toUpperCase() || user.username.charAt(0).toUpperCase()
  }

  // Obtener la etiqueta del género para mostrar
  const getGenderLabel = (value: string) => {
    const option = GENERO_OPCIONES.find((opt) => opt.value === value)
    return option ? option.label : ""
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <Header />
      <main className="flex-grow flex justify-center p-4 md:p-8 relative">
        {/* Efectos de fondo */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[25%] w-[20rem] h-[20rem] bg-[#0ea5e9]/10 rounded-full blur-[8rem] opacity-30" />
          <div className="absolute bottom-[20%] right-[25%] w-[15rem] h-[15rem] bg-[#0d9488]/10 rounded-full blur-[8rem] opacity-30" />
        </div>

        <Card className="w-full max-w-3xl shadow-xl border-0 bg-[#1e293b]/80 backdrop-blur-md relative z-10 mt-8">
          <CardHeader className="space-y-1 flex flex-col items-center">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="h-24 w-24 mb-4 border-4 border-[#38bdf8]/50 group-hover:border-[#38bdf8] transition-colors">
                <AvatarImage src={previewUrl || ""} alt="Foto de perfil" />
                <AvatarFallback className="bg-gradient-to-br from-[#0ea5e9] to-[#0d9488] text-white text-4xl">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-medium">Cambiar foto</span>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center text-white">Mi Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-900/50 text-red-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-900/20 border-green-900/50 text-green-50">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input oculto para la imagen */}
              <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre de usuario */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-[#e2e8f0]">
                    Nombre de usuario
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Correo electrónico */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#e2e8f0]">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Primer nombre */}
                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-[#e2e8f0]">
                    Primer nombre
                  </Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Segundo nombre */}
                <div className="space-y-2">
                  <Label htmlFor="segundo_nombre" className="text-[#e2e8f0]">
                    Segundo nombre
                  </Label>
                  <Input
                    id="segundo_nombre"
                    name="segundo_nombre"
                    value={formData.segundo_nombre}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Apellido */}
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-[#e2e8f0]">
                    Apellido
                  </Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Fecha de nacimiento */}
                <div className="space-y-2">
                  <Label htmlFor="fecha_nacimiento" className="text-[#e2e8f0]">
                    Fecha de nacimiento
                  </Label>
                  <Input
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    type="date"
                    value={formData.fecha_nacimiento}
                    onChange={handleDateChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                  />
                </div>

                {/* Género - Reemplazado con un select nativo para mayor compatibilidad */}
                <div className="space-y-2">
                  <Label htmlFor="genero" className="text-[#e2e8f0]">
                    Género
                  </Label>
                  <select
                    id="genero"
                    name="genero"
                    value={formData.genero}
                    onChange={handleGenderChange}
                    className="w-full h-10 px-3 py-2 rounded-md bg-[#0f172a]/60 border border-[#334155] focus:border-[#38bdf8] text-white"
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
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#e2e8f0]">
                    Contraseña (dejar en blanco para no cambiar)
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-[#0f172a]/60 border-[#334155] focus:border-[#38bdf8] text-white"
                    placeholder="Mínimo 8 caracteres"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button
                  type="submit"
                  disabled={isLoading || !formChanged}
                  className={`bg-gradient-to-r from-[#0ea5e9] to-[#0d9488] hover:from-[#0d9488] hover:to-[#0ea5e9] text-white px-8 ${
                    !formChanged ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
