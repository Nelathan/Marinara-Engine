# Game Mode: Würfel und Fertigkeitsproben

In dieser Anleitung erfährst du, wie das Würfeln im Game Mode von Marinara Engine funktioniert: das Schnellwürfel-Menü, die eigene Würfelnotation und die Grenzen für eigene Würfe. Außerdem geht es darum, wie der Game Master (die KI, die das Spiel leitet) eine Fertigkeitsprobe gegen eine Difficulty Class (DC) abwickelt.

## Würfeln

Die Eingabeleiste in einem Game-Mode-Chat hat eine Würfel-Schaltfläche. Zeig mit der Maus darauf, dann erscheint der Tooltip **Roll dice** (Kurzhinweis beim Draufzeigen). Ein Klick öffnet das Schnellwürfel-Menü.

Das Menü bietet acht Presets für einen Klick:

| Preset | Würfelt |
|---|---|
| d20 | einen 20-seitigen Würfel |
| d6 | einen 6-seitigen Würfel |
| 2d6 | zwei 6-seitige Würfel |
| d10 | einen 10-seitigen Würfel |
| d100 | einen 100-seitigen Würfel |
| d4 | einen 4-seitigen Würfel |
| d8 | einen 8-seitigen Würfel |
| d12 | einen 12-seitigen Würfel |

So kommst du zu einem schnellen Wurf:

1. Öffne die Eingabeleiste in einem Game-Mode-Chat.
2. Klick auf die Würfel-Schaltfläche.
3. Klick auf eines der acht Presets, zum Beispiel **d20**.
4. In der Eingabeleiste erscheint ein kleiner Chip, etwa `🎲 d20`.

Der Wurf geht nicht sofort raus, sondern wandert in die Warteschlange. Zum Entfernen klick auf die Lösch-Schaltfläche am Chip; ihr Tooltip lautet **Clear queued roll**.

Gerechnet wird erst, wenn du die nächste Nachricht abschickst. Die App hängt das Ergebnis als Tag (Schlagwort) ans Ende der Nachricht. Ein einzelner Würfel ohne Bonus sieht so aus:

```
[dice: d20 = 14]
```

Bei mehreren Würfeln oder mit Bonus stehen auch die Einzelwerte dabei:

```
[dice: 3d8+2 = 18 (4, 6, 6 +2)]
```

Der Game Master liest dieses Tag und erzählt passend zum Ergebnis weiter.

## Eigene Würfelnotation

Im Würfelmenü gibt es zusätzlich ein Textfeld für einen eigenen Wurf. Es versteht die übliche `NdM`-Notation: `N` ist die Anzahl der Würfel, `M` die Zahl der Seiten pro Würfel. Am Ende lässt sich ein Bonus oder ein Abzug anhängen.

Der Platzhalter im Feld zeigt ein Beispiel: `3d8+2`. Das heißt: drei 8-seitige Würfel werfen und 2 zur Summe addieren.

So nutzt du einen eigenen Wurf:

1. Klick auf die Würfel-Schaltfläche, um das Menü zu öffnen.
2. Tipp die Notation ins Textfeld, zum Beispiel `2d6+1`.
3. Drück Enter oder klick auf die kleine Papierflieger-Schaltfläche (senden) neben dem Feld.
4. Der Wurf steht als Chip bereit und wartet auf das Absenden.

Weitere Beispiele zum Ausprobieren:

- `d20` wirft einen 20-seitigen Würfel.
- `4d8-1` wirft vier 8-seitige Würfel und zieht 1 ab.
- `2d6+3` wirft zwei 6-seitige Würfel und addiert 3.

Zwei Grenzen sind fest eingebaut: höchstens 100 Würfel auf einmal und höchstens 1000 Seiten pro Würfel. Verlangst du mehr, lehnt die App den Wurf nicht ab, sondern stutzt ihn auf diese Grenzen zurecht. Entspricht der Text keiner gültigen `NdM`-Notation, scheitert der Wurf und du bekommst eine Fehlermeldung, die das erwartete Format nennt.

## Fertigkeitsproben

Eine Fertigkeitsprobe entscheidet, ob dir etwas Riskantes gelingt – anschleichen, einen Hinweis entdecken oder einen NPC (Nicht-Spieler-Charakter) überzeugen. Du startest eine Probe nicht selbst. Der Game Master fordert sie mitten in seiner Erzählung ein. Die App macht daraus einen animierten d20-Wurf mit einem Ergebnis-Banner.

Das Banner nennt die Fertigkeit und die Zielzahl, zum Beispiel **Stealth Check** und daneben **DC 15**. DC steht für Difficulty Class, also den Schwierigkeitsgrad: die Zahl, die dein Wurf erreichen oder übertreffen muss.

### Wie das Ergebnis zustande kommt

Die Probe wirft einen 20-seitigen Würfel und addiert zwei Modifikatoren:

- einen Fertigkeits-Modifikator aus der Fertigkeitsstufe, die das Spiel für den Charakter mitführt. Fehlt für diese Fertigkeit noch eine Stufe, beträgt der Modifikator 0.
- einen Attribut-Modifikator aus dem Attribut, das für diese Fertigkeit zuständig ist.

Würfelwurf plus beide Modifikatoren ergeben das Gesamtergebnis. Erreicht oder übertrifft es die DC, ist die Probe bestanden. Bleibt es darunter, ist sie misslungen. Jede Fertigkeit hängt automatisch an einem zuständigen Attribut. Stealth (Heimlichkeit) nutzt zum Beispiel Dexterity (Geschicklichkeit), Perception (Wahrnehmung) nutzt Wisdom (Weisheit) und Persuasion (Überredung) nutzt Charisma. Kennt die App eine Fertigkeit nicht, greift sie auf Intelligence (Intelligenz) zurück.

### Kritischer Erfolg und kritischer Fehlschlag

Zwei Würfelergebnisse setzen die Rechnung außer Kraft:

- Eine natürliche 20 (der Würfel selbst zeigt 20) ist ein **CRITICAL SUCCESS**. Sie gelingt immer, auch gegen eine hohe DC.
- Eine natürliche 1 (der Würfel selbst zeigt 1) ist ein **CRITICAL FAILURE**. Sie misslingt immer, auch bei großen Modifikatoren.

Das Banner zeigt eines von vier Ergebnissen: **CRITICAL SUCCESS**, **SUCCESS**, **FAILURE** oder **CRITICAL FAILURE**.

### Vorteil und Nachteil

Der Game Master kann eine Probe mit Vorteil oder mit Nachteil ansetzen. Beides zusammen kommt bei einer Probe nie vor.

- Mit Vorteil wirft die App zwei 20-seitige Würfel und behält den höheren.
- Mit Nachteil wirft die App zwei Würfel und behält den niedrigeren.

Ist eines von beiden aktiv, zeigt das Banner den Modus neben der DC an und markiert, welchen Würfel es verwendet hat.

### Eigenen Würfel vorab werfen

Du kannst vor der Probe einen eigenen `d20` über das Würfelmenü in die Warteschlange legen. Dann übernimmt die Fertigkeitsprobe deine gewürfelte Zahl, statt neu zu würfeln. Fertigkeits- und Attribut-Modifikator kommen weiterhin obendrauf.

## Verwandte Anleitungen

- [Game Mode: Kampf](combat.md)
- [Game Mode: Erste Schritte](getting-started.md)
- [Game Mode: Party und NPCs](party-and-npcs.md)
