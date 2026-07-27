# Organiser les connexions

Ce guide explique comment garder tes connexions enregistrées bien rangées dans Marinara Engine. Au programme : les dossiers de connexions, la recherche et le tri, la duplication et la suppression, le pool aléatoire, le Quick Connection Switcher, et l'export ou l'import des connexions. Une connexion est une configuration enregistrée qui indique à Marinara comment joindre un service d'IA.

Tout se passe dans le panneau **Connections** (Connexions). Ouvre-le : tes connexions enregistrées s'affichent sous forme de liste. Chaque ligne indique le nom de la connexion, et juste en dessous son fournisseur et son modèle.

## Les dossiers de connexions

Les dossiers de connexions servent à regrouper des connexions qui vont ensemble. Range par exemple tous les modèles locaux dans un dossier et tous les fournisseurs payants dans un autre.

Pour créer un dossier, procède ainsi :

1. Clique sur le bouton **New Folder** (nouveau dossier) au-dessus de la liste des connexions.
2. Un nouveau dossier nommé "unnamed" apparaît.
3. Renomme-le tout de suite pour le reconnaître (voir ci-dessous).

Pour renommer un dossier, double-clique sur la ligne du dossier, ou touche-la deux fois sur un écran tactile. Autre option : sélectionne la ligne du dossier et appuie sur la touche **F2**. Saisis le nouveau nom, puis appuie sur Enter.

Pour ranger une connexion dans un dossier, fais glisser la ligne de la connexion et dépose-la sur le dossier. Pour l'en ressortir, fais-la glisser vers la zone située sous les dossiers. Pendant le glissement, une indication affiche **Drop here to move out of folder**.

Pour replier ou déplier un dossier, clique une fois sur sa ligne. Un petit nombre sur la ligne du dossier indique combien de connexions il contient.

Pour supprimer un dossier, clique sur l'icône de corbeille sur sa ligne. S'il contient encore des connexions, Marinara demande confirmation avec une fenêtre **Delete Folder** (supprimer le dossier). Un dossier vide est supprimé aussitôt, sans confirmation. Supprimer un dossier ne supprime pas les connexions qu'il contient : elles retournent simplement dans la zone des connexions non classées.

## Recherche et tri

Le champ **Search connections...** filtre la liste au fil de la saisie. La recherche porte sur le nom de la connexion, le fournisseur, le modèle, l'URL de base, le service d'images ou de vidéos, et le modèle d'embedding. Quand rien ne correspond, tu vois "No connections match your search".

Le menu déroulant **Sort order** (ordre de tri), à côté du champ de recherche, change l'ordre de la liste. Il propose cinq options :

| Option | Effet |
|---|---|
| **Custom** | Ton ordre personnel, défini par glisser-déposer. |
| **A-Z** | Tri par nom, de A à Z. |
| **Z-A** | Tri par nom, de Z à A. |
| **Newest** | Les connexions les plus récentes d'abord. |
| **Oldest** | Les connexions les plus anciennes d'abord. |

Pour définir un ordre personnalisé, fais glisser les lignes de connexions vers le haut ou vers le bas. Dès que tu déplaces une connexion, le tri bascule automatiquement sur **Custom**.

## Dupliquer et supprimer

Survole une ligne de connexion (ou regarde simplement la ligne sur un écran tactile) pour faire apparaître ses boutons d'action.

Pour dupliquer une connexion, clique sur le bouton **Duplicate** (dupliquer), l'icône de copie. Marinara en fait une copie complète, clé API comprise. La copie s'ouvre dans l'éditeur pour que tu la renommes. Il n'y a aucune étape de confirmation.

Pour supprimer une seule connexion, clique sur son bouton **Delete** (supprimer), l'icône de corbeille. Marinara affiche une fenêtre **Delete Connection** qui indique Delete "your connection name"? This cannot be undone. Clique sur **Delete** pour confirmer.

Pour supprimer ou exporter plusieurs connexions d'un coup, clique sur le bouton **Select** (sélectionner) en haut du panneau. Le mode sélection s'active. Touche les connexions voulues, puis utilise le bouton **Export** (exporter) ou **Delete** dans la barre d'action en bas. La suppression groupée affiche une fenêtre **Delete Connections** avant de retirer quoi que ce soit.

## Le pool aléatoire et le Quick Connection Switcher

Le pool aléatoire permet à un chat de choisir une connexion différente à chaque génération de réponse. Pratique pour répartir les requêtes entre plusieurs fournisseurs ou modèles.

Pour ajouter une connexion au pool aléatoire, clique sur l'icône de mélange sur sa ligne. Son infobulle indique **Add to random pool**. Une fois la connexion dans le pool, l'infobulle devient **In random pool (click to remove)**. Clique de nouveau sur l'icône pour l'en retirer.

Pour qu'un chat utilise le pool aléatoire, ouvre la section **Chat Settings** (réglages du chat), va dans la section **Connection**, et choisis **🎲 Random** dans le menu déroulant. En Game Mode, ce menu déroulant s'appelle **GM / Party Model**. Chaque réponse pioche alors une connexion au hasard dans le pool.

Le **Quick Connection Switcher** est un moyen plus rapide de changer la connexion du chat en cours. Clique sur l'icône de lien dans la zone de saisie du chat pour l'ouvrir. Il affiche tes connexions dans un petit menu :

- Clique sur une connexion pour l'utiliser immédiatement dans le chat en cours.
- Clique sur le bouton de dé en haut du menu pour activer ou désactiver le pool aléatoire pour ce chat.
- Quand le pool aléatoire est actif, cliquer sur une connexion l'ajoute au pool ou l'en retire. Une coche indique quelles connexions font partie du pool.

## Exporter et importer des connexions

Exporte tes connexions dans un fichier pour les sauvegarder ou les transférer vers une autre installation, puis réimporte-les plus tard.

**Tes clés API ne sont jamais incluses dans un export.** Après avoir importé des connexions, tu dois ouvrir chacune d'elles et saisir de nouveau sa clé API.

Pour exporter une seule connexion, ouvre-la dans l'éditeur et clique sur son bouton **Export**, l'icône de téléversement. Pour en exporter plusieurs d'un coup, passe en mode **Select** dans le panneau et clique sur **Export** dans la barre d'action. Avant le début du téléchargement, Marinara affiche une fenêtre **Export Connection Data** avec cet avertissement : This will export your connection data, WITHOUT your provided API Key. Remember to never share those with others! Clique sur **Export** pour continuer.

Une connexion seule est téléchargée sous la forme d'un fichier `.connection.json`. Plusieurs connexions sont téléchargées ensemble dans un fichier `marinara-connections.zip`.

Pour importer des connexions, clique sur le bouton **Import** (importer) en haut du panneau **Connections**. La fenêtre **Import Connections** s'ouvre. Dépose un ou plusieurs fichiers `.json` dessus, ou clique pour aller les chercher. La fenêtre te le rappelle : Imported connections never include API keys. Add each key again after import. Après l'import, chaque nouvelle connexion a une clé API vide, tant que tu ne l'as pas renseignée.

## Guides associés

- [Se connecter à un fournisseur d'IA](connecting-to-a-provider.md)
- [Vue d'ensemble des réglages du chat](../chats/chat-settings.md)
