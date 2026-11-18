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

Les dépendances sont tenues à jour par Dependabot (une PR groupée par semaine), et chaque PR passe par la vérification complète dans GitHub Actions.

La spécification du jeu est dans [SPEC.md](SPEC.md). Les répliques se trouvent dans `src/content/lines.fr.json`, et les réglages de jouabilité dans `src/engine/config.ts`.

## Licence

[MIT](LICENSE)
