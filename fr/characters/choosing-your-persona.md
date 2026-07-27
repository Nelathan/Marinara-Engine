# Choisir ton persona dans un chat

Ce guide explique comment choisir le persona qui te représente dans un chat. Au programme : le persona actif global, les personas propres à un seul chat et les sélecteurs rapides.

## Le persona actif et les personas propres à un chat

Le persona (le personnage que tu incarnes) est ta propre fiche de personnage, l'identité que Marinara Engine utilise pour te représenter. Il transmet à l'IA ton nom et quelques détails, pour qu'elle sache à qui elle parle. Pour apprendre à en créer un, va voir [Les personas utilisateur](personas.md).

Marinara choisit le persona sur deux niveaux :

- Le **persona actif** sert de valeur par défaut globale. Marinara l'utilise dans tout chat qui n'a pas de persona à lui.
- Un persona propre à un chat remplace le persona actif, mais pour ce chat seulement.

Un seul persona actif à la fois, pas plus. Tu peux aussi n'en avoir aucun.

## Définir le persona actif

Voici la marche à suivre pour définir le persona par défaut global :

1. Ouvre le panneau **Personas** depuis la barre latérale de droite (l'icône en forme de personne).
2. Passe le pointeur sur le persona voulu dans la liste.
3. Clique sur **Set as active** (définir comme actif), l'icône en forme de coche sur cette ligne.

Le persona actif porte un petit badge en forme de coche sur son avatar. Dès que tu en désignes un nouveau, le badge disparaît de l'ancien : un seul persona reste actif.

Les pastilles **Active** (actif) et **Inactive** (inactif) filtrent la liste et montrent d'un coup d'œil quel persona sert de valeur par défaut.

Un persona créé, dupliqué ou importé n'est jamais actif d'office. C'est toujours à toi de le désigner.

## Choisir un persona pour un seul chat

Chaque chat peut mémoriser son propre persona. Ce persona propre au chat l'emporte toujours sur le persona actif.

### Depuis Chat Settings

1. Ouvre la section **Chat Settings** (réglages du chat), via l'icône en forme d'engrenage près du chat.
2. Repère la section **Persona**. Son texte d'aide commence par "Your persona defines who you are in this chat."
3. Quand aucun persona n'est défini, la mention "No persona selected." s'affiche.
4. Clique sur le bouton **Choose Persona** (choisir un persona). Une fois un persona défini, ce bouton devient **Change Persona**.
5. Cherche dans le sélecteur (texte indicatif "Search personas...") puis clique sur un persona.

Pour retirer le persona propre au chat, clique sur le bouton de suppression (X) juste à côté, ou choisis **None** en haut du sélecteur.

En Game Mode, cette section est présentée comme ton équipe en jeu, mais elle garde l'étiquette **Persona**.

### À la création d'un chat

L'assistant de configuration **New Chat** propose un champ **Your Persona** (ton persona). Il reprend le même sélecteur avec recherche et la même option **None**. Dans l'assistant **New Game Setup**, ce champ s'appelle **Player's Persona**.

## Le Quick Persona Switcher

Dès qu'un chat est ouvert, un petit bouton rond en forme d'avatar apparaît près de la zone de saisie : c'est le **Quick Persona Switcher** (sélecteur rapide de persona). Son infobulle affiche ce nom tant qu'aucun persona n'est défini.

1. Clique sur le bouton d'avatar.
2. Un menu intitulé **Personas** s'ouvre.
3. Clique sur un persona pour changer aussitôt, ou sur **None** pour n'en utiliser aucun.

Les personas sont regroupés par dossier. Ceux qui n'ont pas de dossier apparaissent sous **Ungrouped** (sans groupe).

Sur téléphone, le changement de persona partage un menu avec le changement de connexion. Touche le chevron **Quick Switcher** (sélecteur rapide) près de la zone de saisie, puis ouvre l'onglet **Personas**. L'onglet **Connections** se trouve dans le même menu.

## Quel persona l'emporte

Marinara choisit le persona du chat dans cet ordre :

1. Le persona propre au chat, si tu en as défini un.
2. Sinon, le persona actif global.
3. Si aucun des deux n'existe, l'IA t'appelle "User" et n'envoie aucun détail de persona.

En Game Mode, le persona se choisit une seule fois, dans l'assistant **New Game Setup**. Le chat conserve ensuite le persona retenu là. À l'écran, un chat en Game Mode ne bascule pas sur le persona actif.

Changer de persona en cours de chat ne réécrit pas les messages précédents. Chaque message déjà envoyé garde le persona sous lequel il est parti.

## Guides associés

- [Les personas utilisateur : création et modification](personas.md)
- [Vue d'ensemble de Chat Settings](../chats/chat-settings.md)
