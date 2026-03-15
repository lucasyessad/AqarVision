# Component Library — Zinc Design System

## Design Principles for All Components

1. **Consistent height scale:** Buttons, inputs, selects share heights: `sm=32px`, `md=36px`, `lg=40px`, `xl=44px`
2. **Border by default:** Components have `1px border-default` border, not box-shadow for definition
3. **Hover = border-strong + shadow-xs:** Subtle lift, never dramatic
4. **Focus = accent ring:** 2px accent outline with 2px offset
5. **Disabled = 50% opacity + pointer-events-none:** Never gray out text (unreadable in dark mode)
6. **Transitions on everything:** `transition-all duration-fast` minimum

## Button

```tsx
// Variants: solid (default), outline, ghost, danger
// Sizes: sm (32px), md (36px), lg (40px)

// Solid (primary action)
<button className="h-9 px-4 rounded-md bg-zinc-900 text-zinc-50 text-sm font-medium
  hover:bg-zinc-800 active:bg-zinc-950 transition-colors duration-fast
  dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
  Publier l'annonce
</button>

// Accent (CTA)
<button className="h-9 px-4 rounded-md bg-amber-500 text-white text-sm font-medium
  hover:bg-amber-600 active:bg-amber-700 transition-colors duration-fast">
  Rechercher
</button>

// Outline
<button className="h-9 px-4 rounded-md border border-zinc-200 text-zinc-700 text-sm font-medium
  hover:bg-zinc-50 hover:border-zinc-300 transition-all duration-fast
  dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
  Annuler
</button>

// Ghost
<button className="h-9 px-4 rounded-md text-zinc-600 text-sm font-medium
  hover:bg-zinc-100 transition-colors duration-fast
  dark:text-zinc-400 dark:hover:bg-zinc-800">
  Voir plus
</button>

// Icon button
<button className="size-9 flex items-center justify-center rounded-md
  text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-all duration-fast
  dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200">
  <Settings className="size-4" strokeWidth={1.5} />
</button>
```

## Input

```tsx
// States: default, focus, error, disabled
<div className="space-y-1.5">
  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
    Titre de l'annonce
  </label>
  <input
    className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900
      placeholder:text-zinc-400
      focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none
      disabled:opacity-50 disabled:cursor-not-allowed
      dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500
      dark:focus:border-amber-400 dark:focus:ring-amber-400/20
      transition-all duration-fast"
    placeholder="Ex: Appartement F3 Hydra"
  />
  {/* Error state */}
  <p className="text-xs text-danger">Ce champ est requis</p>
</div>
```

## Card

```tsx
// Base card — use for listings, stats, content blocks
<div className="rounded-lg border border-zinc-200 bg-white p-4
  shadow-card hover:shadow-card-hover hover:border-zinc-300
  transition-all duration-normal
  dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
  {children}
</div>

// Interactive card (clickable) — add group + cursor
<Link className="group block rounded-lg border border-zinc-200 bg-white
  shadow-card hover:shadow-card-hover hover:border-zinc-300
  transition-all duration-normal cursor-pointer
  dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">
  {children}
</Link>
```

## ListingCard (Real Estate)

```tsx
// The most important component — used on search, dashboard, favorites
<Link href={`/l/${slug}`} className="group block overflow-hidden rounded-lg border border-zinc-200
  bg-white shadow-card hover:shadow-card-hover transition-all duration-normal
  dark:border-zinc-800 dark:bg-zinc-900">

  {/* Photo — 16:10 ratio, zoom on hover */}
  <div className="relative aspect-[16/10] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
    <Image src={coverUrl} alt={title} fill sizes="(max-width: 768px) 100vw, 33vw"
      className="object-cover transition-transform duration-slow group-hover:scale-105" />
    {/* Status badge — top-end */}
    <div className="absolute top-2 end-2">
      <span className="rounded-full bg-success/90 px-2 py-0.5 text-2xs font-semibold text-white backdrop-blur-sm">
        Publié
      </span>
    </div>
    {/* Favorite button — top-start */}
    <button className="absolute top-2 start-2 size-8 flex items-center justify-center rounded-full
      bg-black/30 text-white backdrop-blur-sm hover:bg-black/50 transition-colors">
      <Heart className="size-4" strokeWidth={2} />
    </button>
    {/* Photo count — bottom-end */}
    <span className="absolute bottom-2 end-2 flex items-center gap-1 rounded-full
      bg-black/50 px-2 py-0.5 text-2xs font-medium text-white backdrop-blur-sm">
      <Camera className="size-3" /> 12
    </span>
  </div>

  {/* Content */}
  <div className="p-3.5">
    {/* Type + Wilaya */}
    <div className="mb-1.5 flex items-center gap-2 text-2xs">
      <span className="font-medium text-listing-sale">Vente</span>
      <span className="text-zinc-300 dark:text-zinc-600">·</span>
      <span className="text-zinc-500">Alger, Hydra</span>
    </div>
    {/* Title */}
    <h3 className="mb-1 truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
      Appartement F3 standing, vue mer
    </h3>
    {/* Price */}
    <p className="mb-2 text-lg font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
      4 500 000 DA
    </p>
    {/* Details row */}
    <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> 3</span>
      <span className="flex items-center gap-1"><Bath className="size-3.5" /> 2</span>
      <span className="flex items-center gap-1"><Maximize2 className="size-3.5" /> 120 m²</span>
    </div>
  </div>
</Link>
```

## StatCard (Dashboard)

```tsx
<div className="rounded-lg border border-zinc-200 bg-white p-5
  dark:border-zinc-800 dark:bg-zinc-900">
  <div className="flex items-center justify-between">
    <p className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
      Annonces actives
    </p>
    <div className="rounded-md bg-amber-500/10 p-1.5">
      <LayoutList className="size-4 text-amber-600 dark:text-amber-400" />
    </div>
  </div>
  <p className="mt-2 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
    247
  </p>
  <div className="mt-1 flex items-center gap-1 text-xs">
    <TrendingUp className="size-3 text-success" />
    <span className="font-medium text-success">+12%</span>
    <span className="text-zinc-400">vs mois dernier</span>
  </div>
</div>
```

## Sidebar Navigation

```tsx
// Collapsible: 240px expanded, 64px collapsed
// Active state: accent-ghost bg + accent text + start border
<nav className="flex flex-col gap-0.5 px-2">
  {/* Active item */}
  <Link className="flex items-center gap-3 rounded-md px-3 py-2
    bg-amber-500/10 text-amber-700 border-s-2 border-amber-500
    dark:bg-amber-400/10 dark:text-amber-400 dark:border-amber-400">
    <LayoutDashboard className="size-4" />
    <span className="text-sm font-medium">Tableau de bord</span>
  </Link>

  {/* Inactive item */}
  <Link className="flex items-center gap-3 rounded-md px-3 py-2
    text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900
    dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100
    transition-colors duration-fast">
    <Home className="size-4" />
    <span className="text-sm">Annonces</span>
  </Link>
</nav>
```

## SearchBar (Marketplace Hero)

```tsx
// Full-width on mobile, max-w-2xl centered on desktop
<div className="w-full max-w-2xl mx-auto">
  <div className="flex items-center rounded-xl border-2 border-zinc-200 bg-white
    shadow-lg focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10
    transition-all duration-normal
    dark:border-zinc-700 dark:bg-zinc-900
    dark:focus-within:border-amber-400 dark:focus-within:ring-amber-400/10">

    {/* Type selector */}
    <select className="h-12 rounded-s-xl border-e border-zinc-200 bg-transparent
      ps-4 pe-8 text-sm font-medium text-zinc-700 focus:outline-none
      dark:border-zinc-700 dark:text-zinc-300">
      <option>Acheter</option>
      <option>Louer</option>
      <option>Vacances</option>
    </select>

    {/* Search input */}
    <div className="relative flex-1">
      <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-zinc-400" />
      <input className="h-12 w-full bg-transparent ps-10 pe-4 text-sm
        placeholder:text-zinc-400 focus:outline-none
        dark:text-zinc-100 dark:placeholder:text-zinc-500"
        placeholder="Wilaya, commune, ou mot-clé..."
      />
    </div>

    {/* Submit */}
    <button className="h-12 rounded-e-xl bg-amber-500 px-6 text-sm font-semibold text-white
      hover:bg-amber-600 transition-colors duration-fast">
      Rechercher
    </button>
  </div>
</div>
```

## DataTable (Dense, Linear-style)

```tsx
// For listings management, leads, admin views
<div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
        <th className="px-4 py-2.5 text-start text-xs font-medium uppercase tracking-wider
          text-zinc-500 dark:text-zinc-400">
          Titre
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors duration-fast">
        <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100 font-medium">
          Appartement F3 Hydra
        </td>
        {/* ... */}
      </tr>
    </tbody>
  </table>
</div>
```

## Toast / Notification

```tsx
// Position: bottom-end, stacked
// Types: success, error, warning, info
<div className="fixed bottom-4 end-4 z-50 flex flex-col gap-2">
  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white
    px-4 py-3 shadow-lg animate-slide-up
    dark:border-zinc-700 dark:bg-zinc-900">
    <CheckCircle2 className="size-5 text-success shrink-0" />
    <div className="flex-1">
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Annonce publiée</p>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">Visible sur AqarSearch</p>
    </div>
    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
      <X className="size-4" />
    </button>
  </div>
</div>
```

## EmptyState

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="mb-4 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
    <Inbox className="size-8 text-zinc-400" />
  </div>
  <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
    Aucune annonce
  </h3>
  <p className="mb-4 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
    Vous n'avez pas encore créé d'annonce. Commencez par ajouter votre premier bien.
  </p>
  <Button variant="solid">Créer une annonce</Button>
</div>
```

## Command Palette (⌘K)

Linear-style command palette for power users (AqarPro only):
- Trigger: `Cmd+K` / `Ctrl+K`
- Fuzzy search across listings, leads, pages, actions
- Sections: Recent, Listings, Leads, Navigation, Actions
- Keyboard nav: arrow keys, Enter to select, Esc to close
- Implementation: `cmdk` library (https://cmdk.paco.me)

## Loading Skeletons

```tsx
// Use zinc-200/zinc-800 with shimmer animation
<div className="space-y-3">
  <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-shimmer
    bg-[length:200%_100%] bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200
    dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800" />
  <div className="h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800 animate-shimmer" />
</div>
```

## Accessibility Checklist

- All interactive elements: `focus-visible` with accent ring
- Color contrast: WCAG AA minimum (4.5:1 for text, 3:1 for large text)
- Aria labels on icon buttons
- Keyboard navigation: Tab order, Enter/Space to activate, Escape to close
- Screen reader: Live regions for toasts, aria-busy for loading
- Reduced motion: `motion-reduce:transition-none motion-reduce:animate-none`

---

## Benchmark-Driven Components (New)

### AI Summary Panel (Fiche augmentée)

```tsx
// Collapsible panel for AI-generated listing analysis
<div className="rounded-xl border border-amber-200/50 bg-amber-50/30
  dark:border-amber-800/30 dark:bg-amber-950/20">
  <button
    onClick={toggle}
    className="flex w-full items-center justify-between px-5 py-4
      text-sm font-semibold text-zinc-900 dark:text-zinc-100"
  >
    <span className="flex items-center gap-2">
      <Sparkles className="size-4 text-amber-500" />
      Résumé IA
    </span>
    <ChevronDown className={`size-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
  </button>

  {open && (
    <div className="border-t border-amber-200/50 px-5 py-4 dark:border-amber-800/30">
      {/* Summary text */}
      <p className="mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {summary}
      </p>

      {/* Pros / Cons grid */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-success">
            Points forts
          </h4>
          {pros.map(p => (
            <div key={p} className="flex items-start gap-2 py-1">
              <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{p}</span>
            </div>
          ))}
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-warning">
            Points d'attention
          </h4>
          {cons.map(c => (
            <div key={c} className="flex items-start gap-2 py-1">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-2xs text-zinc-400 dark:text-zinc-500">
        Généré par IA · Peut contenir des approximations
      </p>
    </div>
  )}
</div>
```

### CompareTable (Comparaison côte-à-côte)

```tsx
// Up to 4 listings side-by-side
<div className="overflow-x-auto">
  <table className="w-full min-w-[600px] text-sm">
    <thead>
      <tr>
        <th className="w-28 p-3 text-start text-xs font-medium text-zinc-500" />
        {listings.map(l => (
          <th key={l.id} className="p-3 text-center">
            <div className="relative mx-auto aspect-[16/10] w-full max-w-[180px] overflow-hidden rounded-lg">
              <Image src={l.cover} alt={l.title} fill className="object-cover" />
            </div>
            <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {l.title}
            </p>
          </th>
        ))}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
      {/* Each row: label + values */}
      <CompareRow label="Prix" values={listings.map(l => formatPrice(l.price))} />
      <CompareRow label="Surface" values={listings.map(l => `${l.surface} m²`)} />
      <CompareRow label="Pièces" values={listings.map(l => String(l.rooms))} />
      <CompareRow label="Wilaya" values={listings.map(l => l.wilaya)} />
      <CompareRow label="Score" values={listings.map(l => `${l.score}/100`)} highlight />
      <CompareRow label="Prix/m²" values={listings.map(l => formatPrice(l.pricePerM2))} />
    </tbody>
  </table>
</div>

// Row component — highlight best value in green
function CompareRow({ label, values, highlight }: { label: string; values: string[]; highlight?: boolean }) {
  return (
    <tr>
      <td className="p-3 text-xs font-medium text-zinc-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`p-3 text-center text-sm font-medium
          ${highlight ? "text-amber-600 dark:text-amber-400" : "text-zinc-900 dark:text-zinc-100"}`}>
          {v}
        </td>
      ))}
    </tr>
  );
}
```

### ProjectCard (Cockpit immobilier)

```tsx
<Link href={`/AqarChaab/espace/projets/${project.id}`}
  className="group block rounded-xl border border-zinc-200 bg-white p-5
    hover:border-zinc-300 hover:shadow-card-hover transition-all duration-normal
    dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700">

  {/* Header */}
  <div className="mb-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <FolderOpen className="size-5 text-amber-500" />
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {project.name}
      </h3>
    </div>
    <button className="text-zinc-400 hover:text-zinc-600">
      <MoreHorizontal className="size-4" />
    </button>
  </div>

  {/* Criteria */}
  <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
    {project.budget} · {project.type} · {project.zone}
  </p>

  {/* Stats row */}
  <div className="mb-3 grid grid-cols-4 gap-2">
    {[
      { icon: Heart, value: project.favCount, label: "favoris" },
      { icon: Scale, value: project.compareCount, label: "compar." },
      { icon: MessageSquare, value: project.convCount, label: "conv." },
      { icon: Calculator, value: project.monthlyPayment, label: "DA/mois" },
    ].map(s => (
      <div key={s.label} className="rounded-lg bg-zinc-50 p-2 text-center
        dark:bg-zinc-800">
        <s.icon className="mx-auto mb-1 size-3.5 text-zinc-400" />
        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{s.value}</p>
        <p className="text-2xs text-zinc-400">{s.label}</p>
      </div>
    ))}
  </div>

  {/* Progress */}
  <div className="mb-2">
    <div className="flex items-center justify-between text-2xs text-zinc-400 mb-1">
      <span>Progression</span>
      <span>{project.stage}</span>
    </div>
    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
      <div className="h-1.5 rounded-full bg-amber-500 transition-all"
        style={{ width: `${project.progress}%` }} />
    </div>
  </div>

  {/* Last activity */}
  <p className="text-2xs text-zinc-400">
    Dernière activité : {project.lastActivity}
  </p>
</Link>
```

### DrawToolbar (Carte — draw-to-search)

```tsx
// Floating toolbar on the map
<div className="absolute top-3 start-3 z-10 flex rounded-lg border border-zinc-200
  bg-white/95 backdrop-blur-sm shadow-sm
  dark:border-zinc-700 dark:bg-zinc-900/95">
  {[
    { icon: Hand, label: "Déplacer", mode: "pan" },
    { icon: PenTool, label: "Dessiner", mode: "draw" },
    { icon: Layers, label: "Heatmap", mode: "heatmap" },
    { icon: RotateCcw, label: "Reset", mode: "reset" },
  ].map(tool => (
    <button key={tool.mode}
      onClick={() => setMode(tool.mode)}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 text-2xs transition-colors
        ${activeMode === tool.mode
          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"}`}
      title={tool.label}
    >
      <tool.icon className="size-4" strokeWidth={1.5} />
      <span>{tool.label}</span>
    </button>
  ))}
</div>
```

### HybridSearchBar (Recherche classique + IA)

```tsx
// Enhanced SearchBar with AI intent detection
<div className="w-full max-w-2xl mx-auto space-y-2">
  {/* Main input */}
  <div className="flex items-center rounded-xl border-2 border-zinc-200 bg-white
    shadow-lg focus-within:border-amber-500 focus-within:ring-4 focus-within:ring-amber-500/10
    dark:border-zinc-700 dark:bg-zinc-900">
    <Search className="ms-4 size-5 shrink-0 text-zinc-400" />
    <input className="h-12 w-full bg-transparent px-3 text-sm
      placeholder:text-zinc-400 focus:outline-none"
      placeholder="Rechercher par wilaya, type, prix... ou décrivez ce que vous cherchez"
      value={query}
      onChange={handleInputChange}
    />
    {isParsingAI && <Loader2 className="me-3 size-4 animate-spin text-amber-500" />}
    <button className="h-12 rounded-e-xl bg-amber-500 px-6 text-sm font-semibold text-white
      hover:bg-amber-600 transition-colors">
      Rechercher
    </button>
  </div>

  {/* AI-detected filter chips */}
  {detectedFilters.length > 0 && (
    <div className="flex flex-wrap gap-1.5">
      {detectedFilters.map(f => (
        <span key={f.key} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium
          ${f.isAI
            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`}>
          {f.isAI && <Sparkles className="size-3" />}
          {f.label}
          <button onClick={() => removeFilter(f.key)}
            className="ms-1 hover:text-danger">
            <X className="size-3" />
          </button>
        </span>
      ))}
    </div>
  )}
</div>
```
