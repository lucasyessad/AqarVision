# AqarVision — 5 Prompts Figma Make (V2 — Direction enrichie)

> Intègre toutes les recommandations UX : MVP focus, conversion-first, productivité agent, micro-UX avancée.
> Copiez chaque prompt séparément dans Figma Make.

-----

## PROMPT 1 — THE SYSTEMS ARCHITECT

You are a Senior Platform Architect at a world-class web infrastructure company. I need to architect a high-performance SaaS proptech platform called AqarVision for the Algerian real estate market.

Context:

- Primary audience: Algerian property seekers (buyers, renters, investors), real estate agencies needing a modern CRM, individual property owners
- Core capabilities required: AI-powered property search with natural language, verified listing marketplace, agency CRM with lead management, individual listing portal, multilingual (FR/AR/EN/ES with RTL)
- Technical priorities: RESPONSIVE / SEO / PERFORMANCE / CONVERSION

Produce a comprehensive technical blueprint including:

1. Information Architecture with MVP Hierarchy

V1 (launch — must ship):

- AqarSearch: Homepage, /search (THE most important page), /annonce/[slug] (conversion page), /a/[slug] (agency mini-site)
- AqarPro: /dashboard (action-oriented), /listings (productivity-first), /listings/create (stepped wizard), /leads (CRM with heat scoring)

V1.5 (fast follow):

- /favorites (decision tool with collections, notes, comparison, personal status tags)
- /messaging (contextual — property always visible alongside conversation)
- /account + /profil

V2 (differentiation):

- /team, /analytics, /billing
- Advanced comparison, price history, intelligent alerts
- AI matching user-to-property, quality scores, agency response time

1. User Journey Mapping — Three critical conversion paths with friction points identified:
   (A) Visitor → Homepage → Search (reduce mental effort) → Listing Detail (push to action) → Lead form → Contact confirmed
   (B) Agency → /pro landing → Create agency → Onboarding → First listing published → First lead received
   (C) Individual → Deposit wizard → Listing live → First message → Successful transaction
1. Data Architecture — Entities: profiles, agencies (with completion score), branches, memberships (5 roles RBAC), listings (status lifecycle + quality score + AI summary + freshness tracking), translations, media (with quality scoring), favorites (with collections + personal notes + status tags: a-revoir/a-contacter/a-visiter), leads (with source tracking + heat score + next action + reminder + activity history), conversations (with property context always attached), plans, subscriptions, ai_jobs, wilayas (58), communes (1541). PostGIS for geolocation. RLS deny-by-default.
1. Component Inventory — 40+ components including the 10 most-forgotten ones:
   Core: Button (4 variants × 3 sizes × 4 states), ListingCard Pulse, SearchBar, StatCard, DataTable, Drawer/SidePanel, CommandPalette, TopBar, Sidebar collapsible, Map
   Missing from most projects: Skeleton (matching layout shapes), Toast/Notification (success/error/info/warning with undo action), Tooltip, DropdownMenu, FilterChip (with active/inactive + count + clear), EmptyState (illustrated + guided CTA), Stepper (for wizard flows), Sheet/SidePanel (slide from right, 480px), MultiSelect (with search + tags), ConfirmationDialog (with “undo” option)
1. Page Blueprints — Focus on the 4 critical pages:

/search — NOT a layout, a mental effort reduction machine:

- Split view: map (MapLibre clustered markers) + list (cards grid)
- Filters: wilaya multi-select, property type, price range slider, surface range, rooms, verified-only toggle, freshness (24h/7d/30d)
- Sort: price asc/desc, date, relevance, distance
- Badges on cards: nouveau, verifie, baisse de prix, urgent, coup de coeur
- Infinite scroll with intersection observer
- URL state sync for shareable searches
- Saved search + alert on search
- Skeleton loading matching card layout
- Smart empty state: suggestions if zero results, similar searches, broaden filters CTA
- Result count always visible
- Active filter chips with clear-all

/annonce/[slug] — Conversion page, not information page:

- Sticky CTA bar: “Appeler”, “Message”, “Demander visite” — always visible
- AI summary of the property (3-4 bullet points generated)
- Points forts / Points d’attention section
- Agency response time indicator
- Neighborhood info: schools, transport, commerce nearby
- Similar listings (truly relevant, not random)
- “Ce bien correspond a votre recherche X” matching block
- Price per m2 vs neighborhood average
- Photo gallery with virtual tour capability
- Share + Favorite + Compare buttons
- Confidence Layer: verification status, last update, data source

/a/[slug] — Agency as premium mini-site:

- Logo + cover photo
- Clear presentation + description
- Covered zones (wilayas/communes)
- Specialties (residential, commercial, terrain, luxe)
- Active listings count + volume indicator
- Average response time
- Trust indicators (verified, years active, certifications)
- Prominent contact CTA
- All active listings grid with filters
- Future: reviews/ratings section

/dashboard — Action cockpit, not just KPI display:

- “What’s urgent?” section: unanswered leads > 24h, expiring listings, incomplete listings
- “Hot leads” section: highest heat score leads with one-click actions
- “Underperforming” section: listings with low views, stale listings
- “Waiting for response” section: messages pending reply
- Then KPI cards: active listings, total views, leads this month, conversion rate
- Activity Feed: last 10 events with actionable items
- Quick Actions: new listing, view leads, check analytics, team settings

1. Micro-UX specifications (most projects forget these):

- Autosave visible indicator on forms
- Draft recovery on wizard forms
- Confirmation douce (not blocking alerts)
- Undo when possible (unfavorite, archive, delete)
- Inline validation on every input
- Useful error messages (not generic “une erreur est survenue”)
- Empty states that guide (not just “rien ici”)
- Skeleton loading matching exact layout shapes
- Optimistic updates on favorites and status changes

1. Technology Stack: Next.js 15 App Router, TypeScript strict, Tailwind CSS (no shadcn/ui), Supabase (Auth SSR + Postgres + RLS + Storage + Edge Functions), Stripe, MapLibre GL JS, next-intl (4 locales), Framer Motion for UI transitions + GSAP for premium scroll moments only, Turborepo + pnpm, Vercel, Vitest + Playwright, Sentry, Pino logger.
1. Performance Benchmarks: LCP < 2.5s, INP < 200ms, CLS < 0.1. ISR for category pages (3600s), SSR for listing detail. next/image with fill + sizes. Lazy loading for map/gallery. Budget: < 200KB JS first load.
1. SEO Framework: /[locale]/annonce/[slug] with generateMetadata. JSON-LD RealEstateListing. Sitemap from active listings. hreflang for 4 locales.

Format as structured technical specification for Figma Make implementation.

-----

## PROMPT 2 — THE VISUAL SYSTEM ARCHITECT

You are a Global Design Director tasked with building a scalable design system called “Atlas Pulse” for AqarVision, an Algerian proptech platform.

Brand personality: MODERN / TECHNICAL / BOLD — fintech precision meets Algerian territorial warmth.

Deliver a production-ready design system including:

1. Color System — Tricolore fonctionnel (each color has a semantic job):
- Sahara Amber #E8920A — Decision/CTA/Value: prices, primary buttons, progress, urgency badges. Hover #D07E08. Light #FEF3E0. Dark text #8A5A10.
- Mediterranean Blue #1A7FA8 — Trust/Data/Confidence: verification badges, analytics, info cards, confidence layers. Hover #146A8A. Light #E4F2F8. Dark text #0C4A6A.
- Atlas Green #2A8A4A — Validation/Success: confirmed status, completed actions, positive metrics, “verified” indicators. Hover #1E6A38. Light #E6F4EA. Dark text #145A2A.
- Neutral: Ink #1A1A1A, Text #444, Muted #888, Faint #BBB, Border rgba(0,0,0,0.06), Background #FEFCFA, Surface #FFF
- Semantic: Danger #EF4444, Warning shared with amber, Info shared with blue, Success shared with green
- Dark mode: Background #0C0C0C, Surface #18181B, Border rgba(255,255,255,0.06), Text #E4E4E7, Muted #71717A
- Heat score gradient for leads: cold #93C5FD → warm #FCD34D → hot #EF4444
1. Typography Framework — 9-step scale, Inter + IBM Plex Sans Arabic:
   Display: 48px/800/-0.045em | H1: 32px/800/-0.03em | H2: 26px/800/-0.03em | H3: 20px/700/-0.02em | Body Large: 17px/400/1.65 | Body: 15px/400/1.6 | Body Small: 13px/450/1.5 | Caption: 11px/500/1.4 | Overline: 11px/600/0.08em uppercase
1. Spatial System — 8px grid: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. Component padding standardized. Section padding 44-48px horizontal, 48-72px vertical.
1. Component Library — 40+ components with ALL states (default, hover, active, disabled, loading, error, empty, skeleton):
   
   Buttons: primary amber, secondary outline, ghost, danger × sm/md/lg
   ListingCard Pulse: status bar 4px left, photo + region badge + fav heart, confidence band, price + location + meta tags, badges (nouveau/verifie/baisse-prix/urgent)
   SearchBar: structured mode + NLP mode, focus glow
   FilterChip: active/inactive, count badge, clear button
   StatCard: icon, value, label, trend arrow, sparkline optional
   DataTable: sortable headers, row hover, checkbox, bulk bar, completion score column, status badge column
   Drawer: slide right 480px, header + scrollable body + sticky footer
   CommandPalette: modal centered, search + grouped results + keyboard navigation
   TopBar: h-14, page title, Cmd+K, notifications with count, theme toggle, user dropdown
   Sidebar: collapsible 240→64px, groups, badge counters, active indicator amber
   Skeleton: matching exact shapes for cards, tables, stat cards, feeds
   Toast: 4 variants (success green/error red/warning amber/info blue), with optional undo action button, auto-dismiss 5s
   Tooltip: dark bg, arrow pointing, max-width 240px
   DropdownMenu: items with icons, separators, keyboard navigation
   EmptyState: illustration + headline + description + primary CTA, contextual per page
   Stepper: horizontal for wizard, active/completed/upcoming states, clickable for navigation
   MultiSelect: search input + selected tags + dropdown list + clear all
   ConfirmationDialog: title + description + cancel/confirm buttons, destructive variant red
   Sheet: mobile-first bottom sheet, drag handle
   FavoriteButton: heart outline → filled red with scale animation
   HeatBadge: cold/warm/hot for lead scoring
   ResponseTime: clock icon + “repond en ~2h” in green/amber/red
   QualityScore: 5-dot or progress bar, with label
   ConfidenceBar: horizontal, 4 trust items with icons
   RegionCard: photo + gradient overlay + data pills glass morphism
   MetricCard: top color bar 3px, animated counter, contextual badge
   AIInputInline: sparkle icon, input, CTA button
1. Responsive Layout: Desktop-first 1440px, breakpoints sm/md/lg/xl/2xl. Nav → hamburger on mobile. Hero stacks. Card grids 4→2→1. Sidebar → drawer on mobile. Sticky CTA bar on listing detail mobile.
1. Motion Principles — TWO systems:
- Framer Motion for everyday UI: page transitions, modal open/close, accordion expand, tab switch, list reorder. Duration 200-300ms, ease-out.
- GSAP for premium moments only: homepage hero reveal, scroll-triggered section entrances, counter animations, parallax. Duration 600-900ms, power3.out/back.out(1.3).
- Micro-interactions: button scale(0.97) active, card translateY(-5px) hover, heart scale pulse on favorite, skeleton shimmer, toast slide-in from top-right.
- Rule: if it happens on every page → Framer Motion. If it’s a “wow moment” → GSAP.
1. Accessibility WCAG AA: 4.5:1 contrast body, 3:1 large text. Focus-visible on all interactive. Keyboard navigation everywhere. aria-labels on icon-only buttons. RTL via logical properties. Screen reader text for badges and scores.

Export: Design tokens JSON, CSS variables, Figma-ready component documentation.

-----

## PROMPT 3 — THE CONVERSION COPY ARCHITECT

You are a Senior Conversion Strategist at a top global agency.
Write the complete website copy for AqarVision, an Algerian proptech platform.

Parameters:

- Brand tone: AUTHORITATIVE / BOLD — confident, data-driven, never generic
- Target audience: Algerian property seekers + agencies + individual owners
- Primary objective: CONVERSION — every word must push toward action

For every critical page, provide:

1. HOMEPAGE — Hero Section
   H1 (max 6 words): “Trouvez votre bien en Algerie.”
   H2 (15 words): “Recherche intelligente, annonces verifiees, 58 wilayas couvertes. La premiere plateforme immobiliere augmentee par IA.”
   Primary CTA: “Explorer les biens” (amber)
   Secondary CTA: “Essayer l’assistant IA” (ghost)
   
   Confidence Layer copy (4 items):
   “12 847 annonces verifiees” | “Donnees mises a jour en continu” | “1 240 agences certifiees” | “Temps de reponse moyen: 2h”
   
   Three benefit blocks:
   Block 1 “Recherche intelligente”: H3 + 2 sentences + CTA. Focus: natural language search, AI matching, zero effort.
   Block 2 “Confiance integree”: H3 + 2 sentences + CTA. Focus: verification, freshness, source transparency.
   Block 3 “Trois territoires”: H3 + 2 sentences + CTA. Focus: Sahara, Mediterranee, Montagnes — full Algeria coverage.
   
   Social proof: 4 metrics with contextual badges (+142 cette semaine, 100% du territoire, +18 agences ce mois, +2pts vs 2025)
1. SEARCH PAGE — Micro-copy
   Search placeholder: “Wilaya, quartier, ou decrivez votre projet…”
   Filter labels: Type de bien, Budget, Surface, Pieces, Statut
   Sort options: Pertinence, Prix croissant, Prix decroissant, Plus recent, Distance
   Result count: “[N] biens trouves”
   Badge labels: Nouveau, Verifie, Baisse de prix, Urgent, Coup de coeur
   Empty state: H3 “Aucun bien ne correspond a vos criteres” + “Essayez d’elargir votre recherche ou creez une alerte pour etre prevenu.”
   Save search CTA: “Sauvegarder cette recherche”
   Alert CTA: “Creer une alerte”
1. LISTING DETAIL — Conversion copy
   Sticky CTA bar: “Appeler” | “Envoyer un message” | “Demander une visite”
   AI Summary label: “Resume IA du bien”
   Points forts label: “Les plus de ce bien”
   Points attention label: “A verifier”
   Response time: “Cette agence repond en moyenne en [Xh]”
   Neighborhood: “Le quartier”
   Similar: “Biens similaires dans le meme secteur”
   Match block: “Ce bien correspond a votre recherche ‘[nom recherche]’”
   Price context: “[X] DA/m2 — [+/-X%] vs moyenne du quartier”
   Share CTA: “Partager” | Compare CTA: “Comparer” | Favorite: “Sauvegarder”
1. AGENCY PAGE — Mini-site premium copy
   Stats labels: “Annonces actives” | “Taux de reponse” | “Repond en ~Xh” | “Depuis [annee]”
   Trust badges: “Agence verifiee” | “Documents conformes” | “Annonces a jour”
   CTA: “Contacter [nom agence]”
   Listings section: “Toutes les annonces de [nom]”
1. DASHBOARD — Action-oriented copy
   Urgent section: “A traiter maintenant”
   Hot leads: “Leads chauds”
   Underperforming: “Annonces a optimiser”
   Pending responses: “En attente de reponse”
   Quick actions: “Nouvelle annonce” | “Voir les leads” | “Statistiques” | “Equipe”
1. FAQ — 8 high-intent questions with conversion-focused answers (see previous version)
1. Footer — Structured nav + legal + social

All copy in 4 languages: FR (primary), AR (RTL), EN, ES.
Persuasion triggers: authority, urgency, exclusivity, social proof, scarcity.
Label hierarchy clearly: H1, H2, H3, Body, Caption, CTA.

-----

## PROMPT 4 — THE INTERACTION SYSTEMS ENGINEER

You are a Senior Frontend Systems Engineer. Architect the functional logic for AqarVision’s interactive modules.

Required Components:

1. SEARCH PAGE — Mental effort reduction machine
   State: { filters, sort, view (list/map/split), results, pagination, savedSearch, alerts }
   Filter logic: URL state sync (searchParams), debounced input, multi-select wilayas, range sliders (price, surface), toggle switches (verified only, with photos only)
   Map interaction: clustered markers, click → highlight card, hover → popup preview, bounds-based filtering
   Infinite scroll: intersection observer, append results, skeleton placeholders during load
   Saved search: persist filter combination to DB, re-trigger with one click
   Alert: subscribe to saved search, receive notification on new matching listings
   Empty state: analyze current filters → suggest modifications (“Essayez sans limite de prix” or “Ajoutez les communes voisines”)
   Badges logic: “Nouveau” = created < 48h, “Baisse de prix” = price decreased, “Urgent” = owner flagged, “Verifie” = verification_status === ‘verified’
   Performance: virtualized list for 100+ results, debounce filter changes 300ms, cache previous searches
1. LISTING DETAIL — Conversion page
   Sticky CTA bar: fixed bottom on mobile, fixed right on desktop, 3 buttons (call → tel: link, message → open conversation modal, visit → request form with date picker)
   AI Summary: fetch from ai_jobs table or generate on first view, cache 24h, display as 3-4 bullet points in a highlighted card
   Points forts / Points attention: extracted from listing metadata (has_parking → “Parking inclus”, no_elevator && floor > 3 → “Pas d’ascenseur, 4e etage”)
   Response time: calculated from agency’s average first-reply time on leads
   Neighborhood: reverse geocode → fetch nearby POIs (schools, transport, commerce) from OpenStreetMap Overpass API or pre-computed
   Similar listings: same commune + same type + price range ±30% + exclude current, sorted by relevance
   Match block: if user has active saved search, compare listing attributes → show match percentage
   Gallery: swipe on mobile, thumbnails strip on desktop, lightbox fullscreen, counter “3/12”
   State: { listing, isFavorited, isComparing, activeTab, galleryIndex, contactModalOpen }
1. FAVORITES — Decision tool, not parking lot
   Structure: favorites have collections (folders), each favorite has: { listingId, collectionId, personalNote, personalStatus: ‘a-revoir’ | ‘a-contacter’ | ‘a-visiter’ | ‘visitee’, addedAt }
   Views: grid view (cards) + list view (compact table with status column)
   Actions: drag to collection, add note (inline edit), change status (dropdown), compare selected (max 3), remove with undo toast
   Comparison: side-by-side view of 2-3 listings, highlighting differences (price, surface, rooms, location)
   Empty state: “Sauvegardez des biens pour les retrouver ici. Parcourez les annonces →”
1. MESSAGING — Contextual immobilière, not generic chat
   Layout: two-panel (conversations list left, active conversation right)
   Context always visible: above message thread, show property card mini (photo thumb 60x60, title, price, location, agency name)
   Pro side additions: lead status badge, private notes field, “prochaine action” dropdown, mark as priority
   Message states: sent (check), delivered (double check), read (blue double check)
   Empty state: “Aucune conversation. Contactez un vendeur depuis une annonce →”
   Auto-context: when opening conversation from listing detail, pre-attach the listing context
1. DASHBOARD — Action cockpit
   Priority sections (ordered by urgency):
   (A) “A traiter maintenant”: leads unanswered > 24h (count badge red), listings expiring in < 7 days, incomplete listings (quality score < 70%)
   (B) “Leads chauds”: top 5 leads by heat score, with one-click actions (respond, call, schedule visit)
   (C) “Annonces a optimiser”: listings with views < average, stale listings (no update > 30 days), low quality photos
   (D) “En attente”: messages pending reply with time elapsed
   Then KPI row: 4 StatCards with sparklines
   Then Activity Feed: last 10 events (new lead, listing view milestone, message received, review posted)
   Quick Actions: 4 ghost buttons in 2x2 grid
   Refresh: auto-refresh every 60s for leads count, manual refresh button
1. LISTINGS TABLE — Productivity-first
   Columns: photo thumb, title, status (badge: brouillon/publie/en-pause/archive), views, leads count, price, quality score (progress bar), last updated
   Filters: by status, by date range, search by title
   Sort: any column
   Row click → Drawer with full detail + edit link
   Bulk actions bar (sticky bottom when checkboxes selected): Publier, Mettre en pause, Archiver, Supprimer
   Quick actions per row: duplicate (1-click), toggle status, preview
   Completion score: visual indicator per listing (photos count, description length, features filled)
   Draft indicator: yellow badge “Brouillon — Completez pour publier”
1. LEADS TABLE — Real CRM
   Columns: lead name, property (mini card), source (search/direct/referral), heat score (color dot), status (nouveau/contacte/visite/offre/perdu), last contact date, next action, assigned agent
   Heat score: computed from recency + interaction count + property match
   Kanban view toggle: drag-and-drop between status columns
   Lead detail drawer: full history timeline, notes, all messages, property context, reminder scheduling
   Reminders: set date + action type, appears in dashboard “A traiter”
   Source tracking: UTM params, referrer, which listing page
1. CREATE LISTING WIZARD — Stepped with autosave
   Steps: Type → Location (autocomplete + map pin) → Details (conditional fields) → Media (drag-drop, reorder, 20 max, 3 required, quality indicator) → Pricing (manual + AI suggestion) → Review → Publish
   Autosave: every 30s or on step change, visible indicator “Brouillon sauvegarde il y a Xs”
   Draft recovery: on return, prompt “Vous avez un brouillon en cours. Reprendre ?” with preview
   Validation: Zod per step, inline errors, prevent next step until valid
   Progress: horizontal stepper with step labels, clickable for navigation back

For each module, define:

- State machines: idle → loading → success/error
- Data flow: Server Actions → Zod → withAgencyAuth → service → Supabase → ActionResult<T>
- Error strategy: inline validation, toast for server errors, retry for network, countdown for rate limit
- Loading: skeletons matching layout, spinners on buttons, progress bars on multi-step
- Empty states: illustrated + guided CTA, contextual per page
- Edge cases: offline banner, session expiry re-auth modal, concurrent edit conflict, file upload per-file retry, map load fallback

-----

## PROMPT 5 — THE FIGMA MAKE PROMPT TRANSLATOR

Convert the AqarVision Atlas Pulse specification into five high-precision Figma Make prompts.

### Prompt A — Homepage (conversion-focused)

Create a proptech homepage with luminous tech-premium aesthetic. Warm cream #FEFCFA background. Sahara Amber #E8920A for CTAs and decisions. Mediterranean Blue #1A7FA8 for trust elements. Atlas Green #2A8A4A for validation. Inter font family.

1. Sticky translucent nav: logo “AqarVision” with tricolore V-i-sion, embedded Cmd+K search bar with keyboard shortcut hint, nav links (Acheter, Louer, Vacances, Estimer, Agences), amber “Deposer” button, user avatar with rounded-square shape. Backdrop-blur 24px, border-bottom 1px rgba(0,0,0,0.05).
1. Hero split 50/50: LEFT — amber pulsing live dot + “12 847 biens verifies en temps reel” badge, title 48px bold “Trouvez votre bien en Algerie.” with amber/blue/green on key words, subtitle 15px muted, structured search bar (magnifier icon + input “Wilaya, quartier ou decrivez votre projet…” + amber “Explorer” button with shadow), filter chips below (Tout active dark, Achat/Location/Terrain/Vacances inactive light). RIGHT — 3-photo asymmetric grid (one tall 2-row + two small), each photo with: glass morphism hover panel (price + location + m2 + rooms), region badge colored pill (Mediterranee blue, Sahara amber, Montagne green), “Verifie” checkmark badge top-right. Photos use warm real estate gradients simulating Mediterranean sea, Saharan architecture, mountain greenery.
1. Confidence Layer: full-width bar in #E4F2F8 with 4 trust items each having blue icon + text: “Annonces verifiees”, “Mises a jour en continu”, “Agences certifiees”, “Reponse moyenne: 2h”.
1. Three region cards: Sahara (golden gradient), Littoral (ocean gradient), Montagnes (forest gradient). Each: gradient overlay bottom with region name 20px bold white + wilayas list small, glass morphism data pills top-right (“2,400+ Biens” + “+2.8% T1”), small colored dot top-left matching region. Hover: translateY(-4px) + shadow + photo zoom.
1. Four Pulse listing cards: 4px status bar left edge (amber/blue/green/amber), photo with region badge pill + heart favorite button (glass morphism circle), blue-light confidence band “Verifie · Agence certifiee · MAJ 2j”, price 17px bold, location 11.5px muted, 3 tag pills. One card shows “Baisse de prix” badge instead of region. Hover: lift + shadow.
1. AI section: dark #1A1A1A rounded-20px, subtle gradient glow top-right amber + bottom-left green at 5% opacity, gradient sparkle icon (amber→blue→green), title “Recherche par conversation” 20px bold white + amber “NOUVEAU” micro badge, description in muted white, inline input field + “Lancer” amber button.
1. Four metric cards: colored top bar 3px (amber/blue/green/amber), large number 28px bold, label 11px muted, contextual badge (”+ 142 cette semaine” in green-light, “100% du territoire” in blue-light). Numbers should appear to animate counting up from zero.
1. Footer: copyright + nav links + “FR / AR / EN / ES” language indicator. Clean, minimal.

Full responsiveness. GSAP-style scroll reveal: stagger on hero images, fade-up on sections, counter animation on metrics. Confidence bar slides in. Cards enter with slight spring bounce.

-----

### Prompt B — Search Page (mental effort reduction machine)

Create a property search page with split-view layout. Background #FAFAFA.

1. Top bar: page title “Recherche”, active filter chips with count and clear-X, result count “[N] biens trouves”, sort dropdown (Pertinence, Prix croissant, Prix decroissant, Plus recent), view toggle icons (list/grid/map).
1. Left panel (60% width): listing cards in grid, each card is a Pulse Card with status bar + photo + confidence band + price + location + tags + badges (Nouveau green dot, Verifie blue checkmark, Baisse de prix amber arrow down, Urgent red exclamation). Infinite scroll with skeleton loading placeholders at bottom. Show a “Sauvegarder cette recherche” button and “Creer une alerte” bell icon button above results.
1. Right panel (40% width): interactive map with clustered markers color-coded by region (amber dots Sahara, blue dots Littoral, green dots Mountains). Hover on marker → popup preview card. Click → highlight corresponding card in left panel with blue border.
1. Filter sidebar (collapsible left): wilaya multi-select with search, property type checkboxes, price range dual slider, surface range dual slider, rooms counter (+/-), toggle “Verifies uniquement”, freshness radio (Tout/24h/7j/30j). Apply button amber + Reset link.
1. Empty state: illustration of magnifying glass over map, H3 “Aucun bien ne correspond”, suggestion chips “Elargir la zone”, “Retirer les filtres de prix”, “Voir les biens similaires a [commune voisine]”.
1. Mobile: map goes full screen with toggle, filters in bottom sheet. Cards stack vertically.

-----

### Prompt C — Listing Detail (conversion page)

Create a property detail page designed to convert visitors into leads. Background #FEFCFA.

1. Sticky CTA bar: fixed at bottom on mobile, fixed right panel on desktop. Three buttons: “Appeler” (phone icon, outline), “Message” (chat icon, amber filled primary), “Demander visite” (calendar icon, outline). Below buttons: response time indicator “Cette agence repond en ~2h” with green clock icon. Agent name + small avatar.
1. Photo gallery: large hero image with swipe on mobile, thumbnail strip below on desktop. Counter “3/12” overlay. Fullscreen lightbox on click. Quality indicator dot (green = HD photos).
1. Price section: large price 32px bold, price per m2 in muted, comparison badge “12% en dessous de la moyenne du quartier” in green if good deal, amber if average, red if above.
1. AI Summary card: blue-light background, sparkle icon, “Resume IA” label, 3-4 bullet points summarizing key features. Subtle, not dominant.
1. Points forts section: green checkmark icons with positive attributes (Parking inclus, Vue mer, Proche transports, Quartier calme). Points d’attention section: amber warning icons (Pas d’ascenseur — 4e etage, Travaux a prevoir).
1. Details grid: Type, Surface, Pieces, Chambres, Etage, Annee construction, Etat. Clean 2-column grid with icons.
1. Description: full text expandable with “Lire la suite” if long.
1. Neighborhood section: mini map with pin + nearby POIs listed (ecoles, transport, commerces) with walking distance.
1. Similar listings: 3 Pulse cards horizontal scroll, “Biens similaires dans le meme secteur”.
1. Match block: if user has saved search, show “Ce bien correspond a 87% a votre recherche ‘F3 Alger centre’” with match percentage circle.
1. Confidence section: verification badge, last update date, data source, listing freshness indicator.

Responsive: on mobile, CTA bar fixed bottom. Gallery becomes full-width swiper. Details stack vertically.

-----

### Prompt D — AqarPro Dashboard (action cockpit)

Create a SaaS agency dashboard optimized for action, not just display. Background #FAFAFA.

1. Sidebar: 240px dark #1A1A1A, collapsible to 64px icon-only. Logo top. Nav items with Lucide icons: Vue d’ensemble (amber active bar), Annonces, Leads (red badge “3”), Visites, Analytics, IA, Equipe, Facturation. Separator. Parametres group (General, Apparence, Branding, Verification). Bottom: “Retour au portail” link, “Voir ma vitrine” link, sign out icon.
1. TopBar: 56px height, page title “Vue d’ensemble”, Cmd+K search trigger with keyboard hint, notification bell with red dot count, sun/moon theme toggle, user avatar dropdown.
1. Priority section “A traiter maintenant”: red-bordered card with urgent items count: “3 leads sans reponse depuis +24h”, “2 annonces expirent dans 7 jours”, “1 annonce incomplete”. Each with arrow link to relevant page.
1. Two-column below priority:
   LEFT — “Leads chauds”: top 5 leads, each row showing: heat dot (red/amber/blue), name, property mini-reference, time since last contact, one-click action buttons (Repondre, Appeler). Link “Voir tous les leads →”
   RIGHT — “Annonces a optimiser”: listings with low views or stale, each showing: thumbnail, title, views count with down arrow if declining, quality score bar, “Mettre a jour” CTA. Link “Voir toutes les annonces →”
1. KPI row: 4 stat cards (Annonces actives green trend, Vues totales blue, Leads ce mois amber, Conversion rate green percentage). Each with sparkline mini-chart.
1. Activity Feed: 5 recent events with avatars, action text, timestamp. “Nouveau lead de Ahmed B. pour F3 Hydra — il y a 12 min” style entries.
1. Quick Actions: 2x2 grid of ghost buttons: Nouvelle annonce, Voir les leads, Statistiques, Parametres equipe.

Responsive: sidebar → hamburger drawer on mobile. Priority section stacks. KPI cards 2x2 on tablet, 1 column on mobile.

-----

### Prompt E — Listing Card Pulse + Component Library

Create a component library sheet showing AqarVision’s core UI components:

1. Pulse Card — Three variants side by side (Sahara amber, Littoral blue, Montagne green):
   Each: 4px left status bar, photo (16:10) with region badge + heart button, blue-light confidence band “Verifie · Agence · MAJ 2j”, price 17px bold, location 11.5px muted, 3 tag pills.
   Show states: default, hover (lift + shadow), favorited (filled red heart), with “Baisse de prix” badge variant, with “Nouveau” badge variant.
1. Button set: Primary amber, Secondary outline, Ghost, Danger red. Each in sm/md/lg. Show hover and disabled states.
1. SearchBar: with icon + input + amber CTA. Default and focus (amber border glow) states.
1. FilterChip: active (dark bg) and inactive (light border) states. With count badge. With clear X.
1. Toast notifications: success green, error red, warning amber, info blue. With undo action button variant.
1. EmptyState: illustration placeholder + H3 + description + CTA button. Show for “No results”, “No favorites”, “No leads”.
1. CommandPalette: dark overlay + white modal, search input top, grouped results (Actions rapides, Pages, Biens recents), keyboard hints footer.
1. Skeleton: card skeleton, table row skeleton, stat card skeleton — all matching exact layout shapes with shimmer animation.
1. HeatBadge: cold blue dot, warm amber dot, hot red dot — for lead scoring.
1. ConfidenceBar: horizontal blue-light band with 4 icon+text items.

All components use Inter font, 14px border-radius, 1px borders rgba(0,0,0,0.05). Premium fintech feeling — data-rich, clean, confident. Not generic real estate template.