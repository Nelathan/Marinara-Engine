# Prompts conditionnels ({{#if}})

Ce guide explique comment utiliser les blocs `{{#if}}` dans Marinara Engine. Un bloc conditionnel n'ajoute un morceau de prompt (le texte que Marinara envoie à l'IA) que si une valeur correspond à la règle que tu as fixée. Les conditionnels font partie du système de macros : ils fonctionnent donc partout où les macros fonctionnent, y compris dans les fiches de personnage, les personas, les entrées de lorebook et les presets de prompt.

## À quoi servent les prompts conditionnels

Une macro est un espace réservé écrit entre `{{doubles accolades}}`, que Marinara Engine remplace par une valeur réelle pendant la construction du prompt. Un bloc conditionnel va plus loin. Il examine une valeur, garde un morceau de texte et jette le reste.

Tu écris une condition, le texte à utiliser quand elle est vraie et, si tu veux, le texte à utiliser quand elle est fausse. Marinara relit la condition à chaque construction du prompt. Une même fiche ou un même preset peut donc se comporter différemment selon les personnages, les personas ou les chats.

Un usage courant : donner des instructions propres à un personnage à l'intérieur d'un preset partagé. Autre usage courant : n'inclure un champ que s'il contient quelque chose, pour ne pas envoyer une étiquette vide au modèle.

## La syntaxe de base

Un bloc conditionnel commence par `{{#if condition}}` et se termine par `{{/if}}`. Tout ce qui se trouve entre les deux est le texte retenu quand la condition est vraie.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

Une branche `{{else}}` peut prendre en charge le cas faux :

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

Autre option : enchaîner des conditions supplémentaires avec `{{else if}}`. Marinara examine chaque branche dans l'ordre, de haut en bas. Il retient la première branche dont la condition est vraie, résout les macros qu'elle contient et écarte toutes les autres. Si aucune condition n'est vraie et qu'il n'y a pas de `{{else}}`, le bloc entier ne produit rien.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

Un bloc s'écrit sur plusieurs lignes, comme ci-dessus, ou sur une seule. Tu peux aussi imbriquer un conditionnel dans une branche d'un conditionnel plus large.

## Opérateurs pris en charge

La condition se compose en général d'une valeur de gauche, d'un opérateur et d'une valeur de droite, par exemple `char == "Alice"`. Le tableau ci-dessous liste tous les opérateurs disponibles. Chacun est présenté en style code.

| Opérateur | Signification |
| --- | --- |
| `==`, `=`, `is` | Égal. |
| `!=`, `is not` | Différent. |
| `>` | Supérieur à (nombres uniquement). |
| `<` | Inférieur à (nombres uniquement). |
| `>=` | Supérieur ou égal (nombres uniquement). |
| `<=` | Inférieur ou égal (nombres uniquement). |
| `contains`, `includes` | La valeur de gauche contient la valeur de droite en tant que texte. |
| `not contains`, `not includes` | La valeur de gauche ne contient pas la valeur de droite. |

Quelques règles régissent la comparaison :

1. Avec `==`, `=`, `is`, `!=` et `is not`, si les deux côtés ressemblent à des nombres, Marinara les compare comme des nombres. Ainsi, `5` est égal à `5.0`. Sinon, la comparaison se fait sur le texte, sans distinction entre majuscules et minuscules. Ainsi, `Mari` est égal à `mari`.
2. Avec `>`, `<`, `>=` et `<=`, les deux côtés doivent être des nombres. Si l'un des deux n'en est pas un, la condition est fausse.
3. Avec `contains`, `includes`, `not contains` et `not includes`, la comparaison ignore la casse. Ainsi, `contains "dr"` correspond au texte `Dr Smith`.

## Combiner des conditions avec OR et AND

Utilise `||` quand l'une ou l'autre condition peut correspondre. Utilise `&&` quand toutes les conditions doivent correspondre.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&` est évalué avant `||`. Ajoute des parenthèses pour fixer l'ordre toi-même :

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

Si plusieurs égalités portent sur la même valeur, la partie gauche répétée peut être omise après `||` :

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

Cette écriture abrégée signifie `character == "Maukie" || character == "Pantalone"`. Elle vaut pour les opérateurs d'égalité `==`, `=` et `is`. Écris des conditions complètes des deux côtés de `&&` : une même valeur peut rarement être égale à deux choix différents en même temps.

### Tests de contenu (sans opérateur)

Si tu écris une condition sans opérateur, Marinara effectue un test de contenu. La question posée est simple : cette valeur contient-elle vraiment quelque chose ?

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

Un test de contenu est vrai quand la valeur n'est pas vide et qu'elle ne fait pas partie de ces mots : `false`, `0`, `no`, `off`, `null` ou `undefined`. La casse de ces mots n'a pas d'importance. Emploie un test de contenu quand tu ne veux inclure un texte que si un champ est rempli.

### Ce que tu peux comparer

Le côté gauche ou droit d'une condition accepte l'un des éléments suivants :

1. Un mot-clé de champ ou d'identité, comme `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input` ou `model`. Ces mots-clés lisent les mêmes valeurs que les macros correspondantes. `group` liste les autres personnages actifs du chat, une fois écarté celui qui répond.
2. Une valeur littérale entre guillemets, comme `"Alice"`.
3. Un nom de variable de preset, comme `length`. Une variable de preset est une valeur nommée que tu définis dans un preset de prompt. Voir [Variables de preset](preset-variables.md).
4. Une recherche de variable explicite, écrite `var:name` ou `var.name`.
5. Une autre macro, dont la valeur est résolue d'abord, puis comparée.

Si tu écris un mot isolé qui n'est pas un mot-clé, Marinara le prend pour un nom de variable. Si aucune variable ne porte ce nom, il utilise le mot comme simple texte. Mettre les valeurs littérales entre guillemets évite cette confusion : dans le doute, mets-les entre guillemets.

## Règles de mise entre guillemets

Quand tu compares avec un texte fixe, mets-le entre guillemets. Marinara le traite alors comme une valeur littérale exacte, et non comme un mot-clé ou une variable.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

Les guillemets doubles droits comme les guillemets simples droits conviennent. Marinara accepte aussi les guillemets courbes (typographiques), mais les guillemets droits sont les plus sûrs et correspondent à tous les exemples de l'application. À l'intérieur d'une valeur entre guillemets, une barre oblique inverse échappe un guillemet, et `\n` produit un retour à la ligne.

Mets toujours entre guillemets une valeur littérale contenant une espace, comme `"Dr Smith"`. Sans guillemets, une valeur de plusieurs mots est lue comme un seul nom de variable, ce qui n'est presque jamais l'effet recherché.

## Blocs de groupe pour plusieurs personnages

Dans un chat de groupe réunissant deux personnages ou plus, un bloc de groupe répète le même texte une fois par personnage. Tu écris ainsi un seul bloc qui décrit tous les personnages de la scène.

Pour créer un bloc de groupe, place un `[` seul sur sa ligne, puis ton texte, puis un `]` seul sur sa ligne. Le bloc doit contenir une macro de personnage, comme `{{char}}` ou `{{description}}`, ou une condition portant sur le personnage, comme `{{#if char == "Alice"}}`. Marinara répète alors le bloc une fois par personnage et résout les macros de personnage pour chacun à son tour.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

Dans un chat de groupe avec Alice et Bob, le bloc s'exécute deux fois. Le premier passage insère le nom d'Alice et choisit sa branche. Le second insère le nom de Bob et choisit la sienne. Hors d'un bloc de groupe, une macro de personnage ne se résout que pour le personnage courant ou principal.

Les blocs de groupe ne se déploient que dans un chat comptant deux personnages ou plus. Dans un chat en tête-à-tête, les lignes `[` et `]` restent du texte ordinaire.

## Exemples concrets (avant et après)

Voici trois exemples complets, avec le résultat que reçoit le modèle.

Un ton propre à un personnage dans un preset partagé :

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

Pour un personnage nommé `Dottore`, le modèle reçoit `Speak in a cold, clinical tone.` Pour tous les autres personnages, il reçoit `Speak warmly and casually.`

Inclure un champ seulement s'il est rempli :

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

Si le personnage a un champ **Backstory** (histoire personnelle) rempli, le modèle reçoit cette ligne avec le texte correspondant. Si le champ **Backstory** est vide, le bloc entier ne produit rien : aucune étiquette vide n'est envoyée.

Reconnaître une partie du nom de l'utilisateur :

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

Si le nom du persona contient `Dr`, le modèle reçoit la consigne de t'appeler Doctor. Sinon, le bloc ne produit rien.

## Guides associés

- [Macros de prompt](macros.md)
- [Variables de preset](preset-variables.md)
- [Chats de groupe et conversations de groupe](../chats/group-chats.md)
