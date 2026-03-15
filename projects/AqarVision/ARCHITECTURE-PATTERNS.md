# PATTERNS ARCHITECTURAUX — Extraits des repos de reference

> Ce document synthetise les patterns concrets extraits des 10 repos etudies.
> A utiliser comme reference pendant le developpement d'AqarVision.

-----

## 1. STRIPE + SUPABASE (nextjs-subscription-payments)

### Schema billing a adopter

```sql
-- Table customers : mapping user <-> Stripe customer
CREATE TABLE customers (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  stripe_customer_id text
);
-- Pas de RLS (admin only via service key)

-- Products synces depuis Stripe via webhooks
CREATE TABLE products (
  id text PRIMARY KEY,              -- stripe product id
  active boolean,
  name text,
  description text,
  image text,
  metadata jsonb
);
-- Lecture publique

-- Prices synces depuis Stripe
CREATE TABLE prices (
  id text PRIMARY KEY,              -- stripe price id
  product_id text REFERENCES products,
  active boolean,
  unit_amount bigint,               -- en centimes EUR
  currency text CHECK (char_length(currency) = 3),
  type pricing_type,                -- 'one_time' | 'recurring'
  interval pricing_plan_interval,   -- 'month' | 'year'
  interval_count integer,
  trial_period_days integer,
  metadata jsonb
);
-- Lecture publique
```

### Pattern idempotent customer creation

```typescript
async function createOrRetrieveCustomer({ uuid, email }) {
  // 1. Chercher dans Supabase d'abord (rapide)
  // 2. Si existe, verifier dans Stripe
  // 3. Sinon, chercher par email dans Stripe
  // 4. Sinon, creer dans Stripe avec metadata { supabaseUUID: uuid }
  // 5. Sync Supabase
}
```

### Pattern sync webhook subscription

```typescript
// Cle : Stripe timestamps (unix) -> ISO 8601 dans Supabase
// Toujours upsert (gere create ET update)
// Sur nouvelle subscription : copier billing details vers customer
// Retry avec backoff pour les FK constraints (price peut arriver avant product)
```

### Checkout server action

```typescript
"use server";
export async function checkoutWithStripe(price, redirectPath) {
  // 1. getUser() depuis Supabase Auth
  // 2. createOrRetrieveCustomer()
  // 3. stripe.checkout.sessions.create({
  //      customer, line_items, success_url, cancel_url,
  //      mode: price.type === 'recurring' ? 'subscription' : 'payment'
  //    })
  // 4. Return sessionId (client redirige avec stripe.redirectToCheckout)
}
```

-----

## 2. CAL.COM — Monorepo production-grade

### Structure packages

```
packages/
  features/          # Vertical slices par domaine (85+ features)
    bookings/
      repositories/  # Data access (interface + implementation)
      services/      # Business logic
      components/    # React UI
      lib/tasker/    # Async task handlers
      di/            # Dependency injection
      __tests__/     # Tests feature
  lib/               # Utilitaires partages (PAS de features)
  trpc/              # Couche API tRPC
  i18n/              # Traductions
  tsconfig/          # Config TS partagee
  embeds/            # Widgets embeddables
```

### Hierarchie d'import (anti-circulaire)

```
packages/lib          <- fondation, importe RIEN d'interne
  |
packages/features     <- importe lib, JAMAIS trpc/web
  |
packages/trpc         <- importe lib + features
  |
apps/web              <- importe tout
```

> **Regle pour AqarVision** : `packages/domain` = pur (comme lib), `src/features/*/services` = orchestration (comme features), `src/features/*/actions` = point d'entree (comme trpc)

### Testing (Vitest + Playwright)

```typescript
// vitest.config.mts
{
  test: {
    globals: true,
    environment: "jsdom",
    pool: "forks",
    testTimeout: 500000,
  }
}
// TOUJOURS TZ=UTC pour les tests
// 3 modes : unit, integration, timezone
// Coverage 80%+ pour tout nouveau code
```

### Error handling (2 couches)

```
Services/Repositories -> throw ErrorWithCode (code metier + message)
                            |
                     Middleware conversion
                            |
Server Actions       -> ActionResult<T> { success, data/error }
```

### DTO boundary pattern

```typescript
// Jamais exposer les types Prisma/Supabase au client
// Toujours transformer vers un DTO explicite
// Zod validation a la frontiere
type BookingDto = { id: string; title: string; startTime: string; }
// PAS de Prisma.Booking directement
```

-----

## 3. SAAS-STARTER-KIT — Multi-tenant

### Pattern team/invitation

```
Team (= Agency dans AqarVision)
  |-- slug (unique)
  |-- billingId (Stripe customer)
  |-- members[] (TeamMember avec role OWNER/ADMIN/MEMBER)
  |-- invitations[] (token unique, expiration 7 jours, email ou domaine)
```

### Invitation flow

```
1. Admin cree invitation (email, role)
2. Verifier que l'email n'est pas deja membre
3. Generer token unique + expiration 7 jours
4. Envoyer email avec lien
5. Utilisateur clique -> acceptInvite(token)
6. Verifier expiration + email match
7. Ajouter comme membre -> supprimer invitation
```

### RBAC permission pattern

```typescript
const permissions = {
  team_member: {
    create: ['ADMIN', 'OWNER'],
    read: ['ADMIN', 'OWNER', 'MEMBER'],
    delete: ['ADMIN', 'OWNER'],
  },
  team_invitation: {
    create: ['ADMIN', 'OWNER'],
    read: ['ADMIN', 'OWNER', 'MEMBER'],
  },
  team_settings: {
    update: ['ADMIN', 'OWNER'],
  },
};

function throwIfNotAllowed(member, resource, action) {
  if (!permissions[resource]?.[action]?.includes(member.role)) {
    throw new ApiError(403, "Permission denied");
  }
}
```

> **Pour AqarVision** : adapter ce pattern avec les agency_roles (owner, admin, agent, editor, viewer) dans les server actions.

-----

## 4. MICROREALESTATE — Modele immobilier

### Entites cles a retenir

| Entite | Champs pertinents pour AqarVision |
|--------|-----------------------------------|
| Property | type, name, description, surface, address, price |
| Tenant/Occupant | isCompany, contacts[], contract, properties[], billing |
| Lease | numberOfTerms, timeRange, active |
| Document | type (text/file), expiryDate, mimeType, versionId |
| Rent | term, preTaxAmounts[], charges[], discounts[], payments[], total |

### Pipeline calcul loyer

```
1. Base amount (prix propriete)
2. + Charges additionnelles
3. - Remises (contrat ou reglement)
4. + TVA
5. = Sous-total
6. - Dettes reportees
7. - Paiements effectues
8. = Balance restante
```

### Generation PDF contrats

```
Template EJS -> Donnees structurees -> Chrome headless -> PDF
                                                            |
Mutex atomique (evite generation concurrente)
```

> **Pour AqarVision** : implementer en M08 via une Edge Function Supabase ou un service serverless.

-----

## 5. SHARETRIBE — Marketplace immobilier

### Modele listing enrichi

```
Listing
  |-- title, description (max 5000)
  |-- price_cents, currency, unit_type
  |-- category (hierarchique, 2 niveaux)
  |-- custom_fields[] (dynamiques par categorie)
  |-- images[] (6 tailles : thumb/small/medium/big/square/email)
  |-- location (lat/lng + address, geocodage auto)
  |-- availability (blocked_dates, working_time_slots)
  |-- state ('approved' | 'pending_admin_approval' | 'rejected')
  |-- times_viewed (compteur)
  |-- valid_until (expiration)
```

### Custom fields dynamiques

```
CustomField
  |-- type: TextField | NumericField | DropdownField | CheckboxField | DateField
  |-- entity_type: for_listing | for_person
  |-- required, public, search_filter (booleans)
  |-- min, max (pour NumericField)
  |-- options[] (pour Dropdown/Checkbox, multilingues)
  |-- categories[] (quelles categories utilisent ce champ)
```

> **Pour AqarVision** : le champ `details jsonb` de listings pourrait etre structure comme custom_fields pour plus de flexibilite. Envisager une table `property_attributes` si les besoins evoluent.

### Transaction lifecycle

```
Listing -> Conversation -> Transaction -> Payment -> Confirmation -> Review
           (inquiry)       (deal)        (Stripe)    (auto/manual)  (bidirectionnel)
```

### Systeme de reviews bidirectionnel

```
Testimonial
  |-- author (qui ecrit)
  |-- receiver (qui est note)
  |-- transaction (quel deal)
  |-- grade (0.0-1.0, affiche 1-5 etoiles)
  |-- text, blocked (modereable)
```

### Tailles d'images standardisees

| Usage | Dimensions | Nom |
|-------|-----------|-----|
| Thumbnail | 120x120 | thumb |
| Petit | 240x160 | small_3x2 |
| Medium | 360x270 | medium |
| Grand | 660x440 | big |
| Carre | 408x408 | square |
| Email | 150x100 | email |

> **Pour AqarVision** : definir des variantes similaires pour les images de listing via Supabase Image Transformations.

-----

## 6. DECISIONS A INTEGRER DANS AQARVISION

### Adopter du nextjs-subscription-payments

- [x] Schema products/prices synce depuis Stripe (deja dans V3 via plans table)
- [ ] Pattern `createOrRetrieveCustomer` idempotent
- [ ] Retry avec backoff pour FK constraints dans webhooks
- [ ] Realtime publication sur products/prices

### Adopter de cal.com

- [x] Vertical slices par feature (deja dans V3)
- [ ] Hierarchie d'import anti-circulaire formalisee
- [ ] DTO boundary pattern (jamais exposer types DB au client)
- [ ] ErrorWithCode + middleware conversion
- [ ] Coverage 80%+ pour tout nouveau code

### Adopter du saas-starter-kit

- [x] Team invitation flow (deja dans V3)
- [ ] RBAC permission map declarative
- [ ] Pattern `throwIfNotAllowed(member, resource, action)`

### Adopter de microrealestate

- [ ] Pipeline calcul loyer (pour AqarPro analytics)
- [ ] Generation PDF contrats (Edge Function)
- [ ] Document expiry tracking

### Adopter de sharetribe

- [ ] Custom fields dynamiques par categorie
- [ ] Tailles d'images standardisees
- [ ] Transaction lifecycle formalise
- [ ] Reviews bidirectionnel (futur)

-----

## REPOS REFERENCES

| Repo | Path local | Usage principal |
|------|-----------|-----------------|
| nextjs-subscription-payments | `resources/nextjs-subscription-payments/` | Stripe + Supabase billing |
| saas-starter-kit | `resources/saas-starter-kit/` | Multi-tenant RBAC |
| cal.com | `resources/calcom/` | Monorepo production Next.js |
| microrealestate | `resources/microrealestate/` | Domain model immobilier |
| sharetribe | `resources/sharetribe/` | Marketplace patterns |
| next.js | `resources/vercel-nextjs/` | Framework reference |
| shadcn/ui | `resources/shadcn-ui/` | Design system components |
| supabase | `resources/supabase-repo/` | Backend reference |
| awesome-claude-code | `resources/awesome-claude-code/` | Claude Code resources |
| postgis | `resources/postgis-repo/` | Spatial queries reference |
