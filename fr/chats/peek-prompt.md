# Peek Prompt : voir ce que l'IA a reçu

La fonction **Peek Prompt** (aperçu du prompt) affiche le texte exact que Marinara Engine a envoyé au modèle d'IA pour obtenir une réponse. Elle peut aussi afficher un aperçu en direct du prompt avant tout envoi. Ce guide explique ce que montre la fenêtre, comment l'ouvrir, comment lire les directions enregistrées et comment s'en servir pour comprendre une réponse.

Un prompt, c'est le bloc complet d'instructions et d'historique du chat que Marinara assemble puis envoie au modèle. Le modèle lit ce bloc et rédige une réponse. Avec Peek Prompt, tu vois ce bloc une fois assemblé : plus rien de mystérieux dans les réponses.

## Ce que montre Peek Prompt

Quand tu ouvres Peek Prompt, une fenêtre intitulée **Assembled Prompt** (prompt assemblé) apparaît. Elle comporte trois parties.

Un badge de provenance se trouve en haut, à côté du titre. Il indique quelle version du prompt tu consultes :

- **Exact Text Model Request** : la requête littérale envoyée au modèle.
- **Live Preview** : un aperçu reconstruit à l'instant.
- **Raw Messages** : la liste brute des messages.
- **Prompt Preview** : un aperçu général.

Sous le badge se trouve un panneau d'informations sur la génération. Il peut afficher le nom du fournisseur et du modèle, une estimation du nombre de tokens, et le nombre réel de tokens du prompt une fois la réponse terminée. Un token est un petit morceau de texte : les modèles comptent en tokens plutôt qu'en mots. Ce panneau montre aussi de petites pastilles pour les valeurs employées, comme **Temperature**, **Max Output Tokens**, **Thinking**, **Reasoning**, **Verbosity**, **Service Tier** et **Assistant Prefill**. Des valeurs d'échantillonnage comme **Top P**, **Top K** et **Min P** peuvent également y figurer.

Le reste de la fenêtre, c'est le prompt lui-même, découpé en sections repliables. Chaque section porte une étiquette et sa propre estimation approximative de tokens. Les messages du chat sont regroupés dans une seule section **Chat History** (historique du chat). Pour une requête exacte enregistrée, le fournisseur a parfois fusionné plusieurs tours de chat en un seul bloc. Déplie chaque bloc pour inspecter tout le texte visible par le modèle. Clique sur l'en-tête d'une section pour l'ouvrir ou la refermer.

## Ouvrir Peek Prompt

Il existe deux façons d'ouvrir la fenêtre.

La première passe par la barre d'actions du message. Voici la marche à suivre :

1. Survole le dernier message de l'IA dans le chat.
2. Repère l'action **Peek prompt**. Son icône est une loupe.
3. Clique dessus. La fenêtre **Assembled Prompt** s'ouvre.

L'action **Peek prompt** n'apparaît que sur le dernier message de l'IA. Les messages plus anciens ne la proposent pas.

La seconde façon est un raccourci à taper. Il fonctionne même avant toute réponse de l'IA, ce qui permet de prévisualiser le prompt à l'avance. Voici la marche à suivre :

1. Clique dans le champ de saisie du message.
2. Saisis exactement ce texte :

```
{{prompt}}
```

3. Appuie sur Enter ou clique sur Send.

Au lieu d'envoyer un message, Marinara vide le champ et ouvre la fenêtre Peek Prompt. Les raccourcis `{{prompt_preview}}` et `{{preview_prompt}}` font la même chose.

## Lire les directions enregistrées

La génération guidée permet d'orienter une réponse avec une instruction hors personnage. Quand un message a été produit avec une direction enregistrée, il porte une action distincte, **Stored guidance** (direction enregistrée). Son icône est un petit parchemin. Cette action apparaît aussi sur les messages produits avec la commande `/impersonate`.

Clique sur **Stored guidance** pour ouvrir une fenêtre qui affiche la direction employée pour ce message. Pour un message guidé, la fenêtre précise d'où venait la direction :

- **/guided** : tu as utilisé la commande slash `/guided`.
- **Guided regenerate** : tu as régénéré le message avec une direction saisie.
- **Game start** : la direction vient de la configuration de Game Mode.

Un bouton **Copy /guided** apparaît uniquement pour les directions **/guided** et **Guided regenerate**. Il recopie la direction sous forme de commande `/guided`. Colle cette commande plus tard pour réutiliser la même orientation. Le bouton n'apparaît pas pour les directions **Game start**.

Pour un message d'impersonation, la fenêtre affiche les détails de l'impersonation au lieu d'une direction unique. Le déroulé complet de la génération guidée et de l'impersonation est décrit dans le guide indiqué plus bas.

## Comprendre une réponse avec Peek Prompt

Peek Prompt est l'outil idéal quand une réponse te surprend. Sers-t'en dès qu'un personnage oublie un élément, ignore une règle ou sort de son rôle.

Ouvre la fenêtre **Assembled Prompt** et vérifie ces points :

- Cherche les informations manquantes. Si une entrée de lorebook, un souvenir ou un détail du persona ne figure dans aucune section, le modèle ne l'a jamais vu.
- Regarde les pastilles de paramètres. Une valeur de **Temperature** très élevée rend les réponses aléatoires, et une valeur de **Max Output Tokens** trop basse coupe les réponses.
- Déplie la section **Chat History**. Vérifie que les messages attendus sont bien là, et dans le bon ordre.
- Lis le nombre réel de tokens après une réponse. Un prompt très volumineux peut pousser les anciens messages hors de la limite du modèle.

Une fois que tu sais ce que le modèle a réellement reçu, tu peux corriger la cause. Par exemple : modifier une fiche de personnage, ajuster une entrée de lorebook ou changer une valeur dans les paramètres de génération.

## Guides associés

- [Paramètres de génération](../prompts/generation-parameters.md)
- [Éditeur de presets et gestionnaire de prompts](../prompts/presets.md)
- [Génération guidée et impersonation](guided-and-impersonate.md)
- [Actions sur les messages : modifier, supprimer, swipe, régénérer](messages.md)
