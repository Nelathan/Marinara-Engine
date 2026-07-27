# Bedingte Prompts ({{#if}})

In dieser Anleitung erfährst du, wie du `{{#if}}`-Blöcke in Marinara Engine einsetzt. Mit einem Bedingungsblock landet ein Stück Text nur dann im Prompt, wenn ein Wert einer Regel entspricht, die du festlegst. Bedingungen gehören zum Makro-System und funktionieren deshalb überall dort, wo auch Makros funktionieren: in Charakterkarten, Personas, Lorebook-Einträgen und Prompt-Presets.

## Wozu bedingte Prompts gut sind

Ein Makro ist ein `{{double-brace}}`-Platzhalter, den Marinara Engine beim Zusammenbauen des Prompts durch einen aktuellen Wert ersetzt. Ein Bedingungsblock geht noch einen Schritt weiter: Er prüft einen Wert, behält ein Stück Text und verwirft den Rest.

Du schreibst eine Bedingung, den Text für den zutreffenden Fall und optional den Text für den nicht zutreffenden Fall. Marinara wertet die Bedingung bei jedem Prompt-Aufbau neu aus. Dieselbe Karte und dasselbe Preset verhalten sich dadurch je nach Charakter, Persona oder Chat unterschiedlich.

Häufig genutzt wird das für charakterspezifische Anweisungen innerhalb eines gemeinsamen Presets. Ebenso häufig: ein Feld nur dann mitschicken, wenn es Inhalt hat – damit keine leere Beschriftung beim Modell ankommt.

## Die Grundsyntax

Ein Bedingungsblock beginnt mit `{{#if condition}}` und endet mit `{{/if}}`. Alles dazwischen ist der Text für den zutreffenden Fall.

```
{{#if condition}}
Text used when the condition is true.
{{/if}}
```

Für den nicht zutreffenden Fall lässt sich ein `{{else}}`-Zweig ergänzen:

```
{{#if condition}}
Text used when true.
{{else}}
Text used when false.
{{/if}}
```

Mit `{{else if}}` hängst du weitere Bedingungen an. Marinara prüft die Zweige von oben nach unten. Der erste Zweig mit zutreffender Bedingung bleibt stehen, die Makros darin werden aufgelöst, alle anderen Zweige fallen weg. Trifft keine Bedingung zu und fehlt ein `{{else}}`, ergibt der ganze Block nichts.

```
{{#if length == "short"}}
Keep your reply to one or two sentences.
{{else if length == "long"}}
Write a detailed, multi-paragraph reply.
{{else}}
Write a reply of normal length.
{{/if}}
```

Ein Block darf sich wie oben über mehrere Zeilen ziehen oder in einer einzigen Zeile stehen. Und du kannst eine Bedingung in den Zweig einer größeren Bedingung verschachteln.

## Verfügbare Operatoren

Eine Bedingung besteht meist aus einem linken Wert, einem Operator und einem rechten Wert, etwa `char == "Alice"`. Die folgende Tabelle listet alle Operatoren auf, die du verwenden kannst. Jeder Operator steht in Code-Schrift.

| Operator | Bedeutung |
| --- | --- |
| `==`, `=`, `is` | Gleich. |
| `!=`, `is not` | Ungleich. |
| `>` | Größer als (nur Zahlen). |
| `<` | Kleiner als (nur Zahlen). |
| `>=` | Größer als oder gleich (nur Zahlen). |
| `<=` | Kleiner als oder gleich (nur Zahlen). |
| `contains`, `includes` | Der linke Wert enthält den rechten Wert als Text. |
| `not contains`, `not includes` | Der linke Wert enthält den rechten Wert nicht. |

Für den Vergleich gelten ein paar Regeln:

1. Bei `==`, `=`, `is`, `!=` und `is not` vergleicht Marinara beide Seiten als Zahlen, sofern beide wie Zahlen aussehen. `5` ist also gleich `5.0`. Andernfalls zählt der Textvergleich, ohne Rücksicht auf Groß- und Kleinschreibung. `Mari` ist also gleich `mari`.
2. Bei `>`, `<`, `>=` und `<=` müssen beide Seiten Zahlen sein. Ist eine Seite keine Zahl, trifft die Bedingung nicht zu.
3. Bei `contains`, `includes`, `not contains` und `not includes` spielt Groß- und Kleinschreibung keine Rolle. `contains "dr"` passt also auf den Text `Dr Smith`.

## Bedingungen mit ODER und UND verknüpfen

Nimm `||`, wenn eine der Bedingungen zutreffen darf. Nimm `&&`, wenn alle zutreffen müssen.

```
{{#if character == "Maukie" || character == "Pantalone"}}
Use the shared Maukie and Pantalone instructions.
{{/if}}

{{#if characters contains "Maukie" && characters contains "Pantalone"}}
Both characters are present in this chat.
{{/if}}
```

`&&` wird vor `||` ausgewertet. Mit Klammern legst du die Reihenfolge ausdrücklich fest:

```
{{#if (character == "Maukie" || character == "Pantalone") && scenario contains "lake"}}
Use the lakeside instructions for either character.
{{/if}}
```

Prüfst du denselben Wert auf mehrere Alternativen, darfst du die wiederholte linke Seite nach `||` weglassen:

```
{{#if character == "Maukie" || "Pantalone"}}
Use the shared instructions.
{{/if}}
```

Diese Kurzform bedeutet `character == "Maukie" || character == "Pantalone"`. Sie gilt für die Gleichheitsoperatoren `==`, `=` und `is`. Rund um `&&` schreibst du besser vollständige Bedingungen, denn ein Wert entspricht kaum je zwei verschiedenen Alternativen gleichzeitig.

### Truthy-Prüfungen (ohne Operator)

Steht in der Bedingung kein Operator, führt Marinara eine Truthy-Prüfung durch. Sie beantwortet eine einfache Frage: Steckt in diesem Wert überhaupt echter Inhalt?

```
{{#if scenario}}
Current scene: {{scenario}}
{{else}}
No specific scene is set.
{{/if}}
```

Eine Truthy-Prüfung trifft zu, wenn der Wert nicht leer ist und keines dieser Wörter ist: `false`, `0`, `no`, `off`, `null` oder `undefined`. Groß- und Kleinschreibung spielt dabei keine Rolle. Nimm eine Truthy-Prüfung, wenn ein Text nur bei ausgefülltem Feld mitgehen soll.

### Was sich vergleichen lässt

Links oder rechts in einer Bedingung steht eines der folgenden Elemente:

1. Ein Feld- oder Identitäts-Schlüsselwort wie `char`, `user`, `group`, `persona`, `description`, `personality`, `scenario`, `input` oder `model`. Diese lesen dieselben Werte wie die passenden Makros. `group` listet die übrigen aktiven Charaktere im Chat auf, ohne den gerade antwortenden Charakter.
2. Ein Literal in Anführungszeichen, etwa `"Alice"`.
3. Der Name einer Preset-Variablen, etwa `length`. Eine Preset-Variable ist ein benannter Wert, den du in einem Prompt-Preset festlegst. Siehe [Preset-Variablen](preset-variables.md).
4. Ein ausdrücklicher Variablenzugriff in der Form `var:name` oder `var.name`.
5. Ein weiteres Makro, dessen Wert zuerst aufgelöst und dann verglichen wird.

Schreibst du ein bloßes Wort, das kein Schlüsselwort ist, behandelt Marinara es als Variablennamen. Existiert keine Variable dieses Namens, gilt das Wort als schlichter Text. Anführungszeichen um feste Werte räumen diese Unklarheit aus – setz sie im Zweifel.

## Regeln für Anführungszeichen

Vergleichst du mit einem festen Text, gehört dieser in Anführungszeichen. Das sagt Marinara, dass es sich um ein exaktes Literal handelt und nicht um ein Schlüsselwort oder eine Variable.

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{/if}}
```

Erlaubt sind gerade doppelte oder gerade einfache Anführungszeichen. Marinara akzeptiert auch typografische Anführungszeichen, doch gerade Zeichen sind am sichersten und entsprechen allen Beispielen in der App. Innerhalb eines Werts in Anführungszeichen maskierst du ein Anführungszeichen mit einem Backslash, und `\n` steht für einen Zeilenumbruch.

Ein Literal mit Leerzeichen gehört immer in Anführungszeichen, etwa `"Dr Smith"`. Ein mehrteiliger Wert ohne Anführungszeichen gilt als ein einziger Variablenname – und das ist so gut wie nie gewollt.

## Gruppenblöcke für mehrere Charaktere

In einem Gruppenchat mit zwei oder mehr Charakteren wiederholt ein Gruppenblock denselben Text einmal pro Charakter. So beschreibt ein einziger Block jeden Charakter in der Szene.

Für einen Gruppenblock setzt du ein einzelnes `[` in eine eigene Zeile, darunter den Text und darunter ein einzelnes `]` in eine eigene Zeile. Der Block muss ein Charakter-Makro wie `{{char}}` oder `{{description}}` enthalten oder eine charakterbezogene Bedingung wie `{{#if char == "Alice"}}`. Marinara wiederholt den Block dann einmal pro Charakter und löst die Charakter-Makros nacheinander gegen jeden davon auf.

```
[
{{char}}'s current attitude:
{{#if char == "Alice"}}cheerful and open{{else}}guarded and quiet{{/if}}
]
```

In einem Gruppenchat mit Alice und Bob läuft der Block zweimal durch. Der erste Durchlauf setzt Alices Namen ein und wählt ihren Zweig. Der zweite setzt Bobs Namen ein und wählt seinen Zweig. Außerhalb eines Gruppenblocks bezieht sich ein Charakter-Makro nur auf den aktuellen oder den primären Charakter.

Gruppenblöcke greifen nur in Chats mit zwei oder mehr Charakteren. Im Einzelchat bleiben die Zeilen mit `[` und `]` schlichter Text.

## Beispiele aus der Praxis (vorher und nachher)

Es folgen drei vollständige Beispiele samt dem Ergebnis, das beim Modell ankommt.

Charakterspezifischer Ton innerhalb eines gemeinsamen Presets:

```
{{#if char == "Dottore"}}
Speak in a cold, clinical tone.
{{else}}
Speak warmly and casually.
{{/if}}
```

Beim Charakter `Dottore` erhält das Modell `Speak in a cold, clinical tone.` Bei allen anderen Charakteren erhält es `Speak warmly and casually.`

Ein Feld nur mitschicken, wenn es ausgefüllt ist:

```
{{#if backstory}}
Backstory to remember: {{backstory}}
{{/if}}
```

Hat der Charakter eine **Backstory** (Vorgeschichte), bekommt das Modell diese Zeile samt Text. Ist das Feld **Backstory** leer, ergibt der ganze Block nichts, und es geht keine leere Beschriftung mit.

Einen Teil des Nutzernamens treffen:

```
{{#if user contains "Dr"}}
Address the user as Doctor.
{{/if}}
```

Enthält der Name der Persona `Dr`, wird das Modell angewiesen, dich mit Doktor anzusprechen. Andernfalls ergibt der Block nichts.

## Verwandte Anleitungen

- [Prompt-Makros](macros.md)
- [Preset-Variablen](preset-variables.md)
- [Gruppenchats und Group Conversations](../chats/group-chats.md)
