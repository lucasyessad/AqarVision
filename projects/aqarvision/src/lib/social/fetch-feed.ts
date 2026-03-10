import type { SocialPost, SocialPlatform } from '@/types/database';

/**
 * Service de récupération des publications sociales.
 *
 * Approche hybride :
 * 1. Si un access_token est configuré → utilise l'API officielle (Meta Graph / TikTok)
 * 2. Sinon → utilise l'endpoint oEmbed (pas de clé requise, données limitées)
 * 3. Fallback final → retourne un lien embed iframe
 *
 * Les résultats sont mis en cache côté serveur via Next.js fetch cache.
 */

const CACHE_TTL = 3600; // 1 heure

// ─── Instagram (Meta Graph API) ──────────────────────────────────────

/**
 * Extrait le username Instagram depuis une URL de profil.
 * Supporte: instagram.com/username, instagram.com/username/, www.instagram.com/username
 */
export function extractInstagramUsername(url: string): string | null {
  const match = url.match(/instagram\.com\/([a-zA-Z0-9_.]+)\/?$/);
  return match?.[1] ?? null;
}

async function fetchInstagramAPI(accessToken: string, limit = 6): Promise<SocialPost[]> {
  const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=${limit}&access_token=${accessToken}`;

  const res = await fetch(url, { next: { revalidate: CACHE_TTL } });
  if (!res.ok) return [];

  const json = await res.json();
  if (!json.data) return [];

  return json.data.map((post: Record<string, unknown>) => ({
    id: `ig-${post.id}`,
    platform: 'instagram' as SocialPlatform,
    permalink: post.permalink as string,
    caption: (post.caption as string) || null,
    media_url: (post.media_url as string) || null,
    media_type: mapMediaType(post.media_type as string),
    thumbnail_url: (post.thumbnail_url as string) || null,
    timestamp: post.timestamp as string,
    likes_count: (post.like_count as number) ?? null,
    comments_count: (post.comments_count as number) ?? null,
  }));
}

// ─── Facebook (Meta Graph API) ───────────────────────────────────────

/**
 * Extrait l'ID ou username Facebook depuis une URL de page.
 */
export function extractFacebookPageId(url: string): string | null {
  // facebook.com/pagename ou facebook.com/profile.php?id=123
  const profileMatch = url.match(/facebook\.com\/profile\.php\?id=(\d+)/);
  if (profileMatch) return profileMatch[1];
  const pageMatch = url.match(/facebook\.com\/([a-zA-Z0-9.]+)\/?$/);
  return pageMatch?.[1] ?? null;
}

async function fetchFacebookAPI(accessToken: string, pageId: string, limit = 6): Promise<SocialPost[]> {
  const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,full_picture,permalink_url,created_time,type,likes.summary(true),comments.summary(true)&limit=${limit}&access_token=${accessToken}`;

  const res = await fetch(url, { next: { revalidate: CACHE_TTL } });
  if (!res.ok) return [];

  const json = await res.json();
  if (!json.data) return [];

  return json.data
    .filter((post: Record<string, unknown>) => post.full_picture || post.message)
    .map((post: Record<string, unknown>) => ({
      id: `fb-${post.id}`,
      platform: 'facebook' as SocialPlatform,
      permalink: (post.permalink_url as string) || `https://facebook.com/${post.id}`,
      caption: (post.message as string) || null,
      media_url: (post.full_picture as string) || null,
      media_type: (post.type === 'video' ? 'video' : 'image') as SocialPost['media_type'],
      thumbnail_url: (post.full_picture as string) || null,
      timestamp: post.created_time as string,
      likes_count: (post.likes as Record<string, unknown>)?.summary
        ? ((post.likes as Record<string, Record<string, unknown>>).summary.total_count as number)
        : null,
      comments_count: (post.comments as Record<string, unknown>)?.summary
        ? ((post.comments as Record<string, Record<string, unknown>>).summary.total_count as number)
        : null,
    }));
}

// ─── TikTok (Display API) ────────────────────────────────────────────

/**
 * Extrait le username TikTok depuis une URL.
 */
export function extractTikTokUsername(url: string): string | null {
  const match = url.match(/tiktok\.com\/@([a-zA-Z0-9_.]+)\/?$/);
  return match?.[1] ?? null;
}

async function fetchTikTokAPI(accessToken: string, limit = 6): Promise<SocialPost[]> {
  const url = 'https://open.tiktokapis.com/v2/video/list/?fields=id,title,cover_image_url,share_url,create_time,like_count,comment_count';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ max_count: limit }),
    next: { revalidate: CACHE_TTL },
  });
  if (!res.ok) return [];

  const json = await res.json();
  if (!json.data?.videos) return [];

  return json.data.videos.map((video: Record<string, unknown>) => ({
    id: `tt-${video.id}`,
    platform: 'tiktok' as SocialPlatform,
    permalink: video.share_url as string,
    caption: (video.title as string) || null,
    media_url: null,
    media_type: 'video' as const,
    thumbnail_url: (video.cover_image_url as string) || null,
    timestamp: new Date((video.create_time as number) * 1000).toISOString(),
    likes_count: (video.like_count as number) ?? null,
    comments_count: (video.comment_count as number) ?? null,
  }));
}

// ─── oEmbed Fallback ─────────────────────────────────────────────────

/**
 * Données oEmbed minimales pour l'embed iframe.
 * Ne nécessite aucune clé API.
 */
export interface OEmbedData {
  platform: SocialPlatform;
  embedUrl: string;
  profileUrl: string;
  username: string | null;
}

export function getOEmbedData(
  instagramUrl: string | null,
  facebookUrl: string | null,
  tiktokUrl: string | null
): OEmbedData[] {
  const embeds: OEmbedData[] = [];

  if (instagramUrl) {
    const username = extractInstagramUsername(instagramUrl);
    embeds.push({
      platform: 'instagram',
      embedUrl: `https://www.instagram.com/${username}/embed`,
      profileUrl: instagramUrl,
      username,
    });
  }

  if (facebookUrl) {
    const pageId = extractFacebookPageId(facebookUrl);
    embeds.push({
      platform: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(facebookUrl)}&tabs=timeline&width=340&height=500&small_header=true&adapt_container_width=true&hide_cover=false`,
      profileUrl: facebookUrl,
      username: pageId,
    });
  }

  if (tiktokUrl) {
    const username = extractTikTokUsername(tiktokUrl);
    embeds.push({
      platform: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/@${username}`,
      profileUrl: tiktokUrl,
      username,
    });
  }

  return embeds;
}

// ─── Orchestrateur principal ─────────────────────────────────────────

function mapMediaType(type: string): SocialPost['media_type'] {
  switch (type?.toUpperCase()) {
    case 'VIDEO':
      return 'video';
    case 'CAROUSEL_ALBUM':
      return 'carousel';
    default:
      return 'image';
  }
}

export interface SocialFeedResult {
  posts: SocialPost[];
  embeds: OEmbedData[];
  hasApiData: boolean;
}

/**
 * Récupère le feed social d'une agence.
 * Stratégie hybride :
 * - Tente les APIs officielles si des tokens sont configurés
 * - Retourne les données oEmbed dans tous les cas (pour le fallback iframe)
 */
export async function fetchSocialFeed(config: {
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  limit?: number;
}): Promise<SocialFeedResult> {
  const limit = config.limit || 6;
  const posts: SocialPost[] = [];
  let hasApiData = false;

  // Tokens depuis les variables d'environnement
  const igToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const fbToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const ttToken = process.env.TIKTOK_ACCESS_TOKEN;

  // Fetch en parallèle depuis les APIs disponibles
  const promises: Promise<void>[] = [];

  if (config.instagram_url && igToken) {
    promises.push(
      fetchInstagramAPI(igToken, limit)
        .then((p) => {
          posts.push(...p);
          if (p.length > 0) hasApiData = true;
        })
        .catch(() => {})
    );
  }

  if (config.facebook_url && fbToken) {
    const pageId = extractFacebookPageId(config.facebook_url);
    if (pageId) {
      promises.push(
        fetchFacebookAPI(fbToken, pageId, limit)
          .then((p) => {
            posts.push(...p);
            if (p.length > 0) hasApiData = true;
          })
          .catch(() => {})
      );
    }
  }

  if (config.tiktok_url && ttToken) {
    promises.push(
      fetchTikTokAPI(ttToken, limit)
        .then((p) => {
          posts.push(...p);
          if (p.length > 0) hasApiData = true;
        })
        .catch(() => {})
    );
  }

  await Promise.all(promises);

  // Trier par date décroissante
  posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // oEmbed fallback (toujours disponible)
  const embeds = getOEmbedData(config.instagram_url, config.facebook_url, config.tiktok_url);

  return { posts: posts.slice(0, limit), embeds, hasApiData };
}
