# Intégration Home Assistant

Ce guide explique comment connecter Marinara Engine à Home Assistant. Une fois la connexion établie, les personnages IA peuvent piloter de vrais appareils de maison connectée directement depuis un chat : lumières, chauffage, volets et lecteurs multimédias. Dans l'autre sens, les automatisations Home Assistant peuvent envoyer des messages dans Marinara.

Home Assistant est une plateforme gratuite et open source pour piloter les appareils de maison connectée. Si tu n'utilises pas Home Assistant, cette intégration ne te sert à rien.

## Ce que fait cette intégration

L'intégration est un petit logiciel qui s'installe dans Home Assistant. Elle relie un Home Assistant en fonctionnement à un serveur Marinara Engine en fonctionnement. Une fois installée, elle fait trois choses pour toi, automatiquement :

- Elle crée des outils de maison connectée dans Marinara. Ils apparaissent dans la section **Functions** du panneau **Presets**. Marinara les appelle "custom tools" ou "Functions". Voir [Outils personnalisés](../extending/custom-tools.md) pour le fonctionnement général des Functions.
- Elle crée dans Marinara un agent IA nommé **Home Assistant**. Un agent est une IA auxiliaire qui tourne en parallèle du chat. Voir [Agents : des aides IA pour tes chats](../agents/agents-overview.md).
- Elle crée plusieurs entités Home Assistant, pour que tu puisses surveiller et piloter Marinara depuis Home Assistant. Une entité, c'est un appareil, un capteur ou une commande dans Home Assistant.

Aucune adresse d'outil à copier, aucun outil à configurer à la main : l'intégration branche tout dès la première configuration.

## Prérequis

Avant de commencer, vérifie que tu as bien tout ce qui suit.

- Un Home Assistant en fonctionnement, en version 2024.1.0 ou plus récente.
- HACS installé dans Home Assistant. HACS, le Home Assistant Community Store, sert à installer des intégrations personnalisées qui ne sont pas livrées avec Home Assistant.
- Marinara Engine installé, en fonctionnement, et accessible depuis la machine qui héberge Home Assistant. L'adresse par défaut est `localhost:7860`. Si Home Assistant tourne sur un autre appareil, lis la note ci-dessous sur les mots de passe.
- Le réglage `WEBHOOK_LOCAL_URLS_ENABLED=true` ajouté au fichier `.env` de Marinara.

Le fichier `.env` est le fichier de réglages en texte brut du serveur Marinara. Voir [Configuration du serveur](../CONFIGURATION.md) pour savoir où il se trouve et comment le modifier.

Ce dernier réglage est nécessaire parce que l'intégration passe par un webhook. Un webhook est une adresse web qui permet à un logiciel d'en alimenter un autre automatiquement. L'adresse du webhook de Home Assistant est une adresse locale en simple `http`. Par sécurité, Marinara bloque par défaut les appels vers les adresses locales en `http`. Le réglage `WEBHOOK_LOCAL_URLS_ENABLED=true` les autorise.

Ajoute cette ligne au fichier `.env` :

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

Le réglage prend effet en quelques secondes. Inutile de redémarrer le serveur Marinara.

### Si Home Assistant tourne sur un autre appareil

L'intégration se connecte à Marinara sans nom d'utilisateur ni mot de passe. Le formulaire de configuration ne prévoit aucun champ pour ça. L'endroit où tourne Home Assistant a donc son importance :

- Si Home Assistant et Marinara tournent sur la même machine, la connexion fonctionne telle quelle.
- Si Home Assistant tourne sur un autre appareil, Marinara bloque la connexion par défaut. Il faut alors autoriser l'appareil Home Assistant à se connecter sans mot de passe. Une solution : ajouter l'adresse IP de cet appareil à `IP_ALLOWLIST` dans le fichier `.env` de Marinara. Une adresse IP est le numéro qui identifie un appareil sur le réseau. Sur un réseau domestique entièrement fiable, tu peux à la place définir `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true`.
- Si Marinara est protégé par `BASIC_AUTH_USER` et `BASIC_AUTH_PASS`, l'intégration ne peut pas s'authentifier. Elle ne fonctionne alors que depuis la même machine, ou depuis un appareil listé dans `IP_ALLOWLIST`.

Voir [Accès à distance](../REMOTE_ACCESS.md) pour comprendre ces réglages et choisir le bon.

## Installer l'intégration dans Home Assistant

L'installation se fait en deux temps : d'abord l'ajout à HACS, ensuite la configuration.

### L'ajouter à HACS

1. Dans Home Assistant, ouvre **HACS**.
2. Ouvre le menu à trois points, puis clique sur **Custom repositories**.
3. Dans le champ du dépôt, saisis cette adresse :

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. Choisis la catégorie **Integration**, puis clique sur **Add**.
5. Cherche **Marinara Engine**, puis installe-le.
6. Redémarre Home Assistant.

### La configurer

1. Va dans **Settings** (Paramètres), puis **Devices & Services**, et clique sur **Add Integration**.
2. Cherche **Marinara Engine**.
3. Saisis le **Host** et le **Port** où tourne Marinara. Par défaut : `localhost` et `7860`.
4. Clique sur **Submit**.

Si Marinara est injoignable à cette adresse, Home Assistant affiche une erreur et s'arrête là. Voir la section Dépannage plus bas.

## Ce que Marinara Engine crée automatiquement

Quand la configuration aboutit, l'intégration construit tout à ta place.

- Elle enregistre un webhook privé dans Home Assistant.
- Elle crée les outils de maison connectée dans la section **Functions** de Marinara, chacun déjà pointé vers ce webhook.
- Elle crée l'agent **Home Assistant** dans Marinara, avec la liste de tous les outils activés.
- Elle crée les entités Home Assistant décrites plus loin dans ce guide.

## Ajouter l'agent Home Assistant à un chat

Créer l'agent ne l'attache pas à tous les chats. Il faut l'ajouter à chaque chat où tu veux piloter la maison connectée.

1. Ouvre le chat voulu.
2. Ouvre **Chat Settings** (réglages du chat), puis la section **Agents**.
3. Ajoute l'agent **Home Assistant** au chat.

L'agent Home Assistant fonctionne dans les chats Roleplay, Conversation et Game. Une fois ajouté, les outils de maison connectée deviennent automatiquement accessibles à l'IA dans ce chat. Rien d'autre à activer.

## Vérifier que tout fonctionne

Teste la connexion avec une seule demande toute simple.

1. Ajoute l'agent **Home Assistant** à un chat, comme indiqué ci-dessus.
2. Dans ce chat, écris une demande simple, par exemple : `Turn on the office lights`.
3. Envoie le message.

L'IA doit appeler un outil de maison connectée, `ha_turn_on` par exemple, et les lumières concernées doivent s'allumer. L'IA confirme ensuite ce qu'elle a fait. Si rien ne se passe, vérifie que `WEBHOOK_LOCAL_URLS_ENABLED=true` est bien défini, puis consulte la section Dépannage.

## Catégories d'outils exposées

L'intégration répartit ses outils de maison connectée en huit catégories. C'est toi qui choisis celles que Marinara a le droit d'utiliser.

Pour modifier les catégories, ouvre **Settings**, puis **Devices & Services**, clique sur **Marinara Engine**, puis sur **Configure**. Deux options s'affichent :

- **Primary Chat** (chat principal) : le chat visé par défaut par les services Home Assistant. Ces services sont décrits plus loin dans ce guide.
- **Exposed Tool Categories** (catégories d'outils exposées) : la liste des catégories d'outils que Marinara a le droit d'utiliser.

Le tableau ci-dessous donne chaque catégorie, son état par défaut et les outils qu'elle contient.

| Catégorie | Par défaut | Outils |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

Les catégories **Locks** et **Generic Service Calls (Advanced)** sont désactivées par défaut. Ne les active que si tu en as besoin. **Generic Service Calls (Advanced)** autorise l'IA à appeler n'importe quel service Home Assistant : à manier avec prudence.

La plupart des outils acceptent soit un appareil précis, soit un nom de pièce. Avec un nom de pièce, l'outil agit d'un coup sur tous les appareils correspondants de la pièce.

Les changements de catégories ne prennent effet qu'après un appui sur **Marinara Sync HA Tools** ou un redémarrage de Home Assistant. Ce bouton est décrit dans la section suivante.

## Entités Home Assistant

L'intégration crée ces entités sous un appareil Home Assistant nommé **Marinara Engine**.

| Entité | Type | Rôle |
|---|---|---|
| Marinara Chat Count | Sensor | Affiche le nombre total de chats Marinara |
| Marinara Active Agent Count | Sensor | Affiche le nombre d'agents Marinara activés |
| Marinara Active Chat | Select | Choisit le chat visé par les services Home Assistant |
| Marinara Agent: (nom) | Switch | Active ou désactive un agent Marinara. Il y a un interrupteur par agent |
| Marinara Abort Generation | Button | Annule toute réponse IA en cours de génération |
| Marinara Sync HA Tools | Button | Renvoie tous les outils et reconstruit l'agent Home Assistant |

L'intégration interroge Marinara toutes les 30 secondes pour repérer les nouveaux chats et agents. Un chat ou un agent que tu viens de créer dans Marinara peut donc mettre jusqu'à 30 secondes à apparaître ici.

## Piloter Marinara depuis les automatisations Home Assistant

L'intégration ajoute deux services Home Assistant. Ils s'utilisent dans les automatisations Home Assistant, pas dans Marinara. Tous deux visent par défaut le **Primary Chat**.

### Send Message (marinara_engine.send_message)

Ce service envoie un message dans un chat Marinara.

- `message` : le texte du message. Ce champ est obligatoire.
- `chat_id` : le chat destinataire. Laissé vide, c'est le Primary Chat qui est utilisé.
- `role` : l'auteur du message. Valeurs possibles : `user`, `assistant`, `system` ou `narrator`. Par défaut : `user`.
- `trigger_generation` : à true, l'IA répond aussi après l'envoi du message. Par défaut : false.

Voici une automatisation qui prévient l'IA quand la porte d'entrée s'ouvre :

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

Ce service lance une réponse de l'IA dans un chat, sans que tu envoies de message visible.

- `chat_id` : le chat à utiliser. Laissé vide, c'est le Primary Chat qui est utilisé.
- `user_message` : un message facultatif à joindre au tour de réponse.

## Resynchroniser après un changement de réglages

Après avoir modifié les catégories activées, appuie sur **Marinara Sync HA Tools** pour appliquer le changement. Ce bouton se trouve sur la page de l'appareil **Marinara Engine** dans Home Assistant.

Un appui sur **Marinara Sync HA Tools** déclenche ceci :

- L'intégration met à jour les outils existants sur place, pour que les changements arrivent bien dans Marinara.
- Elle reconstruit l'agent **Home Assistant** si tu l'as supprimé dans Marinara.
- Elle désactive tout outil dont tu as coupé la catégorie. Ces outils ne sont pas supprimés.

Ne modifie pas à la main les outils Home Assistant dans Marinara. La prochaine synchronisation écrase tes modifications et réactive les outils.

## Dépannage

### Le formulaire de configuration annonce qu'il n'arrive pas à se connecter

Vérifie que Marinara Engine tourne. Vérifie aussi que le **Host** et le **Port** saisis correspondent à l'adresse d'écoute. Par défaut : `localhost` et `7860`.

Si Home Assistant tourne sur un autre appareil que Marinara, Marinara le bloque par défaut. L'intégration ne peut transmettre aucun mot de passe : Marinara doit donc accepter cet appareil sans mot de passe. Ajoute l'adresse IP de l'appareil Home Assistant à `IP_ALLOWLIST` dans le fichier `.env` de Marinara. Voir [Accès à distance](../REMOTE_ACCESS.md) pour cette option et les autres. Un Marinara protégé par `BASIC_AUTH_USER` et `BASIC_AUTH_PASS` rejette lui aussi l'intégration, sauf si l'appareil figure dans `IP_ALLOWLIST`.

Ces règles restent valables après la configuration. Si Marinara bloque plus tard l'appareil Home Assistant, les capteurs et la liste des chats cessent de se mettre à jour, sans prévenir.

### L'IA tente un outil d'appareil, mais rien ne se passe

L'appel du webhook est très probablement bloqué. Ajoute `WEBHOOK_LOCAL_URLS_ENABLED=true` au fichier `.env` de Marinara, puis enregistre. L'effet arrive en quelques secondes. Sans ce réglage, les appels d'outils peuvent échouer avec un message indiquant que `http` n'est pas autorisé, ou qu'une adresse privée est refusée.

Si Marinara et Home Assistant tournent sur la même machine, l'intégration utilise automatiquement l'adresse interne pour le webhook. Si Marinara tourne sur un autre appareil, vérifie que l'adresse locale de Home Assistant est joignable depuis cet appareil.

### Les outils n'apparaissent pas dans la liste Functions

Appuie sur **Marinara Sync HA Tools**, ou redémarre Home Assistant. Regarde ensuite la section **Functions** du panneau **Presets** dans Marinara.

### L'agent Home Assistant n'est pas dans mon chat

Vérifie d'abord que l'agent **Home Assistant** existe bien dans Marinara, sous Agents. S'il manque, appuie sur **Marinara Sync HA Tools** pour le reconstruire. Ouvre ensuite **Chat Settings**, va dans la section **Agents** et ajoute l'agent **Home Assistant** à ce chat.

### Retrouver l'adresse du webhook à la main

Tu en auras rarement besoin, puisque chaque outil a déjà l'adresse renseignée. Pour la retrouver, ouvre **Settings**, puis **Devices & Services**, puis **Marinara Engine** dans Home Assistant. Le webhook suit ce format, où 8123 est le port Home Assistant par défaut :

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## Désinstallation

Pour retirer l'intégration, supprime-la depuis **Settings**, puis **Devices & Services**, puis **Marinara Engine** dans Home Assistant. Les entités Home Assistant disparaissent alors. En revanche, les outils créés dans la section **Functions** de Marinara y restent, tout comme l'agent **Home Assistant**. Supprime-les à la main dans Marinara si tu n'en veux plus.

## Guides associés

- [Outils personnalisés](../extending/custom-tools.md)
- [Agents : des aides IA pour tes chats](../agents/agents-overview.md)
- [Configuration du serveur](../CONFIGURATION.md)
- [Accès à distance](../REMOTE_ACCESS.md)
