# Whack-a-Mute — Spécification (PRD)

> **Version** 0.2 (brouillon) · **Date** 2026-11-09 · **Auteur** Marc
> Source d'origine : [VERBATIM.md](VERBATIM.md). En cas de doute sur l'intention, c'est le verbatim qui fait foi.
> Les sections marquées **⚠️ Hypothèse** sont des propositions à valider. Elles sont reprises dans la section 13, « Questions ouvertes ».

---

## 1. Vision

Un petit jeu web, drôle et instantanément compréhensible, inspiré du principe du jeu de la taupe. Le joueur surveille une réunion d'équipe en visio et doit **mettre sur mute** les collègues qui s'apprêtent à lâcher un commentaire déplacé, avant qu'il soit trop tard.

Une partie dure environ 90 secondes. On y joue de 5 à 15 minutes, on partage son score, puis on passe à autre chose. Le jeu vise le « Ah ben voyons, quelqu'un a fait ça ! ».

### Origine (à raconter dans l'intro)
Marc, en fin de carrière, est devenu un peu moins participatif en réunion, puis un jour un petit commentaire déplacé lui a échappé. Quelqu'un lui a alors dit : « Marc, tu n'es pas sur mute. » Petit moment de gêne… et une leçon de vie devenue un jeu.

### Piliers de design
Chaque nouvelle idée doit respecter ces quatre piliers.

1. **Compris en 3 secondes.** Une seule action (cliquer ou taper sur un participant) et une seule décision (cette phrase passe-t-elle ou non ?).
2. **Drôle d'abord.** Le ton est léger, du malaise reconnaissable, jamais de méchanceté.
3. **Éclatant et réactif.** Chaque clic donne un retour visuel et sonore immédiat et satisfaisant.
4. **Peu d'éléments, en synergie.** Tout ajout doit renforcer le reste. Dans le doute, on ne l'ajoute pas.

### Public et contexte
- Des gens qui ont déjà vécu des réunions en visio : employés de bureau, télétravailleurs, retraités nostalgiques.
- Ils découvrent le jeu par un lien partagé (réseaux sociaux, messagerie), **en majorité sur téléphone**.

---

## 2. Parcours du joueur

```
Accueil / Intro  →  Choix du niveau de café  →  Réunion (partie)  →  Écran de fin  →  Rejouer / Partager
```

1. **Accueil.** Titre, une phrase d'accroche, l'anecdote de Marc en 2 ou 3 lignes, puis le bouton « Rejoindre la réunion ».
2. **Choix du niveau de café.** Trois boutons, voir la section 6.
3. **Réunion.** La partie de 90 secondes.
4. **Fin.** Harmonie finale, titre humoristique, statistiques, boutons « Rejouer » et « Partager ».

---

## 3. Boucle de jeu principale

### 3.1 Principe
Chaque participant prend la parole tour à tour. Avant qu'il parle, le joueur **voit sa prochaine phrase** dans une bulle, avec un compte à rebours. Le joueur décide alors :

- la phrase est **correcte** → il ne fait rien ;
- la phrase est **déplacée** → il clique sur le participant pour **le mettre sur mute** avant la fin du compte à rebours.

### 3.2 Cycle d'une prise de parole
1. **Annonce.** Une bulle « va dire… » apparaît sur la tuile avec le texte complet et un compte à rebours visuel (anneau ou barre qui se vide).
2. **État du micro au départ.** La plupart du temps, le participant **enlève lui-même son mute** pour parler, et son micro est visible comme ouvert. Parfois, il est **déjà sur mute** de lui-même, et il n'y a alors rien à faire (voir R-08).
3. **Fenêtre d'action.** Tant que le compte à rebours tourne, chaque clic sur la tuile **bascule** le micro (mute ↔ ouvert). Le joueur peut donc corriger une erreur.
4. **Prise de parole.** À la fin du compte à rebours, la phrase est « dite » et le résultat est appliqué (voir 3.3).
5. **Retour au calme.** Le participant redevient inactif jusqu'à sa prochaine annonce.

### 3.3 Table des résultats

| Phrase | Micro à la fin | Résultat | Effet sur l'harmonie | Retour visuel et sonore |
|---|---|---|---|---|
| Déplacée | 🔇 Mute | **Intercepté !** | +3 | Gros « SCHLAC », micro barré qui s'écrase, texte grisé « …personne n'a rien entendu » |
| Déplacée | 🎙️ Ouvert | **Malaise** | −20 | Phrase affichée en grand, réaction des autres participants (😬), son gênant (criquets, toux), petit tremblement d'écran |
| Correcte | 🎙️ Ouvert | Normal | 0 | La phrase s'affiche normalement |
| Correcte | 🔇 Mute | **Coupé à tort** | −5 | Le participant : « Euh… tu m'as coupé ? », son « boop » déçu |

---

## 4. Harmonie, durée et fin de partie

- **Harmonie d'équipe** : une jauge de 0 à 100 %, qui démarre à 100 % et ne dépasse jamais 100 %.
- **Durée** : une partie dure 90 secondes réelles, présentées comme un « stand-up de 15 minutes » avec une horloge de réunion accélérée.
- **Fin anticipée** : si l'harmonie tombe à 0 %, la réunion se termine aussitôt avec le message « La réunion a été écourtée par l'organisateur. »
- **Score partagé** : l'harmonie finale en %, plus le nombre de commentaires interceptés sur le total des commentaires déplacés.

### Titres de fin ⚠️ Hypothèse (textes à peaufiner)

| Harmonie finale | Titre |
|---|---|
| 90–100 % | Champion·ne de la synergie |
| 70–89 % | Collègue modèle (ou presque) |
| 40–69 % | « On se reparle en 1:1 » |
| 1–39 % | Invitation surprise des RH |
| 0 % | Réunion écourtée par l'organisateur |

---

## 5. Participants

- Jusqu'à 4 participants, affichés en grille : 1, puis 2 côte à côte, puis 2×2.
- Ils **rejoignent la réunion au fil de la partie**, avec la notification « Ginette a rejoint la réunion ».
- Chaque participant a un prénom, un avatar illustré et une petite étiquette de rôle, pour le clin d'œil. Ce sont des **personnages fictifs**.

Distribution ⚠️ Hypothèse :
- **Ginette**, de la compta
- **Kevin**, le stagiaire
- **Josée**, la scrum master
- **Le boss** (s'appelle peut-être Normand)

Le joueur est implicitement l'animateur de la réunion. Il n'a pas de tuile à lui dans la première version.

---

## 6. Difficulté

La difficulté repose sur **deux axes seulement**.

### 6.1 Nombre de participants, au fil de la partie

| Temps écoulé | Participants |
|---|---|
| 0 s | 1 |
| 15 s | 2 |
| 35 s | 3 |
| 55 s | 4 |

### 6.2 Rythme, selon le niveau de café choisi

| Niveau | Nom affiché | Temps de lecture (annonce) | Pause entre deux prises de parole | Prises de parole simultanées max. |
|---|---|---|---|---|
| Facile | ☕ Lundi 9 h, pas de café | 4,0 s | 2,5 s | 1 |
| Moyen | ☕☕ Après le premier café | 3,0 s | 1,8 s | 2 |
| Difficile | ☕☕☕ Quatrième espresso | 2,0 s | 1,0 s | 3 |

- La proportion de phrases déplacées est d'environ 35 %.
- Toutes ces valeurs vivent dans **un seul fichier de configuration** (voir R-40), pour pouvoir ajuster la jouabilité.

---

## 7. Contenu : les répliques

Les répliques sont le cœur de l'humour. Elles sont stockées dans un fichier de données séparé du code.

### Règles de ton
- Ce qui est drôle : la mauvaise foi, la fatigue des réunions, le sarcasme léger, le jargon corporatif, le « pensé tout haut ».
- **Interdit** : viser un groupe (origine, genre, religion, orientation, âge, handicap), la vulgarité forte, le harcèlement, les vraies entreprises ou les vraies personnes.
- Une phrase déplacée doit être reconnaissable comme telle **en moins de 2 secondes de lecture**.
- Longueur maximale : environ 70 caractères, pour rester lisible sur téléphone.
- **Langue : français québécois léger.** On utilise des expressions d'ici avec parcimonie (« ben voyons », « courriel », « on se reparle », « c'est correct »), mais tout doit rester compréhensible partout dans la francophonie. Pas de sacres ni de joual appuyé.

### Exemples de ton
**Correctes**
- « J'ai fini le ticket 42, il reste juste les tests. »
- « Je suis bloqué sur l'API, quelqu'un peut m'aider après ? »
- « Rien de neuf pour moi, je continue sur le rapport. »
- « Je serai absent vendredi, c'est dans le calendrier. »

**Déplacées**
- « Encore une réunion qui aurait pu être un courriel. »
- « Je fais semblant d'écouter depuis dix minutes. »
- « La priorité numéro un de la semaine… la cinquième. »
- « Mon chat est plus agile que cette équipe. »
- « On a déjà essayé ça en 2019. Spoiler : non. »
- « Est-ce qu'on peut finir à l'heure, pour une fois ? »

### Volume visé
Au moins 40 phrases correctes et 25 phrases déplacées pour la première version. Il n'y a jamais deux fois la même phrase dans une même partie.

---

## 8. Direction visuelle et sonore

- **Interface parodique et générique** d'application de visio, avec un nom fictif (⚠️ Hypothèse : « SynergiQ »). **Aucun logo, couleur signature ou nom** de Microsoft Teams, Slack, Zoom ou d'un autre produit réel.
- **Esthétique arcade** : couleurs vives, contours épais, gros boutons, typographie ronde et lisible.
- **Curseur** : un gros marteau ou une grosse main « mute » qui frappe à chaque clic, avec un équivalent tactile (flash à l'endroit touché).
- **Bruitages** : « SCHLAC » pour un mute, « boop » déçu pour un mute à tort, criquets ou toux pour un malaise, carillon de connexion quand quelqu'un rejoint, petite fanfare de fin. Il faut un bouton pour couper le son.
- **Aucun dialogue parlé** : tout est écrit.

---

## 9. Exigences numérotées

Priorité : **[M]** obligatoire pour la première version, **[S]** souhaitable, **[L]** plus tard.
Chaque exigence [M] doit être couverte par au moins un test automatisé (voir la section 11).

### Accueil et parcours
- **R-01 [M]** L'accueil affiche le titre, l'anecdote d'origine (3 lignes max.) et un bouton pour commencer.
- **R-02 [M]** Le joueur choisit un niveau de café parmi trois avant de lancer la partie.
- **R-03 [M]** À la fin, le joueur peut rejouer en un seul clic, au même niveau ou en changeant de niveau.

### Boucle de jeu
- **R-04 [M]** Chaque prise de parole est annoncée par une bulle qui montre le texte complet et un compte à rebours visuel. Sa durée correspond au temps de lecture du niveau choisi.
- **R-05 [M]** Un clic ou une touche sur la tuile d'un participant bascule son micro (mute ↔ ouvert), seulement pendant son annonce.
- **R-06 [M]** À la fin de l'annonce, le résultat suit la table de la section 3.3.
- **R-07 [M]** Un clic en dehors d'une annonce active ne change rien et ne pénalise pas.
- **R-08 [M]** Environ 25 % des phrases déplacées sont annoncées avec le participant **déjà sur mute**. Ne rien faire donne une interception. Cliquer réouvre le micro, ce qui est un piège.
- **R-09 [M]** Les annonces se chevauchent au plus selon le maximum de prises de parole simultanées du niveau.

### Harmonie et fin
- **R-10 [M]** L'harmonie démarre à 100 %, reste entre 0 et 100 %, et varie selon la table 3.3.
- **R-11 [M]** La partie dure 90 secondes, ou se termine dès que l'harmonie atteint 0 %.
- **R-12 [M]** L'écran de fin affiche l'harmonie finale, le titre correspondant (section 4) et le nombre de commentaires interceptés sur le total des commentaires déplacés.

### Difficulté et participants
- **R-13 [M]** Les participants arrivent selon le calendrier de la section 6.1, avec une notification.
- **R-14 [M]** Le rythme (temps de lecture, pause, simultanéité) suit la section 6.2.

### Contenu
- **R-20 [M]** Les répliques sont chargées depuis un fichier de données validé au démarrage. Chacune a un identifiant, un texte, un type (correcte ou déplacée) et une langue.
- **R-21 [M]** Aucune réplique n'est répétée dans une même partie.
- **R-22 [M]** Un test vérifie que chaque réplique fait au plus 70 caractères et que le volume minimal (section 7) est atteint.

### Retour visuel et sonore
- **R-30 [M]** Chaque résultat de la table 3.3 a un retour visuel distinct, perceptible en moins de 100 ms après la fin de l'annonce ou le clic.
- **R-31 [M]** Chaque résultat a un bruitage distinct. Un bouton coupe ou rétablit le son, et ce choix est mémorisé.
- **R-32 [S]** Le curseur prend la forme d'un marteau sur ordinateur, et un flash apparaît à l'endroit touché sur écran tactile.
- **R-33 [S]** Un léger tremblement d'écran signale un malaise. Il est désactivé si le système demande de réduire les animations.

### Configuration, debug et qualité
- **R-40 [M]** Toutes les valeurs de jouabilité (durées, pénalités, calendrier d'arrivée, proportions) sont regroupées dans un seul fichier de configuration.
- **R-41 [M]** Le moteur de jeu accepte une graine aléatoire : la même graine et les mêmes actions donnent exactement la même partie.
- **R-42 [M]** Le mode debug est activé par des paramètres dans l'adresse de la page : `?seed=`, `?vitesse=`, `?participants=`, `?cafe=`.
- **R-43 [M]** Le jeu est jouable sur un téléphone en mode portrait (largeur de 360 px) comme sur ordinateur, sans défilement pendant la partie.
- **R-44 [M]** La page se charge rapidement : moins de 300 Ko compressés hors sons.

### Partage
- **R-50 [S]** Un bouton « Partager » utilise le partage natif du téléphone. Sur ordinateur, il copie plutôt un texte du genre : « J'ai gardé 85 % d'harmonie au stand-up ☕☕ — whack-a-mute ».
- **R-51 [S]** La page a une image d'aperçu et une description pour un bel affichage quand on partage le lien.

### Plus tard
- **R-60 [L]** Version anglaise (voir Q-2).
- **R-61 [L]** Mécanique inverse : un collègue sur mute dit quelque chose d'utile (« Tu es sur mute ! »), et il faut lui ouvrir le micro (voir Q-3).
- **R-62 [L]** Classement mondial (nécessiterait un serveur).
- **R-63 [L]** Phrases ambiguës comme troisième axe de difficulté.

---

## 10. Architecture technique

### Stack
- **TypeScript**, **Vite** et **React** pour l'interface.
- **CSS** et **Motion** pour les animations.
- **Howler.js** (Web Audio) pour les bruitages.
- **Zod** pour valider le fichier de répliques.
- **Vitest** pour les tests du moteur, **Playwright** pour les tests de bout en bout.
- **pnpm** comme gestionnaire de paquets.
- **GitHub Pages** pour l'hébergement, avec publication automatique par GitHub Actions à chaque push sur `main`.
- Pas de serveur : c'est un site statique.

### Principe clé : moteur pur, interface séparée
```
src/
├── engine/            ← logique pure, aucune dépendance à React ou au navigateur
│   ├── state.ts       ← types de l'état du jeu
│   ├── step.ts        ← step(state, dtMs, inputs) → nouvel état et événements
│   ├── rng.ts         ← générateur aléatoire à graine
│   └── config.ts      ← toutes les valeurs de jouabilité (R-40)
├── content/
│   └── lines.fr.json  ← répliques (R-20)
├── ui/                ← composants React, qui lisent l'état et envoient les clics
├── audio/             ← chargement et lecture des bruitages
└── main.tsx
tests/
├── engine/            ← tests Vitest, un fichier par groupe d'exigences
└── e2e/               ← tests Playwright (parcours complet, mobile et ordinateur)
public/sounds/
```

- Le moteur produit des **événements** (`intercepted`, `blunder`, `wrongMute`, `participantJoined`, `gameOver`…). L'interface et le son réagissent à ces événements.
- Le temps est **injecté** dans le moteur : les tests avancent l'horloge eux-mêmes, sans attendre.

---

## 11. Stratégie de test

- **Traçabilité** : chaque test porte l'identifiant de l'exigence qu'il vérifie, par exemple `it("R-10 : l'harmonie ne dépasse jamais 100 %")`.
- **Tests du moteur** (Vitest) : rapides et déterministes grâce à la graine et à l'horloge simulée. Ils couvrent R-04 à R-14, R-21 et R-41.
- **Tests du contenu** : la validation du schéma, la longueur et le volume des répliques (R-20 et R-22).
- **Tests de bout en bout** (Playwright) : le parcours complet avec `?seed=` et `?vitesse=`, sur un format téléphone et un format ordinateur (R-01 à R-03, R-12 et R-43).
- **Ajustement de la jouabilité** : on modifie `config.ts`, on joue en mode debug, puis on reporte les nouvelles valeurs dans la section 6 de ce document.

---

## 12. Hors périmètre de la première version

- Comptes, connexion, classement en ligne.
- Dialogues parlés ou voix de synthèse.
- Plus de 4 participants.
- Monétisation et publicité.
- Statistiques de visite (à reconsidérer après la mise en ligne, avec un outil respectueux de la vie privée).

---

## 13. Questions ouvertes

| # | Question | Hypothèse actuelle |
|---|---|---|
| ~~Q-1~~ | La boucle « ils enlèvent eux-mêmes le mute, le joueur le remet » convient-elle ? | ✅ **Décidé (v0.2)** : oui, telle que décrite en section 3, avec le piège R-08 |
| ~~Q-2~~ | Français seulement, ou français et anglais dès la première version ? | ✅ **Décidé (v0.2)** : français d'abord, code prêt pour la traduction (R-20 inclut la langue). L'anglais reste R-60 |
| Q-3 | Ajoute-t-on la mécanique inverse « Tu es sur mute ! » ? | Non pour la première version, voir R-61 |
| Q-4 | Nom de l'application de visio fictive ? | « SynergiQ » |
| Q-5 | Prénoms et rôles des personnages ? | Ginette, Kevin, Josée, Le boss |
| Q-6 | D'où viendront les bruitages (générés, banque libre de droits, enregistrés par Marc) ? | Générés ou libres de droits |
| Q-7 | Hébergement et adresse web finale ? Le dépôt GitHub sera **privé** au départ, et GitHub Pages ne publie depuis un dépôt privé qu'avec un abonnement payant (GitHub Pro). | À trancher à la mise en ligne : rendre le dépôt public, prendre GitHub Pro, ou héberger sur Netlify, Vercel ou Cloudflare Pages (gratuits depuis un dépôt privé) |
| ~~Q-8~~ | Français québécois assumé dans les répliques ? | ✅ **Décidé (v0.2)** : québécois léger, voir section 7 |

---

## 14. Historique

| Version | Date | Changement |
|---|---|---|
| 0.1 | 2026-11-09 | Premier brouillon, tiré du verbatim et de la discussion sur la stack |
| 0.2 | 2026-11-09 | Décisions : boucle de jeu confirmée (Q-1), français d'abord (Q-2), québécois léger (Q-8). Contrainte d'hébergement avec un dépôt privé ajoutée à Q-7 |
