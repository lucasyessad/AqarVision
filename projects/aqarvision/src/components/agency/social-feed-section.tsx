'use client';

import Image from 'next/image';
import { Instagram, Facebook, ExternalLink, Heart, MessageCircle, Play } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import type { Agency, SocialPost, SocialPlatform } from '@/types/database';
import { PLATFORM_COLORS as PLATFORM_BRAND_COLORS, PLANS } from '@/config';
import type { OEmbedData } from '@/lib/social/fetch-feed';

interface SocialFeedSectionProps {
  agency: Agency;
  posts: SocialPost[];
  embeds: OEmbedData[];
  hasApiData: boolean;
}

const PLATFORM_ICONS: Record<SocialPlatform, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  tiktok: <TikTokIcon className="h-4 w-4" />,
};

const PLATFORM_COLORS = PLATFORM_BRAND_COLORS as Record<SocialPlatform, string>;

const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.6a8.22 8.22 0 004.76 1.51V6.69h-1z" />
    </svg>
  );
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} sem.`;
  return date.toLocaleDateString('fr-DZ', { day: 'numeric', month: 'short' });
}

function truncateCaption(caption: string | null, maxLen = 100): string {
  if (!caption) return '';
  return caption.length > maxLen ? `${caption.slice(0, maxLen)}…` : caption;
}

/** Grille de posts récupérés via API */
function PostsGrid({ posts, isDark, accentColor }: { posts: SocialPost[]; isDark: boolean; accentColor: string }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className={`group block overflow-hidden rounded-xl transition-transform hover:scale-[1.02] ${
            isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-white hover:shadow-lg'
          }`}
        >
          {/* Media */}
          <div className="relative aspect-square overflow-hidden">
            {post.thumbnail_url || post.media_url ? (
              <Image
                src={post.thumbnail_url || post.media_url!}
                alt={truncateCaption(post.caption, 60) || 'Publication'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                {PLATFORM_ICONS[post.platform]}
              </div>
            )}

            {/* Video overlay */}
            {post.media_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="h-10 w-10 fill-white text-white opacity-80" />
              </div>
            )}

            {/* Platform badge */}
            <span
              className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: PLATFORM_COLORS[post.platform] }}
            >
              {PLATFORM_ICONS[post.platform]}
            </span>
          </div>

          {/* Content */}
          <div className="p-4">
            {post.caption && (
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {truncateCaption(post.caption)}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between text-xs opacity-50">
              <span>{formatTimestamp(post.timestamp)}</span>
              <div className="flex items-center gap-3">
                {post.likes_count != null && (
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" />
                    {post.likes_count}
                  </span>
                )}
                {post.comments_count != null && (
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    {post.comments_count}
                  </span>
                )}
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
}

/** Embeds iframes (fallback quand pas d'API) */
function EmbedsGrid({ embeds, isDark }: { embeds: OEmbedData[]; isDark: boolean }) {
  return (
    <div className={`grid gap-6 ${embeds.length === 1 ? 'max-w-md mx-auto' : embeds.length === 2 ? 'sm:grid-cols-2 max-w-3xl mx-auto' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {embeds.map((embed) => (
        <div
          key={embed.platform}
          className={`overflow-hidden rounded-xl ${isDark ? 'bg-white/5' : 'bg-white shadow-md'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span style={{ color: PLATFORM_COLORS[embed.platform] }}>
                {PLATFORM_ICONS[embed.platform]}
              </span>
              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {PLATFORM_LABELS[embed.platform]}
              </span>
              {embed.username && (
                <span className="text-xs opacity-50">@{embed.username}</span>
              )}
            </div>
            <a
              href={embed.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs opacity-50 hover:opacity-80"
              aria-label={`Voir le profil ${PLATFORM_LABELS[embed.platform]}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Embed iframe */}
          <div className="aspect-square w-full">
            <iframe
              src={embed.embedUrl}
              title={`Feed ${PLATFORM_LABELS[embed.platform]}`}
              className="h-full w-full border-0"
              loading="lazy"
              allowTransparency
              allow="encrypted-media"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Section "Nos actualités" pour la page d'accueil.
 * Affiche les publications via API si disponibles, sinon les embeds iframe.
 */
export function SocialFeedSection({ agency, posts, embeds, hasApiData }: SocialFeedSectionProps) {
  const containerRef = useScrollReveal();
  const isDark = agency.theme_mode === 'dark';
  const accentColor = agency.secondary_color || agency.primary_color;
  const isEnterprise = agency.active_plan === PLANS.ENTERPRISE;

  // Pas de réseaux configurés → ne rien afficher
  if (embeds.length === 0 && posts.length === 0) return null;

  // Social links pour le header
  const socialLinks = [
    agency.instagram_url && { platform: 'instagram' as SocialPlatform, url: agency.instagram_url },
    agency.facebook_url && { platform: 'facebook' as SocialPlatform, url: agency.facebook_url },
    agency.tiktok_url && { platform: 'tiktok' as SocialPlatform, url: agency.tiktok_url },
  ].filter(Boolean) as { platform: SocialPlatform; url: string }[];

  if (isEnterprise) {
    return (
      <section
        ref={containerRef}
        className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-white'}`}
      >
        <div className="mx-auto max-w-7xl px-6">
          {/* En-tête luxury */}
          <div className="luxury-scroll-reveal mb-16 text-center">
            <span
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: accentColor }}
            >
              Actualités
            </span>
            <h2
              className={`mt-4 font-display-classic text-display-lg ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Suivez-nous
            </h2>
            <div
              className="luxury-animate-line-grow mx-auto mt-6 h-0.5"
              style={{ backgroundColor: accentColor }}
              aria-hidden="true"
            />

            {/* Social links */}
            <div className="mt-6 flex items-center justify-center gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-opacity hover:opacity-80 ${
                    isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                  aria-label={`Suivre sur ${PLATFORM_LABELS[link.platform]}`}
                >
                  <span style={{ color: PLATFORM_COLORS[link.platform] }}>
                    {PLATFORM_ICONS[link.platform]}
                  </span>
                  {PLATFORM_LABELS[link.platform]}
                </a>
              ))}
            </div>
          </div>

          {/* Contenu */}
          <div className="luxury-scroll-reveal">
            {hasApiData && posts.length > 0 ? (
              <PostsGrid posts={posts} isDark={isDark} accentColor={accentColor} />
            ) : (
              <EmbedsGrid embeds={embeds} isDark={isDark} />
            )}
          </div>
        </div>
      </section>
    );
  }

  // Starter / Pro → version simplifiée
  return (
    <section ref={containerRef} className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-xl font-bold">Nos actualités</h2>
          <div className="flex items-center gap-3">
            {socialLinks.map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label={`Suivre sur ${PLATFORM_LABELS[link.platform]}`}
              >
                <span style={{ color: PLATFORM_COLORS[link.platform] }}>
                  {PLATFORM_ICONS[link.platform]}
                </span>
              </a>
            ))}
          </div>
        </div>

        {hasApiData && posts.length > 0 ? (
          <PostsGrid posts={posts} isDark={false} accentColor={agency.primary_color} />
        ) : (
          <EmbedsGrid embeds={embeds} isDark={false} />
        )}
      </div>
    </section>
  );
}
