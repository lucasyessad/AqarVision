# Meilleures Pratiques - Gestion des Ressources

## Architecture Dual-Structure

AqarVision utilise une architecture a double structure :

### `resources/` - Depots Sources
- Contient les 26 depots Git originaux
- Mise a jour via `./scripts/update-all.sh`
- **En lecture seule** - Ne pas modifier directement
- Source de verite pour les mises a jour

### `library/` - Bibliotheque de Travail
- Contient les ressources organisees pour usage quotidien
- Peut etre modifiee et customisee
- Organisee par cas d'usage (pas par source)
- Stable et optimisee pour le developpement

## Mise a Jour des Ressources

### Workflow Recommande

```bash
# 1. Mettre a jour le depot source
cd resources/<nom-depot>
git pull origin main

# 2. Verifier les changements
git log -5
git diff HEAD~5..HEAD

# 3. Copier vers library/ si stable
cd ../..
cp -r resources/<depot>/path/to/resource library/<category>/
```

### Frequence de Mise a Jour

- **Hebdomadaire** : Verifier les mises a jour disponibles
- **Mensuelle** : Appliquer les mises a jour stables
- **Avant projet majeur** : Mettre a jour toutes les ressources

## Organisation de la Bibliotheque

### Principe : Organisation par Usage

**Mauvais** - Organisation par source
```
library/
  anthropic/
  voltagent/
  othman/
```

**Bon** - Organisation par usage
```
library/
  skills/documents/
  skills/design/
  subagents/languages/
  workflows/planning/
```

### Nommage des Ressources

- Utiliser des noms descriptifs
- Preferer kebab-case (algorithmic-art)
- Eviter les abreviations obscures
- Inclure le type si ambigu (mcp-builder, not just builder)

## Customisation des Ressources

### Quand Customiser

**Customisez** quand :
- Adaptation a votre workflow specifique
- Ajout de configurations personnelles
- Optimisation pour vos projets

**Ne customisez pas** quand :
- La modification peut etre upstream
- C'est temporaire ou experimental
- Vous n'etes pas sur de l'impact

### Comment Customiser

```bash
# 1. Copier depuis resources/
cp -r resources/skills/skills/pdf library/skills/documents/pdf-custom

# 2. Modifier dans library/
cd library/skills/documents/pdf-custom

# 3. Versionner
git add library/skills/documents/pdf-custom
git commit -m "Custom PDF skill with OCR support"
```

## Gestion des Conflits

### Conflit Source vs Customisation

Quand l'upstream a ete mis a jour et vous avez customise la ressource :

```bash
# 1. Sauvegarder votre customisation
cp -r library/skills/documents/pdf library/skills/documents/pdf-backup

# 2. Mettre a jour depuis resources/
cp -r resources/skills/skills/pdf library/skills/documents/pdf-new

# 3. Comparer et fusionner
diff -r library/skills/documents/pdf-backup library/skills/documents/pdf-new

# 4. Appliquer manuellement vos customisations a pdf-new
# 5. Remplacer l'ancienne version
mv library/skills/documents/pdf-new library/skills/documents/pdf
```

### Conflit de Dependances

Si plusieurs ressources dependent de versions differentes :

1. **Isoler** - Creer des environnements separes
2. **Standardiser** - Choisir une version de reference
3. **Documenter** - Noter les incompatibilites

> Pour les procedures de maintenance reguliere (backups, audits, checklists), voir le [Guide de Maintenance](../guides/maintenance.md).
