import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // Check API key
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  // Simple key validation — in production this would check against a DB table
  if (apiKey !== process.env.PUBLIC_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const supabase = await createClient();
  const { searchParams } = request.nextUrl;

  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
  const transaction_type = searchParams.get('transaction_type');
  const wilaya = searchParams.get('wilaya');
  const type = searchParams.get('type');

  let query = supabase
    .from('search_properties_view')
    .select(
      'property_id, title, price, currency, surface, rooms, wilaya, commune, agency_name, agency_slug, agency_is_verified, trust_score, images, published_at'
    )
    .range((page - 1) * limit, page * limit - 1)
    .order('trust_score', { ascending: false });

  if (transaction_type) query = query.eq('transaction_type', transaction_type);
  if (wilaya) query = query.ilike('wilaya', `%${wilaya}%`);
  if (type) query = query.eq('type', type);

  const { data: properties, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: properties,
    meta: {
      page,
      limit,
      count: properties?.length ?? 0,
    },
  });
}
