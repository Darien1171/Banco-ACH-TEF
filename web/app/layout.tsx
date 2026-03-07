import type { Metadata } from 'next'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'
import { getSession, getCuentaDelUsuario } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Banco A — Sistema ACH/TEF',
  description: 'Procesador de transferencias interbancarias ACH/TEF',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user   = await getSession()
  const cuenta = user ? await getCuentaDelUsuario(user.id) : null

  return (
    <html lang='es'>
      <body className='flex min-h-screen bg-gray-50'>
        {user ? (
          <ClientLayout
            userName={cuenta?.nom_cliente ?? user.email ?? 'Usuario'}
            userEmail={user.email ?? ''}
            codCuenta={cuenta?.cod_cuenta ?? ''}
          >
            {children}
          </ClientLayout>
        ) : (
          <main className='flex-1'>
            {children}
          </main>
        )}
      </body>
    </html>
  )
}
