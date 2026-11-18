# Whack-a-Mute

Sauve la réunion d'équipe… un mute à la fois. 🔇

Un petit jeu web : en pleine réunion visio, tes collègues s'apprêtent à dire des commentaires déplacés. Lis ce qu'ils vont dire et coupe-leur le micro juste à temps. Une partie dure 90 secondes, sur téléphone ou ordinateur.

**Jouer :** https://mgagp.github.io/whack-a-mute/

## Développement

```bash
pnpm install
pnpm dev        # serveur local
pnpm test       # tests du moteur (Vitest)
pnpm e2e        # parcours complet (Playwright)
pnpm typecheck
pnpm lint       # ESLint
pnpm build      # version de production dans dist/
pnpm size       # poids de la page (limite de 300 Ko compressés)
```

La spécification du jeu est dans [SPEC.md](SPEC.md). Les répliques se trouvent dans `src/content/lines.fr.json`, et les réglages de jouabilité dans `src/engine/config.ts`.

## Maintenance

- **Dépendances** : Dependabot ouvre chaque semaine une PR groupée (et chaque mois une pour les actions GitHub). Chaque PR passe par la vérification complète dans GitHub Actions avant d'être fusionnée.
- **pnpm** : Dependabot ne met pas à jour le champ `packageManager`. Le 1er de chaque mois, le workflow `rappel-pnpm.yml` ouvre une issue si une nouvelle version est sortie. Il suffit alors de lancer `pnpm self-update` sur une branche et d'ouvrir une PR.
- **Node** : la version vit dans `.node-version`. On la passe à la nouvelle LTS une fois par an, en octobre.

## Licence

[MIT](LICENSE)
