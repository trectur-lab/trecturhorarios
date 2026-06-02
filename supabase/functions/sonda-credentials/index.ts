import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { z } from 'npm:zod@3'

const UpsertSchema = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(1).max(500),
  auth_url: z.string().url().max(500),
  position_url: z.string().url().max(500),
  dashboard_url: z.string().url().max(500).optional(),
})

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const token = authHeader.replace('Bearer ', '')
  const { data: claimsRes, error: claimsErr } = await userClient.auth.getClaims(token)
  if (claimsErr || !claimsRes?.claims?.sub) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
  const userId = claimsRes.claims.sub

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' })
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    if (req.method === 'GET') {
      const { data } = await admin
        .from('sonda_credentials')
        .select('id, username, auth_url, position_url, dashboard_url, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return new Response(JSON.stringify({ credentials: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const parsed = UpsertSchema.safeParse(await req.json())
      if (!parsed.success) {
        return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      await admin.from('sonda_credentials').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      const { error } = await admin.from('sonda_credentials').insert({
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      if (error) throw error
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('sonda-credentials error', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})