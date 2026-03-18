# Agency Themes — AqarVision

> 10 themes vitrines agences. Chaque theme est un composant React complet dans `components/agency/themes/`.
> Registre dans `lib/themes/registry.ts`. Chaque agence choisit son theme dans Settings > Apparence.
> Layout variable par theme (Hero et Grille listings). Tous supportent le dark mode.
> Source HTML d'inspiration : `docs/theme/01-10-*.html`

---

## Structure commune (5 sections)

Chaque theme rend 5 sections dans cet ordre :
1. **Hero** — Presentation agence (layout variable par theme)
2. **About** — Description, valeurs, equipe
3. **Listings** — Grille des annonces actives (layout variable par theme)
4. **Stats** — Chiffres cles (annonces, vues, anciennete)
5. **CTA** — Appel a l'action (contact, rendez-vous)

Les composants recoivent : `agency` (avec `storefront_content`), `listings[]`, `stats`, `locale`.
Les couleurs personnalisees de l'agence (`primary_color`, `accent_color`, `secondary_color`) s'appliquent en CSS vars overrides si definies.

### Donnees du contenu vitrine (`agencies.storefront_content` JSONB)

**Socle commun (tous les themes) :**
- `hero_image_url` — Photo hero principale (obligatoire, min 1920×800)
- `extra_photos[]` — Photos supplementaires pour mosaique/galerie (0-4)
- `hero_video_url` — URL YouTube/Vimeo (optionnel, embed iframe responsive)
- `tagline` — Slogan court (max 80 chars, pre-rempli depuis `agencies.description`)
- `about_text` — Texte About (max 500, pre-rempli depuis `agencies.description`)
- `services[]` — 3-4 items `{ title, icon (nom Lucide), text }` (optionnel)
- `custom_stats` — `{ years_experience?: number, satisfied_clients?: number }` (optionnel)

**Donnees auto (pas dans storefront_content, queryes directement) :**
- Nom, logo, phone, email, WhatsApp, reseaux sociaux ← `agencies`
- Annonces publiees ← `listings` query
- Stats (vues, leads, annonces) ← `agency_stats_daily`
- Badge verification ← `verifications`

**Extras par theme (`theme_extras` JSONB) :**
- LuxeNoir : `{ golden_tagline?: string }` — tagline doree secondaire
- NeoBrutalist : `{ manifesto?: string }` — texte bold XXL dans le hero
- CorporateNavy : `{ topbar_hours?: string }` — horaires dans le topbar (pre-rempli depuis `opening_hours`)
- Editorial : `{ eyebrow?: string }` — petit texte au-dessus du titre ("Depuis 2010")
- OrganiqueEco : `{ eco_certifications?: string[] }` — badges eco ("HQE", "BBC")
- Autres themes : pas d'extras

---

## 01 — LuxeNoir

**Identite :** Luxe sombre, or sur noir. Pour agences premium haut de gamme.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #C8A45C (or) | #E8D5A3 (or clair) |
| secondary | #1A1A1A (charcoal) | #2A2A2A (smoke) |
| accent | #C8A45C (or) | #E8D5A3 |
| background | #0A0A0A (noir) | #050505 |
| surface | #1A1A1A | #111111 |
| text | #E8E8E8 | #F0F0F0 |
| text-muted | #888888 | #666666 |

**Typographie :**
- Display : Playfair Display (serif, 400/700/italic) — Google Fonts
- Body : Outfit (300/400/500) — Google Fonts

**Border-radius :** `rounded-lg` (8px) — elegance sans exces

**Ombres :** Fortes sur fond sombre : `0 8px 32px rgba(200,164,92,0.08)` (lueur doree subtile)

**Elements decoratifs :**
- Ligne doree separatrice entre sections : `w-10 h-[2px] bg-[#C8A45C]`
- Gradient overlay sur images : `linear-gradient(transparent 40%, rgba(10,10,10,0.9))`
- Hover cards : `translateY(-6px)` + ombre doree

**Hero :** Plein ecran noir. Image background en `opacity-30`. Texte or centre. Nom agence en `text-5xl font-bold`. Description en `text-lg text-[#888]`. Pas de bouton — l'elegance suffit.

**Grille listings :** 3 colonnes (`lg:grid-cols-3`). Cards fond charcoal, image avec gradient bottom. Prix en or serif. Metadata avec separateurs dot or. Hover elevation 6px.

**About :** 2 colonnes (image + texte). Fond charcoal. Texte clair. Ligne doree avant le titre.

**Stats :** 4 colonnes. Chiffres en or `text-3xl font-bold`. Labels en gris. Fond noir.

**CTA :** Bouton bordure doree (`border-2 border-[#C8A45C]`). Hover : remplissage or + texte noir.

**Dark mode :** Theme deja sombre. Le dark mode assombrit encore plus le background (#050505) et eclaircit l'or (#E8D5A3).

---

## 02 — Mediterranee

**Identite :** Organique, terreux, mediterraneen. Pour agences cotiere/bord de mer.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #C4775A (terra) | #E8A88C (terra clair) |
| secondary | #5E6B52 (olive) | #7A9E7E (sage) |
| accent | #C4775A | #E8A88C |
| background | #FBF8F4 (cream) | #1A1814 |
| surface | #FFFFFF | #2C2825 |
| text | #4A4440 | #E8DFD0 |
| text-muted | #8A827A | #6B6560 |

**Typographie :**
- Display : DM Serif Display (serif, 400/700/italic) — Google Fonts
- Body : Jost (300/400/500) — Google Fonts

**Border-radius :** `rounded-2xl` (20px) — organique, accueillant

**Ombres :** Douces : `0 2px 20px rgba(0,0,0,0.06)`

**Elements decoratifs :**
- Images en arche : `border-radius: 0 0 50% 50%` sur le bas des images listings
- Badges olive arrondis
- Tags metadata en pills sable (`bg-[#F5EDE3] rounded-full`)
- Icones dans cercles terra

**Hero :** Image hero avec coins arrondis (24px), gradient overlay. Texte sur l'image. Bouton terra arrondi (50px radius). Photo cote/mer/architecture.

**Grille listings :** Auto-fill responsive. Cards blanches arrondies (20px). Images avec arche en bas. Badge olive en haut a gauche. Ombre douce au hover.

**About :** Fond sable (`bg-[#F5EDE3]`), coins arrondis 24px. Grille valeurs avec icones en cercles terra.

**Stats :** Fond blanc, 4 colonnes. Chiffres en terra. Icons olive.

**CTA :** Bouton terra pill (border-radius 50px). Texte blanc. Hover : assombrissement.

**Dark mode :** Background passe a #1A1814. Surface #2C2825. Terra s'eclaircit (#E8A88C). Images gardent leur warmth.

---

## 03 — NeoBrutalist

**Identite :** Brut, bold, minimaliste. Pour agences modernes, jeunes, disruptives.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #111111 (noir) | #F2F0EB (blanc casse) |
| secondary | #F2F0EB (blanc casse) | #111111 |
| accent | #E8FF00 (jaune fluo) | #E8FF00 |
| danger | #FF3B30 (rouge) | #FF3B30 |
| background | #F2F0EB | #111111 |
| surface | #FFFFFF | #1A1A1A |
| text | #111111 | #F2F0EB |
| text-muted | #999999 | #666666 |

**Typographie :**
- Display : Syne (600/800, uppercase, letter-spacing 0.05em) — Google Fonts
- Body : IBM Plex Mono (300/400, monospace) — Google Fonts

**Border-radius :** `rounded-none` (0px) — brutalite geometrique

**Ombres :** Aucune. Separation par bordures.

**Elements decoratifs :**
- Bordures epaisses 2px noires partout
- Numeros de section geants (`text-[5rem] opacity-15`)
- Tag flottant jaune avec bordure noire (offset bottom-right)
- Tout en uppercase + letter-spacing sur les labels
- Grid interne avec bordures (pas de gap)

**Hero :** 2 colonnes avec bordure verticale. Texte XXL gauche (pas d'image). Compteur/stat a droite. Bordure bottom 2px. Font Syne 800 uppercase.

**Grille listings :** Pas de cards — grille avec bordures internes (3 colonnes). Chaque cellule separee par 2px noir. Numeros overlays. Hover : fond jaune.

**About :** Split 2 colonnes, bordure verticale. Texte monospace. Fond blanc casse.

**Stats :** Fond noir, texte jaune. 4 colonnes avec bordures.

**CTA :** Bouton jaune + rouge en hover. Texte noir uppercase. Pas de border-radius.

**Dark mode :** Inversion — fond noir, texte blanc casse. Jaune reste identique. Bordures passent a `border-[#333]`.

---

## 04 — MediterraneenContemporain

**Identite :** Zellige et mosaique, teal et terracotta. Pour agences ancrees dans la culture nord-africaine.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #1B6B6D (teal profond) | #2A9D8F (teal clair) |
| secondary | #C4613A (terra) | #E08A66 (terra clair) |
| accent | #1B6B6D | #2A9D8F |
| background | #FAF7F2 (cream) | #1A1814 |
| surface | #FFFFFF | #2C2825 |
| text | #3D3730 | #F4EDE4 |
| text-muted | #8A7F73 | #6B6055 |

**Typographie :**
- Display : Cormorant Garamond (serif, 400/600/italic) — Google Fonts
- Body : Work Sans (300/400/500) — Google Fonts

**Border-radius :** `rounded-xl` (12px) — melange arrondi et precision

**Ombres :** Subtiles : `0 4px 16px rgba(0,0,0,0.05)`

**Elements decoratifs :**
- Bande zellige : `background: repeating-linear-gradient(90deg, #1B6B6D 0 4px, #C4613A 4px 8px, #F4EDE4 8px 12px)` en haut et bas de page
- Motif geometrique conic-gradient en overlay sur la section About (faible opacite)
- SVG arche entre sections
- Mosaique hero : grille 2x2 avec coins arrondis variables (80px sur la principale)

**Hero :** Mosaique 2x2 a droite (1 grande image span 2 rows + 2 petites + 1 box stat teal). Texte a gauche. CTA teal + CTA bordure blanche.

**Grille listings :** Auto-fill responsive. Cards simples. Badge terra en bas a gauche. Localisation en teal. Ombres subtiles.

**About :** Fond teal profond, texte blanc. Pattern geometrique en overlay. Coins arrondis 24px.

**Stats :** 4 colonnes. Icones teal. Chiffres en terra serif.

**CTA :** Bouton teal plein. Hover : assombrissement. Fond cream.

**Dark mode :** Background #1A1814. Teal s'eclaircit (#2A9D8F). Terra s'eclaircit (#E08A66). Zellige conserve ses couleurs.

---

## 05 — PastelDoux

**Identite :** Doux, accueillant, pastel. Pour agences familiales, quartiers residentiels.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #B8A9E8 (lavande) | #C4B8ED |
| secondary | #F4B8A5 (peche) | #F8CFC2 |
| accent | #A8D8C8 (menthe) | #B8E4D6 |
| background | #FDF9F5 (cream rose) | #2D2A3E (violet sombre) |
| surface | #FFFFFF | #3A3650 |
| text | #4A4558 | #E8E4F0 |
| text-muted | #8E89A0 | #6B6580 |

**Typographie :**
- Display : Fraunces (serif, 400/700/italic, optical sizes) — Google Fonts
- Body : Nunito (300/400/600) — Google Fonts

**Border-radius :** `rounded-2xl` (20px) — tout est doux et arrondi

**Ombres :** Ultra-legeres : `0 2px 12px rgba(0,0,0,0.04)`

**Elements decoratifs :**
- Gradient texte : `background: linear-gradient(135deg, #F4B8A5, #B8A9E8)` + `background-clip: text`
- Images avec coins arrondis (14px) et margin inset (1rem du bord de la card)
- Labels sections en pills blush (`bg-[#F9E8E0] rounded-full px-4 py-1`)
- Tout en pills : boutons, badges, tags

**Hero :** Flex layout. Texte a gauche avec mot-cle en gradient. Mosaique 2x2 a droite avec coins variables (100px sur la principale). Box stat menthe.

**Grille listings :** Cards blanches, ombres legeres, images inset (margin 1rem). Badges blancs arrondis. Coins cards 20px.

**About :** Card blanche centree avec ombre douce. Layout centre. Icone lavande.

**Stats :** 4 colonnes. Chiffres en lavande. Background transparent.

**CTA :** Bouton lavande pill. Hover : leger assombrissement + ombre.

**Dark mode :** Background passe a un violet sombre (#2D2A3E). Surface #3A3650. Pastels s'eclaircissent legerement. Le contraste reste doux.

---

## 06 — CorporateNavy

**Identite :** Professionnel, serieux, digne de confiance. Pour grandes agences, franchises.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #0F1B3D (navy) | #1A2D5A (navy clair) |
| secondary | #2563EB (blue) | #3B82F6 |
| accent | #2563EB | #60A5FA |
| background | #FFFFFF | #0A1225 |
| surface | #F1F5F9 (slate light) | #0F1B3D |
| text | #334155 | #E2E8F0 |
| text-muted | #64748B | #94A3B8 |
| border | #E2E8F0 | #1E3A5F |

**Typographie :**
- Display : Source Serif 4 (serif, 400/600/italic) — Google Fonts
- Body : DM Sans (300/400/500) — Google Fonts

**Border-radius :** `rounded-md` (6px) — stricte, professionnel

**Ombres :** Minimales bordures : `border border-[#E2E8F0]`

**Elements decoratifs :**
- Topbar navy avec infos contact (tel, email, horaires)
- Trust bar : 4 stats en grille avec bordures diviseurs
- Bordures fines partout (1px solid)
- References annonces dans le footer des cards
- Grille services 2x2 dans About

**Hero :** 2 colonnes sur fond navy. Image avec border-radius 8px. Texte blanc. Bouton bleu.

**Grille listings :** 3 colonnes. Cards avec bordures, shadow minimale. Hover : elevation subtile. Reference # dans le footer.

**About :** Fond light (#F1F5F9). 2 colonnes (image + texte). Grille services 2x2 avec fonds clairs.

**Stats :** Trust bar avec bordures grille. 4 colonnes. Chiffres en navy bold.

**CTA :** Bouton bleu sur fond blanc. Simple, professionnel.

**Dark mode :** Background #0A1225. Navy reste la base. Blue passe a #60A5FA pour le contraste. Bordures #1E3A5F.

---

## 07 — Editorial

**Identite :** Magazine haut de gamme, typographie forte. Pour agences d'art de vivre, luxe discret.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #0D0D0D (noir) | #FAFAFA (blanc) |
| secondary | #F0F0F0 (gris clair) | #1A1A1A |
| accent | #D4343B (rouge editorial) | #E85A5F |
| background | #FAFAFA | #0D0D0D |
| surface | #FFFFFF | #1A1A1A |
| text | #0D0D0D | #FAFAFA |
| text-muted | #777777 | #999999 |

**Typographie :**
- Display : Libre Baskerville (serif, 400/700/italic) — Google Fonts
- Body : Hanken Grotesk (300/400/500) — Google Fonts

**Border-radius :** `rounded-none` (0px) — precision editoriale

**Ombres :** Aucune. Lignes et typographie font le travail.

**Elements decoratifs :**
- Lignes separatrices horizontales (1.5px noir) avec label centre
- Numerotation magazine sur les images (grands chiffres fades)
- Hover images : `scale(1.04)` + suppression grayscale
- Overlay texte sur images (gradient bottom)
- Nav minimaliste : liens uppercase, hover underline

**Hero :** 2 colonnes (1.3fr + 1fr). Texte serif XXL a gauche. Image pleine hauteur a droite. Eyebrow text au-dessus du titre.

**Grille listings :** Magazine asymetrique — premiere card span 2 rows (grande), 2 cards normales a cote. Overlay texte sur images. Numerotation.

**About :** Split — panneau noir a gauche (texte blanc), image a droite. Typographie serif dominante.

**Stats :** 4 colonnes. Chiffres en serif bold. Separateurs lignes.

**CTA :** Texte uppercase. Bouton noir sur blanc, underline hover. Minimaliste.

**Dark mode :** Inversion complete — fond noir, texte blanc. Rouge editorial reste. Lignes passent a gris fonce.

---

## 08 — ArtDeco

**Identite :** Geometrie Art Deco, or et emeraude. Pour agences de prestige, immeubles historiques.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #1B5E3B (emeraude) | #2D8F5E (emeraude clair) |
| secondary | #C9A84C (or) | #E4CC7A (or clair) |
| accent | #C9A84C | #E4CC7A |
| background | #F8F5EE (cream) | #141210 |
| surface | #FFFFFF | #1E1C18 |
| text | #3A3530 | #F8F5EE |
| text-muted | #8A847C | #6B665E |

**Typographie :**
- Display : Bodoni Moda (serif, 400/700/italic, optical sizes) — Google Fonts
- Body : Figtree (300/400/500) — Google Fonts

**Border-radius :** `rounded-none` (0px) — geometrie precise

**Ombres :** Subtiles avec teinte or : `0 4px 16px rgba(201,168,76,0.06)`

**Elements decoratifs :**
- Bande deco 3 couleurs : `background: repeating-linear-gradient(90deg, #1B5E3B 0 33%, #C9A84C 33% 66%, #1B5E3B 66% 100%)` h-[3px]
- Losange decoratif : carre 12px rotate(45deg) entre sections
- Pattern carres rotatifs en overlay (faible opacite) sur Hero et About
- Ligne or (50px) sous les titres de section
- Listing dividers or (1px, 20% opacity)

**Hero :** 2 colonnes. Texte sur fond sombre avec pattern carres rotatifs. Image a droite. CTA or.

**Grille listings :** 3 colonnes. Cards blanches propres. Badge emeraude en bas a gauche. Ligne or separatrice sur le body. Prix en or serif.

**About :** Fond emeraude. Texte blanc. Pattern geometrique overlay. 2 colonnes.

**Stats :** 4 colonnes. Chiffres en or bold. Losanges entre stats.

**CTA :** Bouton or plein. Hover : or plus clair. Texte sombre.

**Dark mode :** Background #141210. Emeraude s'eclaircit (#2D8F5E). Or s'eclaircit (#E4CC7A). Bande deco conservee.

---

## 09 — OrganiqueEco

**Identite :** Nature, durable, organique. Pour agences eco-responsables, immobilier vert.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #2D5F3C (forest) | #4A8A5E (forest clair) |
| secondary | #7A9E7E (sage) | #98BC9C |
| accent | #6B5344 (bark) | #8A7460 |
| background | #FAF7F0 (warm cream) | #1A1814 |
| surface | #F6F2EA (cream) | #2C2825 |
| text | #3A3428 | #E8DFD0 |
| text-muted | #8A8070 | #6B6055 |

**Typographie :**
- Display : Instrument Serif (regular/italic) — Google Fonts
- Body : Instrument Sans (400/500) — Google Fonts

**Border-radius :** `rounded-[999px]` partout — organique, naturel, aucune arete

**Ombres :** Douces naturelles : `0 4px 20px rgba(0,0,0,0.04)`

**Elements decoratifs :**
- Coins asymetriques sur images (999px sur certains coins, 0 sur d'autres)
- Boutons pill (border-radius 999px)
- Badges eco avec emojis (🌿, 🏡, 👥, 📅)
- DPE ratings affiches sur les listings
- Cards fond cream (pas blanc pur)
- Label sections avec prefixe ligne (`— Nos biens`)

**Hero :** Flex layout. Texte a gauche. Paire d'images empilees a droite avec coins asymetriques. Fond warm cream.

**Grille listings :** 3 colonnes. Cards fond cream, coins arrondis 20px. Images avec coins asymetriques. Tags sand pill. Hover : ombre douce.

**About :** Fond forest (#2D5F3C), texte blanc. Coins arrondis 30px. Gradient pattern overlay subtil.

**Stats :** 4 colonnes. Icones forest. Chiffres en bark.

**CTA :** Bouton forest pill. Texte blanc. Hover : forest clair.

**Dark mode :** Background #1A1814. Forest s'eclaircit (#4A8A5E). Cream devient surface sombre (#2C2825). Le naturel reste chaleureux.

---

## 10 — SwissMinimal

**Identite :** Grille stricte, minimalisme suisse, typographie pure. Pour agences architecturales, design-forward.

**Palette :**
| Token | Light | Dark |
|-------|-------|------|
| primary | #111111 | #FFFFFF |
| secondary | #F9F9F9 (gris 50) | #1A1A1A |
| accent | #FF4D00 (orange vif) | #FF6B2C |
| background | #FFFFFF | #111111 |
| surface | #F9F9F9 | #1A1A1A |
| text | #111111 | #FFFFFF |
| text-muted | #888888 | #777777 |
| border | #F0F0F0 | #2A2A2A |

**Typographie :**
- Display ET Body : Manrope (300/400/500/700) — police unique. Google Fonts
- Pas de serif. Une seule famille pour tout.

**Border-radius :** `rounded-md` (6-8px max) — minimal

**Ombres :** Aucune. Design flat pur.

**Elements decoratifs :**
- Container max-width strict (1200px)
- Lignes separatrices 1px gris clair entre sections
- Orange comme seul pop de couleur
- Fleche glyphe (→) sur les liens avec animation gap au hover
- Badges orange inline uppercase

**Hero :** 2 colonnes (7fr + 5fr). Texte a gauche, image large en dessous (pas a cote). Alignement grille strict. Pas d'image dans le hero text — image full-width separee en dessous.

**Grille listings :** PAS de cards — lignes tableau. Grille 4 colonnes : image (320px) | infos | prix | action. Hover : fond gris clair + border-radius + padding shift. Flat, dense, informationnel.

**About :** 2 colonnes (texte + stats grid 2x2). Stats dans boxes gris clair. Pas de fond colore.

**Stats :** Inline dans About. Boxes gris (#F9F9F9). Chiffres en noir bold.

**CTA :** Bouton noir. Hover : orange. Texte uppercase. Arrow (→) apres le texte.

**Dark mode :** Inversion — fond noir, texte blanc. Orange reste. Bordures #2A2A2A. Boxes stats #1A1A1A.

---

## Implementation

Chaque theme = 1 composant React (`ThemeLuxeNoir.tsx`, `ThemeMediterranee.tsx`, etc.) de 200-310 lignes.

**Registre (`lib/themes/registry.ts`) :**
```typescript
export const themes = {
  'luxe-noir': { component: ThemeLuxeNoir, fonts: ['Playfair Display', 'Outfit'] },
  'mediterranee': { component: ThemeMediterranee, fonts: ['DM Serif Display', 'Jost'] },
  'neo-brutalist': { component: ThemeNeoBrutalist, fonts: ['Syne', 'IBM Plex Mono'] },
  'mediterraneen-contemporain': { component: ThemeMedContemporain, fonts: ['Cormorant Garamond', 'Work Sans'] },
  'pastel-doux': { component: ThemePastelDoux, fonts: ['Fraunces', 'Nunito'] },
  'corporate-navy': { component: ThemeCorporateNavy, fonts: ['Source Serif 4', 'DM Sans'] },
  'editorial': { component: ThemeEditorial, fonts: ['Libre Baskerville', 'Hanken Grotesk'] },
  'art-deco': { component: ThemeArtDeco, fonts: ['Bodoni Moda', 'Figtree'] },
  'organique-eco': { component: ThemeOrganiqueEco, fonts: ['Instrument Serif', 'Instrument Sans'] },
  'swiss-minimal': { component: ThemeSwissMinimal, fonts: ['Manrope'] },
} as const;
```

**Chargement fonts :** Via `next/font/google` dans chaque composant theme. Les fonts ne sont chargees que si le theme est actif.

**Couleurs personnalisees :** Si l'agence definit `primary_color`, `accent_color`, `secondary_color` dans ses settings, ces valeurs sont injectees en CSS vars qui overrident les couleurs par defaut du theme :
```css
[data-theme-agency] {
  --theme-primary: var(--agency-primary, /* defaut du theme */);
  --theme-accent: var(--agency-accent, /* defaut du theme */);
  --theme-secondary: var(--agency-secondary, /* defaut du theme */);
}
```

**Dark mode :** Toggle via le meme `data-theme="dark"` que le reste de l'app. Chaque theme definit ses overrides dark dans ses CSS vars.
