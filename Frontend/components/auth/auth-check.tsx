"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface AuthCheckProps {
  children: React.ReactNode
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Si no está autenticado y no está en login o signup, redirigir a login
    if (!isAuthenticated && pathname !== "/login" && pathname !== "/signup") {
      router.push("/login")
    }

    // Si está autenticado y está en login o signup, redirigir a home
    if (isAuthenticated && (pathname === "/login" || pathname === "/signup")) {
      router.push("/")
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
}
