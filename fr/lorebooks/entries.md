# Les entrées de lorebook : mots-clés, position et déclenchement

Ce guide explique comment construire les entrées d'un lorebook (un recueil de faits sur ton univers). Au programme : l'onglet **Entries** (entrées), les mots-clés déclencheurs et les trois types d'entrée. Tu découvres aussi où chaque entrée se place dans le prompt (le texte que Marinara envoie à l'IA) et les réglages de déclenchement qui décident du moment où une entrée part. Si tu débutes avec les lorebooks, commence par [Vue d'ensemble des lorebooks](overview.md).

Une entrée, c'est un bloc de texte accompagné des règles qui décident quand Marinara Engine ajoute ce texte au prompt de l'IA. Quand une entrée s'active, Marinara insère son contenu, et l'IA "se souvient" d'un fait que tu n'as jamais tapé dans le chat.

## L'onglet Entries

Ouvre un lorebook depuis le panneau **Lorebooks** pour accéder à son éditeur pleine page. L'éditeur a deux onglets latéraux : **Overview** (vue d'ensemble) et **Entries**. Clique sur **Entries** pour afficher la liste des entrées. Le badge de l'onglet indique le nombre d'entrées du lorebook.

La barre d'outils en haut de l'onglet **Entries** propose ces contrôles :

- Le champ **Search entries…** : filtre la liste par nom d'entrée, par clés ou par contenu.
- Un menu déroulant de tri avec **Order**, **Entries**, **Name A→Z**, **Name Z→A**, **Tokens ↓**, **Keys ↓**, **Newest** et **Oldest**. Les options ↓ trient du plus grand au plus petit.
- Le bouton **Select** (sélectionner) : active la sélection multiple, pour copier, déplacer ou supprimer plusieurs entrées d'un coup.
- Le bouton **Add Folder** (ajouter un dossier) : crée un dossier pour regrouper des entrées (voir la section sur les dossiers d'entrées plus bas).
- Le bouton **Add Entry** (ajouter une entrée) : crée une entrée vide en haut de la liste.

Sous la barre d'outils, une ligne de résumé affiche le nombre d'entrées, le nombre de dossiers et l'estimation totale, en tokens (de petits morceaux de texte), du contenu de toutes les entrées.

## Ajouter et modifier une entrée

Voici la marche à suivre pour créer une entrée.

1. Ouvre ton lorebook et clique sur l'onglet **Entries**.
2. Clique sur **Add Entry**. Une nouvelle ligne apparaît dans la liste.
3. Saisis un nom dans le champ de nom de la ligne. Chaque entrée doit avoir un nom.
4. Clique sur la ligne (ou sur son chevron) pour déplier le panneau latéral d'édition complet.
5. Remplis les mots-clés et le contenu, décrits dans les sections suivantes.

Marinara enregistre les modifications automatiquement. Pendant que tu écris, le panneau latéral affiche **Autosaving…**, puis **Saving…**, puis **Saved automatically**. Si un enregistrement échoue, ton texte reste en place et Marinara réessaie à la modification suivante. Les entrées n'ont pas besoin d'un bouton d'enregistrement séparé.

Chaque entrée se présente comme une ligne compacte, sur une seule ligne. Cette ligne réunit les contrôles les plus utilisés. Déplie-la pour accéder au reste.

Pour dupliquer une entrée, survole la ligne et clique sur le bouton **Duplicate** (dupliquer). Pour en supprimer une, clique sur le bouton **Delete** (supprimer). Marinara demande confirmation avec le message "Delete this lorebook entry?".

## Contenu et clés d'une entrée

Déplie une entrée pour modifier ses champs principaux.

- **Primary Keys** (clés principales) : les mots-clés qui déclenchent cette entrée. Dès que l'un de ces mots apparaît dans le chat récent, l'entrée s'active. Saisis un mot-clé et appuie sur Enter pour l'ajouter sous forme de pastille.
- **Content** (contenu) : le texte que Marinara insère dans le prompt de l'IA quand l'entrée s'active. Écris-le comme un simple fait que l'IA doit connaître. Le contenu accepte les macros de prompt, et une estimation en tokens s'affiche en direct sous le champ.
- **Secondary Keys** (clés secondaires) : des mots-clés supplémentaires, utilisés uniquement quand le type d'entrée est **Selective**. Voir la section sur les types d'entrée plus bas.
- **Description** : un court résumé de l'entrée. Seul l'agent **Knowledge Router** le lit, pour décider s'il faut insérer l'entrée. Ce texte n'est jamais envoyé à l'IA principale comme contenu. Voir [Sources de connaissances](../agents/knowledge-sources.md).

Voici un exemple simple.

- Nom : `Silverhaven`
- Primary Keys : `Silverhaven`, `the capital`
- Contenu : `Silverhaven is the mountain capital. Its people mine blue crystal and distrust outsiders.`

Dès que `Silverhaven` ou `the capital` apparaît dans le chat, sous ta plume ou sous celle de l'IA, l'IA reçoit ce fait automatiquement.

## Règles de correspondance des mots-clés

Par défaut, une clé principale correspond si le mot apparaît quelque part dans le texte récent du chat, sans distinction de majuscules ni de minuscules. Trois contrôles modifient ce comportement. Les options **Whole Words** et **Case Sensitive** se trouvent dans le panneau latéral déplié. L'interrupteur **Regex** est la petite icône de la ligne compacte, et il devient orange quand il est actif.

| Contrôle | Emplacement | Par défaut | Effet |
|---|---|---|---|
| **Whole Words** | Panneau latéral de l'entrée | Off | La clé doit correspondre à un mot entier, pas à un morceau d'un mot plus long. |
| **Case Sensitive** | Panneau latéral de l'entrée | Off | Les majuscules et les minuscules doivent correspondre exactement. |
| **Regex** | Ligne compacte | Off | Traite chaque clé comme un motif d'expression régulière plutôt que comme du texte brut. |

Une expression régulière (regex) est un langage de recherche de motifs dans du texte. Ne l'utilise que si tu maîtrises les regex. Marinara exécute chaque clé regex avec un court délai d'expiration de sécurité. Un motif trop lent ne correspond à rien lors de cette analyse : garde donc des motifs simples.

## Types d'entrée : Normal, Constant, Selective

Chaque entrée a un type. Clique sur le petit point coloré de la ligne pour ouvrir le menu des types et en choisir un.

- **Normal** (point vert) : se déclenche quand une clé principale correspond au texte analysé. C'est le type par défaut.
- **Constant** (point jaune) : s'insère à chaque fois que le lorebook est actif, sans aucun mot-clé. Réserve ce type aux faits qui doivent toujours être présents.
- **Selective** (point rouge) : les clés principales doivent correspondre, et la logique des clés secondaires doit également passer.

Une entrée **Constant** reste soumise au déclenchement, à la probabilité et aux filtres que tu as définis. Elle se passe simplement de mot-clé.

Quand une entrée est **Selective**, ajoute une ou plusieurs **Secondary Keys** et choisis un bouton **Logic** (logique) dans le panneau latéral :

- **AND Any** : au moins une clé secondaire doit apparaître elle aussi.
- **AND All** : toutes les clés secondaires doivent apparaître elles aussi.
- **NOT Any** : l'entrée est bloquée si une clé secondaire apparaît.
- **NOT All** : l'entrée est bloquée seulement si toutes les clés secondaires apparaissent.

Prends par exemple une entrée **Selective** avec la clé principale `king` et la clé secondaire `Silverhaven`, réglée sur **AND Any**. Elle ne part que si le chat mentionne à la fois le roi et Silverhaven. Un mot courant comme `king` ne se déclenche donc pas dans la mauvaise scène.

## Position, Depth et Order

Ces contrôles décident de l'endroit où une entrée activée atterrit dans le prompt. Ils se trouvent sur la ligne compacte quand l'écran est large. Sur un écran étroit, touche le bouton de contrôles rapides de la ligne pour y accéder.

- **Position** : choisis **Before chat**, **After chat**, **@ Depth** ou **Outlet**. Before chat et After chat placent l'entrée autour de l'historique du chat. L'option **@ Depth** insère l'entrée à l'intérieur de l'historique du chat. L'option **Outlet** n'insère pas l'entrée automatiquement : elle met le contenu activé à disposition d'une macro nommée `{{outlet::name}}`. Sur un écran large, la ligne affiche les trois premières positions sous les étiquettes courtes **↑Char**, **↓Char** et **@Depth**.
- **Depth** (profondeur) : n'apparaît que si **Position** vaut **@ Depth**. Ce champ fixe le nombre de messages à remonter, depuis le dernier message, pour insérer l'entrée. La valeur par défaut est 4.
- **Order** (ordre) : l'ordre d'insertion quand plusieurs entrées s'activent en même temps. Un nombre plus petit arrive plus tôt dans le prompt. La valeur par défaut est 100.

Quand tu choisis **Outlet**, un champ **Outlet name** apparaît. Saisis un nom exact, sensible à la casse, par exemple `character_rules`, puis place `{{outlet::character_rules}}` dans une section de prompt. Chaque entrée affectée à cet outlet (un point d'insertion nommé) continue de suivre ses règles habituelles : mot-clé, constante, probabilité, filtre, déclenchement, limite d'entrées et budget de tokens. Seules les entrées activées pour la génération en cours sont récupérées. Les entrées qui partagent le même nom d'outlet sont réunies dans l'ordre défini par **Order**, séparées par des sauts de ligne.

Une macro outlet sans entrée active correspondante ne produit rien. Le contenu d'un outlet ne peut pas appeler une autre macro outlet, ce qui évite les boucles récursives. Les macros outlet fonctionnent dans les sections de prompt des modes Conversation, Roleplay et Game Mode.

## Probabilité de déclenchement

Chaque entrée possède une valeur **Probability** (probabilité), affichée en pourcentage sur la ligne. Par défaut, elle vaut 100 % : l'entrée part donc à chaque fois que ses clés correspondent. Baisse-la pour que l'entrée ne parte qu'une fois de temps en temps. Avec 25 %, par exemple, l'entrée a une chance sur quatre de s'activer à chaque correspondance de ses clés.

## Déclenchement : Sticky, Cooldown, Delay, Ephemeral

Les champs **Timing** du panneau latéral règlent le comportement d'une entrée sur plusieurs messages. **Sticky**, **Cooldown** et **Delay** se comptent en messages. **Ephemeral** compte des activations. Les quatre champs partent à 0, c'est-à-dire désactivés.

- **Sticky** : après son déclenchement, l'entrée reste active pendant ce nombre de messages supplémentaires, même sans nouvelle correspondance de mot-clé.
- **Cooldown** : après son déclenchement, l'entrée attend ce nombre de messages avant de pouvoir se déclencher à nouveau.
- **Delay** : l'entrée attend ce nombre de messages dans le chat avant de pouvoir s'activer une première fois.
- **Ephemeral** : l'entrée se désactive d'elle-même après ce nombre d'activations. La valeur 0 signifie illimité.

Par exemple, règle **Sticky** sur 3 pour garder un fait dans le prompt pendant quelques tours après son apparition. Ainsi, l'IA ne l'oublie pas en pleine scène.

## Autres options d'entrée

Le panneau latéral déplié contient encore quelques champs.

- **Role** (rôle) : définit si le texte inséré est étiqueté **System**, **User** ou **Assistant**. Ce réglage ne compte que si **Position** vaut **@ Depth**. La valeur par défaut est **System**.
- **Group** (groupe) et **Tag** : place des entrées dans le même **Group** pour qu'une seule d'entre elles s'active à la fois. Le champ **Tag** est une étiquette libre, pour ton propre classement.
- **Locked** (verrouillé) : empêche l'agent **Lorebook Keeper** de modifier cette entrée. Voir [Référence des agents téléchargeables](../agents/built-in-agents.md).
- L'option **No Vector** et le badge d'état de vectorisation concernent la recherche sémantique. Voir [La recherche sémantique pour les lorebooks](semantic-search.md).

Le panneau latéral comporte aussi une section **Context filters & matching sources** (filtres de contexte et sources analysées). Elle permet de limiter une entrée à certains personnages, à certains tags de personnage ou à certains types de génération. Tu peux aussi y analyser des champs supplémentaires de la fiche de personnage (la description du personnage, par exemple) à la recherche des mots-clés de l'entrée.

## L'outil Keyword test

Le panneau **Keyword test** (test de mots-clés), en haut de l'onglet **Entries**, sert à vérifier tes mots-clés sans démarrer un chat. Déplie-le et colle un paragraphe d'exemple ou quelques messages dans le champ.

Les entrées dont les clés correspondraient reçoivent un liseré vert et une pastille **Would activate**. Les entrées **Constant** reçoivent une pastille **Always active**, puisqu'elles partent quel que soit le texte. Une ligne de décompte indique combien de tes entrées activées se déclencheraient.

Ce test vérifie uniquement les règles de mots-clés. Il ignore le déclenchement, la probabilité, les filtres de personnage et la correspondance sémantique : un chat réel peut donc différer de l'aperçu.

## Les dossiers d'entrées

Les dossiers regroupent des entrées à l'intérieur d'un même lorebook. Ils sont distincts des dossiers de bibliothèque du panneau **Lorebooks** principal.

- Clique sur **Add Folder** pour en créer un, puis renomme-le sur place.
- Fais glisser une entrée sur un dossier pour l'y classer, ou utilise le sélecteur **Folder** de l'entrée.
- Fais glisser un dossier sur un autre dossier pour l'imbriquer, ou dépose-le sur la bande du haut pour le sortir de son parent.
- Chaque dossier possède un interrupteur **Enabled** (activé). Quand tu désactives un dossier, toutes les entrées qu'il contient cessent de s'activer, même si leur propre interrupteur est actif.
- L'en-tête d'un dossier propose aussi **Clone** (cloner) et **Delete**. **Clone** copie le dossier en profondeur, avec toutes ses entrées et ses sous-dossiers. **Delete** ne supprime que le dossier lui-même. Ses entrées et ses sous-dossiers remontent au niveau supérieur.

Les dossiers ne s'affichent comme des groupes que si tu tries par **Order** sans recherche active. Tout autre tri, ou une recherche, bascule la liste en mode plat et affiche la note "Folder view paused (clear search and sort by Order)".

## Guides associés

- [Vue d'ensemble des lorebooks](overview.md)
- [Budgets de tokens et récursivité des lorebooks](token-budgets.md)
- [La recherche sémantique pour les lorebooks](semantic-search.md)
- [Sources de connaissances : agents de récupération et de routage](../agents/knowledge-sources.md)
