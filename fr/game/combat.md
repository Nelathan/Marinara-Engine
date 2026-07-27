# Game Mode : le combat

Ce guide explique le combat dans le Game Mode de Marinara Engine. Au programme : comment un combat démarre, le menu d'actions et les jets de dés derrière chaque coup. Tu y trouves aussi les effets de statut, les réactions élémentaires, les mécaniques de boss, le butin, le bouton **Interrupt** (interrompre) et les Quick-Time Events. Le combat est mené par le Game Master (GM), le maître du jeu : c'est le personnage qui narre ton aventure.

## Le début d'une rencontre

Tu ne déclenches pas le combat toi-même. Le GM lance un combat quand l'histoire l'exige, par exemple quand tu provoques un ennemi ou que tu tombes dans une embuscade. À ce moment-là, un écran de combat complet s'ouvre par-dessus la narration. Le moteur construit le combat (ton équipe, les ennemis, leurs caractéristiques et les règles spéciales éventuelles) à partir de ce qui se passe dans l'histoire.

L'écran de combat affiche ton équipe d'un côté et les ennemis de l'autre. Chaque combattant a une barre de vie (HP, points de vie) et, s'il utilise des compétences, une barre de magie (MP, points de magie). L'ordre des tours apparaît en haut sous la forme **Next:** suivi du nom de celui qui agit ensuite. Un compteur affiche **Round** et le numéro du round en cours.

## Le menu d'actions

À ton tour, tu choisis une action dans le menu. Les six actions sont :

- **Attack** (attaquer) : frappe un ennemi avec une attaque de base.
- **Skills** (compétences) : utilise une capacité spéciale. Les compétences peuvent coûter des MP. Certaines soignent un allié, d'autres frappent un ennemi, d'autres encore appliquent un buff ou un debuff, c'est-à-dire un bonus ou un malus temporaire.
- **Special** (action libre) : décris une action avec tes propres mots, puis appuie sur **Ask GM** (demander au GM). Par exemple : "Je projette du sable dans la lentille fissurée du Ruin Guard." Le GM décide de la suite.
- **Defend** (défendre) : augmente ta Défense jusqu'à la fin du round pour encaisser moins de dégâts.
- **Items** (objets) : utilise un objet de ton sac. Choisis **Full inventory** (inventaire complet) pour ouvrir la liste complète de tes objets depuis cet endroit.
- **Flee** (fuir) : quitte le combat sur-le-champ. La fuite met fin au combat immédiatement.

Une fois ton choix fait, le round se déroule. Les résultats s'affichent sous forme de nombres de dégâts flottants, de barres de vie qui bougent et de lignes dans le journal de combat.

## Comment les combats se calculent

Dès qu'un combat commence, chaque round est réglé par des jets de dés fixes, pas par l'IA. Le GM se contente de narrer les résultats. Il ne décide jamais qui touche ni combien de dégâts passent. Le combat est donc équitable et cohérent. Un "d20" ci-dessous désigne le jet d'un dé à vingt faces (un nombre de 1 à 20).

### L'initiative (ordre des tours)

Au début de chaque round, chaque combattant lance un d20 et ajoute un bonus lié à sa Vitesse. Les totaux les plus élevés agissent en premier. Un combattant saute le round entier s'il est gelé, étourdi ou emprisonné, ou si sa Vitesse est tombée à 0.

### Attaque et défense

Quand un combattant en attaque un autre :

1. L'attaquant lance un d20 et ajoute un bonus tiré de sa caractéristique d'Attaque.
2. Le défenseur lance un d20 et ajoute un bonus tiré de sa caractéristique de Défense.
3. Si le total de l'attaquant est inférieur à celui du défenseur, l'attaque échoue.
4. Un coup critique tombe sur un 20 naturel, ou quand l'attaquant dépasse le défenseur de 10 points ou plus.

### Les dégâts

Quand un coup porte, les dégâts de base viennent de la caractéristique d'Attaque de l'attaquant et augmentent avec son niveau. Des dés de dégâts supplémentaires s'y ajoutent, et les combattants de haut niveau en lancent davantage. Un coup critique multiplie le total par 1,5. La Défense du défenseur réduit ensuite les dégâts, en bloquant jusqu'à 40 pour cent de sa valeur de Défense.

### L'ajustement selon la difficulté

La dernière étape ajuste les dégâts selon la Difficulté de la partie, que tu définis dans l'assistant de configuration. Les quatre réglages multiplient les dégâts finaux ainsi :

| Difficulté | Multiplicateur de dégâts |
|---|---|
| Casual | 0.6 |
| Normal | 1.0 |
| Hard | 1.3 |
| Brutal | 1.6 |

Plus la difficulté est élevée, plus les deux camps frappent fort : les combats sont donc plus courts et plus risqués.

## Les effets de statut et les réactions élémentaires

Un effet de statut est une modification temporaire de l'Attaque, de la Défense, de la Vitesse ou des HP d'un combattant. Les buffs aident, les debuffs handicapent. Un statut dure un nombre de rounds défini, puis disparaît. Les effets de type poison drainent des HP à chaque round, tandis que les effets de type régénération en rendent. Trois effets nommés (gelé, étourdi et emprisonné) font passer son tour au combattant touché.

Certaines attaques et compétences portent un élément : Fire, Ice, Lightning, Poison, Holy ou Shadow. Le premier élément à toucher une cible y laisse une aura, c'est-à-dire une trace persistante de cet élément. Si un élément différent frappe ensuite la même cible, une réaction élémentaire se déclenche. La réaction ajoute des dégâts bonus et, souvent, un effet de statut.

Parmi les réactions possibles : Melt, Shatter, Overload, Superconduct, Toxic Blaze, Purification, Eclipse et Electrotoxin. Ce système fonctionne tout seul. Tu n'as rien à activer ni à régler. Les réactions se produisent automatiquement dès que les bons éléments s'enchaînent sur la même cible.

## Les mécaniques de boss et le butin

Les ennemis puissants peuvent avoir des mécaniques de boss, des règles spéciales que le GM écrit pour ce combat précis. Une mécanique peut se déclencher à intervalle régulier, par exemple tous les quelques rounds, ou quand le boss passe sous un seuil de vie défini. Les mécaniques peuvent frapper toute ton équipe, renforcer le boss ou appliquer un effet de statut. Quand l'une d'elles se déclenche, l'effet apparaît dans le journal de combat pour que tu puisses réagir.

Quand tu remportes un combat, les ennemis lâchent du butin. Chaque objet a une rareté, de la plus courante à la plus rare : commun, peu commun, rare, épique et légendaire. Une difficulté plus élevée oriente les gains vers les objets les plus rares et en donne un peu plus. Une bannière **Victory!** s'affiche quand tu gagnes, et une bannière **Defeat...** apparaît si ton équipe tombe.

## Interrompre le GM

Pendant que le GM rédige encore sa réponse, tu peux le couper avec le bouton **Interrupt**. Rien de ce que tu écris n'est validé tant que tu ne l'as pas envoyé. Un clic sur **Interrupt** ouvre une fenêtre de confirmation intitulée **Attempt to Interrupt?** avec trois choix :

- **No** (non) : annule et laisse le GM continuer à écrire.
- **Force Interrupt** (forcer l'interruption) : tu coupes net. Le GM n'est pas informé de ton interruption. Ton champ de saisie prend un contour vert.
- **Yes** (oui) : tente une interruption dans l'histoire, à laquelle le GM peut résister. Ton champ de saisie devient rouge et l'application indique "using dice recommended" pendant que le bouton de dés clignote. Lancer les dés ici peut aider ta tentative à réussir.

Après confirmation, écris ton message et envoie-le. Si tu changes d'avis, appuie sur **Resume** (reprendre) pour abandonner l'interruption en attente et laisser la narration continuer. Ce contrôle est utile dans un moment de tension, par exemple pour réagir juste avant qu'un combat n'éclate.

## Quick-Time Events

Le GM peut déclencher une surcouche Quick-Time Events, aussi appelée QTE, pour les passages d'action rapides comme une esquive ou une poursuite. Cette surcouche affiche une barre de compte à rebours qui se rétrécit, un message **React quickly!** et un bouton par choix. Chaque bouton est numéroté (1, 2, 3, et ainsi de suite). Clique sur le bouton correspondant à l'action voulue.

Choisis une action avant la fin du chrono pour gagner un bonus. Plus tu réagis vite, plus le bonus est important. Si le temps s'écoule d'abord, tu prends un malus à la place. Un Quick-Time Event n'utilise aucun dé. Tout se joue à la vitesse.

## Le combat sur mobile

Sur un téléphone, l'écran de combat se réorganise pour tenir sur un petit affichage. Les boutons d'action restent collés en bas de l'écran. Les panneaux qui ne tiennent pas dans la page passent dans un panneau latéral coulissant doté de quatre onglets :

- **Party** (équipe) : les membres de ton équipe et leur vie.
- **Boss Mechanics** (mécaniques de boss) : les règles spéciales du combat en cours.
- **Dialogue** (dialogue) : les répliques lancées par les combattants pendant le combat.
- **Combat Log** (journal de combat) : le compte rendu round par round de ce qui s'est passé.

Touche un onglet pour ouvrir son panneau latéral. Pour le refermer, touche en dehors du panneau latéral ou touche le bouton de fermeture.

## Guides associés

- [Game Mode : les dés et les jets de compétence](dice-and-skill-checks.md)
- [Game Mode : l'équipe et les PNJ](party-and-npcs.md)
- [Game Mode : premiers pas](getting-started.md)
- [Rencontres de combat (Roleplay)](../roleplay/combat-encounters.md)
