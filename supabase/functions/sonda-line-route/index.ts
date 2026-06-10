// Edge Function: sonda-line-route
// Descobre/retorna o traçado (polyline) de uma linha na API SONDA / Sinóptico Plus.
// Body:
//   { probe: true, numeroLinha?: string, idLinha?: string }  -> testa endpoints candidatos
//   { numeroLinha: string }                                  -> resolve idLinha via bus_lines.sonda_id_linha e retorna shape
//   { idLinha: string }                                      -> retorna shape direto
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_AUTH_URL =
  "https://consultaviagem.m2mfrota.com.br/AutenticarUsuario";
const DEFAULT_DATA_URL =
  "https://zn5.sinopticoplus.com/servico-dados/api/v1/obterPosicaoVeiculo";

let cachedToken: { token: string; expiresAt: number; key: string } | null = null;

interface SondaCreds {
  auth_url: string;
  data_url: string;
  usuario: string;
  senha: string;
}

function apiBaseFromDataUrl(dataUrl: string): string {
  // extrai tudo até /api/v1
  const m = dataUrl.match(/^(https?:\/\/[^/]+\/[^/]+\/api\/v1)/);
  if (m) return m[1];
  // fallback: até o último /
  return dataUrl.replace(/\/[^/]*$/, "");
}

async function getCreds(): Promise<SondaCreds | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data } = await supabase
    .from("sonda_credentials")
    .select("auth_url, data_url, usuario, senha")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.usuario || !data?.senha) return null;
  return {
    auth_url: data.auth_url || DEFAULT_AUTH_URL,
    data_url: data.data_url || DEFAULT_DATA_URL,
    usuario: data.usuario,
    senha: data.senha,
  };
}

async function login(creds: SondaCreds): Promise<string | null> {
  const key = `${creds.auth_url}|${creds.usuario}`;
  const now = Date.now();
  if (cachedToken && cachedToken.key === key && cachedToken.expiresAt > now) {
    return cachedToken.token;
  }
  try {
    const res = await fetch(creds.auth_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: creds.usuario, senha: creds.senha }),
    });
    const txt = await res.text();
    if (!res.ok) return null;
    let token: string | undefined;
    try {
      const json = JSON.parse(txt);
      token =
        json?.IdentificacaoLogin ??
        json?.identificacaoLogin ??
        json?.token ??
        json?.Token ??
        json?.access_token ??
        json?.accessToken ??
        json?.data?.IdentificacaoLogin ??
        json?.data?.token;
      if (!token && typeof json === "string") token = json;
    } catch {
      token = txt.replace(/^"|"$/g, "");
    }
    if (!token) return null;
    cachedToken = { token, key, expiresAt: now + 50 * 60 * 1000 };
    return token;
  } catch {
    return null;
  }
}

async function lookupSondaIdLinha(numeroLinha: string): Promise<string | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data } = await supabase
    .from("bus_lines")
    .select("sonda_id_linha")
    .eq("numero", numeroLinha)
    .maybeSingle();
  return data?.sonda_id_linha ?? null;
}

function candidateEndpoints(base: string, idLinha: string): string[] {
  return [
    `${base}/obterItinerario?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterTrajeto?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterPontosLinha?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterTrajetoLinha?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterShapeLinha?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterRoteiroLinha?idLinha=${encodeURIComponent(idLinha)}`,
    `${base}/obterLinhas`,
  ];
}

function extractShape(json: any): [number, number][] {
  // Tenta múltiplos formatos comuns
  const candidates: any[] = [];
  if (Array.isArray(json)) candidates.push(json);
  if (Array.isArray(json?.shape)) candidates.push(json.shape);
  if (Array.isArray(json?.pontos)) candidates.push(json.pontos);
  if (Array.isArray(json?.coordenadas)) candidates.push(json.coordenadas);
  if (Array.isArray(json?.itinerario)) candidates.push(json.itinerario);
  if (Array.isArray(json?.trajeto)) candidates.push(json.trajeto);
  if (Array.isArray(json?.data)) candidates.push(json.data);

  for (const arr of candidates) {
    const out: [number, number][] = [];
    for (const p of arr) {
      const lat = Number(p?.latitude ?? p?.lat ?? p?.[0]);
      const lng = Number(p?.longitude ?? p?.lng ?? p?.lon ?? p?.[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) out.push([lat, lng]);
    }
    if (out.length >= 2) return out;
  }
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const probe: boolean = body?.probe === true;
    const numeroLinha: string | undefined = body?.numeroLinha;
    let idLinha: string | undefined = body?.idLinha;

    const creds = await getCreds();
    if (!creds) {
      return new Response(
        JSON.stringify({ error: "credentials_not_configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!idLinha && numeroLinha) {
      idLinha = (await lookupSondaIdLinha(numeroLinha)) ?? undefined;
    }
    // Sem idLinha e sem probe: devolve shape vazio em silêncio (linha ainda não mapeada).
    if (!probe && !idLinha) {
      return new Response(
        JSON.stringify({ shape: [], count: 0, message: "no_sonda_id_linha" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const token = await login(creds);
    if (!token) {
      return new Response(JSON.stringify({ error: "auth_failed" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base = apiBaseFromDataUrl(creds.data_url);
    const endpoints = candidateEndpoints(base, idLinha ?? "0");

    if (probe) {
      const attempts: any[] = [];
      for (const url of endpoints) {
        try {
          const r = await fetch(url, {
            headers: { Authorization: token, "Content-Type": "application/json" },
          });
          const txt = await r.text();
          let parsed: any = null;
          try { parsed = JSON.parse(txt); } catch { /* keep raw */ }
          attempts.push({
            endpoint: url,
            status: r.status,
            ok: r.ok,
            sample: parsed
              ? JSON.stringify(parsed).slice(0, 500)
              : txt.slice(0, 500),
            shapeLength: parsed ? extractShape(parsed).length : 0,
          });
        } catch (e) {
          attempts.push({ endpoint: url, error: String(e) });
        }
      }
      return new Response(
        JSON.stringify({ idLinha, base, attempts }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Modo normal: testa endpoints em ordem e devolve a primeira shape válida
    for (const url of endpoints) {
      try {
        const r = await fetch(url, {
          headers: { Authorization: token, "Content-Type": "application/json" },
        });
        if (!r.ok) continue;
        const json = await r.json().catch(() => null);
        if (!json) continue;
        const shape = extractShape(json);
        if (shape.length >= 2) {
          return new Response(
            JSON.stringify({ idLinha, endpoint: url, shape, count: shape.length }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      } catch { /* try next */ }
    }

    return new Response(
      JSON.stringify({ idLinha, shape: [], count: 0, message: "no_shape_available" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[sonda-line-route] unexpected:", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
