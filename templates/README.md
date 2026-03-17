# 📚 Templates AqarVision

> Collection complète des meilleurs templates pour démarrer vos projets rapidement

---

## 🎯 Deux Types de Templates

### 1. 🌐 Templates GitHub Publics (NOUVEAU!)
Les **meilleurs templates open-source** trouvés sur GitHub pour 2025

**📖 [Guide complet des templates GitHub →](GITHUB_TEMPLATES.md)**

### 2. 📁 Templates Locaux
Templates extraits de nos dépôts sources dans `resources/`

---

## 🚀 Démarrage Rapide

### Cloner un Template GitHub

```bash
# Depuis le dossier templates/
./clone-template.sh <type> <nom-projet>
```

**Exemples:**
```bash
# SaaS complet avec auth + payments
./clone-template.sh saas ma-startup

# Web app Next.js moderne
./clone-template.sh nextjs mon-site

# API Node.js production-ready
./clone-template.sh api-node mon-api

# App mobile React Native
./clone-template.sh mobile mon-app

# Projet Data Science
./clone-template.sh ds mon-projet-ml
```

---

## 📦 Templates Disponibles

### 🌐 Templates GitHub

| Type | Template | Description | Clonage |
|------|----------|-------------|---------|
| **Web** | Next.js Boilerplate | 12k+ stars, production-ready | `nextjs` |
| **SaaS** | Open SaaS | 100% gratuit, full-featured | `saas` |
| **SaaS** | SaaS Next.js | Enterprise features | `saas-nextjs` |
| **API** | Express Boilerplate | Node.js REST API | `api-node` |
| **API** | FastAPI Official | Python async API | `api-fastapi` |
| **Mobile** | Obytes Template | React Native pro | `mobile` |
| **Data** | Cookiecutter DS | Standard industrie | `ds` |

**📖 [Voir tous les templates (20+) →](GITHUB_TEMPLATES.md)**

---

### 📁 Templates Locaux

| Type | Fichier | Source | Usage |
|------|---------|--------|-------|
| **Skill** | `skills/SKILL.md` | Anthropic (officiel) | Créer skills Claude |
| **Planning** | `planning/task_plan.md` | Manus-style | Planification projet |
| **Planning** | `planning/progress.md` | Manus-style | Journal de progression |
| **Planning** | `planning/findings.md` | Manus-style | Documentation découvertes |

---

## 💡 Guide d'Utilisation

### Option 1: Script Automatique (Recommandé)

```bash
cd templates/
./clone-template.sh saas mon-saas
cd ../projects/mon-saas
npm install
npm run dev
```

### Option 2: Clonage Manuel

```bash
cd projects/
git clone <url-github> mon-projet
cd mon-projet
npm install
```

### Option 3: Copier Template Local

```bash
# Pour un skill
cp templates/skills/SKILL.md mon-skill/

# Pour planning
cp templates/planning/*.md projects/mon-projet/
```

---

## 📊 Comparaison

### GitHub Templates vs Templates Locaux

| Aspect | GitHub Templates | Templates Locaux |
|--------|-----------------|------------------|
| **Taille** | Projets complets | Fichiers individuels |
| **Usage** | Démarrer nouveau projet | Ajouter à projet existant |
| **Maintenance** | Communauté GitHub | Nos dépôts sources |
| **Complexité** | ⭐⭐⭐ | ⭐ |
| **Setup** | npm install | Copier/coller |

---

## 🎓 Cas d'Usage

### Je veux créer une SaaS
→ `./clone-template.sh saas ma-startup`
→ Donne: Auth + Payments + Landing + Dashboard

### Je veux une API REST
→ `./clone-template.sh api-node mon-api`
→ Donne: Express + MongoDB + Auth + Tests

### Je veux une app mobile
→ `./clone-template.sh mobile mon-app`
→ Donne: React Native + Expo + TypeScript

### Je veux un projet Data Science
→ `./clone-template.sh ds mon-projet`
→ Donne: Structure Cookiecutter + Notebooks

### Je veux planifier un projet complexe
→ `cp planning/*.md projects/mon-projet/`
→ Donne: task_plan + progress + findings

### Je veux créer un skill Claude
→ `cp skills/SKILL.md mon-skill/`
→ Donne: Template officiel Anthropic

---

## 🔄 Mise à Jour

### Templates GitHub
Les templates GitHub sont maintenus par leurs créateurs. Pour mettre à jour :

```bash
cd projects/mon-projet
git remote add upstream <url-template-original>
git fetch upstream
git merge upstream/main
```

### Templates Locaux
Les templates locaux viennent de `resources/`. Pour mettre à jour :

```bash
# Mettre à jour la source
cd resources/<depot>
git pull

# Re-copier vers templates/
cp <source> templates/<destination>
```

---

## 📚 Documentation

- **[GITHUB_TEMPLATES.md](GITHUB_TEMPLATES.md)** - Guide complet des templates GitHub
- **[clone-template.sh](clone-template.sh)** - Script de clonage automatique
- **[../README.md](../README.md)** - Documentation principale AqarVision
- **[../CLAUDE.md](../CLAUDE.md)** - Guide Claude Code

---

## 🤝 Contribuer

Tu as trouvé un excellent template ? Ajoute-le :

1. Teste le template
2. Ajoute-le à [GITHUB_TEMPLATES.md](GITHUB_TEMPLATES.md)
3. Ajoute le type au script `clone-template.sh`
4. Commit et partage !

---

**Templates curés pour maximiser la productivité ! 🚀**