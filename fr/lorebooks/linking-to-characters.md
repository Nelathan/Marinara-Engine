# Lier des lorebooks à des personnages et à des personas

Ce guide explique comment lier un lorebook à un personnage ou à un persona (le personnage que tu incarnes) pour qu'il s'active tout seul dans les bons chats. Il montre aussi comment intégrer un lorebook dans une fiche de personnage, et à quoi servent les réglages **Lorebooks** propres à chaque chat. Un lorebook, c'est un ensemble d'entrées World Info déclenchées par mots-clés. Si tu débutes avec eux, commence par [Vue d'ensemble des lorebooks](overview.md).

## Deux façons de rattacher un lorebook

Un lorebook se rattache à un personnage de deux manières différentes. Elles ne fonctionnent pas pareil, alors choisis bien celle qu'il te faut.

- **Link (Assign)** (lier, assigner) : le lorebook reste dans la bibliothèque. Le personnage ou le persona pointe simplement vers lui. Le lorebook s'active de lui-même dans les chats qui incluent ce personnage ou qui utilisent ce persona. Un lorebook lié ne voyage PAS à l'intérieur d'une fiche de personnage exportée.
- **Embed** (intégrer) : le lorebook est écrit dans la fiche de personnage elle-même. Il voyage avec la fiche quand tu exportes ou partages le personnage. L'intégration ne concerne que les personnages, pas les personas.

La plupart du temps, mieux vaut lier le lorebook. Ne l'intègre que si tu comptes partager la fiche de personnage avec le lorebook inclus dedans.

## L'onglet Lorebook dans l'éditeur

L'éditeur de personnage comme l'éditeur de persona disposent d'un onglet **Lorebook**.

1. Ouvre un personnage ou un persona en édition.
2. Clique sur l'onglet **Lorebook**.
3. Une section **Lorebooks** apparaît, avec deux boutons : **New** (nouveau) et **Assign Lorebook** (assigner un lorebook).

Le bouton **New** crée un lorebook vierge, déjà lié au personnage ou au persona en cours d'édition. Il ouvre la fenêtre **Create Lorebook** (créer un lorebook), avec le champ **Category** (catégorie) réglé sur **Character**.

Le bouton **Assign Lorebook** lie un lorebook déjà présent dans la bibliothèque. Le sélecteur n'affiche que les lorebooks de la catégorie **Character**. La section suivante détaille cette opération.

## Assigner un lorebook existant

Le sélecteur **Assign Lorebook** n'affiche que les lorebooks dont le champ **Category** vaut **Character**. C'est vrai aussi quand tu édites un persona. Un lorebook rangé dans une autre catégorie, comme World ou NPC, n'apparaît ni dans le sélecteur ni dans la liste des lorebooks assignés. Pour le faire apparaître, ouvre-le et règle son champ **Category** sur **Character** dans l'onglet **Overview** (vue d'ensemble). Le bouton **New** évite ce souci, puisqu'il crée d'emblée un lorebook de catégorie Character.

1. Dans l'onglet **Lorebook**, clique sur **Assign Lorebook**.
2. Dans le champ de recherche, tape une partie du nom du lorebook pour le retrouver.
3. Clique sur le lorebook voulu. Une coche apparaît à côté de son nom.
4. À droite, choisis un **Scope** (portée). Voir la section suivante.
5. Clique sur **Assign**.

Le lorebook figure maintenant dans la liste des lorebooks assignés. Chaque ligne de cette liste comporte un bouton **Scope** pour changer la portée plus tard, et une icône de corbeille pour supprimer le lien. Clique sur le nom du lorebook pour l'ouvrir dans l'éditeur complet.

Un lorebook réglé sur Global est actif dans tous les chats. Il ne peut pas être lié en plus à un personnage ou à un persona. Le mode Global est expliqué dans [Vue d'ensemble des lorebooks](overview.md).

## Scope : quels chats peuvent utiliser le lorebook lié

Le réglage **Scope** détermine où un lorebook lié a le droit de s'activer. Il ne s'agit pas de tous les chats de Marinara, mais des chats qui incluent ce personnage, ou qui utilisent ce persona. Il existe trois modes de portée.

- **All chats with [name]** : le mode par défaut. Le lorebook s'active dans chaque chat qui inclut ce personnage ou qui utilise ce persona.
- **Disabled for all chats** : le lien reste en place, mais le lorebook ne s'active jamais. Pratique pour mettre un lorebook en pause sans le délier.
- **Specific chats** : tu choisis des chats précis dans une liste à cocher. Seuls les chats cochés peuvent utiliser le lorebook. La liste montre les chats qui incluent déjà ce personnage ou qui utilisent ce persona.

Avec **Specific chats**, tu dois cocher au moins un chat pour pouvoir enregistrer.

Pour changer la portée plus tard, clique sur le bouton **Scope** de la ligne du lorebook assigné, ajuste le réglage, puis clique de nouveau sur **Assign**.

## Intégrer un lorebook dans une fiche de personnage

L'intégration écrit le lorebook dans la fiche de personnage, si bien qu'il part à l'export avec le personnage. Cela ne concerne que les personnages. Utilise-la quand tu veux partager un personnage qui embarque déjà ses World Info.

1. Ouvre le personnage dans l'éditeur de personnage.
2. Va dans l'onglet **Lorebook**.
3. Vérifie que le lorebook voulu est déjà assigné (voir plus haut).
4. Sur la ligne de ce lorebook, clique sur **Embed into card** (intégrer à la fiche).

Un badge **Embedded** apparaît alors sur la ligne. À partir de là, les entrées du lorebook vivent dans la fiche et s'exportent avec elle.

Une fiche de personnage ne contient qu'un seul lorebook intégré à la fois. Si la fiche en a déjà un, le bouton **Embed into card** est désactivé et porte la mention "Remove the current embedded lorebook first". Supprime la copie intégrée existante avant d'intégrer un autre lorebook.

Si tu modifies le lorebook lié après l'intégration, clique sur **Refresh** (actualiser) sur sa ligne. Marinara réécrit la copie intégrée à partir des entrées actuelles du lorebook, ce qui maintient à jour la copie incluse dans la fiche.

## Gérer un lorebook intégré

Quand une fiche de personnage contient déjà un lorebook intégré, des contrôles supplémentaires apparaissent sous la liste des lorebooks assignés. Tu y trouves aussi la liste des entrées intégrées, en lecture seule.

- **Import Embedded Lorebook** (importer le lorebook intégré) : transforme les entrées incluses dans la fiche en un lorebook normal et modifiable, rangé dans la bibliothèque. Le nouveau lorebook est relié au personnage. Le bouton devient **Reimport Embedded Lorebook** dès qu'une copie liée existe.
- **Edit Embedded Lorebook** (modifier le lorebook intégré) : ouvre ce lorebook lié dans l'éditeur complet. Les modifications que tu y fais se répercutent automatiquement dans la copie intégrée à la fiche.
- **Remove from card** (retirer de la fiche) : supprime la copie intégrée de la fiche. Un lorebook lié séparément dans la bibliothèque, lui, n'est pas touché.

C'est bien pratique pour les fiches importées depuis d'autres outils. Beaucoup arrivent avec un lorebook intégré. Clique sur **Import Embedded Lorebook** pour en obtenir une version entièrement modifiable dans Marinara.

## La section Lorebooks des Chat Settings

Chaque chat possède ses propres réglages **Lorebooks**. C'est là que tu vois quels lorebooks sont actifs dans le chat en cours, et que tu les ajustes pour ce chat uniquement.

1. Ouvre un chat.
2. Ouvre les **Chat Settings** (réglages du chat).
3. Repère la section **Lorebooks**. Le badge de comptage indique combien de lorebooks sont actifs.

Chaque lorebook actif porte un ou plusieurs badges qui expliquent pourquoi il est activé :

- **Chat** : tu l'as épinglé à ce chat toi-même.
- **Global** : c'est un lorebook global.
- **Character** : il est lié à un personnage présent dans ce chat.
- **Persona** : il est lié au persona de ce chat.

Rien ne t'empêche de modifier ce qui est actif pour ce seul chat.

- **Add Lorebook** (ajouter un lorebook) : épingle un lorebook à ce chat. Les lorebooks épinglés portent le badge **Chat**.
- Icône de corbeille (**Remove from chat**, retirer du chat) : désépingle un lorebook que tu as ajouté à la main.
- Icône d'œil barré (**Disable in this chat**, désactiver dans ce chat) : masque temporairement un lorebook activé automatiquement, pour ce chat seulement, sans supprimer le lien. Les lorebooks désactivés affichent un nom barré et un badge **Disabled**.
- Icône d'œil (**Enable in this chat**, activer dans ce chat) : réactive un lorebook désactivé pour ce chat.

### Lorebook Token Budget

Le champ **Lorebook Token Budget** (budget de tokens des lorebooks) est un champ numérique de cette section. Il plafonne la quantité de texte de lorebook qui peut être insérée dans ce chat, mesurée en tokens (un token est un petit morceau de texte). La valeur par défaut est **8192**. Mets **0** pour lever le plafond. Ce budget valable pour tout le chat est distinct du budget de tokens propre à chaque lorebook. Les deux limites s'appliquent. Voir [Budgets de tokens et récursivité des lorebooks](token-budgets.md) pour comprendre comment les deux budgets se combinent.

## Guides associés

- [Vue d'ensemble des lorebooks](overview.md)
- [Budgets de tokens et récursivité des lorebooks](token-budgets.md)
- [Importer et exporter des lorebooks](import-export.md)
- [Créer et modifier des personnages](../characters/creating-and-editing-characters.md)
- [Vue d'ensemble des Chat Settings](../chats/chat-settings.md)
