import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

const BodySchema = z.object({ numeroLinha: z.string().min(1).max(20) })

const cache = new Map<string, { shape: [number, number][]; at: number }>()
const TTL = 30 * 60 * 1000

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

    const cached = cache.get(numeroLinha)
    if (cached && Date.now() - cached.at < TTL) {
      return new Response(JSON.stringify({ shape: cached.shape, cached: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: creds } = await supabase
      .from('sonda_credentials')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!creds?.base_url) {
      return new Response(JSON.stringify({ error: 'Credenciais SONDA não configuradas' }), {
        status: 412,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = `${String(creds.base_url).replace(/\/$/, '')}${creds.line_route_path || '/rota'}`
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Username': creds.username,
        'X-Password': creds.password,
      },
      body: JSON.stringify({ numeroLinha }),
    })
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '')
      throw new Error(`SONDA rota ${resp.status}: ${txt.slice(0, 200)}`)
    }
    const raw = await resp.json()
    const rawShape: any[] = Array.isArray(raw)
      ? raw
      : raw?.shape ?? raw?.coordinates ?? raw?.pontos ?? []
    const shape: [number, number][] = rawShape
      .map((p: any) => {
        if (Array.isArray(p)) return [Number(p[0]), Number(p[1])] as [number, number]
        return [Number(p.lat ?? p.latitude), Number(p.lng ?? p.lon ?? p.longitude)] as [number, number]
      })
      .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))

    cache.set(numeroLinha, { shape, at: Date.now() })

    return new Response(JSON.stringify({ shape, cached: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('sonda-line-route error', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})