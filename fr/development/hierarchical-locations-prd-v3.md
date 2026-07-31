# Cartes hiérarchiques et contexte spatial V3

Statut : proposé, prêt à implémenter après validation des mainteneurs

Public : produit, design et contributeurs de Marinara Engine

Remplace : `hierarchical-locations-prd-v2.md`

## Frontière d'architecture

Ce plan traite l'orientation spatiale comme une capacité produit ciblée, avec une frontière d'état étroite.

La fonctionnalité est un système de carte hiérarchique et d'orientation spatiale, pas un moteur de scénarios générique à la Voxta. Elle emprunte un seul motif utile à Voxta : un état persistant sélectionne un contexte de prompt réduit et pertinent. Au départ, elle n'ajoute ni drapeaux, ni variables, ni événements, ni scripts, ni minuteurs, ni modèle séparé d'inférence d'action.

Les modes propriétaires pris en charge sont Roleplay et Game.

Le plan comporte cinq couches ciblées :

| Couche | Responsabilité | Exemple |
| --- | --- | --- |
| Définition de carte | Vérité spatiale stable | La Bibliothèque est à l'intérieur de la Tour du Mage |
| État d'exécution | Le lieu de la scène en cours | La scène se déroule actuellement dans la Bibliothèque |
| Projection de prompt | Orientation bornée du modèle | Fil d'Ariane, mémoire courante, sorties accessibles |
| Identité visuelle | Références artistiques facultatives propres au lieu | La Bibliothèque garde ses arches, ses fenêtres et ses matériaux d'une scène à l'autre |
| Transition | Changement d'état validé | Aller de la Bibliothèque à l'Observatoire |

La machine à états est volontairement minimale :

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

Le déplacement manuel arrive en premier. Plus tard, un outil de modèle contraint comme `change_location({ destinationId })` pourra demander la même transition. C'est le serveur, et non le modèle, qui la valide et l'applique. Un appel séparé d'inférence d'action est reporté, sauf si des éléments ultérieurs montrent qu'il est nécessaire.

## Résumé

Ajouter une fonctionnalité de carte hiérarchique partagée entre Roleplay et Game. Elle fournit une hiérarchie de lieux définie par l'auteur, un lieu focal faisant autorité, un contexte de prompt borné pour le lieu courant, et un déplacement validé par le serveur.

Les lorebooks (recueils de faits sur ton univers) restent la source canonique des faits d'univers réutilisables. La hiérarchie peut référencer des entrées de lorebook existantes par identifiant stable : le lieu actif sélectionne ainsi le lore pertinent sans le copier ni le réécrire. La rédaction de carte par l'IA peut s'appuyer sur des lorebooks explicitement sélectionnés comme matériau source, et elle doit distinguer les lieux adossés à une source des ajouts déduits ou inventés.

Un lieu peut aussi posséder un kit d'identité visuelle facultatif : une courte ancre visuelle plus des références stables vers des images de la galerie de profil. Le lieu reste une entité spatiale, pas une image. Le profil de style d'image du chat pilote le rendu global, les références de lieu préservent le décor architectural, et les références de personnage ou de persona préservent les gens qui s'y trouvent.

Plus tard, une Conversation connectée pourra lire une projection sûre du lieu de l'histoire liée, mais elle ne possède ni ne modifie jamais l'état spatial.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

Ce n'est pas un moteur de scénarios générique. Il n'ajoute ni drapeaux, ni événements, ni JavaScript d'auteur, ni recherche de chemin. Il inclut en revanche un navigateur de carte visuel et imbriqué, avec des présentations en carte, en couches et en liste.

## Décisions produit

Ces décisions tranchent les questions restées ouvertes dans la V2 :

1. La définition de la hiérarchie et le lieu courant sont stockés séparément.
2. Le lieu courant fait l'objet d'un instantané avec l'état validé du message et du swipe (réponse alternative), pour que les branches, les régénérations et les points de contrôle restaurent la bonne position.
3. Le déplacement manuel est validé de façon atomique avec le tour utilisateur suivant du mode propriétaire, avant la génération du prompt.
4. Le contexte spatial fait autorité lorsqu'il est activé. Le lieu en texte libre historique de Game ne doit pas devenir une seconde source de vérité.
5. Roleplay et Game utilisent un seul contrat de projection spatiale partagé, avec de fins adaptateurs de prompt propres à chaque mode.
6. Le champ `awarenessSummary` est rédigé par l'auteur. En son absence, Conversation ne reçoit qu'un extrait borné de la description publique.
7. Conversation emploie une formulation à l'échelle de la scène, sauf si des données de présence faisant autorité prouvent que le personnage connecté est présent.
8. Les liens directs et le placement visuel des enfants font partie du MVP.
9. Les cartes en grille et en nœuds existantes de Game peuvent se lier explicitement à des lieux de la hiérarchie ; les noms ne sont jamais mis en correspondance automatiquement.
10. Les lorebooks détiennent les faits d'univers réutilisables et canoniques ; la carte détient l'identité spatiale, l'imbrication, la navigation et l'état du lieu courant. Les lieux de la carte référencent des entrées de lorebook par identifiant stable et ne copient jamais leur contenu.
11. Un rattachement de lieu est une source d'activation explicite, limitée au chat. Tant que ce lieu précis est le lieu courant, ses entrées activées peuvent s'activer sans correspondance de mot-clé, mais les lorebooks et entrées désactivés ou explicitement exclus restent désactivés.
12. La rédaction de carte adossée aux lorebooks suit l'interface d'exécution du mode propriétaire et précède la Conversation connectée. Quand des lorebooks sources sont sélectionnés, le brouillon doit montrer quels lieux sont adossés à une source, déduits ou inventés, plutôt que de présenter comme canon une géographie sans appui.
13. Un lieu n'est jamais remplacé par une image. Il peut référencer des ressources d'identité visuelle facultatives par identifiant d'image stable, avec une référence d'ambiance principale et des références secondaires bornées.
14. Les références visuelles d'un lieu n'alimentent que les chemins de génération d'images éligibles. La génération de texte, l'activation du lore et la Conversation connectée ne reçoivent jamais d'octets d'image ni de notes réservées aux images.
15. Storyboard consomme en aval le même résolveur visuel. Chaque storyboard fige un manifeste de références ancré à un message et à un swipe, pour qu'une régénération ultérieure n'adopte pas en silence des visuels de lieu ou de personnage plus récents.
16. Le déplacement demandé par le modèle reste une phase ultérieure.

## Périmètre

| Mode | Détient la hiérarchie | Déplace le lieu focal | Projection d'histoire | Projection connectée |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | Oui | Oui | Oui | S. O. |
| Game | Oui | Oui | Oui | S. O. |
| Conversation | Non | Non | Non | Phase ultérieure, lecture seule |

## Expérience utilisateur

### Création

La section **Chat Settings** (réglages du chat) affiche une section compacte **Spatial Context** (contexte spatial) avec :

- L'état d'activation
- Le fil d'Ariane courant
- Le nombre de lieux et d'avertissements
- L'action **Open Location Editor** (ouvrir l'éditeur de lieux)

L'éditeur est un espace de travail cartographique chargé à la demande, pas un formulaire de réglages étriqué :

- Sur ordinateur : un panneau de hiérarchie, une vue de carte locale ou de couches, et un panneau de détail du lieu.
- Sur mobile : un seul panneau à la fois, avec une navigation retour explicite.
- La validation s'affiche à côté du champ ou du nœud concerné.
- L'état d'enregistrement et les conflits de révision restent visibles en permanence.
- L'archivage est l'action de suppression principale ; la suppression définitive est restreinte.
- La sélection donne un aperçu du lieu. Une action **Enter** (entrer) distincte y navigue, pour qu'un clic ne signifie jamais à la fois inspecter, modifier et se déplacer.
- Chaque parent présente ses enfants sous forme de carte positionnée, de couches ordonnées ou de liste accessible.
- La duplication de sous-arbre permet la réutilisation par le créateur sans exiger de modèles inter-chats dans le MVP.
- Chaque lieu dispose d'une section progressive `Linked lore` qui recherche dans les entrées de lorebook existantes, signale les références désactivées ou manquantes, et propose Open entry et Detach sans copier ni supprimer de contenu de lore.
- Chaque lieu dispose d'une section progressive `Visual identity` avec une image principale, des références secondaires, des notes d'usage et des actions explicites de galerie, de téléversement ou de génération. Les images ne remplacent jamais le nom du lieu, son icône ni son libellé de navigation accessible.

### Rédaction adossée aux lorebooks

Le générateur de carte par IA propose un ancrage sur les lorebooks quand le chat propriétaire a des lorebooks sélectionnés ou actifs. Cet ancrage est explicite et inspectable, ce n'est pas une analyse de mots-clés ordinaire.

- La configuration de Game utilise comme sources de carte par défaut les lorebooks retenus à l'étape **Lorebooks**.
- Roleplay prend par défaut les lorebooks actifs du chat ouvert et laisse le créateur changer la sélection de sources dans le générateur de carte.
- `Strict canon` crée chaque nœud nommé à partir d'au moins une entrée de lore sélectionnée. Ce mode conserve plusieurs racines sourcées plutôt que d'inventer des lieux de liaison sans appui.
- `Canon with expansion` conserve les noms et relations sourcés, tout en autorisant des lieux déduits ou inventés, clairement étiquetés, pour combler les manques pratiques.
- `Setup only` conserve le comportement existant et s'appuie sur la configuration, l'aperçu du monde, l'arc narratif, le scénario et le contexte des personnages, sans ancrage sur les lorebooks.
- Quand des lorebooks sont sélectionnés, `Canon with expansion` est la valeur par défaut la plus abordable. Le générateur garde `Strict canon` à un clic pour les créateurs très attachés à leurs lorebooks.

Dans l'aperçu du brouillon, chaque nœud généré porte la mention `Lore-backed`, `Inferred` ou `Added by AI`. Les nœuds `Lore-backed` listent leurs entrées sources et proposent Open entry. Cette étiquette prouve qu'une référence de source valide existe, pas que le modèle a parfaitement interprété le texte : la relecture du créateur reste l'autorité sémantique. Apply ne modifie que la copie de travail locale, et Save reste la frontière de persistance.

### Identité visuelle du lieu et visuels de référence

Les images de lieu doivent améliorer la cohérence des scènes sans transformer la hiérarchie en galerie ni en seconde source de vérité spatiale.

- Un créateur peut téléverser une image, choisir une image existante de la galerie de profil, promouvoir une scène générée, ou générer une référence d'ambiance à partir du fil d'Ariane du lieu, de sa description publique, de son ancre visuelle, du lore lié et du profil de style d'image sélectionné.
- Rattacher une image de la galerie du chat, un arrière-plan Game généré ou une autre source temporaire crée d'abord une ressource durable dans la galerie de profil. La carte stocke l'identifiant d'image de galerie stable, jamais un chemin de fichier, une URL externe ou une charge utile base64.
- Une image `identity` peut être principale. Les images secondaires peuvent décrire un détail distinctif, une vue alternative, un plan d'aménagement ou un indice de style artistique transmissible.
- Les références `layout` restent des aides à l'édition, sauf si une demande spécialisée d'arrière-plan ou de plan les réclame explicitement. Elles ne sont pas envoyées automatiquement à une illustration de scène ordinaire, car elles peuvent déformer la composition.
- Seules les références `style` peuvent opter pour l'héritage vers les descendants. Les images d'identité et de détail s'appliquent au lieu exact : la silhouette d'une ville ne devient donc pas en silence l'identité visuelle de chaque pièce qu'elle contient.
- Les visuels de scène générés ne deviennent jamais canon automatiquement. `Set as location reference` est une action de relecture explicite, ce qui évite qu'une génération répétée n'amplifie des détails accidentels ou une dérive de style.
- L'inspecteur du lieu sélectionné affiche l'image principale et les rôles des références. Les vues denses de hiérarchie et de carte restent centrées sur les noms ; elles peuvent afficher une petite vignette quand la place le permet, mais la navigation ne dépend jamais de la reconnaissance d'une image.
- L'aperçu de génération d'images nomme chaque référence de lieu et de personnage résolue, son rôle, et toute référence omise en raison des limites du fournisseur. Il ne journalise ni n'affiche jamais de base64 brut dans les diagnostics.

La pile de cohérence visée est la suivante :

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs    -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

Un visuel de référence est une preuve visuelle, pas du lore automatique. Ajouter une image ne crée jamais de lieu, ne change pas l'imbrication et n'écrit aucun fait dans un lorebook. L'inférence d'une carte à partir d'images reste un flux de travail futur, relu séparément.

### Continuité des références dans Storyboard

Storyboard doit consommer les identités visuelles relues du tour GM terminé, sans rendre la fonctionnalité spatiale dépendante de Storyboard.

- La galerie de profil et les galeries d'entités forment une banque de références pouvant contenir plusieurs images relues pour un lieu, un personnage ou un persona. Une image-clé générée ne reçoit qu'une charge utile de références dimensionnée pour le fournisseur, sélectionnée dans cette banque.
- Créer un storyboard résout l'instantané spatial exact de son message et de son swipe source. Le dernier lieu du chat n'est jamais substitué à un tour antérieur.
- Le storyboard fige le lieu résolu, les identifiants d'images candidates ordonnés, les sélections par image-clé, les omissions et la capacité du fournisseur dans un manifeste de références visuelles. La régénération réutilise ce manifeste jusqu'à ce que le créateur choisisse explicitement `Refresh references`.
- Le même lieu principal candidat est disponible pour chaque image-clé. Les candidats personnage et persona varient selon la liste des personnages visibles de l'image, pour que les figurants hors champ ne consomment pas de créneaux de référence.
- La première version sélectionne automatiquement une image principale par entité représentée et au plus une image de lieu secondaire. Des banques plus riches restent utiles pour la sélection manuelle et pour un futur appariement d'angle, de tenue, d'expression ou de détail tenant compte du plan, mais Marinara n'envoie pas toutes les images stockées à chaque image.
- S'il ne reste qu'un seul créneau automatique, une image-clé avec des personnages visibles retient le personnage visible principal ; une image-clé d'ambiance sans personnage visible retient le lieu principal. À partir de deux créneaux, le lieu principal est retenu avant les références de personnages visibles supplémentaires.
- Un fournisseur à plus grande capacité n'ajoute pas en silence des références à un storyboard existant. Un fournisseur à capacité réduite produit un conflit `Review references` en ligne au lieu de modifier discrètement la charge utile figée.
- Chaque aperçu d'image-clé dispose d'un unique volet progressif `Visual sources` qui liste le lieu résolu, les personnages retenus, les rôles d'image, l'ordre et les raisons d'omission. `Refresh references` y est accessible sans ajouter de gestionnaire de ressources Storyboard distinct ni de fenêtre bloquante.
- Les images-clés générées ne deviennent jamais automatiquement des références de personnage ou de lieu. Les actions de promotion explicites existantes restent la seule frontière de persistance.

### Déplacement à l'exécution

Les surfaces de chat en mode propriétaire affichent :

- Le fil d'Ariane courant persisté
- Le sélecteur de destinations valides
- La destination en attente, clairement étiquetée

Choisir une destination ne change pas immédiatement l'état faisant autorité. L'envoi du message suivant transmet l'identifiant de destination et la révision attendue, séparément du texte visible du message. Le serveur valide le déplacement avant d'assembler le prompt de réponse.

En cas d'échec de la validation, le message et le déplacement ne sont pas validés partiellement. Le client conserve le brouillon et explique le conflit.

## Modèle de données

Les définitions relèvent des métadonnées du chat. La position d'exécution relève de l'historique des instantanés.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

Ne stocke pas `ownerChatId` dans `SpatialContextDefinition` : le chat conteneur est le propriétaire. Des identifiants opaques stables survivent aux renommages et aux changements de parent.

Le premier MVP propriétaire traite un champ `lorebookEntryIds` ou `visualReferences` absent comme un tableau vide, pour que des paquets ultérieurs puissent étendre la version 1 du schéma sans réécrire d'emblée les définitions existantes. Les références d'entrées et d'images sont uniquement des identifiants stables. Les noms de lorebooks, les noms d'entrées, les clés, le contenu, les chemins d'images et les octets d'images sont résolus au moment de l'usage et ne sont jamais copiés dans la définition spatiale. Le champ `imageId` se résout via la galerie de profil durable ; rattacher une image temporaire ou limitée au chat en promeut d'abord une copie durable.

## Règles du graphe

Les destinations valides sont actives :

- Les enfants du lieu courant
- Le parent du lieu courant
- Les cibles de liens directs
- Les cibles inverses des liens bidirectionnels

Les frères et sœurs ne sont pas automatiquement adjacents.

À rejeter :

- Les identifiants en double
- Les parents ou cibles de liens manquants
- L'auto-parentage ou les cycles de parents
- Plus de 500 lieux
- Une profondeur supérieure à 20
- Plus de 50 liens par lieu
- Plus de 50 références d'entrées de lorebook par lieu
- Les références d'entrées de lorebook en double sur un même lieu
- Plus de 6 références visuelles par lieu
- Les références d'images visuelles en double sur un même lieu
- Plus d'une référence visuelle principale, ou une référence principale dont le rôle n'est pas `identity`
- L'héritage aux descendants sur un rôle autre que `style`
- Des coordonnées de placement hors de la plage 0 à 100
- Un ordre de couches invalide ou en double au sein d'un parent de type couches
- Un déplacement vers un lieu archivé, masqué, bloqué ou inaccessible
- Les révisions obsolètes ou un lieu courant modifié
- La réutilisation d'identifiants de commande avec un contenu différent
- Les tentatives de mutation depuis Conversation

Limites de texte :

- Nom : 200 caractères
- Description : 4 000 caractères
- Résumé de perception : 1 000 caractères
- Mémoire privée du modèle : 8 000 caractères
- Identité visuelle : 800 caractères
- Note d'usage d'une référence visuelle : 300 caractères

Les cycles de liens directs sont valides. Les cycles de parents ne le sont pas.

### Archivage et suppression

- Le lieu courant ou le lieu de départ exige un remplacement atomique avant l'archivage.
- Un lieu ayant des enfants actifs ne peut pas être archivé.
- La suppression définitive n'est autorisée que pour une feuille archivée sans lien entrant.
- Les descendants ne changent jamais de parent en silence.
- Les références de lorebook manquantes apparaissent comme des avertissements, pas comme une corruption du graphe.
- Archiver ou supprimer un lieu ne supprime jamais les entrées de lorebook qu'il référence.
- Supprimer un lorebook ou une entrée ne réécrit jamais la carte en silence. Le lieu conserve une référence cassée réparable jusqu'à ce que le créateur la détache ou la remplace.
- Archiver ou supprimer un lieu ne supprime jamais une image partagée de la galerie de profil.
- La suppression d'une image de galerie encore référencée par un lieu ou par un manifeste Storyboard figé est bloquée jusqu'à ce que le créateur la détache ou actualise tous les manifestes dépendants. Les références d'images manquantes restent des avertissements réparables et ne se transforment jamais en repli sur un chemin brut.

## Persistance et historique

### Définitions

Stocke `SpatialContextDefinition` dans `chat.metadata.spatialContext`. Les mises à jour de définition exigent `expectedRevision` ; celles qui sont acceptées incrémentent la révision.

### Position d'exécution

Stocke la position courante à l'aide d'instantanés adressables par message et par swipe, en suivant le motif existant des instantanés de Game State.

- Les nouveaux chats propriétaires démarrent au lieu `startingLocationId`.
- Un tour validé crée un instantané après tout déplacement accepté.
- La régénération associe la position au swipe obtenu.
- Changer de swipe résout l'instantané correspondant.
- Créer une branche à un message copie l'instantané en vigueur à cet endroit, pas la dernière position du chat source.
- Les points de contrôle de Game référencent ou incluent l'instantané spatial applicable.
- Un rechargement résout le dernier instantané validé.

Dans le MVP, la modification des définitions n'est pas rembobinée par une simple création de branche sur un message. Une branche reçoit une copie de la définition courante, avec son propre historique de révisions à venir. Sa position d'exécution provient du point de branchement.

## Projections de prompt

Un service de projection partagé côté serveur résout des données de projection structurées. De fins adaptateurs de mode les transforment en texte de prompt final.

### Projection d'histoire côté propriétaire

À inclure :

- Les noms du fil d'Ariane
- L'identifiant du lieu courant
- La description publique
- La mémoire privée du modèle pour le lieu courant
- Les noms, identifiants et libellés de liens des destinations disponibles
- Une instruction précisant que cet état fait autorité

À exclure : toutes les descriptions et mémoires de lieux sans rapport, les destinations masquées ou bloquées, les coordonnées de canevas et les métadonnées d'éditeur.

### Activation du lore du lieu courant

Le résolveur spatial du mode propriétaire renvoie le champ `lorebookEntryIds` du lieu courant exact, à côté de la projection spatiale habituelle. Le formateur ne colle ni ces identifiants ni le contenu des entrées dans le bloc spatial. À la place, l'assemblage du prompt transmet les identifiants au processeur de lorebooks existant, comme candidats forcés avec la source d'activation `current_location`.

Règles :

- Dans la première version, seul le lieu courant exact active le lore rattaché. Les parents et les descendants n'héritent pas implicitement des entrées.
- Un rattachement de lieu explicite peut activer une entrée activée même si son lorebook n'est par ailleurs ni global, ni lié à un personnage, ni lié à un persona, ni épinglé au chat.
- Un lorebook désactivé globalement, une entrée désactivée ou une exclusion explicite au niveau du chat l'emportent toujours sur le rattachement.
- Les macros de lorebook existantes, les positions d'insertion, la récursivité, l'ordre et les limites de tokens et d'entrées par lorebook sont réutilisés.
- Le lore rattaché à un lieu dispose en plus d'un plafond réservé total de 2 048 tokens par prompt propriétaire. La troncature est déterministe et apparaît dans **Active Context** (contexte actif).
- Une entrée activée à la fois par le lieu et par les règles ordinaires de mot-clé, sémantiques, récursives ou constantes est insérée une seule fois et signale toutes ses sources d'activation.
- Un déplacement validé résout les entrées de la destination avant l'assemblage du prompt de réponse propriétaire. Un déplacement en attente ou rejeté ne change pas l'activation du lore.
- La formulation de Game traite le lieu comme la position faisant autorité de l'équipe. Celle de Roleplay le traite comme la scène focale et n'en déduit pas que tous les personnages sont présents.

L'interface **Active Context** regroupe ces entrées sous `Current location`, affiche le lorebook propriétaire, les sources d'activation, la consommation de tokens ou la troncature, et propose Open entry. Les références cassées, désactivées et exclues restent visibles dans l'éditeur de carte mais n'entrent jamais dans le prompt.

### Projection pour la Conversation connectée

Ajoutée en phase 3. À inclure uniquement :

- Le nom et le mode de l'histoire liée
- Le fil d'Ariane
- Le champ `awarenessSummary`, ou un extrait borné de la description publique
- Une instruction de lecture seule
- La présence d'un personnage, uniquement quand un état faisant autorité la prouve

Ne jamais inclure : la mémoire privée du modèle, les identifiants internes, les destinations masquées, la hiérarchie complète, les identifiants ou contenus de lorebook rattachés au lieu, les identifiants de références visuelles du lieu, les notes d'identité visuelle, les notes d'usage, les chemins d'images ou les octets d'images.

Game peut prouver la présence via son état validé `presentCharacters`. Roleplay emploie une formulation neutre du type "The linked story's current scene is..." tant qu'il ne dispose pas d'une source de présence explicite. Ne jamais déduire la présence à partir d'un nom de personnage.

### Chemins de prompt obligatoires

Le même résolveur de projection doit alimenter :

- La génération Roleplay
- La génération GM de Game
- L'aperçu à blanc
- L'assemblage en direct de **Peek Prompt** (aperçu du prompt)

Le **Peek Prompt** mis en cache continue d'afficher le prompt exact envoyé à l'origine. Les logs de débogage incluent la projection finale, mais ne doivent pas journaliser la mémoire privée du modèle aux niveaux ordinaires.

### Projection visuelle du lieu courant pour la génération d'images

Les références visuelles utilisent un résolveur distinct de celui du prompt d'histoire. Il résout l'instantané spatial applicable à la cible de l'image, et pas seulement le dernier lieu du chat. Les visuels automatiques de Game utilisent l'instantané validé pour le message d'assistant concerné. Relancer un visuel pour un swipe antérieur ou invoquer Illustrator depuis un message antérieur utilise le lieu résolu pour ce message et ce swipe.

Les chemins éligibles sont les visuels de scène automatiques de Game, l'illustration de scène manuelle de Game, et la génération de scène ou d'arrière-plan par Illustrator en Roleplay quand le réglage par chat des références de lieu est activé. La génération de portraits, de selfies, d'avatars et de sprites ne rattache pas automatiquement de références de lieu.

Deux réglages dans les métadonnées du chat reprennent le fonctionnement des réglages de référence d'avatar existants : `illustratorUseLocationReferences` et `gameImageUseLocationReferences`. Absents ou à `false`, ils restent désactivés, par compatibilité ascendante. Quand le créateur définit la première image principale d'un lieu, le même flux d'enregistrement propose `Use this location in scene art`, coché par défaut mais explicite : ainsi, des octets d'image ne partent jamais chez un fournisseur au seul motif qu'une image est affichée dans l'éditeur de carte.

L'ordre des candidats est déterministe et tient compte du fournisseur :

1. Les références explicites choisies pour cette demande d'image.
2. La référence `identity` principale du lieu exact résolu.
3. Les personnages référencés et le persona, dans l'ordre de la scène.
4. Les références `identity` et `detail` secondaires du lieu exact, selon `sortOrder`.
5. La référence `style` héritable de l'ancêtre le plus proche.

Aucun repli sur un frère ou sur un nom n'est autorisé. Deux images de lieu au maximum sont candidates pour une demande de scène ordinaire, et l'adaptateur de fournisseur existant applique sa limite totale d'images. Les références explicitement demandées consomment toujours les premiers créneaux. Pour les créneaux automatiques restants, une demande d'arrière-plan privilégie l'identité du lieu par rapport aux références de personnages, tandis qu'une illustration retient la référence principale du lieu avant des références de personnes représentées supplémentaires. Si un fournisseur ne peut accepter à la fois le lieu et toutes les personnes demandées, l'aperçu indique l'arbitrage déterministe retenu et chaque raison d'omission.

Le compilateur de prompt d'image ajoute le fil d'Ariane du lieu, le champ `visualIdentity` borné et le champ `usageNote` borné de chaque référence retenue. Le profil `ImageStyleProfile` sélectionné pour le chat reste l'autorité en matière de style. Les images de référence préservent l'identité du lieu ou du sujet et ne doivent jamais remplacer en silence le texte de style du profil, ses tags positifs, ses tags négatifs ou son mode de prompt.

Les rôles de référence expriment l'intention du créateur et une priorité de sélection ; ils ne garantissent pas que chaque fournisseur interprétera une image comme identité, détail, plan ou style. Les notes sur les capacités des fournisseurs et l'aperçu généré laissent le créateur maître du rendu visuel.

Les requêtes vers un modèle de texte ne reçoivent aucun de ces octets d'image ni les notes d'usage réservées aux images. La Conversation connectée ne reçoit ni les identifiants de références visuelles ni leur contenu. Les logs de débogage d'images peuvent contenir des identifiants d'images, des identifiants de lieux, des rôles, des raisons de sélection et des omissions, mais jamais de base64 ni de chemins du système de fichiers.

### Manifestes de références visuelles de Storyboard

L'adaptateur Storyboard résout les candidats visuels une seule fois pour le tour GM terminé, après validation de son message et de son swipe. Il stocke une banque figée et la charge utile dimensionnée pour le fournisseur, retenue pour chaque image-clé. Cela sépare l'identité durable des références d'une requête fournisseur qui n'en acceptera parfois qu'un petit sous-ensemble.

La sélection est déterministe :

1. Les références explicites d'une image-clé consomment les premiers créneaux.
2. S'il reste un seul créneau automatique, une image d'ambiance retient le lieu principal et une image comportant des personnages visibles retient le personnage visible principal.
3. S'il reste deux créneaux automatiques ou plus, retenir le lieu exact principal, puis une référence principale pour chaque personnage ou persona visible, dans l'ordre du récit.
4. Employer la capacité restante pour une identité ou un détail secondaire du lieu exact, puis pour des références d'entités représentées secondaires, puis pour le style de lieu héritable le plus proche.

Storyboard ne crée jamais implicitement de planche-contact ni de référence composite. Ces techniques peuvent modifier l'interprétation du fournisseur et restent une optimisation future propre à chaque fournisseur. Une image manquante, un changement de fournisseur ou une limite de fournisseur réduite font passer le manifeste en `needs_review` ; il ne choisit pas en silence une autre entité. Une capacité accrue préserve elle aussi la charge utile figée jusqu'à confirmation de `Refresh references`.

Le manifeste stocke les identifiants, les libellés, les rôles, l'ordre, les raisons de sélection, les omissions, le message et le swipe source, l'identifiant du lieu résolu, la révision de définition, l'identité du fournisseur et la limite de références employée. Il ne stocke ni octets d'image, ni chemins du système de fichiers. La sortie de débogage peut décrire ce manifeste, mais suit les mêmes règles d'interdiction du base64 et des chemins que la génération d'images ordinaire.

## Compatibilité avec Game

Les cartes en grille et en nœuds existantes de Game restent des représentations locales ou tactiques. La hiérarchie devient la couche de monde et d'imbrication au-dessus d'elles.

Quand le contexte spatial est activé :

- Le contexte spatial fournit aux prompts le lieu nommé faisant autorité.
- Le tracker de Game affiche le fil d'Ariane spatial comme lieu.
- Les correctifs historiques du modèle ou manuels ne peuvent plus changer indépendamment le lieu en texte libre de Game.
- Le champ `GameMap.spatialLocationId` peut lier une carte entière à un lieu de la hiérarchie.
- Les champs `GridCell.spatialLocationId` et `MapNode.spatialLocationId` peuvent lier une destination accessible.
- Les liaisons n'utilisent que des identifiants stables ; les noms ne sont jamais mis en correspondance automatiquement.
- Choisir une destination liée crée la même transition en attente que le navigateur de hiérarchie.
- Se déplacer entre des cellules ou des nœuds non liés ne change que la position tactique de l'équipe.
- Entrer dans un lieu peut sélectionner sa carte locale liée ; en sortir peut sélectionner la carte de l'ancêtre lié le plus proche.

Quand il est désactivé, le comportement existant du lieu de Game reste inchangé.

Cette frontière préserve l'interface de carte et les sauvegardes actuelles, tout en empêchant l'existence de deux sources de vérité spatiale nommée.

## Forme de l'API

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

Mise à jour de définition :

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

Le champ `replacementCurrentLocationId` ne sert que lorsqu'une modification de définition archive le lieu courant effectif. Le serveur doit valider et appliquer ce remplacement dans la même écriture que la révision de définition. Le déplacement ordinaire passe toujours par la soumission du tour en mode propriétaire.

Le déplacement en attente est soumis via la requête de tour existante du mode propriétaire, et non par un point d'entrée séparé de transition immédiate.

Le serveur valide l'intégrité de la définition, le mode propriétaire, la révision attendue, le lieu courant attendu, l'accessibilité et l'idempotence de la commande, dans la même transaction que la soumission du message.

Renvoie `409 Conflict` pour un état obsolète et `400 Bad Request` pour un graphe ou une destination invalides. Les erreurs ne doivent pas révéler les destinations masquées.

## Plan d'implémentation

### Phase 0 : socle partagé et fixtures de démonstration

- Ajouter les types partagés et les schémas Zod.
- Ajouter la validation de graphe pure, le fil d'Ariane et les utilitaires de destinations.
- Ajouter des fixtures déterministes pour les graphes valides et invalides.
- Confirmer les points d'intégration des instantanés message/swipe pour Roleplay et Game.
- Mesurer des projections de prompt représentatives.

Condition de sortie : le schéma, la sémantique de déplacement et le comportement des instantanés sont démontrés sans interface.

### Phase 1 : MVP propriétaire

1. Ajouter la persistance des définitions avec concurrence optimiste.
2. Ajouter le stockage et la résolution des instantanés spatiaux.
3. Intégrer le déplacement en attente atomique à la soumission du tour en mode propriétaire.
4. Gérer le rechargement, les swipes, les branches et les points de contrôle de Game.
5. Ajouter le service de projection partagé à chaque chemin de prompt obligatoire.
6. Ajouter la section de réglages compacte, le navigateur de hiérarchie, le canevas de carte locale, le sélecteur de couches et l'espace de travail d'édition.
7. Ajouter le fil d'Ariane, le sélecteur de destinations, l'aperçu et l'état en attente aux surfaces propriétaires.
8. Lier les cartes, cellules et nœuds Game existants par des identifiants de lieu stables.
9. Réconcilier le lieu du tracker de Game lorsque la fonctionnalité est activée.

Condition de sortie : Roleplay et Game peuvent créer, déplacer, persister, restaurer et alimenter le prompt à partir du même modèle spatial. Le déplacement sur carte Game liée et le déplacement tactique non lié restent distincts.

### Phase 2A : liaisons lorebook des lieux et exécution

- Ajouter `lorebookEntryIds` aux lieux, avec un tableau vide comme valeur de compatibilité par défaut.
- Ajouter à l'éditeur de lieux les états et actions en ligne de rattachement, d'ouverture, de détachement, ainsi que les états désactivé, exclu et référence cassée.
- Résoudre les références du lieu courant exact comme candidats forcés dans le processeur de lorebooks existant.
- Réutiliser les macros, l'insertion, la récursivité, l'ordre et les limites par lorebook habituels ; ajouter une déduplication déterministe et un plafond total de 2 048 tokens pour le lore de lieu.
- Signaler `current_location` à côté de toute source d'activation par mot-clé, sémantique, récursive ou constante dans **Active Context**.
- Démontrer un comportement identique en Roleplay et en Game, y compris pour le déplacement, le rechargement, la régénération, les swipes et les branches.
- Démontrer que la Conversation connectée ne reçoit ni les identifiants ni le contenu du lore de lieu.

Condition de sortie : les créateurs peuvent lier explicitement du lore existant à des lieux, et seul le lieu courant accepté active ces entrées dans les prompts propriétaires.

### Phase 2B : rédaction de carte adossée aux lorebooks

- Étendre les requêtes de création, de remplacement et d'extension sans risque pour l'historique avec un mode d'ancrage et une sélection explicite de lorebooks ou d'entrées sources.
- Lire directement les entrées de lore sélectionnées et activées pour cette opération de création, au lieu de dépendre d'une activation par mot-clé ou de l'aperçu du monde généré.
- Construire un catalogue de sources borné, conscient de la connexion, avec des compteurs d'omissions visibles et un ordre déterministe.
- Donner au modèle des clés de source temporaires, valider côté serveur chaque clé renvoyée, et ne persister que des identifiants d'entrées stables.
- Prendre en charge les comportements `setup_only`, `lore_strict` et `lore_expand`, avec la provenance affichée dans l'aperçu.
- Lier automatiquement les entrées sources valides aux lieux générés, tout en gardant Apply et Save comme deux frontières de relecture distinctes.
- Préserver chaque identifiant de lieu et chaque liaison de lore existants pendant une extension en ajout seul.

Condition de sortie : un créateur familier des lorebooks peut générer une carte ancrée directement dans le canon sélectionné, repérer chaque ajout sans appui, et le refuser ou le modifier avant la persistance.

### Phase 2C : identité visuelle des lieux et références de scène

- Ajouter les champs bornés `visualIdentity` et `visualReferences`, avec des valeurs de compatibilité vides par défaut.
- Réutiliser les identifiants durables d'images de la galerie de profil et les chemins existants et sécurisés de téléversement, de métadonnées et de génération d'images. Ne jamais persister de chemins bruts, d'URL externes ou de base64 dans la définition.
- Ajouter les réglages parallèles par chat pour Illustrator et pour les références de lieu de Game. Le flux d'enregistrement de la première image principale obtient un consentement explicite avant d'autoriser l'envoi au fournisseur.
- Générer une référence d'ambiance uniquement à partir du contexte borné du lieu exact et du lore rattaché activé. Ne pas parcourir de lorebooks ni de branches de hiérarchie sans rapport.
- Ajouter à l'éditeur de lieux les états en ligne : principale, secondaire, rôle, note d'usage, sélection en galerie, téléversement, génération, détachement, référence cassée et rétroliens.
- Résoudre le lieu exact du message et du swipe pour les demandes de visuels de scène éligibles en Game et en Roleplay, puis fusionner les références de lieu, de personnage, de persona et explicites dans les limites propres au fournisseur.
- Ajouter la promotion explicite `Set as location reference` pour les visuels générés. Ne jamais promouvoir automatiquement une scène générée.
- Préserver les identifiants de références visuelles à travers les branches et l'export de métadonnées JSONL, avertir en cas de ressources manquantes à destination, et inclure ces ressources dans la sauvegarde et la restauration du profil.
- Démontrer que les prompts d'histoire et la Conversation connectée ne reçoivent ni identifiants d'images de lieu, ni octets, ni chemins, ni notes réservées aux images.

Condition de sortie : un créateur peut établir visuellement un lieu, générer plusieurs scènes qui réutilisent son identité relue, voir exactement quelles références visuelles ont été envoyées, et retirer ou remplacer ces références sans modifier la vérité spatiale ou le lore.

### Phase 2D : manifestes de références visuelles de Storyboard

- Ajouter un adaptateur Storyboard en aval, autour du résolveur visuel de la phase 2C, plutôt que de coupler la persistance spatiale à Storyboard.
- Résoudre l'instantané spatial du message et du swipe source, puis figer la banque de références de lieu et d'entités ainsi que les charges utiles fournisseur par image-clé.
- Réutiliser la référence principale du lieu exact d'une image-clé à l'autre quand la capacité le permet, tout en retenant les références de personnage et de persona dans la liste des personnages visibles de chaque image.
- Persister l'identité du fournisseur, la capacité de références, les sélections ordonnées et les raisons d'omission pour rendre la régénération reproductible.
- Ajouter les états en ligne `Visual sources`, `Review references` et `Refresh references` explicite à l'aperçu et à la régénération de Storyboard.
- Refuser toute resélection silencieuse quand une image manque ou que la capacité du fournisseur diminue. Ne pas remplir automatiquement une capacité nouvellement disponible.
- Préserver le manifeste tout au long du cycle de vie Storyboard existant, et démontrer que la conversion image-clé vers vidéo continue de n'utiliser que l'image-clé rendue comme première image.

Condition de sortie : chaque image-clé de Storyboard peut expliquer et reproduire ses entrées visuelles, les images répétées partagent la bonne identité de lieu historique, et les limites du fournisseur ne changent jamais en silence le lieu ni les personnes représentées.

### Phase 3 : Conversation connectée

- Résoudre le dernier état propriétaire via `connectedChatId` au moment de la génération.
- Ajouter une projection bornée en lecture seule.
- Employer une formulation prudente sur la présence.
- Exclure les identifiants et le contenu du lore rattaché aux lieux, les identifiants et métadonnées de références visuelles, les chemins d'images et les octets d'images, même quand la génération en mode propriétaire les utilise.
- Couvrir la dissociation, la réassociation, un propriétaire supprimé, des liens malformés, des histoires conclues et les contrôles négatifs sur le lore de lieu.

### Phase 4 : déplacement demandé par le modèle

- Ajouter une requête typée `change_location` pour les modes propriétaires.
- Appliquer la même validation de révision, d'accessibilité et d'idempotence.
- Consigner les requêtes acceptées et rejetées dans les diagnostics de débogage.
- Conversation reste incapable de demander une transition.

### Phase 5 : modèles pour créateurs

- Enregistrer et importer des sous-arbres de lieux réutilisables ou des cartes complètes.
- Permettre aux créateurs de livrer des cartes de départ avec leurs personnages, une fois la propriété et le comportement de fusion spécifiés.
- Préserver les références internes tout en générant de nouveaux identifiants lors d'une copie vers un autre chat.

## Plan d'implémentation dans le dépôt

Base de planification : la branche `hierarchical-locations` après fusion de `staging` au commit `4fd752ea`, le 13/07/2026. À cette base, la branche ne contient que les documents de planification V1, V2 et V3. Aucun code d'exécution du contexte spatial n'existe encore.

### Contraintes d'intégration confirmées

| Sujet | Comportement actuel du dépôt | Conséquence pour l'implémentation |
| --- | --- | --- |
| Stockage des définitions | Les métadonnées de chat sont en JSON et les mises à jour génériques de métadonnées sont des fusions partielles. | Les définitions spatiales restent dans `chat.metadata.spatialContext`, mais passent par un point d'entrée dédié et validé, et non par la route générique de correctif des métadonnées. |
| Historique d'exécution | La table `game_state_snapshots` est le seul historique d'état du monde adressable par message et par swipe. | Ajouter une table d'instantanés spatiaux neutre vis-à-vis du mode. Ne pas ajouter de colonnes de contexte spatial aux instantanés propres à Game. |
| Début du tour propriétaire | La route `/api/generate` valide l'état visible de Game, crée le message utilisateur, puis met à jour les pièces jointes et les données de persona par des appels séparés. | Ajouter un petit service de tour propriétaire lié à une transaction, pour que la création du message utilisateur et un déplacement spatial accepté réussissent ou échouent ensemble. Garder les appels au fournisseur hors de la transaction. |
| Swipes et branches | La suppression d'un swipe décale les index des instantanés Game. La création d'une branche copie tous les instantanés Game et de tour vers de nouveaux identifiants de messages. | Les instantanés spatiaux doivent participer aux deux chemins et doivent copier l'instantané en vigueur au point de branchement antérieur. |
| Assemblage du prompt | La génération en direct, l'exécution à blanc, le **Peek Prompt** en direct, le **Peek Prompt** mis en cache et les prompts GM de Game ont des chemins d'assemblage distincts. | Résoudre une seule fois les données spatiales structurées, puis appeler un formateur/injecteur partagé depuis chaque chemin en direct. Le **Peek Prompt** mis en cache continue de lire la requête fournisseur enregistrée telle quelle. |
| Données côté client | Les données du serveur passent par React Query. Les brouillons de saisie par chat survivent à la navigation et au rechargement. Les éditeurs lourds sont chargés à la demande via `AppShell`. | Ajouter un hook dédié de requête/mutation, persister les transitions en attente à côté des brouillons par chat, et faire passer un éditeur de lieux chargé à la demande par le modèle de vue de détail existant. |
| Déplacement dans Game | Les cartes de Game disposent déjà de positions en grille et en nœuds, plus d'un déplacement de carte en attente qui devient un texte visible `*moves to ...*`. | Ajouter des liaisons facultatives par identifiant stable. Les destinations liées utilisent des requêtes spatiales structurées sans prose visible ; le déplacement non lié conserve le flux tactique existant. |
| Stockage | Les instantanés en mode fichier natif sont le seul moteur de persistance. De petites transactions sont utilisées, tandis que les grandes boucles transactionnelles sont évitées pour garder des écritures réactives. | Garder la transaction de tour propriétaire de taille constante et la valider face au stockage fichier natif avant d'étendre la fonctionnalité. |
| Traitement des lorebooks | L'activation des lorebooks prend déjà en charge les identifiants de chat explicites, la correspondance par mot-clé et sémantique, les macros, la récursivité, l'ordre et les marqueurs de prompt. La configuration initiale de Game analyse sans aucun message de chat, si bien que les entrées à mots-clés ordinaires n'ancrent pas directement le brouillon de carte ultérieur. | Ajouter des candidats forcés pour le lieu courant au processeur de lorebooks partagé, et donner à la rédaction de carte un chemin de catalogue de sources séparé, explicite et borné. Ne pas déduire le canon de la carte du seul aperçu du monde. |
| Cohérence des images | Les profils de style d'image pilotent le style du prompt, les avatars de personnage et de persona peuvent déjà être envoyés comme références, et les fournisseurs acceptent des nombres maximum de références différents. Les galeries stockent des identifiants d'images stables, séparés des chemins de fichiers. | Garder l'identité du lieu distincte du style global et de l'identité des personnages. Résoudre l'instantané spatial applicable, ne rattacher des images de galerie stables qu'aux demandes de visuels de scène éligibles, et élaguer les candidats de façon déterministe via les adaptateurs de fournisseur existants. |
| Références de Storyboard | Storyboard planifie déjà les personnages visibles par image-clé, résout les limites de références propres au fournisseur, envoie les images de personnage à l'aperçu et au rendu, stocke son message et son swipe source, et utilise chaque image-clé rendue comme première image de la vidéo. | Ajouter un manifeste de références visuelles figé qui résout une fois le lieu historique, fait varier les personnages par image-clé, et préserve les sélections ordonnées d'une régénération à l'autre. Laisser l'entrée image vers vidéo inchangée. |

### Carte des modules cibles

Nouveaux modules partagés :

- `packages/shared/src/types/spatial-context.ts` : types publics de définition, d'instantané, de transition, de projection, de réponse, d'avertissement et de code d'erreur.
- `packages/shared/src/schemas/spatial-context.schema.ts` : schémas Zod et toutes les limites de stockage et de requête.
- `packages/shared/src/utils/spatial-context.ts` : indexation de graphe pure, validation, fil d'Ariane, accessibilité, contrôles d'archivage et tri déterministe des destinations.
- `packages/shared/src/index.ts` : exports explicites du nouveau contrat partagé.

Nouveaux modules serveur :

- `packages/server/src/db/schema/spatial-context.ts` : schéma `spatial_context_snapshots`.
- `packages/server/src/services/storage/spatial-context.storage.ts` : lectures et écritures d'instantanés, copies de branche, décalages de swipes, recherche de commandes et nettoyage.
- `packages/server/src/services/spatial-context/state-resolution.ts` : résolution de l'instantané effectif pour l'amorçage, le swipe visible, la régénération, le branchement et les points de contrôle.
- `packages/server/src/services/spatial-context/projection.ts` : projections structurées propriétaire et connectée, plus mise en forme de texte bornée.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts` : sélection visuelle du lieu tenant compte de l'instantané, héritage, candidats fournisseur et diagnostics sûrs.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts` : banques Storyboard figées, sélection de charge utile par image-clé, revue de capacité fournisseur, actualisation et sérialisation sûre.
- `packages/server/src/services/spatial-context/owner-turn.ts` : validation et déplacement atomique de taille constante, plus validation du message utilisateur.
- `packages/server/src/services/spatial-context/game-map-binding.ts` : projection du fil d'Ariane faisant autorité, plus résolution explicite des liaisons de carte, de cellule et de nœud Game.
- `packages/server/src/routes/spatial-context.routes.ts` : routes GET dédiée et PUT versionnée.

Nouveaux modules client :

- `packages/client/src/hooks/use-spatial-context.ts` : clés de requête, GET, PUT de définition, gestion des conflits et invalidation du cache.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx` : résumé compact dans **Chat Settings** et action d'ouverture de l'éditeur.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx` : coquille d'éditeur pleine page chargée à la demande.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx` : navigation dans la hiérarchie et interactions clavier.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx` : carte positionnée des lieux enfants.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx` : couches ordonnées d'étages, de tours et de donjons.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx` : édition des champs, aperçu, liens, contrôles d'archivage et validation en ligne.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx` : fil d'Ariane, sélecteur de destinations, état en attente et action d'effacement.
- `packages/client/src/features/spatial-context/lib/editor-state.ts` : opérations sur la copie de travail et mise en correspondance des erreurs serveur. Ce module reste local au client et n'est pas exporté via un baril.

Fichiers d'intégration existants susceptibles de changer :

- Persistance : `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts` et `packages/server/src/routes/backup.routes.ts` là où l'enregistrement de la table l'exige.
- Cycle de vie du chat : `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts` et `packages/shared/src/schemas/chat.schema.ts`.
- Chemins de prompt : `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts` et la partie aperçu en direct de `packages/server/src/routes/chats.routes.ts`.
- Ancrage et activation des lorebooks : `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, l'éditeur de lorebooks et l'interface **Active Context**.
- Visuels de référence des lieux : `packages/server/src/db/schema/gallery.ts`, le stockage et les routes de la galerie, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, l'illustration Game et l'assemblage Storyboard dans `packages/server/src/routes/game.routes.ts`, `packages/server/src/services/storage/game-storyboards.storage.ts`, les contrats de prompt Storyboard partagés, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, ainsi que les interfaces de génération d'images et d'aperçu Storyboard.
- Routage client et chemins d'envoi : `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx` et `packages/client/src/components/game/GameInput.tsx`.
- Portabilité et démonstration : le code d'import/export natif des chats dans `packages/server/src/routes/chats.routes.ts` et `packages/server/src/services/import/`, `scripts/regressions/`, `e2e/core-flows.e2e.ts`, ainsi que les scripts du fichier `package.json` racine.

Cette liste de fichiers délimite un périmètre ; elle n'oblige pas à modifier chaque fichier dans une seule pull request. Chaque lot de travail ci-dessous doit garder un diff ciblé.

### Contrat de persistance

Les définitions restent à l'intérieur des métadonnées du chat et sont copiées automatiquement quand une branche copie ces métadonnées. L'état d'exécution utilise une table séparée :

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

Index et invariants requis :

- Une seule ligne effective par `(chatId, messageId, swipeIndex)`.
- Un identifiant de commande de transition est unique au sein de son chat lorsqu'il n'est pas nul.
- Un identifiant de commande répété avec une destination, une révision attendue ou un lieu courant attendu différents renvoie `409 spatial_transition_command_mismatch`.
- Un identifiant de commande répété avec la même charge utile renvoie `409 spatial_transition_already_applied`, inclut l'instantané validé et l'identifiant du message utilisateur, et n'effectue aucune seconde écriture. Le client se réconcilie à partir de la réponse au lieu de renvoyer le tour.
- Les lignes d'instantané utilisent des identifiants de lieu stables. Les renommages et les changements de parent ne réécrivent pas les instantanés.
- Une ligne d'amorçage utilise `messageId: ""` et le swipe `0` jusqu'à ce qu'un ancrage de message validé existe.
- Supprimer un chat, un message ou un swipe retire ou décale les lignes spatiales correspondantes, aux mêmes endroits que ceux qui maintiennent aujourd'hui les instantanés Game et de tour.

La nouvelle table doit être enregistrée dans les définitions de tables fichier, la liste des tables adossées à des fichiers, le graphe de cascade, la sauvegarde/restauration de profil et les métadonnées d'intégrité de la base Mari. Le comportement de recherche doit être couvert par des régressions en mode fichier natif.

### Règles d'état effectif et d'historique

Utilise un seul résolveur pour les API, les prompts, le branchement et la réponse au client :

1. Si un message et un swipe précis sont demandés, renvoyer cet instantané spatial.
2. Pour la vue courante, examiner le dernier message d'assistant visible et son swipe actif.
3. Si ce swipe d'assistant n'a pas de ligne, remonter jusqu'à l'instantané de tour utilisateur ou d'assistant le plus proche, dans l'ordre des messages visibles.
4. Se rabattre sur la ligne d'amorçage.
5. Si aucun instantané n'existe et que la définition activée possède un lieu de départ valide, renvoyer un état de départ en mémoire et le matérialiser au premier tour propriétaire.

Ancrage du tour propriétaire :

- Avant la persistance, résoudre l'état source à partir de l'historique actuellement visible, et non de la ligne la plus récente d'après le seul horodatage.
- Dans la transaction de tour atomique, créer le message utilisateur, le swipe initial, les horodatages du chat et un instantané spatial `owner_turn` ancré à ce message utilisateur.
- Une fois la réponse de l'assistant enregistrée, matérialiser le même état sur son couple `(messageId, swipeIndex)` en tant que `assistant_swipe`.
- Un appel au fournisseur en échec ou interrompu laisse le tour utilisateur accepté et son instantané spatial validés. Le rechargement affiche donc le déplacement et le message utilisateur enregistré, sans inventer de réponse d'assistant.
- La régénération résout l'état juste avant le message d'assistant ciblé et écrit cet état sur le nouveau swipe. La continuation conserve l'état du swipe ciblé.
- Choisir un swipe change l'état effectif via la ligne de swipe actif existante. Cela ne réécrit pas les autres instantanés.
- La création d'une branche copie la définition, réaffecte chaque instantané spatial copié aux nouveaux identifiants de messages, et inclut la ligne d'amorçage. Une branche créée sur un message antérieur arrête la copie au point de coupure choisi.
- Les points de contrôle de Game stockent l'identifiant de l'instantané spatial applicable, ou une copie stable de son lieu courant et de sa révision de définition. Charger un point de contrôle restaure à la fois l'état du jeu et l'état spatial.

La modification des définitions n'est pas historisée. Un renommage ou un changement de parent modifie le fil d'Ariane affiché pour les anciens instantanés, car l'identifiant de lieu stable est résolu contre la définition courante de la branche. Un ancien instantané peut renvoyer à un lieu archivé ; il reste lisible, mais la destination suivante doit être un nœud actif et accessible. Si un éditeur archive le lieu effectif du moment, le champ `replacementCurrentLocationId` est obligatoire et le serveur écrit un instantané `definition_repair` à l'ancrage visible courant, dans la même transaction que la nouvelle révision de définition.

### Séquence atomique du tour propriétaire

Étends `generateRequestSchema` et le contrat de génération côté client avec un champ facultatif `pendingSpatialTransition`. Il n'est accepté que pour les chats propriétaires Roleplay et Game.

La séquence côté serveur est la suivante :

1. Acquérir le verrou de génération par chat existant.
2. Analyser la requête et charger le chat au sein du cycle de vie de la requête.
3. S'il n'y a pas de transition spatiale, conserver le flux de messages actuel.
4. S'il existe une transition, démarrer une transaction de base de données de taille constante.
5. Relire la définition et l'état visible à l'intérieur de la transaction.
6. Valider le mode propriétaire, l'état d'activation, la révision de définition attendue, le lieu courant attendu, l'identifiant de commande, le statut de la destination et l'accessibilité.
7. Créer le message utilisateur et le swipe initial via une instance de stockage de chats liée à la transaction.
8. Insérer l'instantané spatial et mettre à jour les horodatages du chat.
9. Pour Game, valider l'instantané Game visible dans la même transaction lorsque c'est réalisable.
10. Valider la transaction, puis poursuivre l'enrichissement des pièces jointes, l'instantané de persona, l'assemblage du prompt et le travail avec le fournisseur en dehors de la transaction.

Les échecs de validation surviennent avant que l'état optimiste du client ne soit tenu pour faisant autorité. Une erreur `400` de graphe ou de destination et une erreur `409` d'état obsolète contiennent des codes machine stables, un texte sûr destiné à l'utilisateur, la révision courante et le fil d'Ariane courant. Elles n'incluent jamais de noms de destinations masquées ou bloquées.

Le client conserve le texte soumis, les pièces jointes et la destination en attente jusqu'à ce que le serveur accepte le tour. En cas de conflit, il retire le message optimiste, rafraîchit la requête de contexte spatial, restaure le brouillon et propose `Review destinations`. En cas d'acceptation, il efface les trois éléments d'un coup.

### Contrat de projection partagé

Le résolveur renvoie des données structurées avant toute production de texte de prompt :

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

Les limites de prompt sont distinctes des limites de stockage :

- 20 nœuds de fil d'Ariane au maximum.
- 4 000 caractères de description propriétaire au maximum.
- 8 000 caractères de mémoire privée du modèle au maximum.
- 50 destinations au maximum, dans l'ordre déterministe `sortOrder`, puis nom, puis identifiant, suivies uniquement d'un compteur d'omissions.
- 50 références de lorebook du lieu courant au maximum, avant que le processeur de lorebooks n'applique ses budgets d'entrées et de tokens.
- 6 références visuelles stockées au maximum par lieu, et 2 candidats de référence de lieu au maximum pour une demande de scène ordinaire, avant la limite totale de références du fournisseur.
- Un manifeste Storyboard peut conserver tous les identifiants de candidats résolus à des fins d'audit et d'actualisation, mais chaque charge utile d'image-clé est plafonnée par la limite du fournisseur capturée à la création du manifeste.
- 1 000 caractères au maximum pour un champ `awarenessSummary` connecté ou pour l'extrait de description publique de repli.

Un seul formateur produit le bloc propriétaire structuré partagé. Roleplay et Game utilisent de fins adaptateurs autour de ce bloc. Le formateur ne sérialise jamais `lorebookEntryIds` ; la chaîne de prompt propriétaire les consomme via le processeur de lorebooks. Un second formateur, introduit uniquement en phase 3, produit le bloc Conversation à confidentialité réduite et ne reçoit aucun champ de lore de lieu.

Chaque chemin en direct appelle le même résolveur et le même formateur juste avant la préparation finale de la requête au modèle :

- La génération Roleplay standard.
- La génération GM de Game.
- La route `/api/generate/dryRun`.
- L'assemblage en direct de **Peek Prompt** quand aucune requête enregistrée exacte n'existe.
- Les chemins de relance et de continuation qui reconstruisent un prompt.

Le **Peek Prompt** exact mis en cache n'exige aucun nouvel assemblage. Il affiche la requête fournisseur déjà enregistrée, qui doit contenir le bloc spatial employé pour ce swipe. La couverture de régression doit comparer des blocs spatiaux normalisés entre la génération en direct, l'exécution à blanc et le **Peek Prompt** en direct, pour la même fixture.

### Contrat de brouillon adossé aux lorebooks

L'ancrage de la carte est une entrée de création explicite :

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

La configuration de Game renseigne `lorebookIds` par défaut depuis `GameSetupConfig.activeLorebookIds`. Roleplay les renseigne depuis les lorebooks globaux, liés et épinglés actifs du chat. Le créateur peut modifier la sélection avant la génération. Les lorebooks et entrées désactivés ou explicitement exclus ne sont jamais envoyés.

Ce n'est pas une analyse d'activation de lorebook. Le serveur lit directement les sources sélectionnées, résout les macros prises en charge contre le contexte de configuration propriétaire sans persister le texte résolu, et construit un catalogue contenant :

- Une clé de source temporaire
- Les noms de l'entrée et du lorebook
- Les clés d'activation et les tags
- La description de l'entrée quand elle existe
- Sinon, un extrait borné du contenu

Le catalogue est limité par la plus petite de ces trois valeurs : 100 entrées, 16 000 caractères, et le contexte de connexion restant après réservation de la configuration, du système et de la sortie demandée. La priorité est déterministe :

1. Les entrées explicitement sélectionnées via `entryIds`.
2. Les entrées dont les tags, les noms ou les clés évoquent un lieu.
3. Les entrées dotées d'une description rédigée.
4. Les entrées restantes, dans l'ordre stable des lorebooks et des entrées.

Si des entrées sont omises, l'aperçu en indique le nombre et propose Refine sources. Il ne laisse jamais entendre que la totalité du lorebook a été prise en compte.

Le plan de modèle simplifié ajoute des clés de source temporaires à chaque lieu proposé. Le serveur rejette les clés inconnues, associe les clés valides à des identifiants d'entrées stables, supprime les doublons et calcule la provenance affichée dans l'aperçu :

- `Lore-backed` : au moins une entrée source validée.
- `Inferred` : une relation ou un conteneur déduit du matériau source, mais non représenté par une entrée source propre.
- `Added by AI` : aucune entrée source n'appuie le nœud.

Le mode `lore_strict` rejette chaque nœud dépourvu de clé de source validée. Le mode `lore_expand` accepte les nœuds déduits et ajoutés, mais les étiquette de façon visible. Une clé de source valide prouve la provenance, pas la fidélité sémantique : l'aperçu doit montrer les extraits sources pour que le créateur repère une relation ou un nom mal interprétés avant Apply.

Le point d'entrée de génération renvoie la définition de brouillon normalisée, plus une table de provenance transitoire indexée par identifiant de lieu généré. Seul `lorebookEntryIds` persiste après Save. Le remplacement et l'extension conservent les protections d'historique existantes ; une extension peut ajouter des liaisons à de nouveaux nœuds, mais ne peut pas réécrire les lieux ou les liaisons existants.

### Frontière de compatibilité avec Game

Quand le contexte spatial est activé pour un chat Game :

- Le champ `SpatialContextSnapshot.currentLocationId` fait autorité.
- Le champ `location` de l'état du jeu n'est plus qu'une projection de compatibilité.
- Les réponses GET de l'état du jeu et l'interface du tracker reçoivent le fil d'Ariane résolu comme lieu affiché.
- Les correctifs de l'agent World State et les correctifs manuels du tracker de Game ne peuvent pas écrire `location` de façon indépendante ; le serveur abandonne ce champ avec un diagnostic de débogage, ou renvoie un conflit au niveau du champ pour les modifications manuelles explicites.
- Les nouveaux instantanés Game recopient le fil d'Ariane dans leur valeur `location` historique, pour que l'historique de session et l'interface existante restent lisibles, mais le code de prompt lit toujours la projection spatiale.
- Une carte, une cellule de grille ou un nœud de Game peut se lier explicitement à un identifiant de lieu de hiérarchie stable.
- Choisir une destination liée crée une transition spatiale en attente structurée et n'insère aucune prose de déplacement.
- Le déplacement entre cellules et nœuds non liés reste tactique et ne change que la position de l'équipe.
- Entrer dans un lieu lié sélectionne sa carte locale quand elle existe ; en sortir sélectionne la carte de l'ancêtre lié le plus proche quand elle existe.
- L'interface distingue clairement les deux systèmes par les libellés `Story location` et `Map position` quand les deux sont visibles.
- Désactiver le contexte spatial restaure immédiatement le comportement historique du lieu de Game, sans supprimer les définitions ni les instantanés spatiaux.

Des contrôles négatifs doivent démontrer qu'un correctif de lieu Game émis par le modèle, une modification manuelle du tracker et un clic sur une carte non liée ne peuvent pas changer `currentLocationId`. Des contrôles positifs démontrent qu'un clic valide sur un élément lié passe par le validateur de transition habituel.

### Contrat de l'interface propriétaire

**Chat Settings** ajoute une unique section compacte `Hierarchical Map`, pour Roleplay et Game seulement. Elle affiche l'état d'activation, le fil d'Ariane courant, le nombre de lieux actifs et archivés, le nombre d'avertissements, et `Open Map Editor`. Elle n'intègre pas l'éditeur complet dans le panneau latéral.

L'éditeur de lieux suit la route d'éditeur pleine page existante :

- Sur ordinateur : un navigateur de hiérarchie, une vue de carte locale ou de couches, et un inspecteur du lieu sélectionné.
- Sur mobile : la hiérarchie d'abord, les détails ensuite, avec une action Back to locations visible. Aucune opération ne dépend du survol ou du glisser-déposer.
- Les lignes exposent les actions ajouter un enfant, ajouter un frère, changer de parent, dupliquer le sous-arbre, archiver et lier, via des contrôles étiquetés.
- La vue locale affiche les enfants sous forme de nœuds de carte positionnés, de couches ordonnées ou de liste accessible.
- La sélection donne un aperçu du lieu ; une action **Enter** distincte y navigue.
- L'inspecteur contient le nom, le type, la description publique, la mémoire privée du modèle, l'icône, la présentation, le placement ou l'ordre de couche, le statut, le parent, les liens directs et le lore lié.
- L'identité visuelle est une section en ligne de l'inspecteur, pas une fenêtre bloquante. Elle montre d'abord l'aperçu de l'image principale, puis les références secondaires, le rôle, la note d'usage, l'état d'héritage, l'état cassé et les métadonnées de source de l'image.
- La sélection en galerie et le téléversement réutilisent les contrôles d'image existants. `Generate establishing reference` ouvre un aperçu ; accepter l'image et la définir comme principale sont des actions explicites.
- Une scène générée propose `Set as location reference` parmi ses actions d'image existantes. Elle ne modifie jamais le lieu au seul motif que la scène y a été générée.
- Le lore lié utilise un volet en ligne avec recherche, plutôt qu'une fenêtre bloquante. Les résultats groupent les entrées par lorebook et exposent l'état désactivé ou exclu avant le rattachement.
- Les lignes rattachées proposent Open entry et Detach. Detach ne supprime jamais de lore, et la duplication de sous-arbre copie les liaisons.
- L'éditeur de lorebooks affiche les rétroliens de la carte du chat courant, pour qu'un créateur retrouve chaque lieu utilisant une entrée.
- Les contrôles de brouillon par IA affichent les lorebooks sources, le mode d'ancrage, le nombre d'entrées prises en compte et omises, ainsi que la provenance, sans exiger de connaissances techniques sur les prompts.
- La validation est en ligne et également résumée près de Save. Choisir un élément du résumé donne le focus au nœud et au champ concernés.
- L'éditeur utilise une copie de travail locale et une seule action Save versionnée. Le drapeau `editorDirty` protège la navigation. En cas de conflit serveur, la copie de travail est préservée et l'éditeur propose Reload server version ou Review differences ; il n'y a pas d'écrasement à l'aveugle.
- L'état vide enseigne la première action : `Create a starting location`. L'activation reste indisponible tant qu'il n'existe pas de lieu de départ actif et valide.
- Le chargement reprend le vocabulaire de squelette d'éditeur existant. Les états d'enregistrement, de conflit, d'archivage, de masquage, de blocage et d'invalidité utilisent du texte ou des icônes en plus de la couleur.

Les surfaces de chat propriétaires partagent `SpatialContextRuntimeBar` :

- Le fil d'Ariane persisté est visible au-dessus ou à côté du champ de saisie, sans recouvrir le contenu de l'histoire.
- Le sélecteur de destinations liste le parent, les enfants et les liens directs en groupes étiquetés, tout en conservant un ordre déterministe.
- Choisir une destination crée une pastille en attente clairement étiquetée. Cela ne change pas l'état immédiatement.
- La pastille peut être effacée et survit à un changement de chat ou à un rechargement, comme le brouillon de texte.
- Un envoi peut contenir du texte, des pièces jointes, ou seulement une destination en attente. La transition fait partie des données de la requête et n'est pas ajoutée au texte visible du message.
- Une destination en attente devenue obsolète reste visible après un conflit, marquée `Needs review`, jusqu'à ce que l'utilisateur choisisse un remplacement valide ou l'efface.
- Sur écran étroit, le fil d'Ariane se tronque en son milieu, conserve le nom du lieu courant et donne accès au chemin complet via un volet accessible.

L'éditeur et les contrôles d'exécution utilisent les tokens de thème sémantiques existants, prennent en charge les thèmes sombre, clair et SillyTavern, conservent des cibles tactiles de 44 px pour les actions mobiles principales, et affichent des états de focus visibles. Le mouvement se limite à des transitions d'état de 150 à 250 ms et ne déplace jamais la mise en page à des fins purement décoratives.

### Couverture de la portabilité et du cycle de vie

L'export natif d'un chat Marinara doit transporter :

- La définition courante dans `marinara_metadata`.
- Les instantanés spatiaux indexés par l'ordinal de message exporté et l'index de swipe, et non par des noms affichés.
- L'instantané d'amorçage quand il existe.

L'import crée de nouveaux identifiants de chat, de messages et d'instantanés, tout en préservant les identifiants de lieux à l'intérieur de la définition. Les graphes importés malformés désactivent le contexte spatial, préservent la définition brute pour réparation, et renvoient des avertissements. Ils ne sont jamais mis en correspondance par nom ni activés partiellement en silence.

L'export JSONL d'un chat préserve les identifiants lieu-vers-entrée, puisqu'ils font partie de la définition, mais il n'embarque pas discrètement le contenu des lorebooks. L'import résout les références contre le profil de destination et signale les entrées manquantes comme des avertissements réparables, sans correspondance par nom. La sauvegarde et la restauration de profil préservent des références fonctionnelles, car elles transportent à la fois les définitions spatiales et les tables de lorebooks. Un futur paquet de campagne explicite pourra embarquer les lorebooks référencés pour la portabilité entre profils.

Le JSONL préserve aussi les identifiants lieu-vers-image, les rôles, les notes d'usage et l'ordre, mais n'intègre pas les octets d'image. L'import résout ces identifiants contre le profil de destination et signale les images manquantes comme des avertissements réparables, sans correspondance de chemin ni de nom de fichier. La sauvegarde et la restauration de profil incluent les enregistrements et les fichiers de la galerie de profil. Un futur paquet de campagne explicite pourra proposer `Include location images`, avec un nombre de ressources, une taille totale et un rappel sur les licences avant l'export.

Quand le cycle de vie Storyboard existant est exporté ou copié, son manifeste visuel préserve l'ordinal et le swipe du message source, l'identifiant du lieu résolu, les identifiants d'images candidates et l'ordre des images-clés, sans embarquer d'octets. L'import réattribue les identifiants de messages et de storyboards, résout les identifiants d'images de galerie dans le profil de destination, et marque les ressources manquantes `needs_review`. Les storyboards hérités sans manifeste en résolvent un à partir de leur message et de leur swipe source enregistrés, lors de la première régénération ; ils ne se rabattent jamais sur une correspondance par nom ni sur le dernier lieu du chat.

La sauvegarde et la restauration de profil incluent la nouvelle table via `FILE_BACKED_TABLES`. La suppression d'un chat, la suppression en masse, la purge, la suppression de branche, la suppression de swipe et la suppression de message suivent les chemins existants de cascade et de nettoyage applicatif. Les chats existants n'exigent aucune migration anticipée, puisque des métadonnées absentes signifient un contexte spatial désactivé.

### Lots de travail et ordre de fusion

#### Lot A : contrat de base et prototype de démonstration

- Ajouter les types partagés, les schémas, les utilitaires de graphe purs, les limites, les fixtures et des codes d'erreur stables.
- Ajouter un harnais de démonstration temporaire pour les transactions de taille constante face au stockage fichier natif. Ne pas conserver de fichiers `.test.ts`.
- Démontrer le résolveur d'état avec des fixtures d'amorçage, de swipe visible, de point de branchement antérieur, de lieu courant historique archivé et de définition obsolète.
- Mesurer la taille des projections pour des graphes peu profonds, de profondeur 20, larges de 500, à textes longs et fortement liés.

Point de contrôle : la sémantique du graphe, les bornes de projection, les ancrages d'instantanés et la faisabilité des transactions sont démontrés avant que le travail d'interface ne commence.

#### Lot B : API de définition et stockage

- Ajouter le schéma, la migration, l'enregistrement en mode fichier, l'adaptateur de stockage, la route GET et la route PUT versionnée.
- Ajouter le remplacement du lieu courant pour les opérations d'archivage.
- Câbler la suppression, le décalage des swipes et la sauvegarde/restauration de profil.
- Ajouter une couverture de régression côté serveur pour les conflits de révision, les graphes invalides, les erreurs masquées et la réutilisation de commandes.

Point de contrôle : les définitions et les instantanés font l'aller-retour sur les deux moteurs de stockage, et une écriture invalide ne laisse aucun état partiel.

#### Lot C : intégration du tour propriétaire à l'historique

- Étendre la requête de génération avec `pendingSpatialTransition`.
- Ajouter la persistance atomique du tour propriétaire et la matérialisation du swipe d'assistant.
- Intégrer la régénération, la continuation, les swipes actifs, les branches et les points de contrôle de Game.
- Ajouter l'export/import natif des définitions et des instantanés de chat.

Point de contrôle : le rechargement, une panne de fournisseur, un changement de swipe, un branchement sur un message antérieur, l'import/export et la restauration d'un point de contrôle résolvent le lieu attendu.

#### Lot D : projection de prompt et autorité de Game

- Ajouter la projection structurée et les formateurs bornés.
- Intégrer la génération en direct, le GM de Game, l'exécution à blanc, le **Peek Prompt** en direct, les relances et les continuations.
- Faire respecter la frontière de compatibilité avec Game et l'affichage du fil d'Ariane dans le tracker.
- Ajouter les contrôles négatifs de confidentialité et de lieux inactifs.

Point de contrôle : tous les chemins de prompt contiennent le même bloc spatial, aucun texte de lieu sans rapport ne fuit, et Game ne peut pas maintenir un lieu concurrent faisant autorité.

#### Lot E : navigateur de carte et éditeur

- Ajouter les hooks React Query, la mise en correspondance des conflits, le résumé de réglages et la route d'éditeur chargée à la demande.
- Ajouter les flux hiérarchie, carte locale, couches, liste, aperçu, inspecteur et duplication de sous-arbre.
- Ajouter des états accessibles pour ordinateur et pour mobile.
- Préserver les modifications non enregistrées lors d'un conflit de révision.

Point de contrôle : les créateurs peuvent construire et réparer des cartes imbriquées sans glisser-déposer, sans survol et sans saisie de précision.

#### Lot E.1 : rédaction de carte assistée par IA

- Ajouter un générateur à la demande, au moment de la configuration, qui utilise un contexte de configuration borné de Game ou de Roleplay, jamais une mutation implicite en cours de tour.
- Générer un plan de carte simplifié avec clés, puis attribuer des identifiants stables, réparer les omissions de mise en page sûres, et valider la définition complète côté serveur.
- Prévisualiser la hiérarchie générée comme un brouillon local avant de remplacer l'état de l'éditeur.
- Exiger des actions Apply et Save explicites ; la génération n'active jamais le contexte spatial et n'écrit jamais de définition d'elle-même.
- Tenir l'historique de conversation ordinaire hors du prompt de génération et exposer les prompts finaux via les logs de débogage.

Point de contrôle : un créateur non technique peut décrire un monde, recevoir une carte imbriquée valide, l'inspecter, puis la refuser ou l'appliquer sans que l'état persisté ne change avant Save.

#### Lot E.1.1 : extension de carte par IA sans risque pour l'historique

- Traiter la création complète de carte par IA comme un flux d'avant-campagne. Dès qu'un historique spatial lié à des messages existe, préserver côté serveur chaque identifiant de lieu existant.
- Remplacer le générateur en campagne active par un flux d'extension en ajout seul, limité à un lieu actif sélectionné.
- Préserver le lieu courant, le lieu de départ, les descriptions existantes, les liens, la mise en page, les nœuds archivés et les futures liaisons Game. N'attribuer de nouveaux identifiants stables qu'aux lieux ajoutés.
- Fonder l'extension sur un contexte borné de configuration et de lieu sélectionné, pas sur l'historique de tours ordinaire.
- Prévisualiser les nouveaux lieux comme un brouillon local et conserver la frontière Apply puis Save existante.
- N'autoriser le remplacement complet de la carte qu'avant l'existence d'un historique spatial validé, l'extension restant l'option la plus sûre quand une carte est déjà présente.

Point de contrôle : l'IA peut faire grandir la carte d'une campagne active sans orpheliner les instantanés de tour, sans changer le lieu courant et sans remplacer les identifiants existants.

#### Lot E.2 : option de carte dans l'assistant de configuration de Game

- Ajouter un choix facultatif `Draft a hierarchical world map` à l'étape **Features** existante, avec une sélection de taille simple.
- N'exécuter la génération de carte qu'après que `/game/setup` a persisté l'aperçu du monde et l'arc narratif. Un tour de jeu n'est pas requis.
- Garder la configuration visiblement occupée pendant la génération du brouillon complémentaire, y compris après l'application d'une charge utile de configuration réparée.
- Ouvrir l'aperçu IA habituel et l'éditeur de carte après la génération. Skip renvoie au jeu, Apply ne modifie que la copie de travail, et Save reste la frontière de persistance.
- Si la génération de carte échoue, préserver le jeu créé avec succès, expliquer l'échec, et laisser le créateur construire une carte plus tard depuis **Chat Settings**.
- Ne pas intégrer l'éditeur de carte complet dans l'assistant de configuration étroit, ni activer et persister en silence une définition générée.

Point de contrôle : un créateur peut demander une carte initiale plus riche pendant la configuration, sans générer depuis un état d'assistant local incomplet ni contourner la relecture.

#### Lot F : interface d'exécution Roleplay et Game

- Ajouter la barre d'exécution partagée et la persistance des transitions en attente par chat.
- Intégrer les chemins d'envoi de Roleplay et de Game sans modifier le texte visible du message.
- Ajouter des contrôles explicites de liaison des cartes, cellules et nœuds de Game.
- Sélectionner les cartes liées après une transition acceptée, tout en préservant le déplacement tactique non lié.

Point de contrôle : Roleplay et Game peuvent se déplacer, se remettre d'un état obsolète, recharger, changer de chat et utiliser la fonctionnalité au clavier comme au tactile.

#### Lot F.1 : liaisons lorebook des lieux et activation à l'exécution

- Étendre le schéma partagé et la copie de travail de l'éditeur avec un champ `lorebookEntryIds` borné.
- Ajouter les contrôles de rattachement en ligne dans la carte, les rétroliens de lorebook et les avertissements de références cassées.
- Étendre le traitement partagé des lorebooks avec des identifiants de candidats forcés, la déduplication des sources d'activation, les exclusions et le plafond réservé au lore de lieu.
- Intégrer le même résolveur aux chemins Roleplay, GM de Game, exécution à blanc et **Peek Prompt** en direct.
- Ajouter le signalement des sources et de la troncature dans **Active Context**.
- Préserver les identifiants de références à travers les flux de branchement et d'export/import JSONL, et avertir quand le lore est absent à destination.

Point de contrôle : passer d'un lieu à l'autre n'active que le lore rattaché et activé de la destination, dans chaque chemin de prompt propriétaire, sans double insertion ni fuite vers Conversation.

#### Lot F.2 : rédaction de carte adossée aux lorebooks

- Ajouter le mode d'ancrage et la sélection explicite de sources aux requêtes de création, de remplacement et d'extension.
- Construire le catalogue de sources borné à partir des lorebooks sélectionnés, et non d'une analyse de chat ordinaire.
- Valider les clés de source temporaires et lier automatiquement les entrées valides aux nœuds générés.
- Afficher la provenance Lore-backed, Inferred et Added by AI, avec inspection des sources dans l'aperçu du brouillon.
- Imposer des nœuds adossés à une source en `Strict canon`, et rendre visibles les ajouts sans appui en `Canon with expansion`.
- Préserver l'extension en ajout seul, sans risque pour l'historique, ainsi que la frontière de relecture Apply puis Save existante.

Point de contrôle : les faits des lorebooks sélectionnés ancrent directement la hiérarchie générée, chaque lieu sans appui est visible avant Save, et le mode strict ne peut pas persister un nœud généré sans référence.

#### Lot F.3 : identité visuelle des lieux et références pour les visuels de scène

- Ajouter le texte d'identité visuelle borné et les liaisons stables vers la galerie de profil au schéma des lieux et à la copie de travail de l'éditeur.
- Ajouter l'éditeur d'identité visuelle en ligne, les rôles principal et secondaire, l'héritage de style explicite, les rétroliens de galerie et la réparation des références cassées.
- Ajouter les réglages parallèles par chat pour l'usage fournisseur d'Illustrator et de Game, avec consentement à la première image principale et désactivation par défaut pour la compatibilité ascendante.
- Ajouter la génération à la demande d'une référence d'ambiance et la promotion explicite des scènes générées relues.
- Résoudre le lieu applicable au message et au swipe pour les demandes de visuels de scène d'Illustrator en Roleplay et de Game.
- Fusionner de façon déterministe les candidats explicites, de lieu, de personnage, de persona et de style hérité, dans la limite existante de chaque fournisseur, avec des raisons d'omission visibles.
- Préserver les identifiants et métadonnées à travers les branches et le JSONL, inclure les binaires dans la sauvegarde et la restauration de profil, et ajouter des contrôles négatifs sur les prompts d'histoire et sur Conversation.

Point de contrôle : des visuels répétés dans un même lieu peuvent réutiliser une identité de lieu relue, avec des arbitrages déterministes et visibles face aux références de personnage ; les visuels d'un message historique résolvent leur lieu historique ; et aucune donnée réservée aux images ne fuit dans un prompt texte.

#### Lot F.3.1 : manifestes de références visuelles de Storyboard

- Garder F.3.1 en consommateur aval de F.3 et en changement relu séparément ; ce lot n'élargit pas le point de contrôle de persistance de F.3.
- Ajouter une banque de références figée et un manifeste ordonné de charges utiles par image-clé aux métadonnées de Storyboard.
- Ancrer la résolution du lieu au message et au swipe source du storyboard, puis réutiliser le même candidat de lieu sur toutes ses images.
- Retenir les références de personnage et de persona dans la liste des personnages visibles de chaque image-clé, et ne jamais dépenser de capacité pour des figurants hors champ.
- Appliquer de façon déterministe les priorités explicite, créneau unique, créneaux multiples, secondaire et style hérité, via le résolveur de capacités fournisseur existant.
- Ajouter les volets progressifs Visual sources, les raisons d'omission, les conflits needs-review et l'action explicite Refresh references à l'aperçu et à la régénération.
- Préserver le comportement historique de Storyboard quand le contexte spatial est désactivé ou qu'aucune référence de lieu éligible n'existe.

Point de contrôle : régénérer une image-clé réutilise sa charge utile figée, les sélections de lieu et de personnages sont historiquement correctes et inspectables, et changer la capacité d'un fournisseur ne peut pas altérer en silence un storyboard existant.

#### Lot G : Conversation connectée

- N'implémenter qu'une fois les lots A à F.3.1 stabilisés.
- Résoudre le propriétaire lié au moment de la génération et utiliser le formateur de projection réduite.
- Ajouter une formulation prudente sur la présence et une interface en lecture seule.
- Démontrer le comportement en cas de dissociation, de réassociation, de propriétaire supprimé, de liens réciproques malformés, de cycles et d'histoire conclue.

Point de contrôle : Conversation ne reçoit jamais la mémoire privée du modèle, les identifiants internes, les destinations masquées, les identifiants ou contenus de lore rattaché aux lieux, les identifiants ou contenus de références visuelles de lieu, ni la capacité de mutation.

Le déplacement demandé par le modèle, les modèles pour créateurs, les paquets de campagne portables, l'inférence d'images vers carte, la génération en masse de visuels de lieux, la sélection automatique de références multi-vues pour les personnages et les positions par personnage restent des lots ultérieurs distincts, après la livraison des travaux d'ancrage propriétaire, d'identité visuelle et de manifeste Storyboard.

### Frontières des issues et des pull requests

C'est une fonctionnalité de grande ampleur, soumise au flux de travail du dépôt. Avant de commencer l'implémentation du lot A :

1. Confirmer ou ouvrir l'issue de suivi unique et y rendre la propriété visible.
2. Vérifier l'existence d'une branche liée à l'issue, d'une pull request en brouillon ou d'un élément de tableau de projet.
3. Ouvrir une pull request en brouillon vers `staging` dès que l'implémentation démarre.
4. Utiliser les lots de travail comme frontières de PR relisibles quand c'est réalisable ; ne pas combiner le MVP propriétaire et la Conversation connectée dans le seul but de réduire le nombre de PR.

Découpage d'issues suggéré :

1. Socle partagé, persistance et API de définition du contexte spatial.
2. Instantanés de tour propriétaire, swipes, branches, points de contrôle et portabilité.
3. Projection de prompt propriétaire et compatibilité avec Game.
4. Éditeur propriétaire et interface de déplacement à l'exécution.
5. Liaisons lorebook des lieux et activation à l'exécution en mode propriétaire.
6. Rédaction de carte adossée aux lorebooks.
7. Identité visuelle des lieux et résolution des références pour les visuels de scène.
8. Manifestes de références visuelles figés de Storyboard.
9. Projection en lecture seule de la Conversation connectée.
10. Déplacement demandé par le modèle.

### Matrice de démonstration

| Affirmation | Preuve automatisée | Preuve manuelle |
| --- | --- | --- |
| L'activation du lore de lieu est exacte et bornée | Les fixtures couvrent le déplacement accepté, le déplacement en attente et rejeté, les entrées désactivées et exclues, les sources d'activation multiples, la troncature de tokens, le rechargement, les swipes et les branches | Se déplacer entre deux lieux au lore différent en Roleplay et en Game, puis inspecter **Active Context** et **Peek Prompt** |
| L'ancrage sur les lorebooks est inspectable | Les fixtures du mode strict rejettent les nœuds sans référence ; les fixtures d'extension préservent les clés de source validées et étiquettent les nœuds sans appui ; les plafonds de catalogue et les compteurs d'omissions sont déterministes | Rédiger un brouillon à partir d'un gros lorebook existant, ouvrir les extraits sources, comparer `Strict canon` et `Canon with expansion`, et refuser un lieu inventé |
| Les visuels de lieu restent cohérents et bornés | Les fixtures couvrent la sélection du lieu exact, la résolution d'un swipe historique, l'héritage de style explicite, les images manquantes, les limites de fournisseur, les types de demande et des raisons d'omission déterministes | Définir une référence principale, générer plusieurs scènes Game et Roleplay au même endroit, aller ailleurs, relancer un visuel sur un swipe plus ancien, et inspecter l'aperçu des sources visuelles |
| Les références de Storyboard sont reproductibles | Les fixtures couvrent l'ancrage au swipe source, les banques figées, la sélection des personnages visibles, les fournisseurs à créneau unique et à créneaux multiples, les ressources manquantes, une capacité de remplacement inférieure ou supérieure, les manifestes hérités et l'actualisation explicite | Générer un storyboard multi-images, changer de lieu, changer une image principale de personnage et de lieu, régénérer avant et après `Refresh references`, et inspecter les Visual sources de chaque image |
| La validation du graphe est déterministe | Script de régression spatiale dédié, avec fixtures positives et négatives | Inspecter les erreurs en ligne de l'éditeur pour des nœuds invalides représentatifs |
| Le déplacement et le message utilisateur sont atomiques | Panne de stockage injectée avant et après chaque écriture transactionnelle, sur les deux moteurs | Forcer une révision obsolète alors qu'un brouillon et une destination sont en attente |
| L'historique restaure le bon lieu | Régression d'instantanés couvrant le rechargement, les swipes, la régénération, la coupure de branche et le point de contrôle | Exercer chaque flux en Roleplay et en Game |
| Les chemins de prompt concordent | Comparer les blocs normalisés issus de l'utilitaire de génération, de l'exécution à blanc et du **Peek Prompt** en direct | Inspecter le **Peek Prompt** et la sortie de débogage pour un chat par mode propriétaire |
| Le contexte reste borné | Des fixtures larges et à textes longs vérifient les plafonds de caractères et de destinations | Inspecter une hiérarchie profonde et large dans l'éditeur et le sélecteur de destinations |
| La confidentialité tient | Assertions négatives pour la mémoire privée, les liens masqués, les nœuds inactifs, les descriptions sans rapport, les identifiants et contenus de lore rattaché aux lieux, et tous les champs et octets de références visuelles de lieu | Lier un chat Conversation et inspecter ses aperçus de requête texte et image en phase 3 |
| Game n'a qu'une seule autorité de lieu | Rejeter les correctifs historiques ; valider les transitions liées ; préserver le déplacement non lié | Essayer une modification du tracker, des déplacements sur carte liée et non liée, le chargement d'un point de contrôle, l'activation et la désactivation |
| L'interface est robuste | Flux Playwright pour la création, la modification, un déplacement en attente, un conflit et la navigation mobile | Vérifier les thèmes sombre, clair et SillyTavern, le clavier, le tactile, les noms longs et les états vides |
| La portabilité préserve identifiants et état | Les allers-retours d'export/import natif et de sauvegarde/restauration de profil couvrent les liaisons spatiales, de lore, d'images et de manifeste Storyboard ; l'absence de lore ou d'images à destination produit des avertissements | Exporter un chat branché avec un storyboard, l'importer avec et sans ses lorebooks et ses ressources de galerie, et inspecter le fil d'Ariane, l'historique, les liaisons, les sources figées des images-clés et les avertissements |

Ajoute `scripts/regressions/spatial-context.regression.ts` et un script de paquet `regression:spatial`, puis inclus-le dans `pnpm regression`. N'ajoute pas de fichiers `.test.ts` permanents. Chaque PR d'implémentation exécute quand même la régression spatiale restreinte, en plus des vérifications du dépôt adaptées à son périmètre.

## Critères d'acceptation

- Un lieu de la carte stocke des références d'entrées de lorebook, jamais du contenu de lore copié.
- Un lieu stocke des métadonnées d'identité visuelle facultatives et des références stables vers des images de galerie, jamais des chemins bruts, des URL externes ou des octets d'image.
- Les profils de style d'image pilotent le style de rendu, les références de lieu pilotent l'identité du lieu, et les références de personnage ou de persona pilotent l'identité des sujets.
- Les demandes de visuels de scène éligibles résolvent le lieu exact de leur message et de leur swipe, y compris pour les relances historiques, et ne rapprochent jamais un lieu par ressemblance de nom.
- Un visuel généré ne devient une référence de lieu qu'après une action explicite du créateur.
- Les références de plan n'entrent jamais automatiquement dans une génération de scène ordinaire, et seules les références de style peuvent être héritées par les descendants.
- Les prompts texte et la Conversation connectée ne reçoivent ni identifiants de références visuelles de lieu, ni octets, ni chemins, ni notes réservées aux images.
- Storyboard résout le lieu à partir de son message et de son swipe source, fige sa banque de références et ses charges utiles d'images-clés ordonnées, et les réutilise pendant la régénération jusqu'à une actualisation explicite.
- Chaque image-clé de Storyboard ne retient des références que pour son lieu résolu et les personnes visibles ; les figurants hors champ ne consomment jamais de capacité.
- Le comportement des fournisseurs à créneau unique et à créneaux multiples est déterministe et visible, et un changement de fournisseur n'ajoute, ne retire ni ne remplace jamais en silence des références figées.
- Les manifestes de Storyboard stockent des identifiants stables et des métadonnées, jamais d'octets d'image ni de chemins du système de fichiers.
- Les storyboards hérités sans manifeste n'utilisent jamais la correspondance par nom de lieu ni le dernier lieu du chat comme réparation implicite.
- Seul le lieu courant exact accepté force l'activation du lore rattaché, sous réserve des règles de désactivation, d'exclusion, de déduplication, d'ordre, de limite d'entrées et de budget de tokens.
- **Active Context** identifie l'activation par lieu courant, les sources d'activation combinées et la troncature déterministe.
- La rédaction ancrée lit directement les entrées de lore explicitement sélectionnées, au lieu de dépendre d'analyses par mot-clé ou de résumés d'aperçu du monde générés.
- Le mode `Strict canon` ne produit que des lieux adossés à une source ; `Canon with expansion` étiquette chaque ajout déduit ou sans appui avant Save.
- La Conversation connectée ne reçoit ni identifiants ni contenu du lore rattaché aux lieux.
- Les opérations de renommage et de changement de parent préservent l'identité du lieu.
- Les graphes invalides et les écritures obsolètes ne modifient jamais l'état.
- Le déplacement est validé avec un tour utilisateur, ou pas du tout.
- Le rechargement, la sélection de swipe, le branchement sur un message antérieur et la restauration d'un point de contrôle de Game résolvent le bon lieu.
- Les prompts propriétaires ne contiennent que le contexte du lieu actif et des destinations valides.
- Quand la fonctionnalité est activée, Game n'affiche pas et n'envoie pas au prompt un lieu en texte libre concurrent.
- Les cartes Game existantes peuvent se lier explicitement à des lieux de la hiérarchie sans casser le déplacement tactique.
- Roleplay et Game utilisent la même hiérarchie et les mêmes règles de transition.
- L'exécution à blanc et le **Peek Prompt** ont le même comportement de projection que la génération.
- Les chats existants et un contexte spatial désactivé conservent le comportement actuel.
- Conversation ne peut ni posséder ni modifier l'état spatial.
- La mémoire privée du modèle n'entre jamais dans la projection de Conversation.

## Validation

La couverture déterministe doit inclure les limites de graphe, les cycles, les directions de navigation, les liens masqués et bloqués, les révisions obsolètes, l'idempotence, les points de branchement, les swipes, les points de contrôle, les limites de références de lorebook, l'activation forcée, les exclusions, la déduplication, la troncature de tokens, les plafonds du catalogue d'ancrage, la validation des clés de source, le rejet en mode strict, la provenance, les limites de références visuelles, les règles de référence principale et d'héritage, la résolution visuelle historique, l'élagage par fournisseur, les avertissements d'images manquantes, les exclusions par type de demande, l'ancrage à la source de Storyboard, la régénération à manifeste figé, le filtrage des personnages visibles, la sélection à créneau unique et à créneaux multiples, les changements de capacité fournisseur, l'actualisation explicite, le repli sur manifeste hérité, les frontières de confidentialité et les contrôles négatifs sur les lieux inactifs.

Vérifications du dépôt :

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

La vérification manuelle couvre la création sur ordinateur et sur mobile, les fils d'Ariane profonds, les couches, les cartes positionnées, les noms longs, la récupération après conflit, les protections d'archivage, Roleplay, Game, le déplacement sur carte liée et non liée, le rechargement, le branchement, la restauration d'un point de contrôle, le rattachement de lore lié et ses rétroliens, le lore désactivé et cassé, les avertissements d'omission sur les grosses sources, les aperçus `Strict canon` et `Canon with expansion`, le téléversement visuel et la sélection en galerie, les références principale et secondaires, la promotion explicite d'une scène, le style hérité, les images cassées, le signalement des omissions par le fournisseur, les visuels sur swipe historique, les Visual sources de Storyboard, les fournisseurs à créneau unique et à créneaux multiples, la régénération figée, la revue après changement de fournisseur, l'actualisation explicite, les storyboards hérités, **Active Context** et **Peek Prompt**. Les cases de validation de la PR restent décochées, pour vérification humaine.

## Reporté

- Le déplacement immédiat sans tour de chat
- Les positions de personnages indépendantes
- Les drapeaux, événements ou scripts génériques
- Les modèles de lieux et les paquets de scénarios
- La connaissance spatiale propre à chaque personnage
- Le lore de lieu partageable dans Conversation
- L'inférence automatique d'une carte à partir d'images
- La promotion automatique des scènes générées en canon de lieu
- La génération en masse de visuels de référence pour chaque lieu
- La sélection automatique, tenant compte du plan, parmi plusieurs tenues, angles, expressions et détails de personnage
- La génération de références composites ou en planche-contact propres à un fournisseur
