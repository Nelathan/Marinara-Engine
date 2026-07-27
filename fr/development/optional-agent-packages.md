# Packages d'agents et de capacités optionnels

Statut : implémenté pendant le cycle de développement de la v2.3.0, dans le ticket #3612.

## Objectif

La distribution de base de Marinara Engine ne doit ni compiler ni livrer les implémentations d'agents et de capacités optionnels. Une installation neuve démarre sans aucun package optionnel. Une mise à jour conserve les capacités disponibles avant l'arrivée de ce système de packages.

Le catalogue officiel, les sources des packages, les artefacts reproductibles, les scripts de validation et le processus de contribution se trouvent dans [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents). Les artefacts installés sont placés sous le dossier de données Marinara configuré, pour que les mises à jour de l'application ne puissent pas les écraser.

## Modèle de package

Un package d'agent peut apporter un ou plusieurs agents déclaratifs, ainsi que des capacités exécutables de confiance en option :

- des points d'entrée serveur pour les routes, les hooks de cycle de vie, les fournisseurs de prompts, les gestionnaires de résultats et les migrations de stockage ;
- des points d'entrée client pour les panneaux, les surfaces de chat, les sections de réglages, les choix de configuration et les affichages d'exécution ;
- des schémas JSON partagés et des contrats de communication stables ;
- des ressources, de la documentation et des fragments de connaissances pour Professor Mari, tous détenus par le package.

Les packages ciblent une version précise de l'API de capacités Marinara. Ils ne doivent pas importer de chemins de source privés du moteur.

Les éléments d'interface de capacité reçoivent la langue d'interface retenue par le moteur via leurs attributs `lang` et `dir` et via
l'objet `capabilityProps.localization`. Les interfaces détenues par un package gardent leurs propres fichiers de langue et retombent sur
l'anglais du package ; le moteur ne traduit ni les prompts du package ni les valeurs machine qu'il définit. Un changement de langue réutilise
l'événement `marinara-capability-props` existant : une interface installée se réaffiche donc sans redémarrer le moteur.

L'API de capacités 1.1 ajoute une façade d'exécution générique au contexte d'activation serveur.
Les packages peuvent lire l'état effectif du débogage d'agent et écrire dans le logger Pino
du moteur, y compris en forçant explicitement le mode débogage, sans importer le
logger privé ni les modules de configuration d'exécution. La façade expose des opérations,
pas les objets internes du moteur.

L'API de capacités 1.2 ajoute des opérations de chat et de message limitées à une transaction, des
écritures ciblées de métadonnées de chat, des lectures d'existence d'entrée de lore et le magasin de compatibilité
des instantanés spatiaux. Les packages peuvent valider des changements métier à l'intérieur d'une transaction du
moteur et valider de façon atomique des métadonnées avec un message propriétaire, un swipe ou un instantané
spatial, sans jamais recevoir de connexion à la base de données ni d'objet de table. Le moteur garde la main sur le
rollback et sur la compatibilité du stockage historique ; les packages gardent la validation et la politique métier. La même API expose
les enregistrements normalisés de chats et de personnages, la sélection des entrées de lore éligibles,
l'analyse des réponses au format JSON ou approchant, et les appels résolus au modèle de langage.
Les identifiants de connexion, les implémentations de fournisseurs, les connexions à la base de données et les objets de stockage
restent privés au moteur.

## Packages initiaux

- tous les agents actuellement intégrés ;
- les cartes spatiales hiérarchiques pour Roleplay et Game ;
- les appels audio et vidéo du mode Conversation ;
- UNO ;
- les échecs ;
- le poker ;
- le billard 8-Ball ;
- le morpion ;
- pierre-papier-ciseaux.

La base conserve le gestionnaire de packages, le client de catalogue, les contrats génériques du pipeline d'agents, les contrats génériques d'hébergement de jeu au tour par tour et des interfaces hôtes inertes. Les implémentations concrètes appartiennent aux packages.

## Confiance et installation

Le catalogue officiel est un document JSON versionné, validé par schéma et récupéré en HTTPS. Chaque entrée de version contient des URL d'artefacts immuables, des empreintes SHA-256, des tailles en octets, la compatibilité moteur, les permissions et l'indication d'un redémarrage nécessaire à son exécution.

Au démarrage du serveur, l'hôte récupère le catalogue une fois, à condition qu'au moins un package officiel soit installé, retient uniquement les versions plus récentes compatibles avec le moteur et l'API de capacités en cours d'exécution, les vérifie par le pipeline d'installation habituel, puis les installe avant que les runtimes des packages ne s'activent. Les échecs sont isolés package par package. Les fichiers existants et l'état du registre restent utilisables lorsque le catalogue est hors ligne ou que la vérification échoue, et les échecs de disponibilité du runtime serveur empruntent le chemin de rollback vers la version précédente.

L'installateur doit :

1. exiger un accès privilégié en loopback ou administrateur ;
2. imposer HTTPS, des limites de téléchargement et des délais d'expiration ;
3. vérifier la confiance du catalogue et le SHA-256 de l'artefact avant extraction ;
4. rejeter les chemins absolus, la traversée de dossiers, les liens, les fichiers de périphérique et les fichiers non déclarés ;
5. valider le manifeste et la compatibilité moteur ;
6. extraire dans un dossier temporaire voisin ;
7. n'activer de façon atomique qu'une fois la validation réussie ;
8. conserver la version précédente jusqu'au démarrage réussi du nouveau runtime ;
9. annuler l'activation en cas d'échec ;
10. n'exécuter aucun script d'installation, de mise à jour ou de désinstallation.

Seuls les packages exécutables de confiance issus du projet lui-même sont activés par le catalogue officiel. Un futur circuit pour les packages tiers demandera une conception de confiance explicite et distincte.

## Exécution et comportement au redémarrage

Le serveur détient le registre des packages installés et expose les capacités installées aux clients. Les modules déclaratifs et rechargeables s'activent immédiatement. L'interface invalide les requêtes de catalogue, d'agents, de capacités de mode et de chat actif après l'activation.

Le manifeste ne peut déclarer `restartRequired` que si l'hôte ne sait pas recharger ce point d'entrée sans risque. Une activation à chaud réussie affiche `Agent installed. It is ready to use.` Une activation qui exige un redémarrage affiche `Agent installed. Restart Marinara Engine to finish setup.`

Les packages de jeu au tour par tour se rechargent à chaud : l'installation enregistre aussitôt leur moteur serveur et leur lanceur manuel en commande slash, et la désinstallation détache le runtime sans redémarrer le moteur. Les réglages Conversation Commands propres à chaque chat déterminent seulement si les personnages peuvent émettre la commande cachée du package ; ils ne bloquent pas le lanceur slash de l'utilisateur. Les manifestes officiels actuels des jeux au tour par tour gardent leur ancien marqueur de redémarrage, par prudence, pour rester compatibles avec le moteur 2.x ; le moteur 3.x reconnaît le type `turn-game`, réalise l'activation à chaud en toute sécurité et renvoie le package comme actif et prêt.

## Migration de compatibilité

Au premier lancement après mise à jour :

- les agents personnalisés restent intacts ;
- chaque ancien agent intégré visible dans cette installation est enregistré comme installé ;
- les cartes, les appels du mode Conversation et les jeux du mode Conversation gardent leur disponibilité antérieure ;
- la configuration existante propre à chaque chat, les instantanés, l'état du jeu, l'historique des appels et la mémoire des agents restent en place ;
- la migration est idempotente et n'enregistre son achèvement qu'une fois toutes les entrées de disponibilité héritées écrites durablement.

Les artefacts des anciens packages restent disponibles dans le catalogue officiel comme sources de migration. Une installation neuve ne les expose ni ne les active tant que l'utilisateur ne les a pas installés.

## Désinstallation

La désinstallation retire le package des sélections de chat actives, supprime la configuration de ses agents et les fichiers exécutables téléchargés, et détache son runtime au redémarrage si nécessaire. Les chats, messages, instantanés de carte, résumés d'appels et parties terminées de l'historique restent lisibles : retirer un package ne peut donc pas détruire le travail de l'utilisateur. La suppression destructive des données métier historiques est une action distincte et explicite de l'utilisateur.

Chaque désinstallation demande une confirmation. Les chats concernés reviennent à leurs surfaces de base habituelles sans corrompre l'historique.

## Interface du catalogue

Le panneau **Agents** contient un contrôle `Download Agents` qui reprend le principe du contrôle `Download Cards` du Card Browser. Il ouvre une bibliothèque plein écran et responsive, avec recherche, types de packages, informations de compatibilité, état d'installation ou de mise à jour, permissions, coût de stockage, documentation et contrôles de désinstallation.

Sur ordinateur, une liste de navigation s'accompagne d'une zone de détail voisine. Sur mobile, un seul panneau est affiché, avec un retour explicite et des actions dimensionnées pour le tactile. Les états vide, hors ligne, incompatible, téléchargement corrompu, installation interrompue, mise à jour, rollback et redémarrage requis sont traités comme des cas de premier plan.

## Critère d'extraction

Une extraction n'est complète que lorsque les bundles de production du client et du serveur de base ne contiennent plus l'implémentation du package, qu'une installation neuve ne peut pas l'activer sans télécharger le package, qu'une installation mise à jour la conserve, et que l'installation, la mise à jour et la désinstallation du package fonctionnent sur les systèmes de fichiers d'ordinateur, de mobile et compatibles Termux.
