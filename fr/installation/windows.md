# Guide d'installation sous Windows

Ce guide explique comment installer Marinara Engine sous Windows. Deux voies s'offrent à toi : l'installateur en un clic, le plus simple, ou une installation depuis les sources. Tu y trouves aussi la configuration requise, les fonctionnalités optionnelles et la marche à suivre pour mettre à jour plus tard.

## Configuration requise

Marinara Engine tourne sur ton propre PC Windows. Il te faut :

- Windows 10 ou Windows 11 (64 bits).
- Quelques gigaoctets d'espace disque libre pour l'application et ses dépendances.
- Une connexion internet pendant l'installation, pour télécharger le code et les paquets.

Les deux méthodes reposent sur deux outils. L'installateur peut les récupérer à ta place. Avec la méthode depuis les sources, tu les installes toi-même :

- **Node.js** version 24, 25 ou 26. Node.js fait tourner l'application. La version 24 est la version LTS recommandée. LTS signifie Long Term Support, c'est-à-dire une version stable et suivie dans la durée.
- **Git**. Git télécharge le code et permet ensuite à l'application de se mettre à jour toute seule.

pnpm est le gestionnaire de paquets qui installe les différentes parties de l'application. Avec l'installateur ou le lanceur **start.bat**, tu n'as pas besoin d'installer pnpm toi-même. Les deux récupèrent la bonne version de pnpm via Corepack, un utilitaire pnpm fourni avec Node.js, ou via un téléchargement temporaire. Seule l'installation manuelle sans le lanceur exige la commande `pnpm` sur ton système. Cette section décrit alors l'étape d'installation.

## Méthode 1 : l'installateur Windows (recommandé)

L'installateur est le moyen le plus simple de démarrer. Il vérifie la présence de Node.js et de Git, t'aide à les installer s'ils manquent, télécharge l'application, la compile et crée les raccourcis.

Voici la marche à suivre :

1. Ouvre la page des versions de Marinara Engine dans le navigateur.

```text
https://github.com/Pasta-Devs/Marinara-Engine/releases
```

2. Télécharge depuis cette page le fichier d'installation Windows le plus récent.
3. Lance l'installateur et suis les indications à l'écran. Si Node.js ou Git manquent, laisse l'installateur s'en charger.
4. Choisis le dossier d'installation quand la question arrive, ou garde la valeur par défaut.
5. Laisse l'installateur télécharger l'application et la compiler. Compte quelques minutes.
6. Une fois terminé, double-clique sur le nouveau raccourci du bureau pour lancer Marinara Engine.

Le navigateur s'ouvre sur l'application après un court instant. S'il ne s'ouvre pas tout seul, ouvre-le et va à cette adresse :

```text
http://127.0.0.1:7860
```

L'installateur met en place une copie de l'application basée sur Git. Elle peut donc se mettre à jour au lancement suivant. Voir la section sur les mises à jour, plus bas.

Si l'antivirus t'alerte au sujet de l'installateur, il s'agit d'une fausse alerte connue. L'installateur télécharge Node.js et Git, et certains antivirus signalent ce comportement. Ne lance l'installateur que si tu l'as téléchargé depuis la page officielle des versions indiquée ci-dessus.

## Méthode 2 : installer depuis les sources

Choisis cette méthode si tu préfères taper les commandes toi-même, ou si tu veux la version de test (staging).

### Étape 1 : installer Node.js et Git

1. Télécharge l'installateur de Node.js depuis le site officiel et lance-le.

```text
https://nodejs.org/en/download
```

2. Télécharge l'installateur de Git depuis le site officiel et lance-le.

```text
https://git-scm.com/download/win
```

3. Ouvre une nouvelle fenêtre d'invite de commandes. Vérifie que Node.js est en version 24, 25 ou 26 :

```bat
node -v
```

4. Vérifie que Git est installé :

```bat
git --version
```

Chaque commande doit afficher un numéro de version. Si une commande reste introuvable, ferme puis rouvre l'invite de commandes, ou réinstalle l'outil manquant.

### Étape 2 : télécharger le code et lancer l'application

Le script de lancement **start.bat** fait la configuration à ta place. Il choisit la bonne version de pnpm, installe les dépendances, compile l'application et ouvre le navigateur.

1. Télécharge le code avec Git :

```bat
git clone https://github.com/Pasta-Devs/Marinara-Engine.git
```

2. Entre dans le nouveau dossier :

```bat
cd Marinara-Engine
```

3. Optionnel : passer à la version de test. Le téléchargement démarre sur la version stable. Si tu préfères la version de test (staging), lance cette commande avant le premier démarrage. Ignore cette étape si tu veux la version stable. Sauvegarde tes données avant d'utiliser une version de test.

```bat
git checkout staging
```

Après ce changement, le lanceur te maintient sur la version de test lors des mises à jour.

4. Lance le script de démarrage :

```bat
start.bat
```

Le premier démarrage prend quelques minutes, le temps de tout installer et compiler. Une fois prêt, le navigateur s'ouvre sur l'application à l'adresse `http://127.0.0.1:7860`. Pour relancer l'application plus tard, exécute **start.bat** depuis le même dossier.

Par défaut, le lanceur ouvre l'application au réseau local : les autres appareils du réseau peuvent donc l'atteindre. Voir plus bas la section sur l'accès depuis un autre appareil.

### Installation manuelle sans le lanceur

Si tu préfères taper chaque commande plutôt que de passer par le fichier **start.bat**, place-toi dans le dossier `Marinara-Engine`.

1. Installe pnpm. Cette voie n'utilise pas le lanceur : la commande `pnpm` doit donc exister sur ton système. La commande `npm`, elle, est fournie avec Node.js. À lancer une seule fois :

```bat
npm install -g pnpm
```

2. Installe les dépendances :

```bat
pnpm install --force
```

3. Compile l'application :

```bat
pnpm build
```

4. Démarre le serveur :

```bat
pnpm start
```

5. Ouvre l'application dans le navigateur :

```text
http://127.0.0.1:7860
```

Tout tourne sur ton propre ordinateur. Avec cette méthode manuelle, l'application écoute sur `127.0.0.1` : seul cet ordinateur peut l'atteindre. Pour autoriser les autres appareils du réseau à s'y connecter, crée un fichier nommé `.env` dans le dossier `Marinara-Engine`. Ajoute-lui cette ligne, puis redémarre le serveur :

```env
HOST=0.0.0.0
```

## Optionnel : suppression d'arrière-plan des sprites par IA

Marinara Engine demande une transparence native pour les sprites fixes générés – un sprite, c'est l'image du personnage sur le plateau – et intègre un nettoyage adaptatif du détourage pour les fonds unis et les anciens arrière-plans blancs. Autre option : installer un outil complémentaire appelé `backgroundremover`, en renfort pour les décors détaillés et les autres arrière-plans non uniformes. Il reste optionnel parce qu'il télécharge de gros fichiers d'apprentissage automatique.

Pour t'en servir, il te faut d'abord Python. Installe Python 3.11 depuis le site officiel, puis lance la commande d'installation depuis le dossier `Marinara-Engine` :

```text
https://www.python.org/downloads/windows/
```

Lance l'étape d'installation :

```bat
pnpm backgroundremover:install
```

Un dossier Python privé (un venv) est alors créé dans ton dossier de données. Marinara Engine s'en sert ensuite automatiquement pour nettoyer les sprites. Un venv est une installation Python autonome, sans effet sur le reste de ton système.

Autre option : laisser **start.bat** installer l'outil au prochain démarrage. Ajoute cette ligne au fichier `.env` :

```env
BACKGROUNDREMOVER_AUTO_INSTALL=true
```

## Accéder depuis un autre appareil

Tu peux ouvrir Marinara Engine depuis ton téléphone, ta tablette ou un autre ordinateur du même réseau. Pour les étapes de configuration et les options de sécurité, consulte le guide [Foire aux questions](../FAQ.md).

## Mettre à jour Marinara Engine

Les chats, les personnages et les réglages restent en place lors d'une mise à jour. Marinara Engine propose trois façons de mettre à jour sous Windows.

### Mises à jour automatiques avec le lanceur

Quand tu lances l'application par le raccourci du bureau ou par le fichier **start.bat** depuis une copie basée sur Git, le lanceur commence par chercher les mises à jour. S'il en existe une plus récente, il télécharge les modifications, réinstalle les dépendances, recompile l'application, puis la démarre. Cela vaut aussi bien pour les installations par l'installateur que pour les clones manuels.

Lance `start.bat --skip-update` pour sauter une vérification. Pour conserver la version installée du moteur d'un démarrage à l'autre, ajoute `AUTO_UPDATE_ENABLED=false` au fichier `.env`. Les vérifications manuelles, l'application de la mise à jour depuis l'interface et les mises à jour manuelles par Git restent disponibles.

Si tu as des modifications locales non enregistrées dans le code, le lanceur essaie de les mettre de côté sans risque. Il les remet en place après la mise à jour. S'il n'y parvient pas, il garde ta version actuelle et affiche un message.

### Mises à jour depuis l'application

Tu peux aussi chercher les mises à jour directement dans l'application.

1. Ouvre **Settings** (Paramètres).
2. Va dans l'onglet **Advanced** (Avancé).
3. Repère la section **Updates** (Mises à jour).
4. Choisis un canal dans **Release Channel** (canal de publication). Prends **Latest Stable** pour la version normale, ou **Staging/UAT** pour les versions de test anticipées. Sauvegarde tes données avant d'utiliser une version de test.
5. Clique sur **Check for Updates** (rechercher les mises à jour). L'application t'indique si une version plus récente est disponible.

Par sécurité, le bouton **Apply Update** (appliquer la mise à jour) est désactivé par défaut. Appliquer la mise à jour depuis l'application demande une configuration supplémentaire. Dans le fichier `.env`, définis les valeurs suivantes :

```env
UPDATES_APPLY_ENABLED=true
ADMIN_SECRET=your-own-secret-value
```

Ouvre ensuite **Settings**, va dans l'onglet **Advanced**, repère **Admin Access** (accès administrateur) et colle-y la même valeur secrète. Le bouton **Apply Update** devient alors disponible.

Si tu ouvres l'application depuis un iPhone ou un iPad connecté à ce PC Windows, **Apply Update** met à jour ce serveur Windows. L'application à distance réclame une valeur de plus dans le fichier `.env` :

```env
UPDATES_ALLOW_REMOTE_APPLY=true
```

Si tu n'actives pas l'application de la mise à jour depuis l'interface, relance simplement l'application par le raccourci ou par le fichier **start.bat** pour la mettre à jour.

### Mise à jour manuelle

Si tu utilises une copie Git sans le lanceur, tu peux mettre à jour à la main. Lance ces commandes depuis le dossier `Marinara-Engine`.

1. Récupère le dernier code stable :

```bat
git fetch origin +refs/heads/main:refs/remotes/origin/main
```

2. Passe à la dernière version stable :

```bat
git merge --ff-only origin/main || git checkout --detach origin/main
```

3. Réinstalle les dépendances :

```bat
pnpm install --force
```

4. Recompile l'application :

```bat
pnpm build
```

5. Redémarre le serveur :

```bat
pnpm start
```

Pour les versions de test, utilise la branche staging à la place. Lance ces deux commandes au lieu des étapes 1 et 2 ci-dessus. Enchaîne ensuite avec les étapes d'installation et de compilation :

```bat
git fetch origin +refs/heads/staging:refs/remotes/origin/staging
```

```bat
git checkout -B staging origin/staging
```

## En cas de problème

Si l'installation ou le démarrage échoue, vérifie d'abord que Node.js est en version 24, 25 ou 26 et que Git est bien installé. Si l'antivirus bloque l'installateur ou le téléchargement, il s'agit de la fausse alerte connue évoquée plus haut.

Pour d'autres solutions, consulte le guide [Résoudre les problèmes de Marinara Engine](../TROUBLESHOOTING.md).

## Guides associés

- [Installation de Marinara Engine](../INSTALLATION.md) : choisir la bonne méthode d'installation selon l'appareil.
- [Mettre à niveau Marinara Engine](../UPGRADING.md) : plus de détails pour garder l'application à jour.
- [Résoudre les problèmes de Marinara Engine](../TROUBLESHOOTING.md) : les solutions aux problèmes courants.
- [Foire aux questions](../FAQ.md) : des réponses rapides, y compris sur l'accès réseau.
