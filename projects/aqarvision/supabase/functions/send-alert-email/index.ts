import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get active alerts that haven't been sent in 24h
  const { data: alerts, error: alertsError } = await supabase
    .from('search_alerts')
    .select(`
      id,
      user_id,
      channel,
      frequency,
      last_sent_at,
      saved_searches (
        id, name, transaction_type, wilaya, commune, city,
        property_type, price_min, price_max, surface_min, rooms_min, keywords
      )
    `)
    .eq('is_active', true)
    .eq('frequency', 'daily')
    .or(
      `last_sent_at.is.null,last_sent_at.lt.${new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()}`,
    );

  if (alertsError) {
    console.error('Error fetching alerts:', alertsError);
    return new Response(
      JSON.stringify({ error: alertsError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  if (!alerts || alerts.length === 0) {
    return new Response(
      JSON.stringify({ sent: 0 }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  let sent = 0;

  for (const alert of alerts) {
    try {
      const search = Array.isArray(alert.saved_searches)
        ? alert.saved_searches[0]
        : alert.saved_searches;

      if (!search) continue;

      // Build query to find matching properties published since last send
      const sinceDate = alert.last_sent_at
        ? alert.last_sent_at
        : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      let query = supabase
        .from('search_properties_view')
        .select('property_id, title, price, currency, wilaya, images, agency_name')
        .gte('created_at', sinceDate);

      if (search.transaction_type) query = query.eq('transaction_type', search.transaction_type);
      if (search.wilaya) query = query.ilike('wilaya', `%${search.wilaya}%`);
      if (search.property_type) query = query.eq('type', search.property_type);
      if (search.price_max) query = query.lte('price', search.price_max);
      if (search.price_min) query = query.gte('price', search.price_min);

      const { data: properties } = await query.limit(5);

      if (!properties || properties.length === 0) continue;

      // Get user email
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(alert.user_id);

      if (!user?.email) continue;

      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_API_KEY) {
        const appUrl = Deno.env.get('APP_URL') || 'https://aqarvision.com';
        const count = properties.length;
        const plural = count > 1;

        const propertiesHtml = properties
          .map(
            (p: {
              property_id: string;
              title: string;
              price: number | null;
              currency: string | null;
              wilaya: string | null;
            }) => `
          <div style="border:1px solid #e5e7eb;padding:12px;margin:8px 0;border-radius:8px;">
            <strong>${p.title}</strong><br>
            <span>${p.price?.toLocaleString('fr-FR') ?? '—'} ${p.currency || 'DZD'}</span> — ${p.wilaya || ''}<br>
            <a href="${appUrl}/bien/${p.property_id}" style="color:#2563EB;">Voir l'annonce →</a>
          </div>
        `,
          )
          .join('');

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'AqarVision <alertes@aqarvision.com>',
            to: user.email,
            subject: `🏠 ${count} nouveau${plural ? 'x' : ''} bien${plural ? 's' : ''} pour votre alerte "${search.name}"`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                <h2 style="color:#2563EB;">Nouveaux biens correspondant à votre recherche</h2>
                <p>Votre alerte "<strong>${search.name}</strong>" a trouvé ${count} nouveau${plural ? 'x' : ''} bien${plural ? 's' : ''} :</p>
                ${propertiesHtml}
                <hr style="margin:20px 0;"/>
                <p style="color:#6b7280;font-size:12px;">
                  <a href="${appUrl}/alertes" style="color:#6b7280;">Gérer mes alertes</a>
                </p>
              </div>
            `,
          }),
        });

        if (!emailRes.ok) {
          const body = await emailRes.text();
          console.error(`Resend error for alert ${alert.id}:`, body);
          continue;
        }
      }

      // Mark alert as sent
      await supabase
        .from('search_alerts')
        .update({ last_sent_at: new Date().toISOString() })
        .eq('id', alert.id);

      sent++;
    } catch (err) {
      console.error(`Error processing alert ${alert.id}:`, err);
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
