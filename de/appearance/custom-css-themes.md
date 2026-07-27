# Eigene CSS-Themes (Theme Library)

In dieser Anleitung erfährst du, wie du das gesamte Erscheinungsbild von Marinara Engine mit einem eigenen CSS-Theme umgestaltest. Du lernst, Themes anzulegen, zu importieren, zu exportieren und zu aktivieren. Außerdem siehst du, welche CSS-Variablen sich ändern lassen und wie Themes mit Card CSS zusammenspielen.

## Was ein eigenes Theme ist

Ein eigenes Theme ist ein Block CSS, der Marinara neu einfärbt. CSS steht für Cascading Style Sheets und ist der Code, der in der ganzen App Farben, Rahmen und Abstände festlegt. Ein Theme kann den Seitenhintergrund ändern, dazu die Akzentfarbe, Karten, Rahmen, Text und vieles mehr.

Eigene Themes liegen in der **Theme Library** (Theme-Bibliothek). Marinara speichert sie auf dem Server, deshalb erscheinen sie auf jedem Gerät und in jedem Browser, der sich mit demselben Server verbindet. Die meisten anderen Darstellungs-Einstellungen bleiben dagegen auf einem einzigen Gerät. Mehr dazu in der Anleitung [Darstellungs-Einstellungen](appearance-settings.md).

Aktiv sein kann immer nur ein eigenes Theme. In der Bibliothek dürfen beliebig viele liegen, und du wechselst jederzeit zwischen ihnen.

## Wo die Theme Library steckt

1. Öffne **Settings** (Einstellungen).
2. Öffne den Tab **Addons**.
3. Suche den Bereich **Theme Library**.

Der Bereich heißt **Theme Library** und trägt den Untertitel "Create, import, activate, edit, export, or remove custom CSS themes."

## Ein Theme anlegen

1. Klick im Bereich **Theme Library** auf **Create Theme** (Theme anlegen).
2. Gib im Feld **Theme name** (Theme-Name) einen Namen ein.
3. Schreib das CSS in das große Textfeld oder füge es dort ein.
4. Lass **Preview** (Vorschau) an, damit du die Änderungen beim Tippen sofort in der App siehst. Schalte **Preview** aus, um die Live-Vorschau zu beenden.
5. Klick auf **Save** (Speichern).

Ein neues Theme startet mit einer Vorlage. Darin stehen gängige Variablen als auskommentierte Beispiele: Entferne die Kommentarzeichen und trag eigene Werte ein. Speicherst du ein brandneues Theme, aktiviert Marinara es sofort. Dazu kommt eine Bestätigung mit dem Theme-Namen, etwa: Theme "My Theme" saved and activated.

Später änderst du ein Theme über die Liste **Installed Themes** (installierte Themes). Klick dort auf das Code-Symbol – sein Tooltip lautet **Edit theme CSS**, also ein Kurzhinweis beim Draufzeigen –, bearbeite das CSS und klick auf **Save**. Beim Bearbeiten eines gespeicherten Themes ändert sich nur dessen Inhalt, nicht das aktive Theme.

## Themes importieren und exportieren

Themes lassen sich als Datei weitergeben. Praktisch, um ein Theme auf einen anderen Server zu holen oder einer Freundin zu schicken.

So importierst du ein Theme:

1. Klick im Bereich **Theme Library** auf **Import File** (Datei importieren).
2. Wähle eine `.css`- oder eine `.json`-Datei.
3. Lies die Toast-Meldung. Sie nennt, wie viele Themes importiert, übersprungen oder abgelehnt wurden.

Aus einer `.css`-Datei wird ein Theme, benannt nach der Datei. Eine `.json`-Datei kann ein oder mehrere Themes enthalten, und es gibt zwei Sorten davon.

Die erste Sorte stammt aus einem Export von Marinara. Jedes Theme steckt dort in zusätzlichen Feldern, die Marinara beim Export ergänzt. Du musst die Datei weder lesen noch bearbeiten. Importiere sie einfach unverändert.

Die zweite Sorte ist eine kleine Datei, die du selbst schreibst. Für ein einzelnes Theme reicht das hier:

```
{ "name": "My Theme", "css": "..." }
```

Importierte Themes landen ebenfalls auf dem Server, aktivieren sich aber nicht von selbst. Existiert auf dem Server bereits ein Theme mit demselben Namen und demselben CSS, überspringt Marinara es, statt es doppelt anzulegen.

Zum Exportieren suchst du das Theme in der Liste **Installed Themes** und klickst auf das Upload-Symbol (Tooltip: **Export theme**). Marinara lädt eine `.json`-Datei herunter, die du anderswo importieren kannst.

## Ein Theme aktivieren

Die Liste **Installed Themes** zeigt alle Themes und ganz oben zusätzlich den Eintrag **Default Theme** (Standard-Theme).

1. Klick auf den Namen eines Themes, um es zu aktivieren. Ein Häkchen markiert das aktive Theme.
2. Klick auf **Default Theme**, um eigene Themes abzuschalten und zum eingebauten Marinara-Look zurückzukehren.

Die Schaltfläche **Reset Appearance** (Darstellung zurücksetzen) sitzt oben im Bereich **App Style** unter **Settings -> Appearance**. Sie schaltet auch das aktive eigene Theme ab.

Willst du ein Theme endgültig loswerden, klick in seiner Zeile auf das Papierkorb-Symbol (Tooltip: **Remove theme**) und bestätige im Fenster **Delete Theme**. Damit löscht Marinara das CSS dauerhaft vom Server.

## Die CSS-Variablen-Referenz

Im Theme-Editor gibt es eine ausklappbare **CSS Variable Reference** (CSS-Variablen-Referenz). Ein Klick darauf zeigt die nützlichsten Variablen, die sich überschreiben lassen. Ein Theme verändert die App, indem es diese Variablen in einem `:root`-Block setzt. Die Referenz listet folgende Variablen:

| Variable | Wirkung |
| --- | --- |
| `--background` | Seitenhintergrund |
| `--foreground` | Haupttext |
| `--primary` | Akzent und Schaltflächen |
| `--primary-foreground` | Text auf Primärfarbe |
| `--secondary` | Karten und Eingabefelder |
| `--card` | Kartenhintergrund |
| `--border` | Rahmen |
| `--muted-foreground` | Gedimmter Text |
| `--sidebar` | Hintergrund der Seitenleiste |
| `--sidebar-border` | Rahmen der Seitenleiste |
| `--marinara-shell-edge-border` | Linker und rechter Rand der Hülle |
| `--destructive` | Fehler und Löschen |
| `--popover` | Hintergrund des Dropdown-Menüs |
| `--accent` | Hervorhebung beim Draufzeigen |

Auf diese Liste bist du nicht festgelegt. Ein Theme kann jede CSS-Variable setzen, die Marinara verwendet, und darüber hinaus eigene Stile ergänzen.

Manche visuellen Effekte haben eigene Variablen. Die pulsierende Akzent-Animation etwa fordert ein Theme mit `--marinara-theme-accent-pulse: enabled` an.

Aus Sicherheitsgründen bereinigt Marinara das CSS eigener Themes, bevor es wirkt. Stile, die eine Datei von einer fremden Website nachladen, funktionieren nicht. Bilder oder Schriften bindest du deshalb als `data:`-URI ein statt als Web-Link. Eine `data:`-URI trägt den Dateiinhalt direkt im CSS.

## Grenzen für Größe und Name

Ein Theme-Name darf bis zu 200 Zeichen lang sein. Das CSS selbst darf bis zu 256 KiB umfassen, gemessen in UTF-8-Bytes statt in Zeichen. Größere Themes lehnt Marinara beim Speichern oder Importieren ab.

## Admin Access bei Zugriff aus der Ferne

Themes anlegen, bearbeiten, importieren, aktivieren und entfernen sind geschützte Aktionen. Relevant wird das nur, wenn du Marinara über ein Netzwerk öffnest.

Öffnest du Marinara auf demselben Rechner, auf dem der Server läuft, also über Loopback (auch localhost genannt), klappen diese Aktionen ohne Weiteres. Rufst du Marinara von einem anderen Gerät auf – vom Handy etwa oder von einem anderen Rechner im Netzwerk –, braucht der Server zuerst ein Admin-Secret.

So verwaltest du Themes über das Netzwerk:

1. Setze auf dem Server `ADMIN_SECRET` in der Datei `.env`.
2. Öffne in der App **Settings -> Advanced -> Admin Access** und trag denselben Wert ein.

Ohne das schlagen Theme-Änderungen über das Netzwerk fehl. Die komplette Einrichtung beschreiben die [Server-Konfigurationsreferenz](../CONFIGURATION.md) und die [Anleitung zum Fernzugriff](../REMOTE_ACCESS.md).

## Wie Themes und Card CSS zusammenspielen

Marinara kennt zwei Wege, eigenes CSS einzubringen. Es sind getrennte Funktionen, und beide dürfen gleichzeitig aktiv sein.

Ein eigenes Theme färbt die ganze App neu. Es darf Marinaras Kernvariablen überschreiben, `!important` verwenden und `position: fixed` setzen. Genau dafür ist ein Theme da.

Card CSS funktioniert anders. Wer eine Charakterkarte oder eine Persona erstellt, kann CSS darin einbetten, und du schaltest es pro Chat frei. Card CSS bereinigt Marinara strenger: Kernvariablen der App bleiben unangetastet, `!important` fliegt raus, und aus `position: fixed` wird `position: absolute`. Es gestaltet die Nachrichten im Chat, nicht die ganze App. Siehe die [Anleitung zu Card-CSS-Themes](card-css-theming.md).

Sieht die App verkorkst aus, lohnt der Blick auf beides – auf das aktive Theme und auf Card CSS. Beides kommt als Ursache infrage.

## Verwandte Anleitungen

- [Anleitung zu Card-CSS-Themes](card-css-theming.md)
- [Darstellungs-Einstellungen](appearance-settings.md)
- [Server-Konfigurationsreferenz](../CONFIGURATION.md)
- [Fernzugriff: Basic Auth und IP-Allowlist](../REMOTE_ACCESS.md)
