# Profils du mode Conversation (Display Name, About Me, Behavior)

Ce guide explique le petit profil dont disposent tous les personnages et tous les personas en mode Conversation. Ce profil comporte trois parties : un nom affiché, une bio "à propos de moi" et une consigne de comportement. Ces champs fonctionnent comme le profil d'une messagerie, un peu comme sur Discord. Ils ne servent qu'en mode Conversation et ne sont jamais utilisés en mode Roleplay ni en Game Mode.

Le mode Conversation, c'est le chat façon messagerie privée. Si tu le découvres, commence par lire [Mode Conversation : premiers pas](getting-started.md). Un persona, c'est le profil qui te représente (le `{{user}}`) dans un chat.

## Où se trouvent ces champs

Tous les champs du profil sont regroupés dans un onglet nommé **Convo**. Les personnages comme les personas en ont un.

1. Pour modifier le profil d'un personnage, ouvre-le dans le **Character Editor** (éditeur de personnage) et clique sur l'onglet **Convo**.
2. Pour modifier le profil de ton persona, ouvre-le dans le **Persona Editor** (éditeur de persona) et clique sur l'onglet **Convo**.

L'onglet **Convo** contient trois champs : **Convo Display Name** (nom affiché en Conversation), **About Me** (à propos de moi) et **Convo Behavior** (comportement en Conversation). Ils sont identiques pour les personnages et les personas, à une petite différence près, signalée plus bas.

## Convo Display Name

Le champ **Convo Display Name** donne le nom affiché pour ce personnage ou ce persona dans les chats en mode Conversation. Laisse-le vide pour utiliser le nom de la fiche à la place. Dès que tu le modifies, le nom change aussi sur les messages déjà présents. Cela n'a d'effet qu'en mode Conversation.

Les personnages (pas les personas) ont en plus une case à cocher : **Declare this name on the card in the prompt** (annoncer ce nom dans la fiche, au sein du prompt). Quand tu l'actives, Marinara ajoute une courte ligne au texte de la fiche de personnage. Cette ligne indique au modèle quelle fiche correspond à quel nom affiché. La case ne sert à rien tant qu'aucun nom affiché n'est renseigné.

La macro `{{convo_display}}` place le nom affiché du personnage qui répond dans un prompt personnalisé. Une macro est un espace réservé, comme `{{convo_display}}`, remplacé par du vrai texte. Hors du mode Conversation, elle ne donne rien. Voir [Macros](../prompts/macros.md).

## About Me

Le champ **About Me** contient une courte bio écrite à la première personne pour le personnage ou le persona, affichée en mode Conversation. Une ligne ou deux, un simple emoji, une blague, ou rien du tout : tout est permis. Un bouton emoji est présent dans la barre d'outils de la zone de texte pour glisser un emoji dans la bio.

Cette bio n'est pas seulement décorative. Par défaut, Marinara ajoute au prompt, à chaque tour, le contenu de **About Me** de tous les personnages et personas présents. Les bios arrivent sous la forme d'une courte liste de profils des participants. Le modèle sait ainsi toujours comment chacun se présente. Tu n'as rien à faire pour en profiter.

### Rédiger un About Me avec Professor Mari

Rien ne t'oblige à écrire la bio toi-même. Ouvre Professor Mari depuis l'écran d'accueil et demande-lui d'écrire ou de retravailler le **About Me** d'un personnage ou d'un persona que tu nommes. Elle lit d'abord le profil enregistré, rédige une courte bio à la première personne, dans la voix de cette personne, puis l'enregistre directement dans le vrai champ **About Me**.

Par exemple, demande : `Write Luna's About Me as a cryptic one-line bio.` Tu peux aussi demander une révision : rendre une bio existante plus drôle, plus courte, plus chaleureuse ou plus fidèle à la fiche.

Professor Mari utilise le modèle qui lui est configuré habituellement. Il n'existe pas de connexion, de sélecteur de source ni de bouton de génération dédiés au About Me dans les éditeurs de personnage et de persona. Sa modification enregistrée apparaît dans le flux de relecture habituel, où tu peux la garder ou la restaurer. Les modifications manuelles dans l'éditeur affichent toujours le bouton **Revert**, qui rétablit le texte tel qu'il était avant ta modification en cours.

## Convo Behavior

Le champ **Convo Behavior** est une consigne en texte libre : elle décrit la façon dont le personnage ou le persona doit se comporter en mode Conversation. Par exemple : garder des réponses courtes et en minuscules, et écrire comme une vraie personne plutôt que comme un narrateur. Cette consigne n'est jamais envoyée en mode Roleplay ni en Game Mode.

### Insertion (où va la consigne)

Sous la zone **Convo Behavior** se trouve un menu déroulant **Insertion**. Il détermine l'endroit où ta consigne est placée dans le prompt. Les choix possibles :

- L'option **Constant** marquée "after the card" (par défaut) : toujours ajoutée, juste après le texte de la fiche.
- L'option **Constant** marquée "before the card" : toujours ajoutée, juste avant le texte de la fiche.
- **Append to post-history** : ajoutée à la fin des instructions post-historique.
- **Prepend to post-history** : ajoutée au début des instructions post-historique.
- **Replace post-history** : utilisée à la place des instructions post-historique.
- **Only where `{{convo_behavior}}` is placed** : insérée uniquement là où tu as placé la macro `{{convo_behavior}}` dans un prompt personnalisé.

Les instructions post-historique sont du texte de prompt que l'application place après l'historique récent du chat. Si tu n'écris pas de prompts personnalisés, garde la valeur par défaut.

## Remplacer le About Me pour un seul chat

Le **About Me** de la fiche sert de bio par défaut, partout. Tu peux aussi définir une bio différente pour un seul chat. C'est le remplacement propre à un chat, et il s'ouvre depuis un panneau contextuel de profil.

1. Dans un chat en mode Conversation, clique sur l'avatar ou le nom d'un personnage ou d'un persona.
2. Une petite fiche de profil s'ouvre à côté de l'avatar. Sur mobile, elle remonte depuis le bas.
3. La fiche montre l'avatar agrandi, le nom et le **About Me** actuel.
4. Un badge indique **Default** quand la bio de la fiche est affichée, ou **Chat-specific** quand un remplacement propre au chat est actif. Pour les personnages, un statut apparaît aussi ici : **Online**, **Away**, **Busy** ou **Offline**.

Pour définir un remplacement :

1. Clique sur **Edit** dans le panneau contextuel.
2. Saisis la bio pour ce chat. Tu disposes d'un sélecteur d'emojis, avec notamment un onglet **Custom emojis**.
3. Clique sur **Save**. Un message doit confirmer l'enregistrement d'un about me propre au chat.

Pendant la modification, le bouton **Revert** annule les changements non enregistrés, et **Cancel** ferme le mode édition sans rien enregistrer. Quand un remplacement existe, un bouton **Clear** le supprime et rétablit la bio par défaut de la fiche. Enregistrer une bio vide supprime aussi le remplacement. À retenir : le **About Me** par défaut se modifie sur la fiche, et un remplacement ne vaut que pour ce chat-là.

## Laisser un personnage modifier lui-même son About Me

Il existe aussi un outil qu'un personnage peut appeler sur le moment pour changer sa propre bio. Il s'appelle **update_about_me**. Il est désactivé par défaut. Active-le dans **Chat Settings** (réglages du chat), à la section **Function Calling** : active **Enable Tool Use**, puis ajoute l'outil **update_about_me**.

Une fois l'outil actif, un personnage peut modifier sa propre bio de deux manières :

- La portée publique change la vraie bio, celle que tu vois dans tous les chats. Elle t'est d'abord soumise pour approbation.
- La portée chat change une bio privée, limitée à la conversation en cours.

## Utiliser les profils dans des prompts personnalisés

Les macros ne sont pas nécessaires pour que les profils parviennent au modèle. Les bios **About Me** sont ajoutées au prompt automatiquement, et **Convo Behavior** suit son réglage **Insertion**. Les macros servent aux prompts personnalisés, quand tu veux placer une valeur toi-même, à un endroit précis.

Quatre macros insèrent ces valeurs de profil dans le texte. Chacune ne donne rien hors du mode Conversation :

- `{{convo_display}}` : le nom affiché du personnage qui répond.
- `{{char_about}}` : le **About Me** effectif du personnage.
- `{{persona_about}}` : le **About Me** effectif du persona.
- `{{convo_behavior}}` : la consigne **Convo Behavior** du personnage.

Voir [Macros](../prompts/macros.md) pour la liste complète des macros.

## Guides associés

- [Mode Conversation : premiers pas](getting-started.md)
- [Créer et modifier des personnages](../characters/creating-and-editing-characters.md)
- [Personas utilisateur : création et modification](../characters/personas.md)
- [Référence des agents téléchargeables](../agents/built-in-agents.md)
- [Macros](../prompts/macros.md)
