import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

const BodySchema = z.object({
  numeroLinha: z.string().min(1).max(20),
})

const GARAGE = { lat: -21.709497, lng: -45.264057 }
const GARAGE_RADIUS_M = 75
const MAX_AGE_MS = 10 * 60 * 1000

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

async function sondaFetch(creds: any, path: string, body: unknown) {
  if (!creds?.base_url) throw new Error('SONDA base_url não configurado')
  const url = `${creds.base_url.replace(/\/$/, '')}${path}`
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Username': creds.username,
      'X-Password': creds.password,
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const txt = await resp.text().catch(() => '')
    throw new Error(`SONDA ${path} ${resp.status}: ${txt.slice(0, 200)}`)
  }
  return resp.json()
}

function computeStatus(velocidade: number, dataHoraIso: string, prevIdleMap: Map<string, number>, codigo: string) {
  const vel = Number(velocidade) || 0
  const ts = new Date(dataHoraIso).getTime()
  if (vel > 3) {
    prevIdleMap.delete(codigo)
    return { status: 'moving', stoppedForSec: 0 }
  }
  const since = prevIdleMap.get(codigo) ?? ts
  prevIdleMap.set(codigo, since)
  const stoppedForSec = Math.max(0, Math.floor((Date.now() - since) / 1000))
  return { status: stoppedForSec > 60 ? 'stopped' : 'idle', stoppedForSec }
}

const idleSince = new Map<string, number>()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const parsed = BodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { numeroLinha } = parsed.data

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: creds, error: credsErr } = await supabase
      .from('sonda_credentials')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (credsErr) throw credsErr
    if (!creds) {
      return new Response(JSON.stringify({ error: 'Credenciais SONDA não configuradas' }), {
        status: 412,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const raw = await sondaFetch(creds, creds.vehicle_position_path || '/posicao', {
      numeroLinha,
    })

    const list: any[] = Array.isArray(raw) ? raw : raw?.veiculos ?? raw?.data ?? []
    const now = Date.now()
    const vehicles = list
      .map((v) => {
        const lat = Number(v.lat ?? v.latitude)
        const lng = Number(v.lng ?? v.longitude ?? v.lon)
        const dataHora = v.dataHora ?? v.dt ?? v.timestamp ?? new Date().toISOString()
        const codigo = String(v.codigo ?? v.codigoVeiculo ?? v.id ?? v.placa ?? '')
        const { status, stoppedForSec } = computeStatus(v.velocidade ?? 0, dataHora, idleSince, codigo)
        return {
          codigo,
          placa: v.placa ?? v.plate ?? '',
          lat,
          lng,
          velocidade: Number(v.velocidade ?? 0),
          dataHora,
          sentido: v.sentido ?? v.direction ?? '',
          trajeto: v.trajeto ?? v.route ?? '',
          bearing: Number(v.bearing ?? v.direcao ?? 0),
          status,
          stoppedForSec,
        }
      })
      .filter((v) => Number.isFinite(v.lat) && Number.isFinite(v.lng))
      .filter((v) => now - new Date(v.dataHora).getTime() <= MAX_AGE_MS)
      .filter((v) => haversine({ lat: v.lat, lng: v.lng }, GARAGE) > GARAGE_RADIUS_M)

    return new Response(JSON.stringify({ vehicles, fetchedAt: new Date().toISOString() }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('sonda-vehicle-position error', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})