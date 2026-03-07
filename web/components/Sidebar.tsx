'use client'

// ================================================================
// Sidebar — Navegación principal + info de usuario + logout
// ================================================================

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutDashboard, ArrowLeftRight, History, ShieldCheck,
  PiggyBank, Users, CircleUser, X, LogOut,
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

interface SidebarProps {
  isOpen:    boolean
  onClose:   () => void
  userName:  string
  userEmail: string
  codCuenta: string
}

const LINKS = [
  { href: '/',              label: 'Dashboard',       Icon: LayoutDashboard },
  { href: '/transferencia', label: 'Transferencia',   Icon: ArrowLeftRight  },
  { href: '/deposito',      label: 'Deposito Demo',   Icon: PiggyBank       },
  { href: '/historial',     label: 'Historial',       Icon: History         },
  { href: '/directorio',    label: 'Directorio',      Icon: Users           },
  { href: '/perfil',        label: 'Mi Perfil',       Icon: CircleUser      },
  { href: '/auditoria',     label: 'Auditoria',       Icon: ShieldCheck     },
]

export default function Sidebar({ isOpen, onClose, userName, userEmail, codCuenta }: SidebarProps) {
  const path   = usePathname()
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-banco-900 text-white',
        'transition-transform duration-300 ease-in-out',
        'md:relative md:translate-x-0 md:z-auto',
        isOpen ? 'translate-x-0' : '-translate-x-full',
      )}
    >
      {/* Encabezado */}
      <div className='flex items-center justify-between px-5 py-5 border-b border-white/10'>
        <div>
          <span className='text-base font-bold tracking-wide'>Banco A</span>
          <p className='text-xs text-blue-300 mt-0.5'>Sistema ACH / TEF</p>
        </div>
        <button
          onClick={onClose}
          className='md:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors'
          aria-label='Cerrar menu'
        >
          <X size={18} />
        </button>
      </div>

      {/* Navegacion */}
      <nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'>
        {LINKS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              path === href
                ? 'bg-banco-600 text-white'
                : 'text-blue-200 hover:bg-white/10 hover:text-white',
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Footer: usuario + logout */}
      <div className='px-4 py-4 border-t border-white/10'>
        <div className='flex items-center gap-3 mb-3'>
          <div className='w-8 h-8 rounded-full bg-banco-600 flex items-center justify-center text-sm font-bold shrink-0'>
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-white truncate'>{userName}</p>
            <p className='text-xs text-blue-300 truncate'>{codCuenta || userEmail}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-300 hover:bg-red-900/40 hover:text-red-200 transition-colors'
        >
          <LogOut size={15} />
          Cerrar sesion
        </button>
      </div>
    </aside>
  )
}
