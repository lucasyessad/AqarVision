/**
 * AqarVision — Edge Function : publication automatique sur les réseaux sociaux
 *
 * Déclenchée par un webhook DB sur INSERT/UPDATE sur la table `properties`
 * quand status = 'active' et que l'agence a des comptes sociaux configurés.
 *
 * Plateformes supportées :
 *   - Facebook Pages (Graph API v19)
 *   - Instagram Business (Graph API v19)
 *
 * Variables d'environnement requises :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL
 *
 * Variables par agence (stockées dans la table agencies) :
 *   facebook_access_token, instagram_access_token (champs à ajouter)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface PropertyRecord {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  type: string;
  transaction_type: string;
  wilaya: string | null;
  commune: string | null;
  images: string[];
  status: string;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE';
  record: PropertyRecord;
  old_record?: PropertyRecord;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();
    const property = payload.record;
    const oldStatus = payload.old_record?.status;

    // Only process when status changes to 'active'
    if (!property || property.status !== 'active' || oldStatus === 'active') {
      return new Response(
        JSON.stringify({ skipped: true, reason: 'Not a new activation' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get agency social config
    const { data: agency } = await supabase
      .from('agencies')
      .select('name, facebook_url, instagram_url, facebook_access_token, instagram_access_token, facebook_page_id')
      .eq('id', property.agency_id)
      .single();

    if (!agency) {
      return new Response(
        JSON.stringify({ error: 'Agency not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://aqarvision.com';
    const propertyUrl = `${appUrl}/bien/${property.id}`;
    const transactionLabel = property.transaction_type === 'sale' ? 'À vendre' : 'À louer';
    const priceFormatted = property.price.toLocaleString('fr-FR');
    const location = [property.commune, property.wilaya].filter(Boolean).join(', ');

    const caption = `🏠 ${transactionLabel} — ${property.title}

💰 ${priceFormatted} ${property.currency}
📍 ${location || 'Algérie'}

${property.description ? property.description.substring(0, 200) + '...' : ''}

🔗 Voir l'annonce complète : ${propertyUrl}

#immobilier #algerie #${property.type} #${property.transaction_type === 'sale' ? 'vente' : 'location'} ${property.wilaya ? `#${property.wilaya.toLowerCase().replace(/\s+/g, '')}` : ''} #aqarvision`;

    const results: Record<string, string> = {};

    // Post to Facebook Page
    if (agency.facebook_access_token && agency.facebook_page_id) {
      const firstImage = property.images?.[0];
      const fbBody: Record<string, string> = {
        message: caption,
        access_token: agency.facebook_access_token,
      };

      const fbEndpoint = firstImage
        ? `https://graph.facebook.com/v19.0/${agency.facebook_page_id}/photos`
        : `https://graph.facebook.com/v19.0/${agency.facebook_page_id}/feed`;

      if (firstImage) fbBody.url = firstImage;

      const fbRes = await fetch(fbEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fbBody),
      });
      const fbData = await fbRes.json();
      results.facebook = fbRes.ok ? `Published (id: ${fbData.id})` : `Error: ${JSON.stringify(fbData)}`;
    }

    // Post to Instagram Business
    if (agency.instagram_access_token && agency.instagram_business_account_id && property.images?.[0]) {
      // Step 1: Create media container
      const containerRes = await fetch(
        `https://graph.facebook.com/v19.0/${agency.instagram_business_account_id}/media`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_url: property.images[0],
            caption,
            access_token: agency.instagram_access_token,
          }),
        }
      );
      const containerData = await containerRes.json();

      if (containerRes.ok && containerData.id) {
        // Step 2: Publish the container
        const publishRes = await fetch(
          `https://graph.facebook.com/v19.0/${agency.instagram_business_account_id}/media_publish`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              creation_id: containerData.id,
              access_token: agency.instagram_access_token,
            }),
          }
        );
        const publishData = await publishRes.json();
        results.instagram = publishRes.ok
          ? `Published (id: ${publishData.id})`
          : `Error: ${JSON.stringify(publishData)}`;
      } else {
        results.instagram = `Container error: ${JSON.stringify(containerData)}`;
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
