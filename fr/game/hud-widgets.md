# Game Mode : les widgets HUD

Ce guide explique les widgets HUD de Game Mode dans Marinara Engine. HUD signifie "heads-up display" : de petits panneaux d'infos posés le long des bords gauche et droit de l'écran de jeu. Au programme : les types de widgets, l'étape de vérification avant le lancement d'une partie, le déplacement et le verrouillage des panneaux, et le partage d'une disposition de widgets.

## À quoi servent les widgets HUD

Les widgets HUD sont de petits panneaux personnalisés qui suivent des valeurs pendant une partie : une barre de vie, un compteur d'or, le niveau de confiance d'un allié. Chaque partie a ses propres widgets. Ils sont indépendants des trackers du HUD de Roleplay. Pour le bandeau de trackers utilisé dans les chats Roleplay, va voir les guides associés en bas de page.

Tu peux avoir jusqu'à 4 widgets au total. Tu les répartis entre le côté gauche et le côté droit de l'écran comme tu veux.

Les widgets ne servent que si l'option **Custom HUD Widgets** (widgets HUD personnalisés) est activée pour la partie. Elle l'est par défaut dans l'assistant de configuration. Quand elle est active, l'IA qui tient le rôle de Game Master (GM), autrement dit le maître du jeu, conçoit un ensemble de widgets de départ pendant qu'elle construit ton monde.

## Les 8 types de widgets

Il existe huit types de widgets. Le GM choisit un type pour chaque widget qu'il crée. Tu peux aussi choisir les types toi-même quand tu construis des widgets à la main.

| Type de widget | Ce qu'il affiche |
|---|---|
| **Progress Bar** | Une barre horizontale pour une valeur rapportée à un maximum, comme la vie ou l'endurance. |
| **Gauge** | Un cadran en demi-cercle pour une valeur rapportée à un maximum. |
| **Relationship Meter** | Une barre avec des marqueurs d'étape et une étiquette, pratique pour la confiance d'un PNJ (personnage non-joueur) ou pour un lien affectif. |
| **Counter** | Un seul grand nombre : l'or, les jours écoulés ou les ennemis vaincus. |
| **Stat Block** | Une petite grille de champs nommés avec leurs valeurs, comme STR et DEX, ou un mot d'état. |
| **List** | Une courte liste à puces d'éléments texte, comme les objectifs en cours. |
| **Inventory Grid** | Une grille d'emplacements d'objets, avec onglets de catégorie et compteurs d'objets en option. |
| **Timer** | Un compte à rebours en minutes et secondes, qui peut défiler en direct. |

## La fenêtre de vérification avant session

Quand des widgets personnalisés existent, une étape de vérification se déclenche avant ton premier tour. Dès que tu appuies sur **Start Game** (démarrer la partie), la fenêtre **Review Starting Widgets** (vérifier les widgets de départ) s'ouvre. Elle liste chaque widget de départ pour que tu puisses l'ajuster avant que la partie ne le fige.

Dans cette fenêtre, tu peux :

- Appuyer sur le bouton **Edit** (modifier) d'un widget pour changer ses valeurs de départ ou renommer les champs d'un **Stat Block**.
- Appuyer sur **Remove** (supprimer) pour retirer un widget dont tu ne veux pas.
- Appuyer sur **Back** (retour) pour fermer la fenêtre sans lancer la partie.
- Appuyer sur **Start Game** pour commencer à jouer avec les widgets tels qu'ils s'affichent.

Une fenêtre similaire apparaît quand tu démarres une nouvelle session dans une partie en cours. Elle s'intitule **Prepare Next Session Widgets** (préparer les widgets de la prochaine session) et propose un bouton **Start Next Session** à la place de **Start Game**. Son bouton de fermeture porte le libellé **Cancel** au lieu de **Back**.

## Modifier un widget en cours de partie

Pendant la partie, le GM met à jour les valeurs des widgets à mesure que l'histoire avance. S'il oublie une mise à jour, corrige le widget à la main.

1. Repère le panneau du widget sur le bord gauche ou droit de l'écran.
2. Clique sur le bouton crayon (**Edit**) dans l'en-tête du widget.
3. Change les valeurs dans la fenêtre d'édition. Par exemple, saisis une nouvelle valeur dans les champs **Current value** et **Maximum value** d'une barre.
4. Clique sur **Save Changes** (enregistrer les modifications).

L'en-tête porte aussi un petit signe plus ou moins. Clique sur l'en-tête du widget pour replier ou déplier son contenu.

## Déplacer et verrouiller les panneaux

Les panneaux de widgets sont verrouillés en place par défaut. Chaque panneau a une icône de cadenas dans son en-tête.

1. Clique sur l'icône de cadenas pour déverrouiller le panneau. Un contour léger indique qu'il est désormais déplaçable.
2. Fais glisser le panneau jusqu'à son nouvel emplacement.
3. Clique de nouveau sur l'icône de cadenas pour le reverrouiller en place.

Pour remettre un panneau à sa place par défaut, double-clique sur son icône de cadenas ou appuie sur la touche R quand l'icône a le focus. Chaque panneau retient sa position et son état de verrouillage partie par partie. Ta disposition ne se reporte pas d'une partie à l'autre.

Sur un téléphone, les widgets s'affichent sous forme de petites pastilles plutôt que de panneaux complets. Touche une pastille pour ouvrir le widget, et touche le `X` pour le refermer.

## Créer tes propres widgets

Tu peux concevoir les widgets toi-même au lieu de laisser le GM s'en charger. L'éditeur manuel de widgets s'ouvre à deux endroits :

- Dans l'assistant de configuration de la partie : active **Custom HUD Widgets**, puis active l'interrupteur **Build Widget Setup**. L'éditeur apparaît juste en dessous.
- Dans une partie existante : ouvre le panneau **Chat Settings** (réglages du chat), puis la section **Widgets**.

Dans l'éditeur, choisis un type de widget dans le menu déroulant et appuie sur **Add** (ajouter). Pour chaque widget, tu règles :

- **Icon** (icône) : un court symbole ou emoji affiché dans l'en-tête.
- **Label** (libellé) : le nom affiché en haut du widget.
- **Type** : l'un des huit types de widgets.
- **Side** (côté) : **Left HUD** ou **Right HUD**.
- **Accent** : la couleur du widget.

En dessous, chaque type a ses propres champs. Une barre utilise **Value** et **Max**. Un compteur utilise **Count**. Une grille d'inventaire utilise **Slots** et **Contents**. Un minuteur utilise **Seconds** et **Running**. L'éditeur indique combien de widgets tu as utilisés sur les 4 autorisés.

Dans le panneau **Chat Settings**, appuie sur **Save Widgets** (enregistrer les widgets) pour appliquer tes changements à la partie, ou sur **Reset** (réinitialiser) pour annuler les modifications non enregistrées.

## Partager des widgets par import et export

Tu peux enregistrer une disposition de widgets dans un fichier, puis la charger dans une autre partie. Ces boutons sont présents aussi bien dans l'assistant de configuration que dans la section **Widgets** du panneau **Chat Settings**.

1. Appuie sur **Export Widgets** (exporter les widgets) pour télécharger tes widgets actuels dans un fichier JSON. Le JSON est un format de données en texte brut.
2. Appuie sur **Import Widgets** (importer des widgets) dans une autre partie, puis choisis ce fichier pour charger les mêmes widgets.

Dans le panneau **Chat Settings**, pense à appuyer sur **Save Widgets** après un import pour que les widgets chargés soient bien appliqués.

## Guides associés

- [Game Mode : premiers pas](getting-started.md)
- [Le HUD et les trackers en Roleplay](../roleplay/hud-and-trackers.md)
