import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

/**
 * activitypub-federation
 * Federation delivery moved to TestagramGateway.
 * This stub returns status info.
 */
serve((req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  const gateway = Deno.env.get('GATEWAY_URL') ?? '';
  return new Response(
    JSON.stringify({
      status: 'moved',
      gateway: gateway || null,
      message: 'Federation delivery runs inside TestagramGateway.',
    }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
});
