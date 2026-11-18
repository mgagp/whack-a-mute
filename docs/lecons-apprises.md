# Rétrospective : leçons apprises et signaux réutilisables

> Rétrospective du 2026-11-15 (#56), après la v0.25 de la spec. Elle couvre de l'idée de départ (2026-11-09) à aujourd'hui : 25 PR fusionnées, une trentaine de tickets, les retours de Marc et de plusieurs bêta-testeurs.
> **But :** si on refaisait ce jeu, ou si on en commençait un autre du même genre, quelles directives données dès le départ auraient mené l'agent plus vite à la qualité d'aujourd'hui ?
> Le passage du français à l'anglais n'est pas traité ici : faire une langue avant l'autre est une étape normale, pas une erreur de cap.

## Comment lire ce document

- **Partie 1 :** ce qui était déjà bon au départ, à refaire tel quel.
- **Partie 2 :** les leçons, chacune avec les retours qui l'ont révélée et le **signal** qui l'aurait évitée, c'est-à-dire la directive à donner à l'agent dès le départ.
- **Partie 3 :** un brief de départ prêt à copier pour un prochain jeu.
- **Partie 4 :** comment vérifier ces signaux avec un agent « froid », qui part de zéro.

---

## Partie 1. Ce qui était bon dès le départ (à refaire)

Ces choix n'ont jamais été remis en question. Ils ont rendu tous les ajustements rapides et sûrs.

| Choix | Pourquoi ça a payé |
|---|---|
| **Garder le texte d'origine** (VERBATIM.md) comme référence d'intention | En cas de doute, on revient à ce que Marc voulait vraiment, pas à ce que l'agent a compris. |
| **Une spec avec des identifiants** (`R-xx`) et des questions ouvertes (`Q-x`) | Chaque test, ticket et PR pointe vers une exigence. Les décisions restent écrites, avec leur version. |
| **Un moteur pur** : temps et hasard injectés, graine, `?vitesse=` | Tests rapides et déterministes, tests de bout en bout fiables. C'est aussi ce qui a rendu possible le stand-up du jour (#19) et le tutoriel scripté (#42). |
| **Toutes les valeurs de jouabilité dans un seul fichier** (`config.ts`) | La courbe de difficulté (#46) et le temps de lecture (#47) ont été réglés sans toucher au code du jeu. |
| **Une maquette visuelle validée avant le code** (v0.4) | La direction visuelle n'a jamais été rediscutée, seulement amplifiée. |
| **Le contenu séparé du code**, validé par un schéma | On ajoute ou corrige des répliques sans risque (#54). |
| **Un ticket par retour, une PR par ticket, une vérification automatique qui bloque** | Chaque changement est petit, relu, testé et mis en ligne seul. Marc garde la décision de fusion. |
| **Des captures téléphone et ordinateur dans les PR** | Les défauts visuels sont vus avant la fusion (texte coupé, débordements, contraste). |

**À retenir :** ces fondations sont réutilisables telles quelles pour n'importe quel petit jeu web.

---

## Partie 2. Les leçons et leurs signaux

Chaque leçon suit le même modèle : ce qui s'est passé, la leçon, puis le **signal**, la directive qui l'aurait fait anticiper.

### Leçon 1. Penser avec les codes qu'un humain connaît déjà

**Ce qui s'est passé**
- **#10.** La pensée et la parole s'affichaient dans la même bulle carrée. Un humain s'attend à un **nuage** pour une pensée : c'est le code de la bande dessinée, connu de tous.
- **#38, #28.** Le niveau de café était discret, et ses libellés prêtaient à confusion. Un humain s'attend à reconnaître tout de suite **Facile / Normal / Difficile**.
- **#48.** Le compte à rebours était un petit anneau à côté du texte. Le code le plus naturel est que le temps se lise **sur l'objet qu'on regarde déjà**.
- **#29.** S'abstenir à bon escient donnait le même retour que couper. Un humain veut que le jeu **nomme sa bonne décision** (« Bien vu ! »).

**La leçon.** Des personnages cartoon qui parlent appellent les codes de la bande dessinée. Un choix de difficulté appelle les codes des jeux vidéo. Un humain lit d'abord ce qu'il connaît déjà : une interface qui invente ses propres codes demande un effort que le joueur pressé ne fait pas.

> **Signal.** « Pour chaque élément d'interface, nomme la convention humaine qu'il reprend (bande dessinée, jeux vidéo, applications courantes) et dans quel genre elle est connue. S'il n'en reprend aucune, propose celle qui s'en approche le plus, ou justifie pourquoi en inventer une. »

### Leçon 2. Le joueur arrive à froid

**Ce qui s'est passé.** Le premier pilier de la spec disait déjà « Compris en 3 secondes ». Dans les faits, trois vagues de retours ont été nécessaires :
1. **#32.** « Tout va trop vite au début. » Réponse : le Facile par défaut, et des flèches autour du collègue à couper pendant 30 secondes.
2. **#36.** Les flèches ne ressortaient pas assez. Réponse : quatre fois plus de flèches, avec une vague.
3. **#42, #43.** « On ne comprend pas ses erreurs, et le jeu continue. » Réponse :
   - un **tutoriel en trois étapes**, avec le temps arrêté, un geste à faire pour avancer et un échec qui s'explique ;
   - pendant le guide, chaque erreur s'explique sur la tuile, et la première **arrête le jeu** un instant ;
   - au Facile, pas de piège qu'on n'a pas encore appris (#46).

**La leçon.**
- Un pilier écrit ne suffit pas : il faut le **traduire en mécanique** et le **mettre à l'épreuve** avec quelqu'un qui ne connaît pas le jeu.
- Le joueur arrive par un lien, sans contexte, sur téléphone. Tout ce qui se passe dans la première minute doit lui laisser le temps de regarder, de comprendre, puis de faire le bon geste.
- Montrer ne suffit pas. Il faut **arrêter, expliquer en une phrase, faire faire le geste, puis confirmer**. C'est ce qui donne un sentiment de contrôle.

> **Signal.** « Conçois la première minute pour quelqu'un qui arrive par un lien partagé, sur téléphone, sans rien savoir du jeu. Prévois dès la première version :
> - un niveau par défaut où il ne se passe qu'une chose à la fois ;
> - une prise en main à l'arrêt : on regarde, on lit une phrase, on fait le geste ;
> - aucune mécanique piège avant qu'elle ait été présentée. »

### Leçon 3. Chaque erreur doit être comprise sur le moment

**Ce qui s'est passé.**
- **#43.** Quand le « malaise » s'affichait, il était déjà trop tard pour voir ce qui s'était passé. Le joueur cherchait son erreur, perdait le fil et en faisait d'autres. La frustration montait.
- **#29.** Un bon choix sans retour distinct laissait le joueur dans le doute.
- **#47.** Une phrase longue n'avait pas plus de temps qu'une courte : une erreur sur une phrase qu'on n'a pas pu lire paraît injuste.

**La leçon.**
- La frustration ne vient pas de l'échec, mais de l'échec **incompris** ou **injuste**.
- Un retour efficace nomme la cause (« il fallait couper Kevin »), au moment où ça se passe, avec le temps de le lire.
- Un retour efficace distingue aussi les bonnes décisions entre elles : couper, ou laisser passer à bon escient.

> **Signal.** « Pour chaque issue possible d'une action du joueur (réussite, échec, abstention), décris le retour : ce qu'il nomme, quand il apparaît, combien de temps il reste lisible. Une pénalité doit toujours dire pourquoi. Et la difficulté ne doit jamais venir d'une injustice, comme un texte qu'on n'a pas le temps de lire. »

### Leçon 4. Dans une interface éclatante, un indice discret est invisible

**Ce qui s'est passé.**
- Le visuel « éclatant » est devenu une exigence de premier plan dès la v0.3, et c'était le bon choix.
- Il a eu un effet secondaire : tout signal d'aide devait être **exagéré** pour se voir :
  - les 7 flèches, devenues environ 25 avec une vague (#36) ;
  - le choix du café, avec un titre en jaune, des mots de niveau et de la vapeur (#38) ;
  - le compte à rebours, devenu un trait épais autour du nuage (#48).

**La leçon.** Plus le décor est chargé, plus un indice doit contraster par sa taille, son mouvement et sa couleur. Une couleur déjà utilisée par un personnage disparaît sur sa tuile : c'est le turquoise de Kevin qui a fait choisir le violet pour le compte à rebours.

> **Signal.** « Pour chaque indice qui guide le joueur (où regarder, combien de temps il reste, quel niveau est choisi), vérifie sur une capture à taille téléphone qu'il ressort du premier coup d'œil, sur toutes les couleurs de fond. Dans un jeu très coloré, réserve à ces indices une couleur qu'aucun élément du décor n'utilise. »

### Leçon 5. La difficulté doit monter régulièrement, sur plusieurs axes

**Ce qui s'est passé.**
- **#46.** Au niveau le plus difficile, le début était lent (4 phrases avant le deuxième collègue), puis le jeu accélérait d'un coup. Le calendrier d'arrivée était le même à tous les niveaux. Un bêta-testeur a aussi demandé si la difficulté n'était que de la vitesse.
- **#46.** La réponse : les arrivées dépendent maintenant du niveau, et le piège « déjà sur mute » aussi (0 %, 25 %, 40 %). Plus de café demande plus d'attention, pas seulement plus de vitesse.
- **#39.** En fin de partie, le jeu propose maintenant moins de café après un mauvais score, ou plus de café après un excellent.

**La leçon.**
- Une courbe de difficulté se **regarde dans le temps** : combien de choses à gérer à la 5e, à la 30e et à la 80e seconde.
- Les plafonds d'un niveau (ici, trois bulles à la fois) ne servent à rien si une autre règle empêche de les atteindre.
- Faire varier un seul axe, la vitesse, donne vite l'impression d'un jeu « juste plus rapide ».

> **Signal.** « Pour chaque niveau, décris la charge du joueur seconde par seconde, sur toute la partie, et vérifie qu'elle monte régulièrement. Fais varier au moins deux axes de nature différente : la vitesse ou la quantité, et l'attention ou le jugement. Propose un ajustement de niveau selon le résultat. »

### Leçon 6. Un score qu'on partage doit être comparable et juste

**Ce qui s'est passé.**
- **#19.** Le « stand-up du jour », la même réunion pour tout le monde ce jour-là, rendait les scores comparables. C'est un bon moteur de partage.
- **#49.** Un bêta-testeur a remarqué qu'on pouvait mémoriser la réunion en rejouant, ce qui faussait la comparaison. La réponse : seul le premier essai du jour compte pour le partage, et les suivants deviennent des parties libres.
- **#24, #26.** Le lien partagé a aussi dû porter sa provenance et sa langue.

**La leçon.** Une réunion identique pour tous rend les scores comparables, mais aussi mémorisables. Il faut décider dès le départ **ce qui compte** pour la comparaison.

> **Signal.** « Si le jeu se partage par le score, précise dès la première version : ce que le texte partagé contient, ce qui rend deux scores comparables, et comment empêcher qu'on améliore son score en rejouant la même partie. Le lien partagé ouvre le jeu dans la langue du message, et on peut compter les visites qu'il amène. »

### Leçon 7. Un contenu attribué à des personnages doit rester cohérent

**Ce qui s'est passé.**
- **R-26.** Le boss pouvait se moquer du boss. L'agent l'a repéré tôt, et le champ `pasDitePar` a été ajouté pour l'exclure.
- **#54.** Plus tard, un bêta-testeur a trouvé que Ginette pouvait parler des « dossiers de Ginette », et que Kevin pouvait se remercier lui-même.
- **#54.** L'analyse a aussi révélé trois répliques au masculin que des personnages féminins pouvaient dire.

**La leçon.** Dès qu'une réplique peut être dite par plusieurs personnages, trois questions se posent :
- Qui la dit ?
- De qui parle-t-elle ?
- Le texte s'accorde-t-il avec la personne qui parle ?

Ces vérifications sont mécaniques : elles se testent au lieu de se découvrir au hasard d'une partie.

> **Signal.** « Pour toute banque de textes dits par des personnages, garantis par un test qu'aucun personnage ne parle de lui-même à la troisième personne. En français, écris au neutre les répliques que des personnages de genres différents peuvent dire. Vérifie aussi que chaque réplique colle au rôle de celui qui la dit. »

### Leçon 8. Les libellés doivent se comprendre sans contexte

**Ce qui s'est passé.**
- **#28.** « Changer de café » se comprenait mal, et c'est devenu « Changer le niveau de café ».
- **#38.** Les niveaux ont reçu un mot clair (Facile, Normal, Corsé).

**La leçon.** Un clin d'œil humoristique (le café) peut habiller un réglage, mais il ne doit pas le remplacer : le mot attendu doit rester visible à côté.

> **Signal.** « Chaque bouton et chaque réglage porte le mot qu'un joueur s'attend à lire. L'humour vient en plus, jamais à la place. »

### Leçon 9. La synergie humain–agent : à chacun son apport

**Ce qui s'est passé.**
- **#42.** Marc a apporté l'intention et le vécu du joueur : « respire par le nez », trois étapes, des arrêts. Sa proposition était volontairement incomplète.
- L'agent a apporté les patrons connus des tutoriels de jeux, qui ont donné sa fluidité au résultat :
  - une animatrice tirée de la distribution (Josée) ;
  - un geste qui sert lui-même de confirmation ;
  - un échec qui arrête le temps et s'explique ;
  - « Passer » toujours visible ;
  - un tutoriel mémorisé comme fait, et relançable.
- L'agent a aussi critiqué la demande quand Marc l'y a invité. Il a proposé de sortir les explications d'erreurs dans un ticket à part (#43) et de reprendre l'étape 3 jusqu'à réussir.
- Dans l'autre sens, les meilleurs ajustements sont venus de vrais humains qui jouaient. L'agent ne les avait pas vus : tout va trop vite, je ne comprends pas mon erreur, je peux mémoriser la partie.

**La leçon.**
- L'humain voit ce que ressent le joueur. L'agent connaît les conventions et les bonnes pratiques du genre.
- Le meilleur résultat vient quand l'humain décrit **le problème vécu**, et que l'agent propose **les patrons éprouvés**, avec sa critique.

> **Signal.** « Avant d'implémenter une demande, propose les conventions et les bonnes pratiques du genre qui s'y appliquent, critique la demande si tu vois mieux, et sépare ce qui mérite un ticket à part. »
>
> **Et côté humain :** décrire le ressenti du joueur (« je suis perdu », « je ne comprends pas pourquoi j'ai perdu ») plutôt que la solution, et inviter explicitement la critique.

### Leçon 10. Un enchaînement se vérifie de bout en bout, chronomètre en main

*Ajoutée le 2026-11-17, après #58 et #60.*

**Ce qui s'est passé.**
- **#58.** Marc a vu qu'à la fin de l'étape 1 du tutoriel, « C'était correct » disparaissait en 1,7 seconde. L'agent a ajouté un arrêt et un bouton, puis a chronométré la transition… seulement jusqu'au début de l'étape 2.
- **#60.** Marc a aussitôt trouvé un autre passage trop rapide, juste après. L'agent l'avait lui-même créé en corrigeant #58 : une carte de passage affichée 0,85 seconde. En chronométrant enfin tout le tutoriel, deux autres cartes trop brèves sont apparues : l'accueil (1,2 s pour trois phrases) et « Bien joué ! » (1,35 s, en accéléré).

**La leçon.**
- Une correction dans un enchaînement déplace souvent le problème un peu plus loin. Vérifier seulement l'endroit corrigé ne suffit pas.
- Une carte qui s'affiche pendant que le temps avance n'a pas de durée garantie : elle dure ce que dure l'attente du jeu, accélérée ou non. Une carte qui doit être lue attend un geste ; sinon, on mesure sa durée.

> **Signal.** « Après tout changement dans un enchaînement (tutoriel, transitions, écrans successifs), rejoue-le en entier à vitesse normale et note combien de temps chaque texte reste à l'écran. Tout texte affiché sans attendre de geste doit tenir au moins 2 secondes, et un test automatique le vérifie. N'ajoute jamais une carte ou un message de passage sans mesurer sa durée. »

### Leçon 11. L'outillage suit d'abord la norme du type de projet

*Ajoutée le 2026-11-18, après #62, #63, #65 et les PR #64 à #71.*

**Ce qui s'est passé.**
- **#62.** Marc a demandé de garder le projet à jour en misant sur les automatismes de GitHub. Le premier plan de l'agent prévoyait la fusion automatique des PR de Dependabot, avec un jeton personnel. Marc a alors demandé ce qui était la norme pour un projet de ce genre. Réponse : à cette échelle, on fusionne d'un clic une PR groupée par semaine. Le plan a perdu la fusion automatique, le jeton et une vérification programmée, et il est devenu plus simple.
- **#62, image Playwright.** Marc a demandé si l'image Docker de la CI était un choix voulu. L'historique a montré qu'elle avait été adoptée en réaction à **une seule** panne réseau passagère, sans relancer l'essai. Elle bloquait aussi Dependabot. On est revenu à `playwright install --with-deps`, l'exemple principal de la documentation de Playwright.
- **#63.** En comparant le projet aux pratiques courantes, il manquait ESLint, que le modèle React de Vite inclut par défaut. ESLint a buté sur TypeScript 7, adopté avant que son écosystème suive : `typescript-eslint` ne le prend pas encore en charge. Marc a tranché pour TypeScript 6. Le retour à TS 7 est noté dans #65, avec son déclencheur et l'étiquette `bloqué en amont`.
- **#70 et #71.** Dependabot ne met pas à jour la version de pnpm (champ `packageManager`). Plutôt que de changer d'outil, on a regardé ce que font les autres projets (`pnpm self-update` à la main) et ajouté un rappel mensuel qui ouvre une issue seulement en cas de retard.

**La leçon.**
- Pour l'outillage, le bon point de départ est **ce que fait la communauté pour ce type de projet**, pas la solution la plus automatisée possible. Chaque écart à la norme doit avoir une raison écrite.
- Une décision prise à chaud, sur un seul incident, doit être notée comme telle, pour pouvoir la revoir.
- Une version majeure d'un outil de base (TypeScript, Node) s'adopte quand son écosystème suit, pas le jour de sa sortie.
- Un report a un **déclencheur écrit** et une étiquette (`bloqué en amont`). Sinon, on le réévalue sans cesse sans raison nouvelle.
- Un rappel qui vient nous chercher (issue automatique) vaut mieux qu'une note qu'il faut penser à relire.

> **Signal.** « Pour tout choix d'outillage, de CI ou de maintenance, cherche d'abord ce qui est le plus courant pour ce type de projet, pars de là et justifie chaque écart. Après un échec passager, relance avant de changer de méthode. Avant d'adopter une version majeure d'un outil de base, vérifie que les outils qui en dépendent la prennent en charge. Tout report a son déclencheur écrit et l'étiquette `bloqué en amont`. »
>
> **Et côté humain :** demander « qu'est-ce qui est la norme pour un projet comme celui-ci ? » et « ce choix était-il voulu ? » avant de valider un plan d'outillage.

---

## Partie 3. Brief de départ pour un prochain jeu

À copier au début d'un nouveau projet de petit jeu web social, à côté de l'idée elle-même. Chaque ligne vient d'une leçon ci-dessus.

```markdown
## Directives de conception (tirées de la rétrospective Whack-a-Mute)

Joueur visé : il arrive par un lien partagé, sur téléphone, sans rien savoir du jeu.

1. Codes humains : chaque élément d'interface reprend une convention connue
   (bande dessinée, jeux vidéo, applications courantes). Nomme-la. Le temps
   se lit sur l'objet qu'on regarde déjà.
2. Première minute : un niveau par défaut où il ne se passe qu'une chose à la
   fois. Une prise en main à l'arrêt (regarder, lire une phrase, faire le
   geste), toujours avec « Passer ». Aucun piège avant qu'il soit présenté.
3. Retours : chaque issue (réussite, échec, abstention) a son retour, qui
   nomme la cause, au moment où ça se passe, avec le temps de le lire. Jamais
   de difficulté injuste, comme un texte qu'on n'a pas le temps de lire.
   Un enchaînement se rejoue en entier, chronomètre en main : tout texte qui
   n'attend pas de geste tient au moins 2 secondes (vérifié par un test).
4. Saillance : dans un visuel éclatant, les indices sont exagérés (taille,
   mouvement, couleur réservée). Vérifié sur une capture à taille téléphone.
5. Difficulté : décris la charge seconde par seconde, à chaque niveau. Elle
   monte régulièrement, sur au moins deux axes (vitesse et attention).
   Propose un changement de niveau selon le score.
6. Partage : un texte partagé qui donne envie de cliquer, des scores
   comparables (même partie pour tous ce jour-là), seul le premier essai
   compte, et le lien garde la langue et la provenance.
7. Contenu : personne ne parle de soi à la troisième personne (vérifié par un
   test), texte neutre en genre quand plusieurs personnages peuvent le dire,
   chaque réplique colle au rôle de celui qui la dit.
8. Libellés : le mot attendu est toujours visible ; l'humour vient en plus.
9. Collaboration : avant d'implémenter, propose les conventions du genre,
   critique la demande et sépare ce qui mérite un ticket à part.
10. Outillage : pars de la norme du type de projet (modèle Vite avec ESLint,
   Dependabot groupé, CI qui bloque la fusion, méthode standard de chaque
   outil) et justifie chaque écart. Pas de version majeure d'un outil de
   base avant que son écosystème suive. Tout report a un déclencheur écrit.

Fondations à reprendre : texte d'origine conservé, spec avec identifiants,
moteur pur avec graine, valeurs de jouabilité dans un seul fichier, maquette
validée avant le code, contenu séparé et validé, un ticket et une PR par
changement, vérification automatique bloquante, captures téléphone et
ordinateur.
```

---

## Partie 4. Valider les signaux avec un agent « froid »

**L'idée.** Donner l'idée de départ et le brief de la partie 3 à un agent qui part de zéro, le laisser produire une première version jouable, puis compter combien des ajustements d'aujourd'hui il reste à demander. Moins il en faut, plus les signaux sont bons.

**La grille.** Chaque ligne est un ajustement qu'il a fallu demander sur Whack-a-Mute. On coche ce que la première version de l'agent froid fait déjà, sans qu'on le lui demande.

| # | Ce que la première version devrait déjà faire | Ticket d'origine | Leçon |
|---|---|---|---|
| 1 | Une pensée s'affiche dans un nuage, distinct de la parole. | #10 | 1 |
| 2 | Le choix de difficulté se voit tout de suite et porte des mots clairs. | #38, #28 | 1, 8 |
| 3 | Le compte à rebours est sur l'objet regardé, bien visible. | #48 | 1, 4 |
| 4 | Une bonne abstention a son propre retour positif. | #29 | 1, 3 |
| 5 | Le niveau par défaut est le plus calme. | #32 | 2 |
| 6 | Une prise en main à l'arrêt avant la première partie, avec « Passer ». | #42 | 2 |
| 7 | Les indices d'aide ressortent du premier coup d'œil. | #36 | 4 |
| 8 | Une erreur s'explique sur le moment, et le jeu laisse le temps de lire. | #43 | 3 |
| 9 | Pas de piège avant qu'il soit présenté. | #46 | 2 |
| 10 | La difficulté monte régulièrement, sur plusieurs axes. | #46 | 5 |
| 11 | Le temps de lecture suit la longueur du texte. | #47 | 3 |
| 12 | Un changement de niveau est proposé selon le score. | #39 | 5 |
| 13 | Les scores partagés sont comparables, et seul le premier essai compte. | #19, #49 | 6 |
| 14 | Le lien partagé garde la langue et la provenance. | #24, #26 | 6 |
| 15 | Personne ne parle de soi, et le genre reste neutre. | R-26, #54 | 7 |

**Comment l'utiliser.**
1. Dans un dépôt vide, donner à l'agent froid : l'idée (l'équivalent du VERBATIM.md) et le brief de la partie 3. Ni la spec, ni le code de Whack-a-Mute.
2. Le laisser produire la spec, la maquette et la première version jouable, comme ici.
3. Remplir la grille, idéalement avec un humain qui ne connaît pas le jeu pour les lignes 2 à 8.
4. Pour chaque ligne non cochée, améliorer le signal correspondant dans la partie 3. C'est ainsi que ce document s'affine d'un projet à l'autre.

**Repère.** Sur Whack-a-Mute, ces 15 ajustements ont demandé environ une douzaine de retours, répartis sur quatre jours. L'objectif d'un agent froid bien guidé : en cocher au moins 10 dès la première version.

---

## Pour aller plus loin

- Ce document pourra être déplacé dans un dépôt commun de prompts et de bonnes pratiques, de plus haut niveau que ce jeu. La partie 3 est écrite pour être copiée telle quelle.
- À chaque nouveau projet, ajouter ses propres leçons ici, avec le même modèle : ce qui s'est passé, la leçon, le signal.
