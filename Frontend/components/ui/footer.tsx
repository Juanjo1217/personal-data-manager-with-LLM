import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] border-t border-[#334155] text-[#e2e8f0] py-6 relative z-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-white">QueryMind</h3>
            <p className="text-sm text-[#94a3b8]">Tu asistente inteligente</p>
          </div>

          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <Link href="#" className="text-sm text-[#94a3b8] hover:text-[#38bdf8] transition-colors">
              Términos de servicio
            </Link>
            <Link href="#" className="text-sm text-[#94a3b8] hover:text-[#38bdf8] transition-colors">
              Política de privacidad
            </Link>
            <Link href="#" className="text-sm text-[#94a3b8] hover:text-[#38bdf8] transition-colors">
              Contacto
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-[#64748b]">
          © {new Date().getFullYear()} QueryMind. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
