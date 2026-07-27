# Referenz der Slash-Befehle

In dieser Anleitung findest du alle Slash-Befehle, die sich in einem Marinara-Engine-Chat eintippen lassen. Ein Slash-Befehl ist eine Abkürzung, die du mit einem Schrägstrich beginnend ins Nachrichtenfeld schreibst, um schnell etwas zu erledigen. Manche Befehle wirken sofort auf dem Bildschirm, andere lassen die KI etwas schreiben.

## So funktionieren Slash-Befehle

Tipp den Befehl unten im Chat ins Nachrichtenfeld und klick dann auf **Send** (Senden). Auch Enter sendet, sofern **Send on Enter** (mit Enter senden) für den jeweiligen Chat-Modus unter **Settings** (Einstellungen) aktiv ist. Standardmäßig sendet Enter in Conversation-Chats; in Roleplay-Chats beginnt es dagegen eine neue Zeile. Das Nachrichtenfeld weist selbst auf die Befehle hin. In einem Roleplay-Chat lautet der Platzhaltertext **Write your response, / for commands** („Schreib deine Antwort, / für Befehle“). In einem Conversation-Chat steht dort der Charaktername, etwa „Message @Alice, / for commands“. Sind mehrere Charaktere beteiligt, erscheint stattdessen der Chatname.

Sobald du einen Schrägstrich tippst, öffnet sich über dem Feld ein kleines Menü mit passenden Befehlen. Jede Zeile zeigt den Namen und eine kurze Beschreibung. Ein Klick oder Tipp auf eine Zeile setzt den Befehl ins Feld ein – danach ergänzt du noch weiteren Text und schickst ihn ab.

Viele Befehle haben kürzere Alternativen. `/continue` und die Kurzform `/cont` bewirken zum Beispiel genau dasselbe. Die vollständige Liste zeigt dir die App jederzeit über diesen Befehl:

```
/help
```

Manche Befehle laufen direkt im Browser und ändern den Chat sofort, ganz ohne Kosten. Andere lassen die KI Text generieren; das läuft über den verbundenen Anbieter und verbraucht unter Umständen Tokens. Ein Token ist die Einheit, mit der die meisten KI-Anbieter Text messen und abrechnen. Die Tabellen unten halten fest, was der jeweilige Befehl macht.

Slash-Befehle funktionieren in den Nachrichtenfeldern von **Conversation** und **Roleplay**. Im Modus **Game** wirkt nur `/illustrate` als Slash-Befehl. Alles andere mit einem Schrägstrich am Anfang geht dort als ganz normaler Text raus.

Mehrere Befehle arbeiten mit Nachrichtennummern. Marinara zählt ab der ersten Nachricht im Chat: 1, dann 2, dann 3 und so weiter. Befehle wie `/goto`, `/hide` und `/unhide` greifen auf diese Nummern zu.

## Befehle für Chat und Nachrichten

Diese Befehle helfen dir beim Verwalten des Chats und seiner Nachrichten. Sie funktionieren in **Conversation**- und **Roleplay**-Chats.

| Befehl | Auch als | Was er macht |
|---|---|---|
| `/help` | | Listet alle Slash-Befehle auf. |
| `/continue` | `/cont` | Hängt weiteren Text an die letzte KI-Antwort an, ohne eine neue Nachricht zu senden. Die Option **Add a new line before /continue text** unter **Settings → General → Responses** legt fest, ob der Text nach einer Leerzeile beginnt oder direkt an der Abbruchstelle. |
| `/goto` | `/jump`, `/scroll` | Springt im Chat zu einer Nachricht mit der angegebenen Nummer. |
| `/hide` | | Blendet eine oder mehrere Nachrichten für die KI aus, sodass sie in kommenden Zügen unsichtbar bleiben. |
| `/unhide` | | Holt ausgeblendete Nachrichten wieder in die Sicht der KI zurück. |
| `/sys` | `/system` | Fügt eine Systemnachricht ein. Der Hinweis erscheint im Chat und lenkt die KI, stammt aber von keinem Charakter. |
| `/macros` | `/macro` | Listet die unterstützten Prompt-Makros auf, etwa `{{user}}` und `{{char}}`. |
| `/remind` | `/reminder`, `/timer` | Stellt einen Timer und postet danach eine Erinnerung im Chat. |

So springst du zu Nachricht 27:

```
/goto 27
```

`/hide` und `/unhide` nehmen eine einzelne Nummer, einen Bereich oder eine Mischung aus beidem. Dieses Beispiel blendet die Nachrichten 3 bis 8 aus:

```
/hide 3-8
```

Für eine einzelne Nachricht schreibst du `/hide 5`, für mehrere `/hide 2-5,9,12`. Ausgeblendete Nachrichten bleiben im Chat stehen, die KI liest sie im nächsten Zug aber nicht mit. Mit `/unhide` und derselben Art von Nummernliste holst du sie zurück.

Der Befehl `/remind` erwartet erst eine Zeitangabe, dann eine Nachricht. Dabei steht `h` für Stunden, `m` für Minuten und `s` für Sekunden. Dieses Beispiel erinnert dich in 30 Minuten:

```
/remind 30m check the oven
```

Die Erinnerung lebt in der Browser-Sitzung. Lass den Tab also offen, bis sie fällig wird.

## Befehle für Story und Roleplay

Mit diesen Befehlen lenkst du die Geschichte, spielst einen Charakter und ergänzt Bilder. Die meisten entfalten ihre Stärke in einem **Roleplay**-Chat. Die Ausnahme ist `/scene`: Den startest du aus einem **Conversation**-Chat heraus.

| Befehl | Auch als | Was er macht |
|---|---|---|
| `/guided` | `/narrator`, `/narrate`, `/nar` | Lenkt die nächste KI-Antwort in eine Richtung, die du vorgibst. |
| `/as` | `/respond` | Postet eine Nachricht als Charakter oder bittet einen Charakter um eine Antwort. |
| `/emote` | `/emotion`, `/sprite` | Zeigt die Gesichtsausdrücke eines Sprites an oder wechselt zwischen ihnen. |
| `/roll` | `/r`, `/dice` | Würfelt und postet das Ergebnis. |
| `/random` | `/rand`, `/event` | Bittet die KI, ein überraschendes Ereignis in die Geschichte einzubauen. |
| `/scene` | `/rp` | Wird aus einem Conversation-Chat heraus ausgeführt. Startet eine neue Roleplay-Szene, die sich von diesem Chat verzweigt. |
| `/illustrate` | `/ill` | Generiert ein Galeriebild für den aktuellen Chat. |
| `/impersonate` | `/imp` | Schreibt eine Antwort im Namen deiner Persona. |
| `/impersonate_prompt` | `/imp_prompt` | Legt die Anweisung fest, die `/impersonate` in diesem Chat verwendet. |

Um die nächste Antwort zu lenken, hängst du deine Vorgabe hinter `/guided`:

```
/guided make him confess he is lying
```

Der Befehl `/roll` versteht Würfelnotation. So würfelst du zwei sechsseitige Würfel:

```
/roll 2d6
```

Ein Modifikator ist ebenfalls möglich, etwa `/roll 1d20+5`. Steht nach `/roll` nichts, würfelt Marinara `1d20`.

Ein Sprite ist ein Charakterbild auf der Bühne, das einen Gesichtsausdruck zeigt. Mit `/emote` wechselst du, welches davon zu sehen ist. Tipp `/emote` allein ein, um die verfügbaren Gesichtsausdrücke zu sehen, oder nenne einen davon direkt:

```
/emote joy
```

Der Wechsel klappt nur in einem Roleplay-Chat, in dem Sprites hochgeladen sind. Wie du sie hinzufügst, steht unter [Charakter-Sprites](../characters/sprites.md).

Deine Persona ist der Charakter, der dich im Chat vertritt; in Prompts steht dafür `{{user}}`. Der Befehl `/impersonate` schreibt eine Antwort an deiner Stelle. Eine Richtungsvorgabe kannst du direkt anhängen:

```
/impersonate ask about the weather
```

In **Conversation**-Chats stehen `/impersonate` und `/impersonate_prompt` nicht zur Verfügung. Ausführlich beschrieben sind gelenkte Generierung und Impersonation unter [Gelenkte Generierung und Impersonate](guided-and-impersonate.md).

## Befehle für den Conversation Mode

Diese Befehle funktionieren ausschließlich in einem **Conversation**-Chat.

| Befehl | Was er macht |
|---|---|
| `/uno` | Startet eine Partie UNO mit den Charakteren im Chat. |
| `/chess` | Startet eine Schachpartie zu zweit mit einem Charakter. |
| `/poker` | Startet eine Runde Texas Hold'em mit den Charakteren. |
| `/8ball` | Startet eine 8-Ball-Poolpartie zu zweit mit einem Charakter. `/pool` macht dasselbe. |
| `/status` | Setzt den Anwesenheitsstatus eines Charakters oder hebt ihn auf. |

`/uno`, `/chess`, `/poker` und `/8ball` öffnen jeweils den Einrichtungsbildschirm des Spiels. Pro Chat läuft immer nur ein Spiel gleichzeitig. Regeln und Optionen findest du unter [Tischspiele](../conversation/table-games.md).

Mit `/status` überschreibst du die Anwesenheit eines Charakters. Möglich sind `online`, `idle`, `dnd` (bitte nicht stören) und `offline`. `clear` entfernt die Überschreibung wieder. So setzt du den Charakter auf abwesend:

```
/status idle
```

Sind mehrere Charaktere im Chat, hängst du den Namen hinten an, etwa `/status online Alice`.

## Verwandte Anleitungen

- [Nachrichten-Aktionen](messages.md)
- [Gelenkte Generierung und Impersonate](guided-and-impersonate.md)
- [Tischspiele](../conversation/table-games.md)
- [Makros](../prompts/macros.md)
