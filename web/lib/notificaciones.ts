// ================================================================
// notificaciones.ts — Email (Resend) + SMS (Twilio Colombia)
// ================================================================

// ── Email con Resend ─────────────────────────────────────────────
const RESEND_API_KEY = process.env.RESEND_API_KEY
const FROM_EMAIL     = 'Banco A <noreply@bancoa.co>'

async function enviarEmail(to: string, subject: string, html: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.log('[Notif] Email omitido — RESEND_API_KEY no configurado')
    return
  }

  const { Resend } = await import('resend')
  const resend = new Resend(RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  })

  if (error) console.error('[Notif] Error enviando email:', error)
}

// ── SMS con Twilio ────────────────────────────────────────────────
const TWILIO_SID   = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM  = process.env.TWILIO_PHONE_NUMBER

async function enviarSMS(to: string, body: string): Promise<void> {
  if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
    console.log('[Notif] SMS omitido — credenciales Twilio no configuradas')
    return
  }

  try {
    const twilio = (await import('twilio')).default
    const client = twilio(TWILIO_SID, TWILIO_TOKEN)
    await client.messages.create({ body, from: TWILIO_FROM, to })
  } catch (err) {
    console.error('[Notif] Error enviando SMS:', err)
  }
}

// ── Helpers de mensajes ──────────────────────────────────────────

export async function enviarEmailBienvenida(args: {
  nombre:    string
  email:     string
  codCuenta: string
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#1e40af">🏦 Bienvenido a Banco A, ${args.nombre}</h2>
      <p>Tu cuenta ha sido creada exitosamente.</p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:12px;color:#6b7280">Número de cuenta</p>
        <p style="margin:4px 0 0;font-family:monospace;font-size:18px;font-weight:bold;color:#1e3a8a">
          ${args.codCuenta}
        </p>
      </div>
      <p style="color:#6b7280;font-size:13px">
        Puedes empezar realizando un depósito demo para probar el sistema.
      </p>
    </div>
  `
  await enviarEmail(args.email, '¡Bienvenido a Banco A! Tu cuenta está lista', html)
}

export async function enviarSMSBienvenida(args: {
  telefono:  string
  nombre:    string
  codCuenta: string
}) {
  const msg = `Banco A: Hola ${args.nombre.split(' ')[0]}, tu cuenta ${args.codCuenta.slice(-6)} fue creada. ¡Bienvenido!`
  await enviarSMS(args.telefono, msg)
}

export async function enviarEmailTransferencia(args: {
  email:        string
  nombre:       string
  numOrden:     string
  mtoTransf:    number
  mtoComision:  number
  mtoTotal:     number
  destino:      string
  concepto:     string
  fecha:        string
  hora:         string
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#1e40af">🏦 Comprobante de Transferencia</h2>
      <p>Hola ${args.nombre}, tu transferencia fue procesada exitosamente.</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px 0;color:#6b7280">Referencia</td>
            <td style="text-align:right;font-family:monospace">${args.numOrden}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Beneficiario</td>
            <td style="text-align:right">${args.destino}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Transferencia</td>
            <td style="text-align:right">$${args.mtoTransf.toLocaleString('es-CO')} COP</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Comisión</td>
            <td style="text-align:right">$${args.mtoComision.toLocaleString('es-CO')}</td></tr>
        <tr style="font-weight:bold;color:#1e3a8a">
            <td style="padding:8px 0 0">Total debitado</td>
            <td style="text-align:right">$${args.mtoTotal.toLocaleString('es-CO')}</td></tr>
        <tr><td style="padding:8px 0;color:#6b7280">Fecha</td>
            <td style="text-align:right">${args.fecha} ${args.hora}</td></tr>
      </table>
    </div>
  `
  await enviarEmail(args.email, `Comprobante transferencia ${args.numOrden}`, html)
}

export async function enviarSMSTransferencia(args: {
  telefono:  string
  numOrden:  string
  mtoTotal:  number
  destino:   string
}) {
  const msg = `Banco A: Transferencia OK. Ref ${args.numOrden.slice(-8)} a ${args.destino.split(' ')[0]} por $${args.mtoTotal.toLocaleString('es-CO')} COP`
  await enviarSMS(args.telefono, msg)
}

export async function enviarEmailDeposito(args: {
  email:     string
  nombre:    string
  monto:     number
  codCuenta: string
  saldoNuevo: number
  fecha:     string
}) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#16a34a">✅ Depósito Confirmado</h2>
      <p>Hola ${args.nombre}, tu depósito demo fue procesado.</p>
      <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:16px;margin:16px 0">
        <p style="margin:0;font-size:12px;color:#6b7280">Monto depositado</p>
        <p style="margin:4px 0 0;font-size:24px;font-weight:bold;color:#15803d">
          +$${args.monto.toLocaleString('es-CO')} COP
        </p>
        <p style="margin:8px 0 0;font-size:13px;color:#6b7280">
          Saldo disponible: $${args.saldoNuevo.toLocaleString('es-CO')} COP
        </p>
      </div>
      <p style="color:#6b7280;font-size:13px">Cuenta: ${args.codCuenta} · ${args.fecha}</p>
    </div>
  `
  await enviarEmail(args.email, 'Depósito demo confirmado — Banco A', html)
}
