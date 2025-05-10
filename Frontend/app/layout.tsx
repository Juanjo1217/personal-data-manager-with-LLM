import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "QueryMind - Tu asistente inteligente",
  description: "Chatbot inteligente con diseño elegante inspirado en el mar",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="custom-scrollbar">
      <body className={`${inter.className} min-h-screen custom-scrollbar`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
