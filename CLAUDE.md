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

## Ton et contenu
- Interface et répliques en **français québécois léger** pour la première version (décisions Q-2 et Q-8). Le code reste prêt pour une traduction.
- Humour léger. Interdits : viser un groupe, la vulgarité forte, les vraies personnes ou entreprises.
- Interface de visio **parodique et générique** : aucun nom, logo ou couleur signature de Teams, Slack, Zoom, etc.

## Git
- Commits courts et descriptifs, en français.
- Ne pas pousser vers GitHub sans que Marc le demande.
- Le dépôt GitHub sera **privé** au départ. Ne jamais le rendre public sans que Marc le demande.
