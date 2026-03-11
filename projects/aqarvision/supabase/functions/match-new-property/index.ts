import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const payload = await req.json();
  const property = payload.record;
  const oldStatus = payload.old_record?.status;

  // Only process when status transitions to 'active'
  if (!property || property.status !== 'active' || oldStatus === 'active') {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Find all active saved searches with alerts
  const { data: searches, error: searchError } = await supabase
    .from('saved_searches')
    .select(`
      id, user_id, name,
      transaction_type, wilaya, property_type, price_min, price_max, surface_min,
      search_alerts!inner (id, channel, is_active, user_id)
    `)
    .eq('search_alerts.is_active', true);

  if (searchError) {
    console.error('Error fetching saved searches:', searchError);
    return new Response(JSON.stringify({ error: searchError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!searches?.length) {
    return new Response(JSON.stringify({ matched: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let matched = 0;

  for (const search of searches) {
    // Check if property matches search criteria
    if (search.transaction_type && search.transaction_type !== property.transaction_type) continue;
    if (search.wilaya && !property.wilaya?.toLowerCase().includes(search.wilaya.toLowerCase())) continue;
    if (search.property_type && search.property_type !== property.type) continue;
    if (search.price_max && property.price > search.price_max) continue;
    if (search.price_min && property.price < search.price_min) continue;
    if (search.surface_min && property.surface < search.surface_min) continue;

    const alerts = Array.isArray(search.search_alerts)
      ? search.search_alerts
      : [search.search_alerts];

    for (const alert of alerts) {
      if (!alert?.is_active) continue;

      // Create in-app notification
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: search.user_id,
        type: 'property_published',
        title: `Nouveau bien correspondant à "${search.name}"`,
        body: `Un ${property.type} à ${property.wilaya || 'voir les détails'} — ${
          property.price?.toLocaleString('fr-FR')
        } DZD`,
        data: {
          property_id: property.id,
          saved_search_id: search.id,
        },
      });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      }

      // Send email if channel allows and Resend is configured
      if (
        (alert.channel === 'email' || alert.channel === 'both') &&
        Deno.env.get('RESEND_API_KEY')
      ) {
        const {
          data: { user },
        } = await supabase.auth.admin.getUserById(search.user_id);

        if (user?.email) {
          const appUrl = Deno.env.get('APP_URL') || 'https://aqarvision.com';

          const emailRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'AqarVision <alertes@aqarvision.com>',
              to: user.email,
              subject: `Nouveau bien pour votre alerte "${search.name}"`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
                  <h2 style="color: #1d4ed8; margin-bottom: 8px;">AqarVision — Alerte immobilière</h2>
                  <p style="color: #374151;">
                    Un bien correspondant à votre alerte <strong>${search.name}</strong> vient d'être publié :
                  </p>
                  <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 16px 0;">
                    <h3 style="margin: 0 0 8px; color: #111827;">${property.title}</h3>
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      ${property.price?.toLocaleString('fr-FR')} DZD &mdash; ${property.wilaya || ''}
                    </p>
                  </div>
                  <a
                    href="${appUrl}/bien/${property.id}"
                    style="display: inline-block; background: #2563eb; color: white; text-decoration: none;
                           padding: 10px 20px; border-radius: 8px; font-weight: 600; margin-top: 8px;"
                  >
                    Voir l'annonce
                  </a>
                  <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
                    Vous recevez cet email car vous avez activé des alertes sur AqarVision.
                    <a href="${appUrl}/alertes" style="color: #6b7280;">Gérer mes alertes</a>
                  </p>
                </div>
              `,
            }),
          });

          if (!emailRes.ok) {
            console.error('Error sending email:', await emailRes.text());
          }
        }
      }

      matched++;
    }
  }

  return new Response(JSON.stringify({ matched }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
