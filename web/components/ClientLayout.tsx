'use client'

// ================================================================
// ClientLayout — Wrapper cliente: maneja estado del sidebar mobile
// Recibe los datos del usuario desde el Server Component (layout.tsx)
// ================================================================

import { useState } from 'react'
import Sidebar from './Sidebar'

interface ClientLayoutProps {
  children:  React.ReactNode
  userName:  string
  userEmail: string
  codCuenta: string
}

export default function ClientLayout({
  children, userName, userEmail, codCuenta,
}: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Overlay oscuro en mobile cuando el sidebar está abierto */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
        codCuenta={codCuenta}
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar mobile */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-banco-900 text-white sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-sm">🏦 Banco A</span>
        </div>

        {/* Página */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </>
  )
}
