# Security Policy - AqarVision

## Signaler une Vulnerabilite

Si vous decouvrez une vulnerabilite de securite dans ce projet, merci de la signaler de maniere responsable en ouvrant une issue privee sur GitHub ou en contactant directement le mainteneur.

## Bonnes Pratiques

- Ne jamais committer de fichiers `.env`, credentials, ou cles API
- Les fichiers sensibles sont listes dans `.gitignore`
- Les projets dans `projects/` gerent leur propre securite independamment
- Les depots dans `resources/` sont en lecture seule et suivent les politiques de securite de leurs mainteneurs respectifs

## Dependances

Chaque projet dans `projects/` gere ses propres dependances. Verifiez regulierement les vulnerabilites connues :

```bash
# Pour les projets Node.js
cd projects/<nom-projet>
npm audit

# Pour les projets Python
pip audit
```
