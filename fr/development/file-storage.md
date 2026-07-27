# Stockage natif en fichiers

Ce guide décrit l'architecture de persistance locale de Marinara Engine. Pour l'organisation des dossiers côté utilisateur, voir [Où sont stockées tes données](../data/where-data-is-stored.md).

## Source de vérité

Marinara enregistre les lignes de l'application sous forme d'instantanés JSON dans `DATA_DIR/storage` :

```text
storage/
├── manifest.json
└── tables/
    ├── chats.json
    ├── messages.json
    ├── characters.json
    └── ...
```

La variable `FILE_STORAGE_DIR` permet de remplacer le dossier `storage`. Chaque fichier de table contient un tableau JSON. Le fichier `manifest.json` conserve la version du format de stockage, l'heure d'enregistrement, l'identifiant du backend et le nombre de lignes de chaque table enregistrée.

## Modèle d'exécution

Le fichier `packages/server/src/db/file-backed-store.ts` charge les instantanés des tables en mémoire au démarrage. Le serveur lit et modifie ces lignes via les opérations natives en fichiers exposées par `db/file-query.ts`. Le fichier `db/file-schema.ts` fournit des métadonnées de tables et de colonnes sans risque de collision pour les définitions de `db/schema/`.

L'API fluide `select`, `insert`, `update` et `delete` garde les services de stockage compacts, sans dépendre d'une base de données externe ni d'un ORM. Les filtres et les tris pris en charge sont des objets d'expression explicites : le store n'analyse donc jamais de chaînes de requête.

Les tables déclarent leurs clés naturelles avec `fileTable(..., { uniqueBy: [...] })`. Les insertions et les mises à jour valident les clés primaires et les clés naturelles déclarées sur l'ensemble du changement candidat avant de modifier les lignes en mémoire. Une contrainte non respectée laisse ainsi la table intacte. Une règle peut inclure un prédicat `when` lorsque l'unicité ne s'applique qu'à une partie des lignes.

Les capability packages téléchargés peuvent embarquer leurs propres instances de file-table. Le store résout ces instances par le nom de table enregistré, après avoir vérifié l'identité des objets. Le code de stockage fourni par un package peut donc utiliser les tables du moteur en toute sécurité.

## Persistance et récupération

Les écritures marquent les tables concernées comme modifiées. Un court anti-rebond regroupe les changements rapprochés, pendant qu'un minuteur de sécurité vide régulièrement le travail en attente. À l'arrêt propre, Marinara attend la fin des écritures en cours, puis enregistre les lignes modifiées pendant cette écriture.

Chaque instantané est écrit dans un fichier temporaire, vidé sur le disque, puis renommé de façon atomique. Avant le remplacement, l'instantané sain précédent est rafraîchi sous forme de fichier `.bak`. Au démarrage, un fichier principal illisible est restauré depuis sa sauvegarde quand c'est possible. Si aucune des deux copies n'est exploitable, Marinara met les fichiers corrompus en quarantaine avec un suffixe horodaté et ne démarre que cette table à vide, pour que l'interface reste accessible et permette la récupération.

## Transactions

Les transactions reposent sur des instantanés en copie sur écriture, délimités par `AsyncLocalStorage`. Une table n'est clonée qu'au moment où la transaction la modifie pour la première fois. Si le callback lève une erreur, seules les tables modifiées par cette transaction sont restaurées ; les écritures concurrentes sans rapport sont préservées.

## Ajouter une table

Pour ajouter des données persistantes :

1. Définis la table dans `packages/server/src/db/schema/` avec `fileTable` et les constructeurs de colonnes natifs en fichiers.
2. Exporte-la depuis `db/schema/index.ts`.
3. Déclare les éventuelles clés naturelles avec l'option de table `uniqueBy`.
4. Enregistre son nom dans `FILE_BACKED_TABLES`.
5. Définis les relations en cascade ou en mise à null dans `file-backed-store.ts` si nécessaire.
6. Ajoute les métadonnées de colonne JSON dans `services/mari-db/mari-db.service.ts` quand un champ texte contient du JSON structuré.
7. Vérifie le comportement de sauvegarde et de restauration du profil.
8. Lance `pnpm check` et les régressions de stockage concernées.

Garde alignés dans le même changement les définitions de tables, les métadonnées de relations, la portabilité des profils et la validation Mari DB.
