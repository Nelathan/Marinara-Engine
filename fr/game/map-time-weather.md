# Game Mode : carte, heure et météo

Ce guide explique le panneau de carte du Game Mode et les systèmes qui suivent l'évolution du monde autour de ton équipe : le jour et l'heure, la météo et le moral de l'équipe. Au programme aussi : les vues de la carte, le déplacement et le zoom, et le réglage manuel du jour et de l'heure.

## Le panneau de carte

Le Game Mode affiche un petit panneau de carte sur l'écran de jeu. Ce panneau indique le nom de la carte en cours, le jour de jeu et une icône de ciel qui donne le moment de la journée.

Sur un ordinateur, la carte s'affiche directement dans un panneau, lisible d'un coup d'œil. Sur un téléphone, touche l'icône de carte en haut à gauche. Le bouton s'appelle **Open map** (ouvrir la carte) et il ouvre la carte dans un panneau contextuel.

Le panneau se déplace à la souris et se verrouille en place. Pour comprendre le fonctionnement des panneaux déplaçables, consulte le guide des widgets HUD en lien plus bas.

## Vue en grille et vue en nœuds

La carte a deux vues. Marinara Engine choisit la vue à ta place, selon le type de lieu que la carte représente. Le passage d'une vue à l'autre ne se fait pas à la main.

- La vue **en grille** convient aux zones ouvertes : une carte du monde, une région, une ville. Elle affiche des cases colorées selon le terrain – herbe, forêt, eau, montagne, désert, neige, ville, route et grotte.
- La vue **en nœuds** convient aux zones fermées comme les donjons et les intérieurs. Elle affiche les lieux sous forme de cercles reliés par des lignes. Un lieu que tu n'as pas encore découvert porte une icône de point d'interrogation. Une ligne en pointillés signale un chemin que tu n'as pas encore emprunté. Une ligne pleine signale un chemin déjà parcouru.

## Déplacer ton équipe

Pour voyager, choisis un lieu sur la carte. Tous les lieux ne sont pas sélectionnables. Sur une carte en grille, la case doit être adjacente à ton équipe et déjà découverte. Sur une carte en nœuds, le nœud doit être relié au lieu où tu te trouves, ou déjà découvert. Les autres cases et nœuds ne font rien quand tu cliques dessus.

1. Clique sur une case de la grille, ou sur un nœud dans une carte en nœuds.
2. Une pastille **Destination:** apparaît au-dessus de la zone de saisie, avec le nom du lieu.
3. Rédige ton message et envoie-le. Marinara ajoute une courte ligne du type `*moves to <place>*` au début du message.

Pour annuler, clique sur le petit bouton d'effacement (la croix X) de la pastille **Destination:**.

Sur un téléphone, la marche à suivre change un peu. Touche un nœud une fois pour le sélectionner, puis touche **Set destination** (définir la destination) dans le pied de page. Le nœud marqué **You are here** correspond au lieu où tu te trouves.

## Zoomer sur la carte

Chaque carte dispose d'une commande de zoom en haut à droite.

- Clique sur **Zoom in** (le bouton plus) pour te rapprocher.
- Clique sur **Zoom out** (le bouton moins) pour voir plus large.

Le zoom va de 75 % à 180 %, par paliers de 25 %.

## Passer d'une carte à l'autre

Certaines parties comptent plusieurs cartes ou régions. Dès qu'il y a plus d'une carte, un petit menu déroulant apparaît en haut du panneau de carte. Sers-t'en pour consulter une autre carte. La carte où tu te trouves vraiment porte la mention **(Current)**.

## Générer une nouvelle carte

En haut à gauche du panneau de carte, un bouton en forme de baguette magique s'appelle **Generate another map** (générer une autre carte). Clique dessus pour remplacer la carte en cours par une carte toute neuve.

Si une partie n'a pas encore de carte, le panneau affiche **No map yet** avec un bouton **Generate** qui fait la même chose.

## Régler le jour et l'heure à la main

La commande de jour et d'heure se trouve en haut du panneau de carte. Elle affiche **Day** (jour) suivi d'un nombre, plus une petite icône de ciel pour le moment de la journée.

1. Clique sur la commande **Day**.
2. Saisis un nouveau numéro de jour dans le champ. Le jour va de 1 à 9999.
3. Choisis un moment de la journée dans le menu déroulant. Les choix sont **Dawn**, **Morning**, **Afternoon**, **Evening**, **Night** et **Midnight**.
4. Clique en dehors du champ ou appuie sur Enter pour enregistrer.

Il s'agit d'un réglage manuel, qui prend le pas sur l'horloge automatique décrite juste après : c'est toi qui fixes le jour et l'heure. L'horloge peut aussi afficher **Noon** d'elle-même, mais Noon ne fait pas partie des choix manuels.

## Comment le temps s'écoule tout seul

L'horloge de jeu tourne toute seule. Elle repose sur des calculs fixes, pas sur l'IA, donc elle reste toujours cohérente. Chaque nouvelle partie commence au jour 1, à 08:00 du matin. Chaque action que tu fais avance l'horloge d'une durée déterminée.

| Action | Temps ajouté |
|---|---|
| Parler | 15 minutes |
| Explorer | 30 minutes |
| Un round de combat | 5 minutes |
| Un repos court | 1 heure |
| Un repos long | 8 heures |
| Un voyage | 2 heures |

Quand l'horloge dépasse minuit, le numéro du jour augmente de un.

## La météo

Le jeu suit aussi la météo tout seul, avec des calculs fixes et sans IA. La météo dépend du biome et de la saison. Le biome, c'est le type de milieu où se trouve ton équipe : désert, arctique, littoral, montagne… Côté météo, on trouve par exemple le ciel dégagé, les nuages, la pluie, l'orage, la neige, le blizzard, le brouillard et la tempête de sable.

La météo peut changer quand tu agis. Elle change le plus souvent lors d'un voyage ou d'un repos long, parfois quand tu explores, rarement dans les autres cas. La météo influence la façon dont le Game Master (le maître du jeu) décrit chaque scène.

Pour voir la météo à l'écran, active le réglage **Dynamic weather effects (rain, snow, fog, etc.)** dans les réglages d'apparence de l'application. Il est actif par défaut. Une fois activé, des particules animées – pluie, neige, brouillard – se superposent au jeu. Elles correspondent à la météo et au moment de la journée. Pour les autres options d'affichage, consulte le guide des réglages d'apparence en lien plus bas.

## Le moral de l'équipe

Le jeu tient un score de moral d'équipe caché, de 0 à 100. Il comporte cinq niveaux, du plus bas au plus haut : Broken, Low, Steady, High et Inspired.

Le moral évolue au fil de l'histoire. Gagner un combat, terminer une quête ou trouver un trésor le fait monter. Perdre un combat, rater une quête ou perdre un allié le fait descendre. Avec le temps, le moral revient peu à peu vers le milieu.

Le moral n'apparaît pas sous forme de nombre dans le jeu : il agit en coulisses. Il modifie tes jets de dés, de plus 2 au niveau Inspired à moins 2 au niveau Broken. Il teinte aussi la façon dont le Game Master décrit l'humeur de ton équipe.

## Guides associés

- [Game Mode : premiers pas](getting-started.md)
- [Game Mode : widgets HUD](hud-widgets.md)
- [Réglages d'apparence](../appearance/appearance-settings.md)
