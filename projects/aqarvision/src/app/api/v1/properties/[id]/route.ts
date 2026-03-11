import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  // Check API key
  const apiKey = request.headers.get('x-api-key');
  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  if (apiKey !== process.env.PUBLIC_API_KEY) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Property ID required' }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: property, error } = await supabase
    .from('search_properties_view')
    .select(
      `property_id, title, description, price, currency, surface, rooms, bathrooms,
       type, transaction_type, country, wilaya, commune, address,
       images, features, latitude, longitude,
       agency_id, agency_name, agency_slug, agency_is_verified, agency_phone, agency_email,
       trust_score, images_count, has_location, has_description,
       published_at, created_at`
    )
    .eq('property_id', id)
    .single();

  if (error || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 });
  }

  return NextResponse.json({ data: property });
}
