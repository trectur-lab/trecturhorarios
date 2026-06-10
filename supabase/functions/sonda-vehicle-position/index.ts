// Edge Function: sonda-vehicle-position
// Autentica na SONDA e retorna posições atuais de veículos.
// Body aceita:
//   { numeroLinha: "07" }     -> retorna lista de veículos da linha
//   { codigoVeiculo: "1123" } -> retorna 1 veículo específico
//   { ping: true }            -> apenas testa o login (admin)
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

async function getCreds(): Promise<SondaCreds | null> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supabase
    .from("sonda_credentials")
    .select("auth_url, position_url, username, password")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[sonda] read creds error:", error.message);
    return null;
  }
  if (!data?.username || !data?.password) return null;
  return {
    auth_url: data.auth_url || DEFAULT_AUTH_URL,
    data_url: data.position_url || DEFAULT_DATA_URL,
    usuario: data.username,
    senha: data.password,
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
    if (!res.ok) {
      console.error(`[sonda] login ${res.status}: ${txt.slice(0, 300)}`);
      return null;
    }
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
    if (!token) {
      console.error("[sonda] login OK sem token:", txt.slice(0, 300));
      return null;
    }
    cachedToken = { token, key, expiresAt: now + 50 * 60 * 1000 };
    return token;
  } catch (e) {
    console.error("[sonda] login error:", e);
    return null;
  }
}

interface VehicleOut {
  codigo: string;
  placa: string | null;
  linha: string | null;
  lat: number;
  lng: number;
  velocidade: number;
  sentido: string | null;
  trajeto: string | null;
  dataHora: number | string | null;
}

function normalize(v: any): VehicleOut | null {
  const lat = Number(v?.latitude ?? v?.lat);
  const lng = Number(v?.longitude ?? v?.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    codigo: String(v?.codigo ?? v?.id ?? ""),
    placa: v?.placa ?? null,
    linha: v?.linha != null ? String(v.linha) : null,
    lat,
    lng,
    velocidade: Number(v?.velocidade ?? 0),
    sentido: v?.sentido ?? null,
    trajeto: v?.trajeto ?? null,
    dataHora: v?.dataHora ?? v?.timestamp ?? null,
  };
}

async function fetchVehicles(creds: SondaCreds, token: string) {
  const res = await fetch(creds.data_url, {
    method: "GET",
    headers: { Authorization: token, "Content-Type": "application/json" },
  });
  if (res.status === 401) return { authExpired: true as const };
  if (!res.ok) {
    const t = await res.text();
    return { error: `sonda_error_${res.status}: ${t.slice(0, 200)}` };
  }
  const json = await res.json();
  const list: any[] = Array.isArray(json)
    ? json
    : json?.veiculos ?? json?.data ?? [];
  return { list };
}

function normalizeLineNumber(s: string): string {
  // Normaliza "07", "7", "07A" para comparação tolerante
  return s.trim().toUpperCase().replace(/^0+(?=\d)/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const numeroLinha = typeof body?.numeroLinha === "string" ? body.numeroLinha.trim() : "";
    const codigoVeiculo =
      typeof body?.codigoVeiculo === "string" ? body.codigoVeiculo.trim() : "";
    const ping: boolean = body?.ping === true;

    if (!ping && !numeroLinha && !codigoVeiculo) {
      return new Response(
        JSON.stringify({
          vehicles: [],
          count: 0,
          message: "missing_filter",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const creds = await getCreds();
    if (!creds) {
      return new Response(
        JSON.stringify({ error: "credentials_not_configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let token = await login(creds);
    if (!token) {
      return new Response(
        JSON.stringify({ error: "auth_failed" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (ping) {
      return new Response(
        JSON.stringify({ ok: true, message: "Login SONDA bem-sucedido." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let result = await fetchVehicles(creds, token);
    if ("authExpired" in result) {
      cachedToken = null;
      token = await login(creds);
      if (!token) {
        return new Response(JSON.stringify({ error: "auth_failed" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      result = await fetchVehicles(creds, token);
    }

    if ("error" in result) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const all = (result.list ?? [])
      .map(normalize)
      .filter((v): v is VehicleOut => v !== null);

    let filtered = all;
    if (codigoVeiculo) {
      filtered = all.filter((v) => v.codigo === String(codigoVeiculo));
    } else if (numeroLinha) {
      const target = normalizeLineNumber(numeroLinha);
      filtered = all.filter(
        (v) => v.linha && normalizeLineNumber(v.linha) === target,
      );
    }

    return new Response(
      JSON.stringify({
        vehicles: filtered,
        count: filtered.length,
        fetchedAt: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("[sonda] unexpected:", e);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
