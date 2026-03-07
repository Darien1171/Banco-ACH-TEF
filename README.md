# 🏦 Banco ACH/TEF

Sistema de transferencias interbancarias ACH/TEF — Proyecto académico con doble implementación: lógica en **COBOL** (GnuCOBOL) e interfaz web en **Next.js + Supabase**.

## Estructura

```
Proyecto_1/
├── src/            → MAIN-ACH.cbl (orquestador principal)
├── copybooks/      → 8 estructuras de datos COBOL (.cpy)
├── data/           → Archivos planos de prueba (.dat)
├── web/            → Aplicación web Next.js 16
└── Makefile        → Compilar/ejecutar con GnuCOBOL
```

## Web App

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · Supabase Auth + PostgreSQL

**Páginas:** Dashboard · Transferencia · Depósito Demo · Historial · Directorio · Perfil · Auditoría

**Funcionalidades:**
- Registro/login de usuarios con Supabase Auth
- Procesamiento ACH/TEF en 14 pasos (validación, comisiones, límites, antifraude)
- Depósito demo para pruebas
- Directorio público (sin saldos)
- Notificaciones por email (Resend) y SMS Colombia (Twilio)
- Diseño responsive con sidebar mobile

## Configuración rápida

```bash
cd web
npm install
cp .env.local.example .env.local   # Completar con tus credenciales
npm run dev
```

Variables requeridas en `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ver `.env.local.example` para todas las variables disponibles.

## COBOL

```bash
# Requiere GnuCOBOL instalado
make        # compilar
make run    # compilar y ejecutar
```

## Deploy

Conectar repositorio en [Vercel](https://vercel.com) con **Root Directory = `web`** y agregar las variables de entorno.
