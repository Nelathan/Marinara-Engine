# Guide du moteur de storyboard

Ce guide explique les storyboards dans Marinara Engine. Un storyboard transforme un tour de Game Mode (le mode jeu) terminé en une courte série d'images-clés. Il peut aussi ajouter de brefs clips animés, y compris des plans continus de style anime. Le tour se lit alors comme une mini cinématique. Les storyboards existent uniquement en Game Mode. Ils n'existent pas dans les chats Roleplay ou Conversation.

## Ce qu'est un storyboard

Game Mode est le mode de chat dans lequel un Game Master (GM, le maître du jeu) piloté par l'IA narre une aventure au tour par tour. Quand le GM termine un tour de narration, le moteur de storyboard peut illustrer ce tour précis.

Marinara lit la narration du GM et la découpe en une courte série d'images-clés ordonnées. Chaque image-clé montre un moment du tour. Un storyboard contient de 1 à 6 images-clés. Par défaut, il y en a 3.

Chaque image-clé est rattachée à un passage du texte du tour. Ces passages s'appellent des sections de lecture. À mesure que tu avances dans le tour, une petite visionneuse affiche l'image-clé qui correspond à l'endroit où tu en es.

Avant de planifier les images, Marinara retire les balises de commande GM du tour. Ce sont des balises d'instruction cachées dans un message du GM : jets de dés, mises à jour de l'état du jeu, etc. Elles disparaissent pour ne pas se retrouver sur l'image.

Les images fixes des images-clés sont enregistrées dans le panneau **Gallery** (galerie), sous l'onglet **Images**. Les clips, eux, sont enregistrés comme vidéos de scène, sous l'onglet **Videos**. Ce sont des éléments de galerie ordinaires : tu peux donc prévisualiser, télécharger, épingler ou copier le prompt (le texte que Marinara envoie à l'IA) de n'importe quelle image-clé.

## Avant de commencer

Quelques éléments doivent être en place avant qu'un storyboard puisse s'afficher.

1. Un chat en Game Mode. Cette fonctionnalité ne marche qu'en Game Mode.
2. Une connexion d'image fonctionnelle pour l'illustrateur de la partie. Deux endroits permettent de la définir, l'un ou l'autre suffit :
   - Partie existante : ouvre la section **Chat Settings** (réglages du chat), va dans **Agents**, puis dans le bloc **Illustrator**. Active **Game Illustrator** et choisis une **Image Connection**.
   - Nouvelle partie : dans l'assistant de configuration, active **Visual Generation** et choisis une **Image Generation Connection**.
3. Mieux vaut un modèle d'image récent et performant. L'application conseille un modèle d'image à l'état de l'art, ou un équivalent de Google Nano Banana 2 Lite.

Pour les clips animés, il faut en plus une connexion vidéo. Voir les étapes d'animation plus bas.

Sans connexion d'image définie, la demande de storyboard échoue avec ce message : "Choose an Illustrator image connection in Game Settings first."

Pour que les personnages gardent la même apparence d'une image-clé à l'autre, utilise des fiches de personnage dotées d'un avatar, et active **Send Avatar References** dans le bloc **Illustrator**. Marinara envoie alors l'avatar de chaque personnage comme image de référence.

## Démarrage rapide

1. Ouvre ou crée un chat en Game Mode.
2. Configure la connexion d'image comme indiqué dans la section précédente.
3. Joue jusqu'à ce que le GM termine un tour de narration.
4. Ouvre le panneau **Gallery**.
5. Clique sur **Create storyboard** (créer un storyboard). Pendant l'opération, le bouton affiche **Creating...** avec un indicateur d'activité.
   - Si l'option **Expose image prompts before sending** est activée dans **Settings > Generation**, relis et modifie le prompt compilé de chaque image-clé, puis confirme la génération.
6. Continue ta lecture du tour. La visionneuse flottante apparaît et change d'image-clé au fil de la lecture.

Si tu fermes la visionneuse, rouvre-la : dans le panneau **Gallery**, clique sur **View storyboard**.

Pendant la génération d'un storyboard, le panneau **Gallery** affiche cette bannière : "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## Storyboards automatiques et manuels

Tu peux créer les storyboards à la main, ou laisser Marinara s'en charger.

Le mode manuel, c'est le bouton **Create storyboard** du panneau **Gallery**. Il construit un storyboard pour le dernier tour de narration GM terminé, et seulement à ta demande. Autre usage : rafraîchir ou réillustrer le tour en cours, même quand les storyboards automatiques sont désactivés.

Les storyboards automatiques se règlent chat par chat. Les commandes se trouvent à deux endroits :

- Nouvelle partie : assistant de configuration, **Visual Generation**, puis la sous-section **Storyboards**.
- Partie existante : **Chat Settings**, **Agents**, puis le bloc **Storyboards**.

**Automatic Storyboard Illustrations** produit des images-clés fixes après chaque tour GM terminé, sans aucun clic de ta part. C'est l'option la moins coûteuse. Pour une nouvelle partie créée avec l'assistant, elle est active par défaut dès que **Visual Generation** est activé. Elle reste sans effet tant que **Game Illustrator** n'est pas configuré.

Les storyboards automatiques n'interrompent pas le traitement du tour terminé pour te faire relire les prompts. Quand l'option **Expose image prompts before sending** est activée, passe par l'action manuelle **Create storyboard** pour voir et modifier chaque prompt final compilé d'image-clé. Les exécutions automatiques se poursuivent sans fenêtre, pour que la partie ne se bloque pas quand le chat tourne sans surveillance.

**Automatic Storyboard Animations** ajoute en plus un clip MP4 pour chaque image-clé. Cette option est désactivée par défaut. Elle réclame les illustrations fixes et une connexion vidéo. Activer les animations active aussi les illustrations. Désactiver les illustrations désactive les animations.

Pour mettre en place les clips :

1. Crée une connexion **Video Generation** dans **Settings** (Paramètres), puis **Connections**.
2. Sélectionne-la dans le champ **Video Generation Connection** de l'assistant, ou dans **Chat Settings**, **Agents**, **Scene Videos**, puis **Video Connection**.
3. Active **Automatic Storyboard Animations**.

Si tu actives les animations sans connexion vidéo, l'assistant t'avertit : "Choose a Video Generation connection below to save automatic storyboard animations."

Un storyboard lance en général 3 tâches d'image, une par image-clé. Avec les animations activées, il lance en plus jusqu'à 3 tâches vidéo. Ce nombre suit le réglage **Keyframes per Turn** : avec 5, tu peux avoir 5 tâches d'image et jusqu'à 5 tâches vidéo. Les tâches vidéo sont bien plus lentes et coûtent plus cher. Commence par les illustrations fixes, et n'ajoute les animations que pour les chats où l'attente et le coût ne posent pas de problème.

## Réglages du storyboard

Tous ces réglages se trouvent dans le bloc **Storyboards**. Ouvre **Chat Settings**, va dans **Agents**, puis **Storyboards**.

| Réglage | Par défaut | Rôle |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | Activé pour les nouvelles parties créées avec l'assistant et Visual Generation ; sinon désactivé | Produit des images-clés fixes après chaque tour GM |
| **Automatic Storyboard Animations** | Désactivé | Ajoute un clip MP4 par image-clé ; réclame une connexion vidéo |
| **Keyframes per Turn** | 3 (de 1 à 6) | Nombre d'images-clés planifiées à chaque tour |
| **Animation Clip Duration** | 6 secondes (de 1 à 15) | Durée de chaque clip |
| **Viewer Display** | Floating | Panneau flottant ou arrière-plan plein écran |
| **Illustration Planner** | Still Keyframes | Planifie des images-clés fixes finies et leurs descriptions d'image |
| **Animation Planner** | Comic Page Animation | Planifie des images sources prêtes pour l'animation et des directions de mouvement |
| **Use Storyboard Template** | On | Met en forme les scènes planifiées avec le Storyboard Illustration Prompt sélectionné. Désactive-le pour des prompts de tags NovelAI directs |
| **Storyboard Illustration Prompt** | Game Scene Illustration | Met en forme chaque image-clé planifiée pour le modèle d'image |
| **Storyboard Video Prompt** | Identique au Game Video Prompt | Prompt de mouvement réservé aux clips d'images-clés du storyboard |

**Keyframes per Turn** est un curseur. Le moteur essaie de planifier ce nombre d'images-clés. Un tour court en donne parfois moins. Il n'en planifie jamais plus de 6.

**Animation Clip Duration** s'exprime en secondes. Le champ reste grisé tant que **Automatic Storyboard Animations** est désactivé. Sans valeur de ta part, le réglage utilise la valeur par défaut de 6 secondes et affiche une pastille **Storyboard default**. Dès que tu saisis ta propre valeur, un bouton **Use storyboard default** apparaît pour l'effacer. Certains fournisseurs vidéo ramènent la valeur à un maximum plus bas : la durée exacte n'est donc pas garantie.

En mode d'affichage **Background**, chaque animation démarre une fois avec le son, dès que son moment de récit devient actif. La narration peut s'afficher pendant la lecture, mais la lecture automatique de la narration attend la fin du clip. L'animation reste ensuite figée sur sa dernière image. La barre d'outils du jeu propose les commandes de relecture, de lecture/pause et de coupure du son, sur ordinateur comme sur mobile. Les vidéos du storyboard flottant se lisent aussi une seule fois et se relancent à la demande, au lieu de tourner en boucle.

Les deux planificateurs construisent le plan visuel. **Illustration Planner** sert aux storyboards fixes. **Animation Planner** intervient quand des vidéos sont générées : il produit à la fois une description d'image prête pour l'animation et une direction de mouvement concise.

**Storyboard Illustration Prompt** met ensuite en forme la description d'image du planificateur pour composer la requête finale envoyée au modèle d'image. Pour les chats existants, la valeur par défaut est **Game Scene Illustration**. **Storyboard Illustration** garde le résultat du planificateur au premier plan, tout en ajoutant les références de personnage, les notes d'apparence, la direction artistique de la campagne et les instructions d'image.

**Storyboard Video Prompt** est distinct du **Game Video Prompt** général, situé dans le bloc **Scene Videos**. Il combine l'image-clé générée, la direction de mouvement de l'Animation Planner et le contexte de la scène en cours pour former la requête finale envoyée au modèle vidéo. Laisse-le sur le choix hérité pour réutiliser le prompt général, ou sélectionne **Anime Game Video** pour les clips d'images-clés, sans toucher aux vidéos manuelles de **Gallery** ou de **Game Assets**.

Sélectionne **Comic Page Animation** pour des pages de bande dessinée sources qui tiennent compte de la durée, puis choisis **Comic Page Video** pour que ces cases servent de références visuelles ordonnées dans un seul clip. Le preset **Comic Page** d'origine reste disponible pour les illustrations ordinaires. Ce choix vidéo séparé laisse intacts le **Game Video Prompt** hérité ainsi que les vidéos manuelles de **Gallery** et de **Game Assets**.

Les nouvelles parties créées avec la présentation **Storyboard Optimized** retiennent **Storyboard Game Prompt**, le planificateur **Comic Page Animation**, **Storyboard Illustration** et **Comic Page Video**. Tu peux basculer ce chat vers la combinaison en plan unique à tout moment, en sélectionnant **Still Keyframe Animation** et **Anime Game Video**.

### LTX 2.3 image vers vidéo

Pour un workflow ComfyUI LTX 2.3 local, commence avec **LTX Simple Image-to-Video** comme Animation Planner, **Storyboard First Frame** comme Storyboard Illustration Prompt, et **LTX Director Video** comme Storyboard Video Prompt. L'Animation Planner crée à la fois le prompt d'image en langage naturel pour T=0 et le paragraphe de mouvement complet. Storyboard First Frame transmet la scène T=0 à un fournisseur d'image en langage naturel avec un habillage minimal, tandis que LTX Director Video envoie le paragraphe de mouvement vers l'entrée `%prompt%` du workflow. **LTX Director Storyboard** est la variante plus détaillée, qui tient compte de la durée ; elle utilise le même prompt vidéo et le même contrat de workflow.

Consulte [Les storyboards LTX 2.3 en Game Mode](ltx-2-3-storyboards.md) pour le choix du modèle, les marqueurs ComfyUI, le profil de réglages Game complet, les étapes de validation et le dépannage.

## Presets de style

Les presets de planificateur déterminent comment chaque image-clé est choisie et décrite. Deux sélecteurs permettent de les choisir :

- **Illustration Planner** sert quand les storyboards produisent des images-clés fixes sans vidéo. Par défaut : **Still Keyframes**.
- **Animation Planner** sert quand **Automatic Storyboard Animations** est activé. Par défaut : **Comic Page Animation**.

Les deux sélecteurs ont des listes de presets distinctes. Les presets d'illustration décrivent des images fixes finies et peuvent inclure du lettrage de BD ou de manga destiné au lecteur. Les presets d'animation décrivent une première image stable et une direction de mouvement adaptée à la durée. Un preset d'illustration n'apparaît jamais dans le menu Animation Planner, et un preset d'animation n'apparaît jamais dans le menu Illustration Planner.

| Voie | Preset | Idéal pour |
| --- | --- | --- |
| Illustration | **Still Keyframes** | La lecture normale. Des images-clés à scène unique, sans cases de BD, bulles de dialogue, légendes ni texte d'effets sonores. |
| Illustration | **NovelAI Keyframes** | Des prompts de tags compacts pour images fixes, calibrés pour NovelAI V4 et V4.5. Pour un prompt de tags direct, désactive **Use Storyboard Template**. |
| Illustration | **Comic Page** | Des illustrations de page de BD finies, avec 2 à 6 cases, bulles de dialogue, légendes et lettrage. |
| Illustration | **Colored Manga** | Une mise en scène manga en couleur finie, avec ombrage cellulaire, trames, bulles de dialogue et effets sonores. |
| Illustration | **B&W Manga** | Des encrages manga en noir et blanc finis, avec trames, noirs profonds, bulles de dialogue et effets sonores. |
| Animation | **Still Keyframe Animation** | Des plans uniques ordonnés, avec une première image exacte, un mouvement principal, un comportement de caméra simple, du mouvement d'ambiance et une pause finale. |
| Animation | **Anime Episode Director** | Des plans uniques dignes d'un anime télévisé, avec continuité de la première image, direction de mouvement concise et mise en scène compatible avec les filtres des fournisseurs. |
| Animation | **NovelAI Keyframe Animation** | Des premières images à base de tags NovelAI, avec le rythme et le mouvement conservés dans une direction d'animation séparée. |
| Animation | **Comic Page Animation** | Des pages de BD sources tenant compte de la durée, dont les cases chronologiques servent de références visuelles ordonnées pour un seul clip. |
| Animation | **Colored Manga Animation** | Des premières images manga en couleur sans texte, avec un mouvement qui préserve le trait et l'ombrage cellulaire. |
| Animation | **B&W Manga Animation** | Des premières images monochromes sans texte, avec un mouvement qui préserve les encrages et les trames. |

Le preset **Still Keyframe Animation** est l'équivalent animé, neutre en style, de **Still Keyframes**. **Anime Episode Director** est une option spécialisée distincte, à associer à **Anime Game Video** quand tu veux une découpe de plans à la manière des anime télévisés. Il garde la violence forte hors champ et la met en scène par l'anticipation, l'obstruction, la réaction ou les conséquences quand c'est possible, ce qui peut réduire les refus des filtres de sécurité des fournisseurs, sans changer l'histoire canonique du GM.

Le preset **Comic Page Animation** se sert de la durée du clip d'animation pour régler la densité de la page. Par défaut, il prévoit 2 cases pour un clip de 6 à 7 secondes, et n'en autorise une troisième que pour trois moments simples d'environ 2 secondes chacun ; il passe à 2 ou 3 cases pour 8 à 10 secondes, et jamais plus de 4 pour les clips plus longs. Les pages d'animation privilégient le rythme visuel sur le lettrage, gardent chaque case bien centrée sur son sujet et réservent une courte pause finale. Les cases s'enchaînent par cause et effet, dans le sens de lecture. **Comic Page Video** entre normalement tout de suite dans la case 1 ; il n'autorise un très bref plan d'ensemble de la page que si cela ne dévoile pas trop tôt une conséquence à venir.

Le preset **NovelAI Keyframes** écrit des tags Danbooru compacts. Les tags Danbooru sont de courts mots-clés séparés par des virgules, attendus par certains modèles d'image anime. Choisir un preset d'animation, de BD ou de manga n'active pas les animations pour autant. Les clips réclament toujours **Automatic Storyboard Animations** et une connexion vidéo.

## Style artistique de campagne et profils de style d'image

La configuration de la partie génère un style artistique à l'échelle de la campagne, pour garder une cohérence visuelle. Dans une partie existante, ouvre **Chat Settings > Agents > Illustrator** pour le voir sous **Campaign art style**. Tu peux le modifier, l'effacer, revenir à la formulation générée à la configuration, ou désactiver **Use Campaign Art Style**.

Le style artistique de campagne et le profil **Image Style** sont deux couches de prompt distinctes. Quand les deux sont actives, Marinara inclut les deux. Désactiver ou effacer le style de campagne laisse en place le profil Image Style sélectionné. Ce réglage s'applique aux images-clés du storyboard comme aux autres visuels générés pour la partie.

Avec l'option **Expose image prompts before sending** activée dans **Settings > Generation**, une demande manuelle **Create storyboard** affiche d'abord les prompts positifs et négatifs compilés, exactement tels quels, pour toutes les images-clés prévues. Les modifications faites à ce moment-là ne valent que pour ce storyboard : elles ne remplacent pas les réglages du style de campagne ni du profil Image Style.

## Modifier les presets de storyboard

Les presets intégrés sont en lecture seule. Pour créer les tiens, ouvre **Edit Illustration Planner Presets**, **Edit Animation Planner Presets**, **Edit Illustration Prompt Presets** ou **Edit Video Prompt Presets** dans le bloc **Storyboards**. Chaque section n'affiche que les presets intégrés et les copies personnalisées de l'étape concernée.

Copie un preset intégré vers un gabarit modifiable, propre à ce chat, puis sélectionne cette copie dans le sélecteur correspondant. Une copie d'Illustration Planner ne peut pas être choisie comme Animation Planner, et une copie d'Animation Planner ne peut pas être choisie comme Illustration Planner. Les copies de Storyboard Illustration Prompt n'affectent que les images du storyboard. Les copies de prompt vidéo restent partagées avec le Game Video Prompt général : les deux sélecteurs vidéo peuvent donc les utiliser.

Chaque copie personnalisée a un nom, une courte description et le corps du prompt que tu modifies. Un bouton corbeille supprime une copie, après une boîte de dialogue de confirmation. Ces copies sont enregistrées sur ce chat précis, pas dans toute l'application.

## La visionneuse de storyboard

La visionneuse suit ta position de lecture. Elle affiche l'image-clé dont la section de lecture correspond à l'endroit où tu te trouves dans le texte du tour. Ce n'est pas simplement "la dernière image de la galerie". Deux styles d'affichage existent, réglés par **Viewer Display**.

**Floating** est la valeur par défaut. Un petit panneau déplaçable se place au-dessus du jeu. Son en-tête affiche **Storyboard**. Il lit la vidéo de l'image-clé dès qu'elle est prête, et se rabat sur l'image tant qu'un clip est en attente ou a échoué.

La visionneuse flottante propose ces commandes :

- **Close storyboard viewer** masque le panneau pour le tour en cours uniquement. Il réapparaît à la fin du tour GM suivant. Recharger la page annule aussi le masquage.
- **Drag storyboard viewer** est la poignée de l'en-tête. Fais glisser le panneau où tu veux à l'écran.
- **Play storyboard video** et **Pause storyboard video** commandent la lecture du clip. Les clips démarrent sans le son.
- **Mute storyboard video** et **Unmute storyboard video** n'apparaissent que si l'image-clé possède un clip déjà rendu.
- **Change storyboard viewer size** fait défiler trois largeurs : petite, moyenne (la valeur par défaut) et grande.
- Une poignée d'angle redimensionne le panneau librement et prend le pas sur la taille prédéfinie.

**Background** remplit toute la surface du jeu avec l'image-clé active, au lieu d'une fenêtre flottante. L'image ou le clip se place derrière les commandes du jeu. La logique de position de lecture reste la même que pour la visionneuse flottante.

Le mode Background a une contrepartie. Il désactive l'arrière-plan de lieu que Marinara génère normalement pour la scène. Tant qu'il est actif, le bouton **Generate background** du panneau contextuel de l'illustrateur reste désactivé. Le bouton affiche cette note : "Storyboard background display is active, so scene background generation is disabled."

## Obtenir de meilleurs résultats

Un storyboard ne vaut que par la clarté du tour qu'il lit. Les meilleurs tours disent qui bouge, ce qui change et où se situe le moment clé. Un tour vague comme "le combat continue" donne moins de matière à dessiner qu'un tour riche en actions concrètes et en détails de décor.

Pour des résultats plus réguliers :

- Garde le cadre, le ton et le style artistique de la partie bien précis dès la configuration.
- Utilise des fiches de personnage avec des avatars détaillés, et active **Send Avatar References**.
- Décris clairement dans la narration les tenues, blessures, accessoires et lieux importants.
- Utilise les profils de style d'image pour obtenir le rendu voulu.
- Utilise **Still Keyframes** pour une lecture normale, et un preset de BD ou de manga quand les clips sont activés.

## Options NovelAI

Pour une requête NovelAI compacte, choisis **NovelAI Keyframes** et désactive **Use Storyboard Template** dans le bloc **Storyboards**. Marinara envoie alors directement le prompt de scène planifié, tout en gardant disponibles les réglages distincts d'apparence, d'image de référence, d'instructions d'image et de style.

**Use NovelAI Character Prompts** fait passer chaque personnage visible par les légendes et positions natives Add Character de NovelAI. L'option est activée par défaut. Important : elle ne prend effet que pour une connexion NovelAI officielle utilisant un modèle V4 ou V4.5 sur novelai.net. Avec tout autre fournisseur ou modèle, l'interrupteur ne fait rien, et Marinara utilise à la place le prompt historique partagé.

## Dépannage

**"Choose an Illustrator image connection in Game Settings first."** Ouvre **Chat Settings**, **Agents**, puis le bloc **Illustrator**. Active **Game Illustrator** et choisis une **Image Connection**. Pour une nouvelle partie, active **Visual Generation** et choisis une **Image Generation Connection** dans l'assistant de configuration.

**"Storyboards can only be generated from GM narration turns."** **Create storyboard** ne fonctionne que sur un tour de narration GM terminé. Le bouton ne marche pas sur tes propres messages de joueur. Attends la fin de la réponse du GM, puis réessaie.

**"This GM turn has no narration to storyboard."** Le tour ne contient aucun texte d'histoire à dessiner. Cela arrive quand un tour GM ne comporte que des balises de commande cachées, sans narration. Continue de jouer jusqu'à ce que le GM écrive un tour avec du texte d'histoire, puis fais le storyboard de celui-là.

**Des images apparaissent, mais aucune vidéo.** Les vidéos réclament à la fois **Automatic Storyboard Animations** activé et une connexion **Video Generation** sélectionnée. Sans les animations, les storyboards ne produisent que des images-clés fixes.

**Les storyboards automatiques ne se lancent pas.** Vérifie que **Automatic Storyboard Illustrations** ou **Automatic Storyboard Animations** est activé. Vérifie aussi que la connexion d'image est définie et que le tour GM a fini de s'afficher en streaming. Marinara ne crée pas de second storyboard pour un tour qui en a déjà un. Tu peux quand même le refaire à la main avec **Create storyboard** dans le panneau **Gallery**.

**Le storyboard est incomplet ou bloqué.** En général, une ou plusieurs tâches d'image ou de vidéo ont échoué, expiré ou atteint une limite de débit du fournisseur. Un contenu interdit peut aussi bloquer une tâche. Si un fournisseur est lent, augmente les délais d'expiration de génération d'images et de vidéos dans le fichier `.env`, puis redémarre Marinara. Les noms exacts des variables figurent dans le [guide de configuration](../CONFIGURATION.md).

Pour un diagnostic plus poussé, règle le niveau de log sur debug et surveille le log du serveur, c'est-à-dire son journal. Les lignes de log du storyboard portent les étiquettes `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]` et `[debug/game/storyboard-video]`.

## Guides associés

- [Génération de vidéos de scène](../media/scene-video.md)
- [Fournisseurs de génération d'images](../media/image-providers.md)
- [Game Mode : premiers pas](getting-started.md)
- [Les storyboards LTX 2.3 en Game Mode](ltx-2-3-storyboards.md)
