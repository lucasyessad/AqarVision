# Meilleures Pratiques - Gestion des Ressources

## Architecture Dual-Structure

PersoDev utilise une architecture à double structure :

### `resources/` - Dépôts Sources
- ✅ Contient les dépôts Git originaux
- ✅ Mise à jour via `git pull`
- ✅ **En lecture seule** - Ne pas modifier directement
- ✅ Source de vérité pour les mises à jour

### `library/` - Bibliothèque de Travail
- ✅ Contient les ressources organisées pour usage quotidien
- ✅ Peut être modifiée et customisée
- ✅ Organisée par cas d'usage (pas par source)
- ✅ Stable et optimisée pour le développement

## Mise à Jour des Ressources

### Workflow Recommandé

```bash
# 1. Mettre à jour le dépôt source
cd resources/<nom-depot>
git pull origin main

# 2. Vérifier les changements
git log -5
git diff HEAD~5..HEAD

# 3. Tester en isolation si nécessaire
# (créer un projet test dans projects/)

# 4. Copier vers library/ si stable
cd ../..
cp -r resources/<depot>/path/to/resource library/<category>/

# 5. Documenter les changements
# Mettre à jour CHANGELOG ou notes dans docs/
```

### Fréquence de Mise à Jour

**Recommandations :**
- **Hebdomadaire** : Vérifier les mises à jour disponibles
- **Mensuelle** : Appliquer les mises à jour stables
- **Avant projet majeur** : Mettre à jour toutes les ressources

### Gestion des Versions

```bash
# Créer un tag avant mise à jour majeure
git tag -a library-snapshot-$(date +%Y%m%d) -m "Pre-update snapshot"

# En cas de problème, revenir en arrière
git checkout library-snapshot-20260309
```

## Organisation de la Bibliothèque

### Principe : Organisation par Usage

❌ **Mauvais** - Organisation par source
```
library/
  anthropic/
  voltagent/
  othman/
```

✅ **Bon** - Organisation par usage
```
library/
  skills/documents/
  skills/design/
  subagents/languages/
  workflows/planning/
```

### Nommage des Ressources

**Conventions :**
- Utiliser des noms descriptifs
- Préférer kebab-case (algorithmic-art)
- Éviter les abréviations obscures
- Inclure le type si ambigu (mcp-builder, not just builder)

## Customisation des Ressources

### Quand Customiser

✅ **Customisez** quand :
- Adaptation à votre workflow spécifique
- Ajout de configurations personnelles
- Optimisation pour vos projets

❌ **Ne customisez pas** quand :
- La modification peut être upstream
- C'est temporaire ou expérimental
- Vous n'êtes pas sûr de l'impact

### Comment Customiser

```bash
# 1. Copier depuis resources/
cp -r resources/skills/skills/pdf library/skills/documents/pdf-custom

# 2. Modifier dans library/
cd library/skills/documents/pdf-custom
# Faites vos modifications

# 3. Documenter
echo "# Customizations" >> CUSTOM.md
echo "- Added support for OCR" >> CUSTOM.md
echo "- Modified default output format" >> CUSTOM.md

# 4. Versionner si nécessaire
git add library/skills/documents/pdf-custom
git commit -m "Custom PDF skill with OCR support"
```

## Nettoyage et Maintenance

### Audit Régulier

**Mensuel :**
- Identifier ressources non utilisées
- Supprimer doublons
- Vérifier intégrité des liens

**Trimestriel :**
- Réévaluer organisation
- Archiver ressources obsolètes
- Mettre à jour documentation

### Commandes Utiles

```bash
# Trouver les ressources volumineuses
du -sh library/*/* | sort -hr | head -10

# Trouver les doublons (par nom)
find library -type f -name "SKILL.md" -exec dirname {} \; | sort

# Vérifier les liens symboliques cassés (si utilisés)
find library -type l ! -exec test -e {} \; -print

# Statistiques d'utilisation (nécessite tracking)
# À implémenter selon vos besoins
```

## Sauvegarde et Récupération

### Stratégie de Sauvegarde

```bash
# Backup complet (excluant resources/)
tar -czf backup-$(date +%Y%m%d).tar.gz \
  --exclude='resources' \
  --exclude='.git' \
  library/ projects/ templates/ docs/ .claude/

# Backup incrémental des projets
rsync -av --progress projects/ backup/projects-$(date +%Y%m%d)/

# Backup de la configuration
cp -r .claude backup/.claude-$(date +%Y%m%d)
```

### Récupération

```bash
# Restaurer library/
tar -xzf backup-20260309.tar.gz library/

# Restaurer un projet spécifique
rsync -av backup/projects-20260309/mon-projet/ projects/mon-projet/

# Reconstruire library/ depuis resources/
# Utiliser les scripts de setup (à créer)
```

## Gestion des Conflits

### Conflit Source vs Customisation

**Scénario :** Vous avez customisé une ressource, et l'upstream a été mis à jour.

**Solution :**

```bash
# 1. Sauvegarder votre customisation
cp -r library/skills/documents/pdf library/skills/documents/pdf-backup

# 2. Mettre à jour depuis resources/
cp -r resources/skills/skills/pdf library/skills/documents/pdf-new

# 3. Comparer et fusionner
diff -r library/skills/documents/pdf-backup library/skills/documents/pdf-new

# 4. Appliquer manuellement vos customisations à pdf-new
# 5. Remplacer l'ancienne version
mv library/skills/documents/pdf-new library/skills/documents/pdf
```

### Conflit de Dépendances

Si plusieurs ressources dépendent de versions différentes :

1. **Isoler** - Créer des environnements séparés
2. **Standardiser** - Choisir une version de référence
3. **Documenter** - Noter les incompatibilités

## Métriques et Monitoring

### KPIs à Suivre

```bash
# Nombre de ressources
find library -type f -name "SKILL.md" | wc -l

# Taille totale
du -sh library/

# Ressources par catégorie
for dir in library/*/; do echo "$dir: $(find $dir -type f | wc -l)"; done

# Dernière mise à jour
stat -f "%Sm %N" library/**/* | sort
```

### Dashboard (à créer)

Créer un script pour générer un rapport :

```bash
#!/bin/bash
echo "=== PersoDev Resource Dashboard ==="
echo "Date: $(date)"
echo "Total Skills: $(find library/skills -type d -depth 2 | wc -l)"
echo "Total Subagents: $(find library/subagents -type d -depth 2 | wc -l)"
echo "Total Workflows: $(find library/workflows -type d -depth 2 | wc -l)"
echo "Active Projects: $(ls -1 projects/ | wc -l)"
echo "Disk Usage: $(du -sh library/ | cut -f1)"
```

## Checklist de Maintenance

### Hebdomadaire
- [ ] Vérifier mises à jour disponibles dans resources/
- [ ] Nettoyer fichiers temporaires
- [ ] Vérifier intégrité des projets actifs

### Mensuelle
- [ ] Appliquer mises à jour stables
- [ ] Audit des ressources non utilisées
- [ ] Backup complet
- [ ] Mettre à jour documentation

### Trimestrielle
- [ ] Réévaluer organisation
- [ ] Archiver projets terminés
- [ ] Nettoyer ressources obsolètes
- [ ] Mise à jour majeure des dépendances

---

**Maintenir vos ressources organisées = Productivité maximale** 📊
