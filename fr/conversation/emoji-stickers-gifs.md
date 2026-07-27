# Emojis personnalisés, stickers et GIF

Ce guide explique quelles images supplémentaires tu peux ajouter à un chat en mode **Conversation** : emojis personnalisés, stickers personnalisés et GIF trouvés par recherche. Il montre aussi comment régler quels emojis et stickers personnalisés le personnage a le droit d'utiliser dans ses réponses.

Ces outils fonctionnent uniquement en mode **Conversation**. Les modes **Roleplay** et **Game** n'ont que le sélecteur d'emojis standard : pas d'emojis personnalisés, pas de stickers, pas de recherche de GIF.

## Où trouver ces outils

Dans un chat en mode **Conversation**, regarde la barre de saisie du message. Un bouton rond avec une icône de smiley porte l'étiquette **Emoji, GIFs & stickers**. Clique dessus pour ouvrir un petit panneau au-dessus de la barre de saisie.

Le panneau contient ces onglets :

- **Emoji** : la grille d'emojis standard, plus un onglet étoile nommé **Custom emojis** (emojis personnalisés) pour tes images téléversées.
- **GIFs** : la recherche de GIF en direct.
- **Stickers** : tes stickers téléversés.

Un onglet **Tools** apparaît aussi quand d'autres outils de saisie sont activés. Sur mobile, les mêmes onglets s'ouvrent dans un panneau au-dessus du clavier.

## Emojis personnalisés

Un emoji personnalisé est une petite image que tu téléverses une fois et que tu réutilises dans n'importe quel chat en mode **Conversation**. Dans un message, il s'écrit sous forme de shortcode, c'est-à-dire le nom de l'emoji entouré de deux-points, comme `:kekw:`.

Les emojis personnalisés sont partagés dans tout ton profil. Un seul téléversement suffit, ensuite ils sont disponibles partout.

### Téléverser un emoji personnalisé

1. Ouvre le panneau **Emoji, GIFs & stickers** et va dans l'onglet **Emoji**.
2. Clique sur l'onglet étoile nommé **Custom emojis**.
3. Clique sur **Upload** et choisis un ou plusieurs fichiers image.
4. Dans la fenêtre **Name this emoji**, saisis un nom et clique sur **Add**.

Le nouvel emoji apparaît alors dans la grille **Custom emojis**.

Les noms d'emoji suivent des règles strictes. Un nom compte de 1 à 32 caractères. Seuls les lettres minuscules, les chiffres et les tirets bas sont autorisés. Si tu saisis des espaces ou des majuscules, l'application nettoie le nom pour toi. Elle passe par exemple les lettres en minuscules et remplace les autres caractères par des tirets bas.

L'image d'un emoji personnalisé ne doit pas dépasser 256 par 256 pixels. L'application le vérifie au téléversement. Les noms doivent être uniques parmi tous tes emojis personnalisés. Si tu choisis un nom déjà pris, une erreur s'affiche : `An emoji named ":name:" already exists.`

Un fichier GIF animé peut servir d'emoji personnalisé. Il s'anime directement dans le chat. C'est indépendant de l'onglet **GIFs** décrit plus bas.

### Utiliser un emoji personnalisé

Clique sur n'importe quelle tuile de la grille **Custom emojis** pour insérer son shortcode dans le message. Cela n'envoie pas le message, cela insère seulement le texte. Autre option : taper le shortcode à la main, par exemple `:kekw:`. Écris le nom en minuscules, exactement tel que tu l'as enregistré.

### Renommer, supprimer, exporter et importer

Clique sur **Edit** (modifier) en haut de l'onglet **Custom emojis** pour activer le mode édition.

En mode édition :

- Clique sur une tuile pour ouvrir la fenêtre **Rename emoji**, puis clique sur **Rename**.
- Clique sur le petit badge corbeille d'une tuile pour supprimer cet emoji. La fenêtre **Delete emoji** prévient que les messages qui l'utilisaient déjà afficheront le texte brut à la place.
- Clique sur **Export** pour télécharger tous tes emojis personnalisés dans un fichier nommé `marinara-custom-emojis.json`. Ce fichier contient les images, il est donc entièrement portable.
- Clique sur **Import** pour charger un fichier exporté auparavant. L'import ignore les emojis qui ne respectent pas les règles de nom ou de taille, ainsi que ceux dont le nom est déjà pris.

## Stickers personnalisés

Un sticker personnalisé fonctionne comme un emoji personnalisé, mais pour des images plus grandes. Un sticker s'écrit `sticker:name:` et s'affiche toujours en grande image bloc, sur sa propre ligne.

Ouvre l'onglet **Stickers** dans le même panneau. Téléverser, nommer, renommer, supprimer, exporter et importer fonctionne comme pour les emojis, à ces différences près :

- La fenêtre de téléversement s'intitule **Name this sticker**.
- L'image d'un sticker ne doit pas dépasser 512 par 512 pixels.
- Les noms de stickers sont uniques parmi tous tes stickers. Un doublon affiche `A sticker named "sticker:name:" already exists.`
- L'export télécharge un fichier nommé `marinara-custom-stickers.json`.

### Envoyer un sticker

Clique sur une tuile de sticker dans la grille. Une fenêtre **Send sticker** (envoyer le sticker) demande comment l'utiliser, avec deux choix :

- **Send & reply** : publie aussitôt le sticker comme message à part entière et laisse le personnage répondre.
- **Add to message** : insère le texte `sticker:name:` dans ton message pour que tu puisses continuer à écrire.

## Recherche de GIF (Giphy)

L'onglet **GIFs** interroge Giphy, une grande bibliothèque de GIF en ligne. Saisis un mot dans le champ de recherche pour trouver des GIF, ou parcours la liste des tendances. Clique sur un GIF pour l'envoyer dans le chat.

### La recherche de GIF a besoin d'une clé

La recherche de GIF réclame une clé API Giphy gratuite. Une clé API est un code secret qui autorise Marinara Engine à s'adresser au service Giphy en ton nom. Sans clé, l'onglet **GIFs** affiche une carte de configuration au lieu des résultats.

Pour mettre en place la recherche de GIF :

1. Ouvre le Giphy Developer Dashboard à l'adresse `https://developers.giphy.com/dashboard/`.
2. Crée une clé API gratuite pour une application web.
3. Ajoute la clé au fichier `.env`. C'est le fichier de réglages du serveur de Marinara.

Ajoute une ligne comme celle-ci dans le fichier `.env` :

```
GIPHY_API_KEY=your_key_here
```

Une fois la clé ajoutée, redémarre Marinara. Pour tout savoir sur le fichier `.env`, consulte le guide de configuration du serveur en lien plus bas.

### Classement du contenu des GIF

Les résultats de GIF utilisent le classement de contenu mature de Giphy. Ce réglage est figé et ne peut pas être changé dans l'application. Les résultats peuvent contenir des GIF suggestifs ou adultes : garde-le en tête pendant tes recherches. Il n'existe aucune source de GIF hors ligne ou garantie sans contenu sensible.

## Marquer une image de galerie comme emoji ou sticker

N'importe quelle image déjà enregistrée dans une **Character Gallery** (galerie de personnage) ou une **Persona Gallery** (galerie de persona) peut être marquée comme emoji ou sticker personnalisé. Une image de galerie marquée reste limitée à ce personnage ou à ce persona. Elle ne fonctionne que dans les chats où ils sont présents.

Pour marquer une image de galerie :

1. Ouvre le **Character Editor** (éditeur de personnage) ou le **Persona Editor** (éditeur de persona).
2. Va dans l'onglet **Gallery** et ouvre le sous-onglet **Images**.
3. Survole une image et clique sur le petit bouton de marquage dans son coin supérieur gauche.
4. Choisis **Make emoji** ou **Make sticker**.
5. Dans la fenêtre **Custom Emoji** ou **Custom Sticker**, saisis un nom.

Le bouton de marquage change alors et affiche le nom attribué.

Les mêmes limites de taille s'appliquent ici. **Make emoji** plafonne à 256 par 256 pixels et **Make sticker** à 512 par 512 pixels. Si une image est trop grande pour le type choisi, une notification d'erreur rouge apparaît.

Pour modifier une image marquée plus tard, clique de nouveau sur son bouton de marquage. Le menu propose **Rename**, une option de bascule comme **Switch to sticker**, et une option de retrait comme **Remove emoji**. Le marquage ne déplace ni ne copie l'image : elle reste aussi une image de galerie normale.

## Préférences de sélection

Marinara peut indiquer au personnage qui répond quels emojis et stickers personnalisés il a le droit d'utiliser dans sa réponse. Cela se règle dans **Selection preferences** (préférences de sélection).

Pour ouvrir le panneau, clique sur l'icône d'engrenage nommée **Selection preferences**. Elle se trouve en haut de l'onglet **Custom emojis** et de l'onglet **Stickers**. Les deux ouvrent le même réglage. Ce réglage est enregistré par chat, chaque chat peut donc différer.

Le panneau contient une ligne de mode avec trois choix :

- **Semantic** (le choix par défaut) : propose les emojis et les stickers qui collent le mieux à la conversation récente. Le mode **Semantic** s'appuie sur un embedder local, un petit modèle d'IA qui tourne sur ta propre machine. S'il n'est pas disponible, ce mode bascule sur **Random**.
- **Random** : propose un ensemble aléatoire à chaque réponse.
- **Tool-call** : un appel au modèle choisit les éléments adaptés à chaque réponse. Tu dois sélectionner une connexion dans le menu déroulant qui apparaît. Si la connexion n'est pas définie ou échoue, le mode bascule sur **Semantic**. Dans un tour de chat de groupe où plusieurs personnages répondent, **Tool-call** est ignoré pour ce tour et la sélection bascule sur **Semantic**.

Sous les modes se trouve le réglage **Max offered (each)** (nombre maximum proposé, par type). Il fixe combien de noms d'emojis personnalisés et combien de noms de stickers sont proposés au personnage à chaque tour. La valeur par défaut est 20. Tu peux la régler de 1 à 100.

## Comment s'affichent les emojis et les stickers personnalisés

Dans un chat en mode **Conversation**, un shortcode d'emoji comme `:kekw:` s'affiche en petite image intégrée à la ligne de texte. Si un message ne contient que des shortcodes d'emoji et rien d'autre, ils s'affichent en plus grand.

Un sticker comme `sticker:wave:` s'affiche toujours en grande image bloc, sur sa propre ligne.

Si un nom est introuvable, par exemple après la suppression de l'emoji, le message affiche le texte brut du shortcode à la place, comme `:kekw:`.

## Les réactions n'utilisent que le pool global d'emojis

Tu peux réagir à un message avec un emoji personnalisé. Les réactions n'acceptent que tes emojis personnalisés principaux, le pool global. Les emojis marqués depuis une galerie, les stickers et les GIF ne sont pas disponibles en réaction. Les réactions aux messages sont traitées dans le guide de démarrage du mode **Conversation**.

## Guides associés

- [Mode Conversation : premiers pas](getting-started.md)
- [Galeries de personnage et de persona](../characters/galleries.md)
- [Référence de configuration du serveur](../CONFIGURATION.md)
