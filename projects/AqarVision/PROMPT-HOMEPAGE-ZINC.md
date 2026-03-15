# PROMPT CLAUDE CODE — Appliquer le thème Zinc sur la Homepage

## Contexte

La homepage actuelle (`apps/web/src/app/[locale]/page.tsx`) utilise l'ancien design "Onyx & Ivoire"
avec des `var(--onyx)`, `var(--ivoire)`, `var(--or)`, inline styles partout, et une image hero
qui ne charge pas (variable d'env `NEXT_PUBLIC_HERO_BG_URL` non définie).

On veut la transformer pour qu'elle ressemble exactement au prototype Zinc qu'on a construit.
Le prototype est dans le fichier `aqarsearch-refonte.jsx` — composant `HomePage`.

## Objectif visuel (ce qu'on veut voir)

1. **Hero 100vh** : Photo d'architecture full-bleed avec gradient overlay sombre
   (`from-black/65 via-black/25 to-black/70`), statement typographique géant
   "Trouvez votre chez-vous en Algérie" avec "chez-vous" en amber-400,
   barre de recherche blanche flottante avec shadow-xl, pills Acheter/Louer/Vacances,
   chevron bounce en bas

2. **Section split** : Grid 2 colonnes — texte "Plus de 15 000 biens dans 58 wilayas"
   à gauche + photo full-bleed à droite (pas de padding sur la photo)

3. **Wilayas scroll** : Cards horizontales scrollables avec photo + nom + count

4. **Listings featured** : Grille 3 colonnes de ListingCards Zinc

5. **Photo full-bleed** : 60vh avec statement overlay "Chaque quartier a son caractère"

6. **Stats strip** : Fond zinc-950, chiffres animés amber, 4 colonnes

7. **CTA Pro** : Texte centré + bouton amber

## Instructions étape par étape

### Étape 1 — Ajouter une photo hero par défaut

Le problème principal est que l'image hero ne charge pas.
Télécharger ou utiliser une URL Unsplash directe comme fallback :

```bash
# Option A : URL directe (pas de téléchargement nécessaire)
# Utiliser cette URL dans le code :
# https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=1600&h=1000&fit=crop
# (Photo d'Alger / architecture algérienne)

# Option B : Télécharger dans public/images/
curl -o public/images/hero-bg.jpg "https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=1600&h=1000&fit=crop&q=80"
```

### Étape 2 — Réécrire la section Hero

Remplacer toute la section `{/* HERO */}` dans `page.tsx` par :

```tsx
{/* ─────────────────────────────────────────── HERO ─── */}
<section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
  {/* Background photo — full-bleed */}
  <img
    src="https://images.unsplash.com/photo-1590059390104-0eaa0c381bcc?w=1600&h=1000&fit=crop"
    alt=""
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
  />
  {/* Gradient overlay — Heatherwick style */}
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0"
    style={{
      background: "linear-gradient(180deg, rgba(9,9,11,0.65) 0%, rgba(9,9,11,0.25) 40%, rgba(9,9,11,0.7) 100%)",
    }}
  />

  {/* Content */}
  <div className="relative z-10 mx-auto flex w-full max-w-[1320px] flex-col items-center px-4 pt-24 pb-12 text-center sm:px-6 lg:px-8">
    {/* Headline — Heatherwick: big, bold, minimal */}
    <h1
      className="mb-10"
      style={{
        color: "#FAFAFA",
        fontSize: "clamp(2.5rem, 8vw, 5rem)",
        lineHeight: 1.05,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        maxWidth: "750px",
      }}
    >
      Trouvez votre
      <br />
      <span style={{ color: "#FBBF24" }}>chez-vous</span>
      <br />
      en Algérie
    </h1>

    {/* Subtitle */}
    <p className="mb-8 max-w-xl text-base" style={{ color: "rgba(250,250,250,0.55)" }}>
      Des milliers de biens à explorer dans les 58 wilayas
    </p>

    {/* Transaction pills */}
    <div className="mb-6 flex gap-2">
      {[
        { label: "🏠 Acheter", href: "/search?listing_type=sale", active: true },
        { label: "🔑 Louer", href: "/search?listing_type=rent", active: false },
        { label: "☀️ Vacances", href: "/search?listing_type=vacation", active: false },
      ].map(({ label, href, active }) => (
        <Link
          key={label}
          href={href}
          locale={locale}
          className="rounded-full px-5 py-2 text-sm font-medium transition-all"
          style={{
            background: active ? "#F59E0B" : "rgba(255,255,255,0.1)",
            color: active ? "#FFF" : "rgba(255,255,255,0.65)",
            backdropFilter: "blur(8px)",
          }}
        >
          {label}
        </Link>
      ))}
    </div>

    {/* Search bar — white, floating, prominent */}
    <HomeSearchBar locale={locale} wilayas={wilayas} />

    {/* Helper text */}
    <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
      Essayez : &quot;F3 lumineux Alger &lt; 5M&quot; · &quot;Villa avec piscine Oran&quot; · &quot;Proche école, calme&quot;
    </p>
  </div>

  {/* Scroll indicator — bouncing chevron */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2" style={{ animation: "bounce 2.5s ease infinite" }}>
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
  <style>{`@keyframes bounce { 0%,100% { transform: translateY(0) } 50% { transform: translateY(8px) } }`}</style>
</section>
```

### Étape 3 — Ajouter la section Split éditoriale (après le ticker ou à la place)

Remplacer la section `TICKER` par une section split Heatherwick :

```tsx
{/* ──────────────────────────────── SPLIT EDITORIAL ─── */}
<section className="grid min-h-[70vh] grid-cols-1 lg:grid-cols-2">
  <div className="flex flex-col justify-center px-8 py-16 lg:px-16" style={{ background: "var(--bg-app, #FAFAFA)" }}>
    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#F59E0B" }}>
      Explorer
    </p>
    <h2 className="text-4xl font-bold leading-[1.08] tracking-tight lg:text-5xl" style={{ color: "var(--text-primary, #09090B)", letterSpacing: "-0.03em" }}>
      Plus de 15 000 biens
      <br />
      dans <span style={{ color: "#F59E0B" }}>58 wilayas</span>
    </h2>
    <p className="mt-5 max-w-[420px] text-base leading-relaxed" style={{ color: "var(--text-secondary, #71717A)" }}>
      Des appartements au cœur d&apos;Alger aux villas de bord de mer à Tipaza,
      trouvez le bien qui correspond à votre projet de vie.
    </p>
    <Link
      href="/search"
      locale={locale}
      className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
      style={{ color: "#F59E0B" }}
    >
      Explorer les annonces
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
  <div className="relative min-h-[400px] overflow-hidden">
    <img
      src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=700&fit=crop"
      alt="Bel intérieur"
      className="h-full w-full object-cover"
    />
  </div>
</section>
```

### Étape 4 — Modifier la section stats

Remplacer la section `STATS ONYX` par le style Zinc :

```tsx
{/* ──────────────────────────────── STATS STRIP ─── */}
<section className="py-20" style={{ background: "#09090B" }}>
  <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
    <h2 className="mb-12 text-center text-3xl font-bold sm:text-4xl" style={{ color: "#FAFAFA", letterSpacing: "-0.02em" }}>
      La confiance de milliers
      <br />
      de familles algériennes
    </h2>
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-4" style={{ maxWidth: 800, margin: "0 auto" }}>
      {[
        { value: "15 000+", label: "annonces" },
        { value: "58", label: "wilayas" },
        { value: "2 500+", label: "agences vérifiées" },
        { value: "98%", label: "satisfaction" },
      ].map((stat) => (
        <div key={stat.label} className="text-center">
          <p className="text-3xl font-bold sm:text-4xl" style={{ color: "#FBBF24", fontVariantNumeric: "tabular-nums" }}>
            {stat.value}
          </p>
          <p className="mt-1 text-sm" style={{ color: "#A1A1AA" }}>
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Étape 5 — Ajouter une section full-bleed photo (avant les stats)

```tsx
{/* ──────────────────────── FULL-BLEED PHOTO ─── */}
<section className="relative overflow-hidden" style={{ height: "60vh" }}>
  <img
    src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&h=700&fit=crop"
    alt=""
    className="h-full w-full object-cover"
  />
  <div
    className="absolute inset-0"
    style={{ background: "linear-gradient(transparent 30%, rgba(9,9,11,0.8))" }}
  />
  <div className="absolute bottom-0 start-0 p-8 lg:p-16">
    <h2 className="max-w-[550px] text-3xl font-bold leading-[1.1] sm:text-4xl lg:text-5xl" style={{ color: "#FAFAFA", letterSpacing: "-0.02em" }}>
      Chaque quartier
      <br />
      a son <span style={{ color: "#FBBF24" }}>caractère</span>
    </h2>
    <Link
      href="/search"
      locale={locale}
      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
      style={{ color: "#FBBF24" }}
    >
      Rechercher par quartier
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  </div>
</section>
```

### Étape 6 — Mettre à jour la section CTA Pro

Remplacer le CTA Pro actuel par le style Zinc, plus centré et épuré :

```tsx
{/* ──────────────────────────────── CTA PRO ─── */}
<section className="py-20 text-center" style={{ background: "var(--bg-app, #FAFAFA)" }}>
  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#F59E0B" }}>
    Pour les professionnels
  </p>
  <h2 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text-primary, #09090B)", letterSpacing: "-0.02em" }}>
    Gérez votre agence
    <br />
    avec <span style={{ color: "#F59E0B" }}>AqarPro</span>
  </h2>
  <p className="mx-auto mt-4 max-w-[480px] text-base" style={{ color: "var(--text-secondary, #71717A)" }}>
    Dashboard, CRM, analytics, vitrine personnalisée, IA intégrée.
    Tout ce dont votre agence a besoin.
  </p>
  <Link
    href="/AqarPro/dashboard"
    locale={locale}
    className="mt-8 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
    style={{ background: "#F59E0B" }}
  >
    Découvrir AqarPro →
  </Link>
</section>
```

### Étape 7 — Migrer les wilayas populaires vers le scroll horizontal Zinc

Remplacer la section `MARCHÉS POPULAIRES` (grille 6 colonnes de cards) par le scroll horizontal :

```tsx
{/* ──────────────────────── WILAYAS SCROLL ─── */}
<section className="py-16" style={{ background: "var(--bg-app, #FAFAFA)" }}>
  <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
    <h2 className="mb-2 text-2xl font-bold" style={{ color: "var(--text-primary, #09090B)", letterSpacing: "-0.02em" }}>
      Explorez par région
    </h2>
    <p className="mb-7 text-sm" style={{ color: "var(--text-tertiary, #A1A1AA)" }}>
      Les wilayas les plus recherchées
    </p>
  </div>
  <div className="flex gap-3 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8" style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}>
    {POPULAR_WILAYAS.map((city) => (
      <Link
        key={city.code}
        href={`/search?wilaya_code=${city.code}`}
        locale={locale}
        className="group shrink-0 overflow-hidden rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg"
        style={{
          width: 200,
          scrollSnapAlign: "start",
          borderColor: "var(--border-default, #E4E4E7)",
          background: "var(--bg-surface, #FFF)",
        }}
      >
        {/* Photo placeholder — remplacer par des vraies photos de wilayas */}
        <div className="h-[130px] overflow-hidden" style={{ background: "var(--bg-muted, #F4F4F5)" }}>
          <div className="flex h-full items-center justify-center text-3xl">
            🏙️
          </div>
        </div>
        <div className="p-3">
          <p className="text-sm font-semibold" style={{ color: "var(--text-primary, #09090B)" }}>
            {city.name}
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "var(--text-tertiary, #A1A1AA)" }}>
            {city.count} annonces
          </p>
        </div>
      </Link>
    ))}
  </div>
</section>
```

### Étape 8 — Résumé des sections dans l'ordre final

L'ordre final des sections dans `page.tsx` doit être :

```
1. <MarketingHeader />
2. HERO (100vh, photo full-bleed, statement, search bar, pills)
3. SPLIT EDITORIAL (texte + photo, 70vh)
4. WILAYAS SCROLL (horizontal, cards avec photos)
5. FEATURED LISTINGS (grille 3 colonnes — garder le code existant mais adapter les styles)
6. TENDANCE (garder le code existant mais adapter les styles)
7. FULL-BLEED PHOTO (60vh, statement overlay "Chaque quartier a son caractère")
8. STATS STRIP (fond #09090B, chiffres #FBBF24)
9. CTA PRO (centré, bouton amber)
10. <MarketingFooter />
```

Les sections FEATURED et TENDANCE peuvent garder leur structure actuelle (data fetching etc.),
il faut juste remplacer les couleurs `var(--onyx)` → classes Zinc et `var(--or)` → `#F59E0B` / amber.

### Étape 9 — Nettoyage des anciennes variables CSS

Dans les sections conservées (Featured, Tendance, Nouvelles annonces), faire un find-replace :

```
var(--onyx)           →  #09090B
var(--onyx-light)     →  #18181B
var(--onyx-mid)       →  #27272A
var(--ivoire)         →  #FAFAFA
var(--ivoire-warm)    →  #F4F4F5
var(--ivoire-deep)    →  #E4E4E7
var(--ivoire-border)  →  #E4E4E7
var(--or)             →  #F59E0B
var(--text-dark)      →  #09090B
var(--text-body)      →  #71717A
var(--text-muted)     →  #A1A1AA
var(--text-faint)     →  #A1A1AA
var(--font-display)   →  inherit (ou supprimer la propriété fontFamily)
var(--font-mono)      →  "Geist Mono", monospace
var(--bg-card)        →  #FFFFFF
var(--shadow-card)    →  0 1px 3px rgba(0,0,0,0.04)
```

Remplacer aussi `borderRadius: "2px"` par `borderRadius: "12px"` (le Zinc utilise des
arrondis plus généreux, pas les 2px ultra-sharp de l'ancien thème).

### Étape 10 — Modifier la HomeSearchBar pour le style Zinc

Dans `apps/web/src/components/marketing/HomeSearchBar.tsx`, le composant doit devenir
une barre blanche flottante avec shadow sur le hero sombre :

- Container : `rounded-2xl bg-white/97 shadow-xl` (au lieu de bg transparent + border)
- Hauteur : `h-14` (56px)
- Focus state : `shadow-[0_0_0_3px_rgba(245,158,11,0.3)]`
- Bouton Rechercher : `bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-e-2xl`
- Les selects doivent avoir `bg-transparent border-none` pour être intégrés visuellement
- Séparateurs : `w-px h-6 bg-zinc-200` entre chaque section

## Vérification

Après les modifications, vérifier visuellement :
- [ ] Le hero montre une photo full-bleed d'architecture (pas un fond noir vide)
- [ ] Le statement "Trouvez votre chez-vous en Algérie" est grand et lisible
- [ ] "chez-vous" est en ambre (#FBBF24)
- [ ] La barre de recherche est blanche avec une ombre forte
- [ ] Les pills Acheter/Louer/Vacances sont visibles, la première est ambre solid
- [ ] Le chevron bounce en bas du hero
- [ ] La section split a une photo bord-à-bord à droite
- [ ] Les stats sont sur fond noir avec des chiffres ambre
- [ ] Le CTA Pro a un bouton ambre
- [ ] Pas d'inline styles avec var(--onyx) ou var(--ivoire) restants
