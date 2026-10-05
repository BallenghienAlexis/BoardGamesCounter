---
name: maintenance-audit
description: Audit de santé périodique de BoardGamesCounter - dépendances et versions Expo, dette technique, code mort hérité du template, couverture de tests, doc obsolète, sécurité des workflows. Produit un rapport priorisé et met à jour docs/MAINTENANCE.md. À utiliser une fois par mois ou avant une montée de version importante.
---

1. **Vérifications de base** : `npm run validate` ; `npx expo install --check` (si réseau) ; `npm outdated` ; `npm audit --omit=dev`.
2. **Couverture** : `npm test -- --coverage --silent` ; lister les fichiers de `src/utils/` sous 80 %.
3. **Code mort** : fichiers jamais importés (`components/`, `hooks/`, `constants/`, `app/modal.tsx`, `scripts/reset-project.js`…) — vérifier avec `grep -rn` avant de conclure.
4. **Dette** : `grep -rn "TODO\|FIXME\|any\b\|console\.log\|@ts-ignore" app src`, fichiers > 500 lignes (`wc -l app/**/*.tsx`), logique de calcul présente dans les écrans au lieu de `src/utils/`.
5. **Doc** : skill `/doc-sync` en mode audit.
6. **CI/CD** : versions de Node et des actions dans `.github/workflows/`, permissions minimales.
7. Mettre à jour `docs/MAINTENANCE.md` (section « Dette technique connue ») : ajouter les nouveaux points, retirer ceux qui sont réglés, chacun avec gravité et action proposée.

Rapport final : top 5 des actions par rapport valeur / effort. Les corrections passent ensuite par `/feature` ou `/bugfix`, une PR par sujet.
