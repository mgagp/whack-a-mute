# Whack-a-Mute — instructions pour Claude Code

Jeu web social et humoristique : le joueur met sur mute les collègues qui s'apprêtent à dire un commentaire déplacé en réunion visio. Parties d'environ 90 s, pensé pour le mobile et le partage.

## Sources de vérité
- **[SPEC.md](SPEC.md)** : le PRD. Lis-le avant toute tâche. Les exigences ont des identifiants (`R-xx`) et les questions ouvertes sont notées `Q-x`.
- **VERBATIM.md** : le texte d'origine de Marc. Il est local seulement (dans `.gitignore`) et peut être absent. S'il existe, c'est lui qui fait foi sur l'intention et le ton. Ne jamais le commiter ni le retirer du `.gitignore` sans que Marc le demande.
- En cas de conflit ou d'ambiguïté avec la spec, demande à Marc plutôt que d'inventer. Si une décision tranche une question `Q-x`, mets à jour SPEC.md (sections 13 et 14).

## Stack
TypeScript, Vite, React, CSS et Motion, Howler.js, Zod, Vitest, Playwright, pnpm. Hébergement statique sur GitHub Pages. Pas de serveur.

État actuel : le projet n'est pas encore initialisé (aucun `package.json`). La structure visée est décrite dans SPEC.md, section 10.

## Règles d'architecture
- `src/engine/` est **pur** : aucun import de React, du DOM ou du navigateur. Le temps et le hasard (graine) sont injectés.
- **Toutes** les valeurs de jouabilité vivent dans `src/engine/config.ts` (R-40). Aucun nombre magique ailleurs.
- Les répliques vivent dans `src/content/lines.<langue>.json`, validées par Zod. On ajoute du contenu sans toucher au code.
- L'interface réagit aux événements émis par le moteur. Elle ne recalcule pas les règles.

## Tests
- Chaque test porte l'identifiant de l'exigence vérifiée : `it("R-10 : …")`.
- Toute exigence `[M]` implémentée doit avoir au moins un test.
- Les tests de bout en bout utilisent `?seed=` et `?vitesse=` pour être déterministes.
- Avant de dire qu'une tâche est terminée, lance les tests et le typecheck.
- GitHub Actions relance tout (typecheck, Vitest, poids, Playwright) sur chaque PR, et la mise en ligne n'a lieu que si tout passe (`.github/workflows/verification.yml`).

## Visuel : priorité de premier plan
- Le jeu doit être **éclatant** : beau, coloré, expressif, hors de l'ordinaire (SPEC.md, section 8). Une interface fonctionnelle mais terne ne compte pas comme terminée.
- **Référence visuelle validée : [design/maquette-v1.html](design/maquette-v1.html)** (R-34). Reprends ses variables de thème (`:root`), sa palette, ses formes et ses animations. L'interface doit lui rester fidèle, en mieux. Pour la voir : `python3 -m http.server 8765 --directory design`, puis ouvrir `http://localhost:8765/maquette-v1.html`.
- Thème centralisé dans un seul fichier (R-35).
- On s'inspire des qualités des jeux sociaux colorés, sans copier l'apparence d'un jeu ou d'un produit précis.

## Ton et contenu
- Interface et répliques en **français québécois léger** pour la première version (décisions Q-2 et Q-8). Le code reste prêt pour une traduction.
- Humour léger. Interdits : viser un groupe, la vulgarité forte, les vraies personnes ou entreprises.
- Interface de visio **parodique et générique** : aucun nom, logo ou couleur signature de Teams, Slack, Zoom, etc.

## Git
- Commits courts et descriptifs, en français.
- Ne pas pousser vers GitHub sans que Marc le demande.
- Le dépôt GitHub est **public** depuis le 2026-11-11 (github.com/mgagp/whack-a-mute), sous licence MIT. Tout ce qui est commité est visible de tous : ne rien y mettre de personnel ou de secret.
- Chaque push sur `main` met le jeu en ligne sur GitHub Pages.
