# Fonctionnement interne des prompts Noodle (développeurs)

Référence pour les développeurs : où vivent les prompts de génération de Noodle dans le code, comment les personnaliser et comment déboguer les prompts finaux. Un prompt, c'est le texte que Marinara envoie à l'IA. Côté utilisateur, Noodle se configure depuis son panneau **Settings** (Paramètres) ; voir les guides Noodle dans `docs/noodle/`.

## Carte des sources de prompts

Aujourd'hui, Noodle compte un prompt de génération de texte écrit directement dans le code, une surcharge de prompt texte enregistrée et une surcharge de prompt image enregistrée.

| Rôle | Source | Symbole principal | Comment personnaliser |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Posts, réponses, abonnements, sondages, votes et digests de la timeline | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` | Modifie dans le code les messages système et de contexte écrits en dur. La partie ton et liberté créative est déléguée à la surcharge **Noodle Timeline Voice & Tone** décrite ci-dessous ; le reste, soit les règles de format de sortie dont dépend le schéma, ne se personnalise pas depuis l'interface. |
| Instructions de voix et de ton de la timeline (sous-ensemble du prompt système) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | Modifie **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone**, ou change dans le code la valeur par défaut enregistrée (`noodleTimelineVoiceDefaultText(enhanced)` dans `noodle-prompt.ts`). Le périmètre est volontairement limité au ton : les limites d'actions structurées, les règles de champ cible et les autres instructions dont dépend le schéma restent écrites en dur, hors de cette surcharge, pour qu'une réécriture ne puisse pas casser l'analyse de `noodleGeneratedRefreshSchema`. Tant qu'elle n'est pas modifiée, la valeur par défaut suit le réglage Noodle `enableEnhancedTimelineWriting` (`ctx.enhanced` ; désactivé par défaut, ce qui reproduit l'instruction de ton d'origine sur une seule ligne). Dès que l'utilisateur enregistre son propre texte de surcharge, celui-ci l'emporte quel que soit ce réglage. |
| Profils des comptes de personnages créés pour la première fois | `packages/server/src/routes/noodle.routes.ts` | `generateMissingNoodleProfiles()` | Modifie dans le code les messages système et utilisateur écrits en dur. La sélection des participants s'exécute d'abord, et seuls les comptes de personnages sélectionnés sans `profileGenerated` sont transmis à ce prompt. |
| Prompt de l'image générée pour un post | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`) | Modifie **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image**, ou change dans le code la valeur par défaut enregistrée. |
| Instructions d'image propres à Noodle, par défaut | `packages/shared/src/schemas/noodle.schema.ts` | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | Change le réglage Noodle dans l'interface, ou sa valeur par défaut de schéma dans le code. |
| Contexte de chat inséré dans la génération de la timeline, sur activation | `packages/server/src/routes/noodle.routes.ts` | `buildOptedInChatContext()` | Change l'assemblage du contexte dans le code ; l'activation par l'utilisateur reste dans les réglages de chaque chat. |
| Images fournies en entrée pour les posts et réponses de la timeline | `packages/server/src/services/noodle/noodle-vision.ts` | `prepareNoodleVisionAttachments()` | Change dans le code la sélection des images, leur normalisation, les limites ou le repli en texte seul pour raison de compatibilité. |
| Activité Noodle insérée dans les prompts de chat | `packages/server/src/services/noodle/noodle-context.ts` | `buildRecentSocialMediaActivityBlock()` | Change dans le code le filtrage ou l'assemblage du bloc ; les utilisateurs règlent les modes cibles et le nombre maximal d'éléments dans les réglages de Noodle, tandis que le bloc encapsulé a un plafond strict de 8 192 tokens. |
| Contrat JSON de la génération | `packages/shared/src/schemas/noodle.schema.ts` | `noodleGeneratedRefreshSchema` | À ne changer qu'en même temps que le prompt, le traitement de la route, les types partagés et la couverture de régression. |
| Contexte de monde et de lore issu des lorebooks, inséré dans la génération de la timeline | `packages/server/src/routes/noodle.routes.ts` | `buildRefreshPrompt()` (appelle `processLorebooks()`) | Conditionné par le réglage Noodle **Lorebook context** (`enableLorebookContext`, désactivé par défaut). Réutilise le même `processLorebooks()` multi-personnages que les chats de groupe, avec un budget de tokens propre à Noodle fourni par `noodleLorebookTokenBudget()` dans `noodle-prompt.ts`, mis à l'échelle selon le nombre de personnages actifs et plafonné à 8 192 tokens. S'exécute avec `previewOnly: true`, car Noodle n'a pas d'emplacement par chat où conserver l'état de temporisation sticky/cooldown. |

Les prompts de la timeline et des profils n'apparaissent pas pour l'instant dans l'interface des surcharges de prompts. Le modèle **Noodle Post Image** est le seul prompt de génération Noodle exposé à cet endroit. Le champ local **Prompt instructions** de Noodle est transmis à ce modèle d'image ; il ne modifie pas le prompt d'écriture de la timeline.

La route d'image charge `NOODLE_IMAGE_POST`, puis fait passer le résultat par `compileImagePrompt()` avant de l'envoyer au fournisseur d'images. La requête finale peut donc aussi dépendre du profil de style d'image sélectionné et des valeurs par défaut de la connexion.

## Inspecter les prompts finaux

Un rafraîchissement manuel lancé avec Debug Mode (mode débogage) activé enregistre les messages finaux envoyés au modèle, pour le profil comme pour la timeline, via le logger partagé du serveur. Cherche :

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

Les images de la timeline ne sont jamais écrites en base64 dans les logs de débogage. Le texte enregistré contient les mêmes clés de pièce jointe de post ou de réponse que celles envoyées au modèle, ainsi que le nombre d'images fournies nativement en entrée. Noodle normalise et plafonne ces entrées dans `noodle-vision.ts`. Si un fournisseur refuse explicitement le contenu visuel, la route l'enregistre dans les logs et envoie à la place le prompt de repli en texte seul.

Pour les images, active **Expose media prompts before sending** (afficher les prompts médias avant l'envoi) sous **Settings -> Generations -> Image Generation** afin d'inspecter et de modifier les prompts positif et négatif compilés avant l'envoi de la requête.

## Modifier sans casser

L'assemblage des prompts est une frontière de compatibilité à haut risque. Quand tu y touches, garde alignés le prompt, `noodleGeneratedRefreshSchema`, le traitement de la route ainsi que les régressions Noodle sur les mentions et les sondages. Lance au minimum :

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## Guides associés

- [Noodle : la timeline sociale intégrée](../noodle/overview.md)
- [Réglages de Noodle et reprise du chat](../noodle/settings.md)
- [Carte de l'architecture (développeurs)](architecture-map.md)
