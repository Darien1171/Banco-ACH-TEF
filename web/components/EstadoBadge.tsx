import type { EstadoOrden } from '@/lib/tipos'
import clsx from 'clsx'

const CONFIG: Record<string, { label: string; cls: string }> = {
  CONFIRMADA:             { label: 'Exitosa',           cls: 'bg-green-100 text-green-800' },
  PENDIENTE_CONFIRMACION: { label: 'Pendiente',         cls: 'bg-yellow-100 text-yellow-800' },
  ENVIADA:                { label: 'En tránsito',       cls: 'bg-blue-100 text-blue-800' },
  RECHAZADA:              { label: 'Rechazada',         cls: 'bg-red-100 text-red-800' },
  TIMEOUT:                { label: 'Timeout',           cls: 'bg-orange-100 text-orange-800' },
  PENDIENTE_REVISION:     { label: 'Rev. manual',       cls: 'bg-purple-100 text-purple-800' },
  EXITOSA:                { label: 'Exitosa',           cls: 'bg-green-100 text-green-800' },
  SOSPECHOSA:             { label: 'Sospechosa',        cls: 'bg-red-100 text-red-800' },
}

export default function EstadoBadge({ estado }: { estado: string }) {
  const cfg = CONFIG[estado] ?? { label: estado, cls: 'bg-gray-100 text-gray-700' }
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.cls)}>
      {cfg.label}
    </span>
  )
}
