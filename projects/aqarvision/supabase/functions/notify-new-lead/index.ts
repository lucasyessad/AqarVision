import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface LeadRecord {
  id: string;
  agency_id: string;
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
}

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: LeadRecord;
  schema: string;
  old_record: LeadRecord | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const lead = payload.record;

  if (!lead) {
    return new Response(
      JSON.stringify({ error: 'No record in payload' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get agency details including owner
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('name, email, owner_id')
    .eq('id', lead.agency_id)
    .single();

  if (agencyError || !agency?.owner_id) {
    console.error('Agency not found:', agencyError);
    return new Response(
      JSON.stringify({ error: 'Agency not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const {
    data: { user: owner },
    error: userError,
  } = await supabase.auth.admin.getUserById(agency.owner_id);

  if (userError || !owner?.email) {
    console.error('Owner not found:', userError);
    return new Response(
      JSON.stringify({ error: 'Owner email not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (RESEND_API_KEY) {
    const appUrl = Deno.env.get('APP_URL') || 'https://aqarvision.com';

    const optionalRows = [
      lead.email
        ? `<tr><td style="padding:8px;font-weight:bold;">Email</td><td style="padding:8px;">${lead.email}</td></tr>`
        : '',
      lead.message
        ? `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Message</td><td style="padding:8px;">${lead.message}</td></tr>`
        : '',
    ]
      .filter(Boolean)
      .join('');

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AqarVision <leads@aqarvision.com>',
        to: owner.email,
        subject: `🔔 Nouveau lead reçu — ${lead.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
            <h2 style="color:#2563EB;">Nouveau lead reçu pour ${agency.name}</h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px;font-weight:bold;width:120px;">Nom</td>
                <td style="padding:8px;">${lead.name}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:8px;font-weight:bold;">Téléphone</td>
                <td style="padding:8px;">${lead.phone}</td>
              </tr>
              ${optionalRows}
            </table>
            <div style="margin-top:20px;">
              <a
                href="${appUrl}/dashboard/leads"
                style="background:#2563EB;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block;"
              >
                Voir dans le dashboard →
              </a>
            </div>
            <hr style="margin:24px 0;" />
            <p style="color:#6b7280;font-size:12px;">
              Cet email a été envoyé automatiquement par AqarVision.
            </p>
          </div>
        `,
      }),
    });

    if (!emailRes.ok) {
      const body = await emailRes.text();
      console.error('Resend error:', body);
      // Continue to create in-app notification even if email fails
    }
  }

  // Create in-app notification regardless of email outcome
  const { error: notifError } = await supabase.from('notifications').insert({
    user_id: agency.owner_id,
    agency_id: lead.agency_id,
    type: 'new_lead',
    title: `Nouveau lead : ${lead.name}`,
    body: lead.message?.substring(0, 100) || 'Nouveau contact reçu',
    data: { lead_id: lead.id, lead_name: lead.name },
  });

  if (notifError) {
    console.error('Failed to create notification:', notifError);
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
