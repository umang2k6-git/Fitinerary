import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method === 'POST') {
      // Increment visit count
      const { data: currentData, error: fetchError } = await supabase
        .from('site_visits')
        .select('visit_count')
        .single();

      if (fetchError) throw fetchError;

      const newCount = (currentData?.visit_count || 0) + 1;

      const { error: updateError } = await supabase
        .from('site_visits')
        .update({ visit_count: newCount, last_updated: new Date().toISOString() })
        .eq('id', (await supabase.from('site_visits').select('id').single()).data.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ visit_count: newCount }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    } else if (req.method === 'GET') {
      // Get current visit count
      const { data, error } = await supabase
        .from('site_visits')
        .select('visit_count')
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ visit_count: data?.visit_count || 0 }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});