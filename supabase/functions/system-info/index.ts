import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // 只返回非敏感的系统信息
  const systemInfo = {
    deno: {
      version: Deno.version.deno,
      typescript: Deno.version.typescript,
      v8: Deno.version.v8,
    },
    deployment: {
      region: Deno.env.get('DENO_REGION') || 'unknown',
      deployment_id: Deno.env.get('DENO_DEPLOYMENT_ID') || 'local',
    },
    supabase: {
      url_configured: !!Deno.env.get('SUPABASE_URL'),
      anon_key_configured: !!Deno.env.get('SUPABASE_ANON_KEY'),
      service_key_configured: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    },
    timestamp: new Date().toISOString(),
  }

  return new Response(JSON.stringify(systemInfo, null, 2), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
