# Extensions personnelles

Les extensions personnelles sont des brouillons de code privés que Professor Mari écrit pour toi. Ouvre la section **Settings** (Paramètres) > **Addons** > **Personal Extensions**.

Le message par défaut est le suivant :

> Ask Professor Mari to create an extension for you. Nothing runs until you enable it and approve the exact code hash.

Cette section ne propose ni action New Draft, ni contrôle d'import. Demande à Professor Mari de créer ou de retoucher un brouillon. Elle peut enregistrer du code, mais elle ne peut ni l'approuver ni l'activer.

## Relire et activer

Tout brouillon arrive désactivé. Marinara calcule une empreinte SHA-256 du code exécutable exact. Ouvre le brouillon, examine le code, compare l'empreinte affichée, puis choisis **Review and Run** (relire et exécuter) seulement si tu acceptes cette version précise. La moindre modification du code exécutable, ou la restauration d'une révision, désactive l'extension et impose une nouvelle approbation.

L'isolation en bac à sable réduit les pouvoirs de l'extension, elle ne rend pas pour autant un code quelconque digne de confiance. Une extension malveillante peut encore gaspiller du processeur jusqu'à ce que le chien de garde l'arrête, saturer son propre espace de stockage dans les limites imposées, ou se montrer trompeuse dans ses logs (le journal du serveur). Relis toujours le code avant de l'activer.

## Isolation à l'exécution

Une extension navigateur (Browser Extension) tourne dans un Worker dédié, à l'intérieur d'une iframe isolée à origine opaque. Elle n'a accès ni à la page de Marinara, ni au DOM, ni aux cookies, ni au stockage du navigateur, ni aux API d'origine, ni au réseau. Ses capacités se limitent à un stockage d'extension privé, aux logs, à des minuteurs gérés, à l'enregistrement d'un nettoyage, à des fenêtres restreintes et à des points de contribution sûrs vers l'interface hôte.

Une extension peut ajouter des actions dans la barre supérieure, des entrées au menu Extensions et des panneaux persistants sur le côté droit, via `marinara.ui.registerContribution(...)`. Marinara affiche ces surfaces avec le thème actif et un jeu fixe de contrôles : titres, texte, sortie préformatée, boutons, champs de saisie, listes de sélection, interrupteurs, curseurs, sélecteurs de couleur et espaceurs. Une extension fournit du contenu et un état, jamais de HTML, de CSS, d'URL, de composants React ni de gestionnaires d'événements de l'hôte.

Ces capacités d'interface et ces règles sont identiques pour toutes les extensions navigateur, quelle que soit leur provenance. Une extension tierce importée (External Extension) obtient la même API de contribution une fois franchies les deux autorisations – le fichier `.env` et la **Danger Zone** – ainsi que l'approbation de l'empreinte exacte. Elle reste incapable d'atteindre le DOM ou les API de Marinara.

### Ajouter un panneau affiché par Marinara

```js
const panel = marinara.ui.registerContribution({
  id: "weather-settings",
  kind: "panel",
  label: "Weather controls",
  description: "Tune a weather scene without leaving Marinara.",
  icon: "sparkles",
  elements: [
    { kind: "heading", text: "Atmosphere" },
    {
      kind: "select",
      id: "weather",
      label: "Weather",
      value: "rain",
      options: [
        { value: "rain", label: "Rain" },
        { value: "snow", label: "Snow" },
        { value: "aurora", label: "Aurora" },
      ],
    },
    { kind: "slider", id: "intensity", label: "Intensity", min: 0, max: 100, value: 60 },
    { kind: "toggle", id: "lightning", label: "Lightning", checked: false },
    { kind: "color", id: "tint", label: "Tint", value: "#6d8cff" },
    { kind: "button", id: "apply", label: "Apply" },
  ],
  onActivate: async () => {
    const settings = await marinara.storage.get();
    // Update the panel when stored state should be reflected in the controls.
  },
  onEvent: async ({ elementId, values }) => {
    if (elementId !== "apply") return;
    await marinara.storage.patch(values);
  },
});

marinara.onCleanup(() => panel.remove());
```

Utilise `kind: "button"` pour une action compacte dans la barre supérieure ou le menu Extensions, et `kind: "menu-item"` pour une action réservée au menu. Les deux appellent `onActivate`. Un `panel` appelle `onActivate` à son ouverture ; ses boutons appellent `onEvent` avec les valeurs courantes de tous ses contrôles. La référence renvoyée expose `update({ label?, description?, icon?, elements? })` et `remove()`. Les identifiants acceptent lettres, chiffres, `.`, `_` et `-`.

Un outil complexe peut construire une interface en plusieurs étapes en mettant à jour les éléments du panneau après un événement. Garde l'état de l'application dans `marinara.storage` ; ne l'encode pas dans le balisage.

### Portage des anciennes extensions

Contrôleurs météo, éditeurs de prompts et autres flux de travail conséquents sont des cas d'usage tout à fait valables pour les contributions. Leur portage sûr peut s'appuyer sur un lanceur dans le menu ou la barre supérieure, complété par des panneaux mis à jour au fil des étapes. En revanche, les paquets existants qui superposent des éléments au DOM, interrogent les sélecteurs CSS de Marinara, parcourent les entrailles de React ou appellent les routes `/api` de même origine ne peuvent pas être importés tels quels dans le runtime sûr.

Les contributions d'interface fournissent l'interface, pas des pouvoirs implicites. Une fonctionnalité qui a besoin des chats, des presets, des lorebooks, des personnages, des personas ou des effets visuels de scène réclame aussi une capacité de courtage dédiée, exposée par Marinara et approuvée explicitement par l'utilisateur. Tant que cette capacité n'existe pas, une extension ne doit pas la simuler en accédant au DOM de l'hôte ou en lançant des requêtes réseau sans restriction.

L'ancienne API `marinara.ui.showWindow(...)` reste disponible pour ouvrir une fenêtre temporaire dans l'iframe à origine opaque. Elle emploie les mêmes contrôles fixes et renvoie les références `update(...)` et `close()`. Privilégie les contributions quand l'outil doit rester accessible par la navigation habituelle de Marinara.

Une extension serveur (Server Extension) tourne dans un processus Node distinct, aux permissions restreintes, sous macOS Seatbelt ou Linux Bubblewrap. Elle n'a accès ni aux fichiers de Marinara, ni à tes fichiers, ni aux secrets hérités du serveur, ni au réseau, ni aux processus enfants, ni aux workers, ni aux modules natifs. Si Marinara ne parvient pas à mettre en place un bac à sable pris en charge par le système, les extensions serveur restent désactivées.

### Plateformes prises en charge

Les extensions navigateur sont isolées par le navigateur lui-même : elles fonctionnent donc partout. Les extensions serveur exigent un bac à sable système pris en charge ; à défaut, elles restent désactivées et ne peuvent pas être activées – jamais Marinara ne se rabat sur une exécution sans bac à sable.

| Plateforme               | Extensions navigateur | Extensions serveur                        |
| ------------------------ | --------------------- | ----------------------------------------- |
| macOS                    | ✅ Isolées            | ✅ Isolées (Seatbelt)                     |
| Linux (avec Bubblewrap)  | ✅ Isolées            | ✅ Isolées (Bubblewrap)                   |
| Linux (sans `bwrap`)     | ✅ Isolées            | ⛔ Désactivées – installe `bwrap`         |
| Windows                  | ✅ Isolées            | ⛔ Désactivées – utilise une extension navigateur |
| Android                  | ✅ Isolées            | ⛔ Désactivées – utilise une extension navigateur |

Sous Windows et Android, aucun bac à sable de processus n'est pris en charge par le système : les extensions serveur y sont donc indisponibles, par conception. Utilise plutôt une extension navigateur, ou fais tourner le serveur Marinara sous macOS ou Linux (avec `bwrap`) si tu as vraiment besoin d'une extension serveur.

## Extensions externes

Les imports tiers sont verrouillés et masqués par défaut. Il faut passer deux étapes :

1. Sur la machine qui héberge Marinara, définis `ENABLE_EXTERNAL_EXTENSIONS=true` dans le fichier `.env`.
2. Ouvre la section **Settings** > **Advanced** > **Danger Zone**, descends sous les contrôles de suppression de données, lis l'avertissement, puis active l'option **Allow third-party extension imports** (autoriser les imports d'extensions tierces).

Alors seulement la section **Settings** > **Addons** affiche **External Extensions** avec ses contrôles d'import de fichier et de dossier. Les formats pris en charge sont toujours décompressés :

- `.personal-extension.zip` et les paquets `.zip` compatibles ;
- les manifestes `.json` ;
- `.css` ;
- `.js`, `.mjs` et `.cjs` ;
- `.server.js`, `.server.mjs` et `.server.cjs`.

Un import n'apporte jamais d'approbation avec lui et ne peut pas s'activer tout seul. Les enregistrements anciens, importés depuis un profil, stockés manuellement ou de provenance inconnue comptent eux aussi comme externes. Ils restent masqués, ne peuvent pas être approuvés et sont exclus des deux runtimes tant que les deux verrous ne sont pas levés.

Refermer l'un ou l'autre verrou arrête les processus serveur externes actifs, supprime les workers du navigateur et désactive les enregistrements externes stockés. Rouvrir les verrous ne les relance pas automatiquement.

Une extension tierce peut contenir du code malveillant ou dangereux. Examine toujours chaque ligne avant de la télécharger, de l'importer ou de l'activer. Tu procèdes entièrement sous ta propre responsabilité.

## Export, révisions et récupération

L'action d'export d'une extension télécharge un paquet transportable. Les paquets exportés puis restaurés restent désactivés. Restaurer une révision la ramène également à l'état de brouillon désactivé.

Si une extension se comporte mal, choisis **Disable** (désactiver). Si l'interface est inaccessible, arrête Marinara et passe la valeur `enabled` de l'enregistrement `installed_extensions` concerné à `"false"`. Ne définis jamais `approvedHash` à la main.

## Guides associés

- [Professor Mari](../home/professor-mari.md)
- [Configuration du serveur](../CONFIGURATION.md)
- [Sauvegarde et restauration](../data/backup-and-restore.md)
- [Accès à distance](../REMOTE_ACCESS.md)
