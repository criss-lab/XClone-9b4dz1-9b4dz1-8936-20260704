/**
 * gateway-relay — CORS-safe server-side proxy to TestagramGateway
 *
 * All gateway API calls from the frontend go through this relay,
 * avoiding CORS issues and keeping gateway secrets server-side.
 *
 * Usage (client-side):
 *   const { data, error } = await supabase.functions.invoke('gateway-relay', {
 *     body: { path: '/timeline/home', method: 'GET', params: { limit: 30 } }
 *   });
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const GATEWAY_URL = (
  Deno.env.get('GATEWAY_URL') ??
  'https://testagramgateway-9bi61x-9bi61x-2984-lovat.vercel.app'
).replace(/\/$/, '');

const GATEWAY_SECRET = Deno.env.get('GATEWAY_SECRET') ?? '';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { path, method = 'GET', body: bodyData, params } = await req.json();

    if (!path || typeof path !== 'string') {
      return new Response(JSON.stringify({ error: '`path` string is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build target URL
    let targetUrl = `${GATEWAY_URL}${path}`;
    if (params && typeof params === 'object') {
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString();
      if (qs) targetUrl += `?${qs}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json, application/activity+json',
    };

    // Forward caller's Authorization token
    const auth = req.headers.get('Authorization');
    if (auth) headers['Authorization'] = auth;

    // Attach gateway secret if configured
    if (GATEWAY_SECRET) headers['x-gateway-secret'] = GATEWAY_SECRET;

    const fetchOpts: RequestInit = { method: method.toUpperCase(), headers };
    if (bodyData && !['GET', 'HEAD'].includes(method.toUpperCase())) {
      fetchOpts.body = JSON.stringify(bodyData);
    }

    console.log(`[gateway-relay] → ${method.toUpperCase()} ${targetUrl}`);

    const gwRes = await fetch(targetUrl, fetchOpts);
    const ct = gwRes.headers.get('Content-Type') ?? 'application/json';
    const resText = await gwRes.text();

    console.log(`[gateway-relay] ← ${gwRes.status} from gateway`);

    return new Response(resText, {
      status: gwRes.status,
      headers: {
        ...corsHeaders,
        'Content-Type': ct,
        'X-Gateway-Status': String(gwRes.status),
        'X-Gateway-Url': GATEWAY_URL,
      },
    });
  } catch (err: any) {
    console.error('[gateway-relay] Error:', err.message);
    return new Response(JSON.stringify({ error: err.message ?? 'Relay error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
