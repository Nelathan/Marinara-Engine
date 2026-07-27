# Importer et exporter des lorebooks

Ce guide explique comment faire entrer des lorebooks dans Marinara Engine et comment les enregistrer sous forme de fichiers. Au programme : un fichier à la fois, plusieurs fichiers d'un coup, et les deux formats d'export. Un lorebook est un ensemble de notes déclenchées par des mots-clés, que Marinara ajoute au prompt envoyé à l'IA dès qu'un mot correspondant apparaît. Dans d'autres outils de roleplay, cette fonctionnalité s'appelle **World Info**.

## Ce que tu peux importer

Marinara lit deux types de fichiers de lorebook, et il reconnaît tout seul celui que tu lui donnes :

- Un lorebook exporté depuis Marinara. Tous les champs et tous les dossiers sont conservés.
- Un fichier **World Info** venu d'un autre outil. Cela inclut les fichiers World Info de SillyTavern et le format "character-book" des fiches de personnage V2. Marinara fait correspondre les champs de l'autre outil aux siens.

Dans les deux cas, ce sont de simples fichiers `.json`. Aucun compte ni clé API (un code secret, un peu comme un mot de passe) n'est nécessaire pour importer un lorebook.

## Importer un lorebook

Voici la marche à suivre pour importer un fichier de lorebook.

1. Ouvre le panneau **Lorebooks** depuis le côté gauche de l'application.
2. Clique sur l'icône de flèche vers le bas, dans la rangée d'actions du haut. Son infobulle indique **Import** (importer). Elle se trouve entre l'icône plus (**New**, nouveau) et l'icône coche (**Select**, sélectionner). Ces trois boutons n'affichent que des icônes : survole-les pour voir leur nom.
3. La fenêtre **Import Lorebook** (importer un lorebook) s'ouvre. Une zone y affiche **Drop one or more lorebook files here or click to browse**.
4. Fais glisser le fichier `.json` sur cette zone, ou clique dessus pour choisir un fichier.
5. Attends le résultat. Chaque fichier affiche soit une coche verte avec **Imported lorebook**, soit une marque rouge avec un message d'erreur.
6. Clique sur **Close** (fermer). Le nouveau lorebook apparaît alors dans la liste du panneau **Lorebooks**.

Marinara conserve la date d'origine du fichier importé comme date de création du lorebook, et non le moment où tu l'as importé.

## Importer plusieurs lorebooks d'un coup (import groupé)

La fenêtre **Import Lorebook** accepte plusieurs fichiers en une seule fois.

1. Ouvre le panneau **Lorebooks** et clique sur l'icône de flèche vers le bas. Son infobulle indique **Import**.
2. Fais glisser plusieurs fichiers `.json` en même temps sur la zone de dépôt, ou clique dessus et sélectionne plusieurs fichiers.
3. Marinara importe les fichiers l'un après l'autre et affiche une ligne de résultat pour chacun. Une ligne de synthèse récapitule le nombre de réussites et d'échecs.

Tu peux mélanger fichiers Marinara et fichiers **World Info** dans le même lot. Marinara traite chaque fichier séparément.

## Exporter un lorebook

L'export enregistre un lorebook dans un fichier sur ton appareil. C'est ainsi que tu partages un lorebook ou que tu le transfères vers une autre installation.

1. Dans le panneau **Lorebooks**, clique sur un lorebook pour ouvrir son éditeur.
2. Clique sur l'icône d'export dans l'en-tête de l'éditeur. Son infobulle indique **Export lorebook** (exporter le lorebook).
3. La fenêtre **Export Lorebook** s'ouvre avec deux choix. Prends-en un :
   - **Marinara Native** conserve les dossiers Marinara et tous les champs des entrées. Utilise ce format pour transférer un lorebook vers une autre installation Marinara sans rien perdre. Le nom du fichier se termine par `.marinara.json`.
   - **Compatible JSON** enregistre un fichier **World Info** sans dossiers, destiné aux autres outils de roleplay. Certains détails propres à Marinara sont abandonnés. Le nom du fichier se termine par `.json`.
4. Le navigateur télécharge le fichier.

Choisis **Marinara Native** si le fichier est destiné à Marinara. Choisis **Compatible JSON** s'il est destiné à un autre outil.

## Exporter plusieurs lorebooks d'un coup (export groupé)

Tu peux enregistrer plusieurs lorebooks dans un seul fichier zip.

1. Dans le panneau **Lorebooks**, clique sur l'icône coche dans la rangée d'actions du haut. Son infobulle indique **Select**.
2. Coche la case de chaque lorebook à exporter.
3. Clique sur **Export** (exporter) dans la barre de sélection, en bas.
4. Le navigateur télécharge un seul fichier zip nommé `marinara-lorebooks.zip`.

L'export groupé utilise toujours le format **Marinara Native** : le fichier revient donc dans Marinara sans aucune perte.

## Importer un dossier SillyTavern complet

Les étapes ci-dessus importent des fichiers de lorebook que tu possèdes déjà. Autre option : récupérer les lorebooks directement depuis un dossier d'installation SillyTavern complet. Cette méthode récupère en même temps les personnages, les chats et les presets. Elle passe par un assistant d'import de dossier distinct. Voir [Importer depuis SillyTavern](../data/importing-from-sillytavern.md).

## Après l'import

Un lorebook importé fonctionne immédiatement avec les déclencheurs par mots-clés. Si tu utilises la recherche sémantique, qui associe les entrées par le sens, il faut reconstruire ses vecteurs après l'import. Voir [Recherche sémantique pour les lorebooks](semantic-search.md).

## Guides associés

- [Vue d'ensemble des lorebooks](overview.md)
- [Relier des lorebooks aux personnages et aux personas](linking-to-characters.md)
- [Recherche sémantique pour les lorebooks](semantic-search.md)
- [Importer depuis SillyTavern](../data/importing-from-sillytavern.md)
