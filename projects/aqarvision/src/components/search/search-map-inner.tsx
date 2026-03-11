'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';
import type { SearchPropertyResult } from '@/types/database';

// Fix broken default icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const iconUrl = (require('leaflet/dist/images/marker-icon.png') as { default: string }).default ?? require('leaflet/dist/images/marker-icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const iconShadow = (require('leaflet/dist/images/marker-shadow.png') as { default: string }).default ?? require('leaflet/dist/images/marker-shadow.png');

const DefaultIcon = L.icon({
  iconUrl: typeof iconUrl === 'string' ? iconUrl : (iconUrl as { src: string }).src,
  shadowUrl: typeof iconShadow === 'string' ? iconShadow : (iconShadow as { src: string }).src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.mergeOptions({ icon: DefaultIcon });

interface SearchMapInnerProps {
  properties: SearchPropertyResult[];
  height?: string;
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: currency === 'DZD' ? 'DZD' : currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function SearchMapInner({ properties, height = '500px' }: SearchMapInnerProps) {
  const mappableProperties = properties.filter(
    (p): p is SearchPropertyResult & { latitude: number; longitude: number } =>
      p.latitude != null && p.longitude != null
  );

  return (
    <MapContainer
      center={[28.0339, 1.6596]}
      zoom={5}
      style={{ height, width: '100%', borderRadius: '0.75rem' }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mappableProperties.map((property) => (
        <Marker
          key={property.property_id}
          position={[property.latitude, property.longitude]}
        >
          <Popup maxWidth={240}>
            <div className="text-sm">
              {property.images.length > 0 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="mb-2 h-28 w-full rounded object-cover"
                />
              )}
              <p className="font-semibold leading-snug text-neutral-900 line-clamp-2">
                {property.title}
              </p>
              <p className="mt-0.5 font-bold text-primary-600">
                {formatPrice(property.price, property.currency)}
              </p>
              {(property.wilaya || property.city) && (
                <p className="mt-0.5 text-xs text-neutral-500">
                  {[property.wilaya, property.city].filter(Boolean).join(', ')}
                </p>
              )}
              <Link
                href={`/bien/${property.property_id}`}
                className="mt-2 block rounded-md bg-primary-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Voir le bien
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
