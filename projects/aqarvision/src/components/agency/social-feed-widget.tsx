'use client';

import Image from 'next/image';
import { Instagram, Facebook, ExternalLink, Play } from 'lucide-react';
import type { Agency, SocialPost, SocialPlatform } from '@/types/database';
import { PLANS } from '@/config';
import type { OEmbedData } from '@/lib/social/fetch-feed';

interface SocialFeedWidgetProps {
  agency: Agency;
  posts: SocialPost[];
  embeds: OEmbedData[];
  hasApiData: boolean;
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.6a8.22 8.22 0 004.76 1.51V6.69h-1z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  tiktok: <TikTokIcon className="h-4 w-4" />,
};

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  tiktok: '#000000',
};

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

/**
 * Widget compact pour sidebar/pages secondaires.
 * Affiche un mini-feed de 3 posts max ou un embed réduit.
 */
export function SocialFeedWidget({ agency, posts, embeds, hasApiData }: SocialFeedWidgetProps) {
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;
  const isEnterprise = agency.active_plan === PLANS.ENTERPRISE;

  if (embeds.length === 0 && posts.length === 0) return null;

  const socialLinks = [
    agency.instagram_url && { platform: 'instagram' as SocialPlatform, url: agency.instagram_url },
    agency.facebook_url && { platform: 'facebook' as SocialPlatform, url: agency.facebook_url },
    agency.tiktok_url && { platform: 'tiktok' as SocialPlatform, url: agency.tiktok_url },
  ].filter(Boolean) as { platform: SocialPlatform; url: string }[];

  const widgetClass = isEnterprise && isDark
    ? 'rounded-xl bg-white/5 p-5'
    : isEnterprise
      ? 'rounded-xl bg-gray-50 p-5'
      : 'rounded-xl border p-5';

  return (
    <aside className={widgetClass}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3
          className={`text-sm font-semibold uppercase tracking-wider ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          Réseaux sociaux
        </h3>
        <div className="flex items-center gap-2">
          {socialLinks.map((link) => (
            <a
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
              aria-label={`Voir le profil ${PLATFORM_LABELS[link.platform]}`}
            >
              <span style={{ color: PLATFORM_COLORS[link.platform] }}>
                {PLATFORM_ICONS[link.platform]}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Mini feed (3 posts max) ou embed compact */}
      {hasApiData && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {posts.slice(0, 3).map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-lg"
            >
              {post.thumbnail_url || post.media_url ? (
                <Image
                  src={post.thumbnail_url || post.media_url!}
                  alt={post.caption?.slice(0, 50) || 'Publication'}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="120px"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{ backgroundColor: `${accentColor}15` }}
                >
                  {PLATFORM_ICONS[post.platform]}
                </div>
              )}
              {post.media_type === 'video' && (
                <Play className="absolute bottom-1 right-1 h-4 w-4 fill-white text-white drop-shadow" />
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
              {/* Platform dot */}
              <span
                className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full"
                style={{ backgroundColor: PLATFORM_COLORS[post.platform] }}
              />
            </a>
          ))}
        </div>
      ) : embeds.length > 0 ? (
        // Afficher le premier embed en mode compact
        <div className="aspect-square w-full overflow-hidden rounded-lg">
          <iframe
            src={embeds[0].embedUrl}
            title={`Feed ${PLATFORM_LABELS[embeds[0].platform]}`}
            className="h-full w-full border-0"
            loading="lazy"
            allowTransparency
            allow="encrypted-media"
          />
        </div>
      ) : null}

      {/* Footer link */}
      {posts.length > 3 && (
        <div className="mt-3 text-center">
          <a
            href={socialLinks[0]?.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs transition-opacity hover:opacity-70"
            style={{ color: accentColor }}
          >
            Voir plus
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </aside>
  );
}
