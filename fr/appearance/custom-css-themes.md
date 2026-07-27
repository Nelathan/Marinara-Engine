# Thèmes CSS personnalisés (Theme Library)

Ce guide explique comment changer toute l'allure de Marinara Engine avec un thème CSS personnalisé. Au programme : créer, importer, exporter et activer un thème. Tu découvres aussi quelles variables CSS se modifient, et comment les thèmes cohabitent avec le CSS de fiche.

## Qu'est-ce qu'un thème personnalisé

Un thème personnalisé, c'est un bloc de CSS qui repeint Marinara. Le CSS, abréviation de Cascading Style Sheets, est le code qui définit les couleurs, les bordures et les espacements dans toute l'application. Un thème peut changer l'arrière-plan de la page, la couleur d'accentuation, les cartes, les bordures, le texte, et bien plus encore.

Les thèmes personnalisés vivent dans la section **Theme Library** (bibliothèque de thèmes). Marinara les stocke sur le serveur : ils se synchronisent donc sur tous les appareils et tous les navigateurs connectés au même serveur. C'est différent de la plupart des autres réglages d'apparence, qui restent sur un seul appareil. Pour les réglages propres à chaque appareil, consulte le guide [Réglages d'apparence](appearance-settings.md).

Un seul thème personnalisé peut être actif à la fois. Garde autant de thèmes que tu veux dans la bibliothèque, et passe de l'un à l'autre quand ça te chante.

## Où trouver la Theme Library

1. Ouvre **Settings** (Paramètres).
2. Ouvre l'onglet **Addons**.
3. Repère la section **Theme Library**.

La section s'intitule **Theme Library** et affiche "Create, import, activate, edit, export, or remove custom CSS themes."

## Créer un thème

1. Dans la section **Theme Library**, clique sur **Create Theme** (créer un thème).
2. Saisis un nom dans le champ **Theme name**.
3. Écris ou colle le CSS dans la grande zone de texte.
4. Laisse l'interrupteur **Preview** (aperçu) activé pour voir les changements en direct dans l'application pendant que tu tapes. Désactive **Preview** pour arrêter l'aperçu en direct.
5. Clique sur **Save** (enregistrer).

Un nouveau thème part d'un modèle. Ce modèle liste les variables les plus courantes sous forme d'exemples mis en commentaire : retire les marques de commentaire et donne tes propres valeurs. Quand tu enregistres un thème tout neuf, Marinara l'active aussitôt. Une confirmation apparaît avec le nom du thème, par exemple : Theme "My Theme" saved and activated.

Pour modifier un thème plus tard, retrouve-le dans la liste **Installed Themes** (thèmes installés). Clique sur l'icône de code (son infobulle indique **Edit theme CSS**), fais tes modifications, puis clique sur **Save**. Modifier un thème enregistré le met à jour, mais ne change pas le thème actif.

## Importer et exporter des thèmes

Les thèmes se partagent sous forme de fichiers. Pratique pour déplacer un thème d'un serveur à un autre, ou pour le transmettre à un ami.

Pour importer un thème :

1. Clique sur **Import File** (importer un fichier) dans la section **Theme Library**.
2. Choisis un fichier `.css` ou un fichier `.json`.
3. Lis le message qui s'affiche. Il indique combien de thèmes ont été importés, ignorés ou refusés.

Un fichier `.css` devient un seul thème, qui porte le nom du fichier. Un fichier `.json` peut contenir un ou plusieurs thèmes, et il en existe deux sortes.

La première sorte, c'est un fichier exporté depuis Marinara. Chaque thème y est entouré de champs supplémentaires que Marinara ajoute à l'export. Tu n'as ni à le lire ni à le modifier. Importe le fichier tel quel.

La seconde sorte, c'est un petit fichier que tu écris toi-même. Pour un thème unique, ceci suffit :

```
{ "name": "My Theme", "css": "..." }
```

Les thèmes importés se synchronisent sur le serveur, mais ils ne s'activent pas d'eux-mêmes. Un thème déjà présent sur le serveur, avec le même nom et le même CSS, est ignoré plutôt qu'ajouté en double.

Pour exporter un thème, retrouve-le dans la liste **Installed Themes** et clique sur l'icône de téléversement (son infobulle indique **Export theme**). Marinara télécharge un fichier `.json` que tu peux importer ailleurs.

## Activer un thème

La liste **Installed Themes** montre tous les thèmes, avec en haut une entrée **Default Theme** (thème par défaut).

1. Clique sur le nom d'un thème pour l'activer. Une coche signale le thème actif.
2. Clique sur **Default Theme** pour désactiver le thème personnalisé et revenir à l'allure d'origine de Marinara.

Le bouton **Reset Appearance** (réinitialiser l'apparence) se trouve en haut de la section **App Style**, dans **Settings -> Appearance**. Il désactive lui aussi le thème personnalisé actif.

Pour supprimer définitivement un thème, clique sur l'icône de corbeille sur sa ligne (son infobulle indique **Remove theme**), puis confirme dans la fenêtre **Delete Theme**. Le CSS du thème disparaît alors du serveur, sans retour possible.

## La référence des variables CSS

L'éditeur de thème contient une section dépliable **CSS Variable Reference**. Clique dessus pour voir les variables les plus utiles à redéfinir. Un thème modifie l'application en donnant une valeur à ces variables dans un bloc `:root`. Voici les variables listées dans cette référence :

| Variable | Ce qu'elle règle |
| --- | --- |
| `--background` | Arrière-plan de la page |
| `--foreground` | Texte principal |
| `--primary` | Accentuation et boutons |
| `--primary-foreground` | Texte sur la couleur primaire |
| `--secondary` | Cartes et champs de saisie |
| `--card` | Arrière-plan des cartes |
| `--border` | Bordures |
| `--muted-foreground` | Texte atténué |
| `--sidebar` | Arrière-plan de la barre latérale |
| `--sidebar-border` | Bordure de la barre latérale |
| `--marinara-shell-edge-border` | Bord gauche et droit du cadre |
| `--destructive` | Erreur et suppression |
| `--popover` | Arrière-plan des menus déroulants |
| `--accent` | Surbrillance au survol |

Tu n'es pas limité à cette liste. Un thème peut définir n'importe quelle variable CSS utilisée par Marinara, et il peut aussi ajouter d'autres styles personnalisés.

Certains effets visuels ont leur propre variable. Un thème peut par exemple demander l'animation de pulsation de l'accentuation en définissant `--marinara-theme-accent-pulse: enabled`.

Par sécurité, Marinara nettoie le CSS des thèmes personnalisés avant de l'appliquer. Les styles qui chargent un fichier depuis un autre site web ne fonctionnent pas. Pour utiliser une image ou une police dans un thème, intègre-la sous forme d'URI `data:` au lieu d'un lien web. Une URI `data:` contient directement le contenu du fichier à l'intérieur du CSS.

## Limites de taille et de nom

Un nom de thème peut atteindre 200 caractères. Le CSS peut peser jusqu'à 256 Kio, mesurés en octets UTF-8 et non en caractères. Au-delà, le thème est refusé à l'enregistrement comme à l'import.

## Admin Access pour les installations distantes

Créer, modifier, importer, activer et supprimer un thème sont des actions protégées. Cela ne concerne que l'ouverture de Marinara à travers un réseau.

Si tu ouvres Marinara sur l'ordinateur qui fait tourner le serveur, via le loopback (aussi appelé localhost), ces actions fonctionnent directement. Si tu ouvres Marinara depuis un autre appareil, un téléphone ou un ordinateur de ton réseau par exemple, le serveur réclame d'abord un secret d'administration.

Pour gérer les thèmes à travers un réseau :

1. Sur le serveur, définis `ADMIN_SECRET` dans le fichier `.env`.
2. Dans l'application, ouvre **Settings -> Advanced -> Admin Access** (accès administrateur) et saisis la même valeur.

Sans cela, toute modification de thème à travers un réseau échoue. Pour la configuration complète, consulte la [Référence de configuration du serveur](../CONFIGURATION.md) et le [guide d'accès à distance](../REMOTE_ACCESS.md).

## Comment les thèmes et le CSS de fiche se combinent

Marinara propose deux façons d'ajouter du CSS personnalisé. Ce sont deux fonctionnalités distinctes, et elles peuvent être actives en même temps.

Un thème personnalisé repeint toute l'application. Il a le droit de redéfinir les variables fondamentales de Marinara, d'employer `!important` et d'employer `position: fixed`. C'est tout l'intérêt d'un thème.

Le CSS de fiche, c'est autre chose. Le créateur d'un personnage ou d'un persona peut intégrer du CSS dans une fiche, et tu l'actives chat par chat. Ce CSS-là est nettoyé plus sévèrement : il ne peut pas redéfinir les variables fondamentales de l'application, `!important` est retiré, et `position: fixed` devient `position: absolute`. Il met en forme les messages du chat, pas l'application entière. Consulte le [Guide du CSS de fiche](card-css-theming.md).

Si l'application a une drôle d'allure, pense à vérifier à la fois le thème actif et le CSS de fiche. L'un comme l'autre peut être en cause.

## Guides associés

- [Guide du CSS de fiche](card-css-theming.md)
- [Réglages d'apparence](appearance-settings.md)
- [Référence de configuration du serveur](../CONFIGURATION.md)
- [Accès à distance : authentification de base et liste d'autorisation d'IP](../REMOTE_ACCESS.md)
