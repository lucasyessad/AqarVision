# Guide de Maintenance - AqarVision

Guide complet pour maintenir votre workspace AqarVision a jour et optimise.

---

## Maintenance Quotidienne

### Verifier l'Integrite

```bash
./scripts/verify.sh
```

Verifie que :
- Tous les dossiers essentiels sont presents
- Les depots Git sont intacts
- La structure est correcte

**Frequence :** Au debut de chaque session de travail

---

## Maintenance Hebdomadaire

### 1. Mettre a Jour les Ressources Sources

```bash
./scripts/update-all.sh
```

Met a jour tous les 26 depots dans `resources/`.

**Actions apres mise a jour :**
1. Lire les changelogs
2. Tester les nouvelles fonctionnalites
3. Re-copier vers `library/` si pertinent

### 2. Nettoyer les Fichiers Temporaires

```bash
find . -name "*.tmp" -delete
find . -name "*.log" -delete
find . -name ".DS_Store" -delete
```

### 3. Verifier l'Espace Disque

```bash
du -sh .
du -sh */ | sort -hr
```

---

## Maintenance Mensuelle

### 1. Backup Complet

```bash
./scripts/backup.sh
```

Cree un backup dans `backups/` :
- Garde les 5 derniers backups
- Exclut resources/ et templates GitHub (trop lourds)
- Archive : library/, projects/, docs/, templates/

### 2. Audit des Ressources

```bash
# Identifier skills utilises recemment
find library/skills -type f -name "*.md" -atime -30

# Projets actifs
ls -lt projects/ | head -10

# Ressources jamais accedees (>90 jours)
find library/ -type f -atime +90
```

### 3. Mettre a Jour les Templates GitHub

```bash
cd templates/
./fetch-all-templates.sh
```

### 4. Reviser la Documentation

- [ ] README.md a jour ?
- [ ] CLAUDE.md a jour ?
- [ ] Nouveaux guides necessaires ?

---

## Scripts Automatiques

| Script | Usage | Description |
|--------|-------|-------------|
| `update-all.sh` | `./scripts/update-all.sh` | Met a jour tous les depots dans `resources/` |
| `backup.sh` | `./scripts/backup.sh` | Cree un tarball, garde les 5 derniers |
| `verify.sh` | `./scripts/verify.sh` | Verifie structure et depots Git (exit 0=OK, 1=erreur) |
| `commit-to-main.sh` | `./scripts/commit-to-main.sh` | Merge dev vers master avec verification |
| `create-branch.sh` | `./scripts/create-branch.sh` | Cree une branche feature avec scaffolding |

---

## Resolution de Problemes

### Depot Git Corrompu

```bash
cd resources/
rm -rf <depot-probleme>
git clone <url-original> <depot-probleme>
```

### Espace Disque Insuffisant

```bash
du -sh resources/* library/* templates/* | sort -hr
# Nettoyer les caches git si necessaire
cd resources/<depot> && git gc --aggressive
```

### Ressources Library Non Synchronisees

```bash
# 1. Mettre a jour resources
./scripts/update-all.sh

# 2. Identifier differences
diff -r resources/skills/skills/ library/skills/

# 3. Re-copier manuellement si necessaire
cp -r resources/skills/skills/<nouveau-skill> library/skills/<categorie>/
```

### Script Permission Denied

```bash
chmod +x scripts/*.sh
chmod +x templates/*.sh
```

---

## Checklist Mensuelle

- [ ] `./scripts/update-all.sh` - Mise a jour sources
- [ ] `./scripts/backup.sh` - Backup complet
- [ ] `./scripts/verify.sh` - Verification integrite
- [ ] Nettoyer fichiers temporaires
- [ ] Audit ressources utilisees/non-utilisees
- [ ] Verifier espace disque

---

## Bonnes Pratiques

### DO
- Faire des backups reguliers
- Verifier l'integrite hebdomadairement
- Garder resources/ en lecture seule
- Tester apres mise a jour

### DON'T
- Modifier directement dans resources/
- Garder des backups > 6 mois
- Ignorer les erreurs de verify.sh
- Commit de gros fichiers binaires
