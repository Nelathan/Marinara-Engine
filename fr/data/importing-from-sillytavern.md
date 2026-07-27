# Importer depuis SillyTavern

Ce guide explique comment récupérer tes données SillyTavern dans Marinara Engine. Deux approches : importer un fichier à la fois, ou analyser tout un dossier SillyTavern et tout importer d'un coup.

## Ce que tu peux récupérer

Marinara Engine sait importer ces types de données SillyTavern :

- Les personnages (fiches de personnage)
- Les chats (historiques de messages)
- Les chats de groupe (chats avec plusieurs personnages)
- Les presets (réglages de génération)
- Les lorebooks (SillyTavern les appelle "World Info")
- Les arrière-plans (images d'arrière-plan du chat)
- Les personas (tes propres profils **{{user}}**)

Un lorebook est un recueil de notes que l'IA lit quand certains mots apparaissent dans le chat. Un preset est un ensemble de réglages de génération enregistré. Un persona est le profil qui te représente dans un chat, le personnage que tu incarnes.

L'import se fait de deux façons. Pour un seul fichier, utilise les boutons dédiés. Pour transférer une installation SillyTavern complète en une fois, passe par l'assistant **Import from SillyTavern Folder** (importer depuis un dossier SillyTavern).

## Imports rapides fichier par fichier

Ouvre **Settings** (Paramètres), puis l'onglet **Imports**, et repère la section **SillyTavern Import**. Sa description indique "Bring over characters, chats, presets, and lorebooks from SillyTavern files."

Cette section propose quatre boutons, un par fichier. Chacun ouvre un sélecteur de fichiers classique, sans option supplémentaire :

- **Import Character (JSON/PNG)** accepte une fiche de personnage `.json` ou `.png`.
- **Import Chat (JSONL)** accepte un historique de chat `.jsonl`. Il crée toujours un chat **Roleplay** et t'y bascule.
- **Import Preset (JSON)** accepte un fichier de preset `.json`.
- **Import Lorebook (JSON)** accepte un fichier World Info `.json`.

JSONL signifie un enregistrement JSON par ligne. C'est le format dans lequel SillyTavern enregistre un historique de chat.

Quand tu importes un personnage dont la fiche contient un lorebook intégré, le navigateur te demande si tu veux aussi l'importer comme lorebook Marinara indépendant. Clique sur **OK** pour conserver le World Info comme lorebook autonome et réutilisable. Clique sur **Cancel** pour sauter cette étape et n'importer que le personnage.

Ces boutons rapides s'appuient sur des valeurs par défaut fixes, non modifiables ici. Ils conservent tous les tags d'origine et limitent les scripts regex au seul personnage. Un script regex est une règle de rechercher-remplacer qui modifie le texte avant ou après son passage par l'IA. Pour choisir ces options toi-même, passe plutôt par le bouton **Import** du panneau Characters. Voir [Importer et exporter des fiches de personnage](../characters/import-export.md).

### Importer un chat dans un mode précis

Le bouton **Import Chat (JSONL)** ci-dessus crée toujours un chat **Roleplay**. Pour que le chat arrive dans un autre mode, utilise plutôt le petit bouton d'import en haut de la liste des chats. Son infobulle indique **Import SillyTavern or Marinara chat JSONL**. Ce bouton importe le fichier dans l'onglet de mode ouvert à ce moment-là : Conversation, Roleplay ou Game. Pour en savoir plus sur l'import et l'export de chats, voir [Exporter et importer des chats](../chats/export-import.md).

## Import from SillyTavern Folder

Cet assistant analyse un dossier SillyTavern complet et importe de nombreux éléments d'un coup. Il traite ensemble les personnages, les chats, les chats de groupe, les presets, les lorebooks, les arrière-plans et les personas.

Pour l'ouvrir, va dans **Settings**, puis **Imports**, puis la section **SillyTavern Import**, et clique sur **Import from SillyTavern Folder**. Une fenêtre intitulée **Import from SillyTavern** s'ouvre.

### Étape 1 : indiquer le dossier SillyTavern

1. Dans le champ **SillyTavern Folder Path**, saisis le chemin de ton dossier SillyTavern. Par exemple `/path/to/SillyTavern`.
2. Autre option : clique sur le bouton **Browse** (parcourir) pour choisir le dossier avec le sélecteur de ton ordinateur. Sur un serveur distant ou sans interface graphique, un explorateur de dossiers intégré s'ouvre à la place, avec un bouton **Select This Folder** (sélectionner ce dossier).
3. Vise le dossier SillyTavern principal. L'indication affichée dans la fenêtre précise qu'il s'agit en général du dossier qui contient un sous-dossier `data/` ou `public/`.
4. Clique sur **Scan Folder** (analyser le dossier). Le bouton affiche **Scanning...** pendant le traitement.

Une fois l'analyse terminée, Marinara indique combien d'éléments il a trouvés dans chaque catégorie. S'il n'arrive pas à lire le dossier, une erreur s'affiche, par exemple "Could not find SillyTavern data directory."

### Étape 2 : choisir ce que tu importes

L'écran suivant s'intitule **Choose exactly what to import**. Il affiche une liste à cocher par catégorie : **Characters**, **Chats**, **Group Chats**, **Presets**, **Lorebooks**, **Backgrounds** et **Personas**. Un compteur indique le nombre d'éléments sélectionnés.

Chaque catégorie dispose de boutons **All** et **None**, ainsi que d'un interrupteur **Show** ou **Hide** pour afficher le détail des éléments et leurs dates.

Presque tout est présélectionné. Seuls les presets fournis d'origine avec SillyTavern font exception. Marinara les repère et les laisse décochés, avec un bandeau qui explique pourquoi. Il s'agit des presets standards comme `default`, `deterministic`, `neutral` et les presets `universal-*`. Laisse-les décochés, sauf si tu tiens vraiment à en avoir des copies.

Si l'analyse a trouvé des personnages, deux réglages supplémentaires apparaissent :

- **Imported character tags** définit le mode d'import des tags. Choisis **All tags** pour conserver les tags d'origine, **No tags** pour les ignorer, ou **Existing only** pour ne garder que les tags déjà présents dans Marinara. La valeur par défaut est **All tags**.
- **Imported regex scripts** définit la portée des scripts regex. Choisis **Character only** pour que les scripts s'appliquent à chaque bot, ou **Global** pour les ajouter à **Presets -> Regexes** et les appliquer à tous les chats. La valeur par défaut est **Character only**.

Quand ta sélection te convient, clique sur **Import Selected**. Le bouton **Back** te ramène à l'étape du dossier.

### Étape 3 : suivre la progression

Marinara importe les éléments un par un. Tu vois un indicateur d'activité, la catégorie et le nom de l'élément en cours, une barre de progression et des compteurs par catégorie qui avancent en direct.

### Étape 4 : lire le bilan

La dernière étape affiche un bandeau **Import complete!** si l'import a réussi, ou un bandeau d'erreur en cas d'échec. En cas de réussite, une carte par catégorie donne le total final. Si un élément a échoué, une liste d'avertissements affiche une ligne par échec, du type `Character "Foo": error message`. Clique sur **Done** pour fermer la fenêtre.

### Comment l'assistant traite tes données

- L'import fonctionne au mieux, élément par élément. Si un personnage, un chat, un preset, un lorebook, un arrière-plan ou un persona échoue, Marinara le saute, note un avertissement et poursuit avec le reste.
- Plusieurs fichiers de chat appartenant à un même personnage arrivent sous forme de branches d'un seul chat, et non de chats distincts.
- Les chats de groupe deviennent toujours des chats **Roleplay**.
- Les éléments importés conservent la date de dernière modification du fichier source comme date dans Marinara. Ce n'est pas le moment de l'import qui compte.

## Accès et règles sur les dossiers

Les boutons d'import fichier par fichier fonctionnent pour tout le monde, sans configuration particulière.

L'assistant **Import from SillyTavern Folder** lit des fichiers sur le disque : il lui faut donc un accès privilégié. Sur la même machine que le serveur (loopback), aucune configuration n'est nécessaire. Depuis un autre appareil ou un autre navigateur, tu dois définir un secret administrateur sur le serveur. Enregistre ensuite la même valeur dans **Settings -> Advanced -> Admin Access**. Voir [Référence de configuration du serveur](../CONFIGURATION.md) pour savoir comment définir ce secret.

Si ton serveur définit `IMPORT_ALLOWED_ROOTS`, Marinara refuse les chemins saisis en dehors de ces dossiers. Les chemins choisis via **Browse** ou l'explorateur de dossiers intégré fonctionnent toujours, même avec ce réglage actif.

## Ce qui n'est pas transféré

L'assistant de dossier n'analyse que les sept catégories listées plus haut. Les autres données SillyTavern, comme les réglages généraux de l'application et les réponses rapides, ne sont ni lues ni importées.

Les presets fournis d'origine avec SillyTavern restent décochés par défaut : ils ne sont donc pas récupérés, sauf si tu les coches toi-même.

Marinara ignore tout élément dont la conversion échoue. Consulte la liste d'avertissements à la dernière étape de l'assistant pour voir précisément ce qui a été laissé de côté.

## Guides associés

- [Importer et exporter des fiches de personnage](../characters/import-export.md)
- [Importer et exporter des lorebooks](../lorebooks/import-export.md)
- [Exporter et importer des chats](../chats/export-import.md)
- [Scripts regex](../extending/regex-scripts.md)
