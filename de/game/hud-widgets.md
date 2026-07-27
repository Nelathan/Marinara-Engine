# Game Mode: HUD-Widgets

In dieser Anleitung erfährst du, wie HUD-Widgets im Game Mode von Marinara Engine funktionieren. HUD steht für Heads-up-Display: kleine Info-Panels am linken und rechten Rand des Spielbildschirms. Es geht um die Widget-Typen, die Prüfung vor dem Spielstart, das Verschieben und Fixieren der Panels sowie das Teilen von Widget-Layouts.

## Was HUD-Widgets sind

HUD-Widgets sind kleine, selbst gestaltete Panels, die während eines Spiels Werte mitführen – etwa eine Lebensanzeige, einen Goldzähler oder das Vertrauen eines Verbündeten. Jedes Spiel bekommt eigene Widgets. Mit den HUD-Trackern aus dem Roleplay haben sie nichts zu tun. Die Tracker-Leiste in Roleplay-Chats beschreiben die verwandten Anleitungen weiter unten.

Möglich sind insgesamt bis zu 4 Widgets. Wie du sie auf die linke und die rechte Bildschirmseite verteilst, bleibt dir überlassen.

Widgets kommen nur zum Einsatz, wenn die Option **Custom HUD Widgets** (eigene HUD-Widgets) für das Spiel aktiviert ist. Standardmäßig ist sie im Einrichtungsassistenten aktiv. Ist sie an, entwirft der KI-Game-Master (GM) – die KI, die das Spiel leitet – beim Aufbau der Welt gleich einen Startsatz an Widgets.

## Die 8 Widget-Typen

Es gibt acht Widget-Typen. Der GM wählt für jedes Widget, das er anlegt, einen Typ aus. Baust du Widgets selbst, wählst du den Typ ebenfalls selbst.

| Widget-Typ | Was es anzeigt |
|---|---|
| **Progress Bar** | Ein waagerechter Balken für einen Wert im Verhältnis zu einem Maximum, etwa Leben oder Ausdauer. |
| **Gauge** | Eine halbrunde Skala für einen Wert im Verhältnis zu einem Maximum. |
| **Relationship Meter** | Ein Balken mit Meilenstein-Markierungen und Beschriftung – passend für das Vertrauen eines NPC (Nicht-Spieler-Charakter) oder eine Bindung. |
| **Counter** | Eine große Zahl, etwa Gold, vergangene Tage oder erledigte Gegner. |
| **Stat Block** | Ein kleines Raster aus benannten Feldern mit Werten, etwa STR und DEX oder ein Statuswort. |
| **List** | Eine kurze Aufzählung mit Texteinträgen, etwa aktive Ziele. |
| **Inventory Grid** | Ein Raster aus Inventarplätzen, optional mit Kategorie-Tabs und Stückzahlen. |
| **Timer** | Eine Countdown-Uhr in Minuten und Sekunden, die live herunterlaufen kann. |

## Das Prüffenster vor der Sitzung

Sobald eigene Widgets existieren, schiebt sich vor deinen ersten Zug ein Prüfschritt. In dem Moment, in dem du **Start Game** (Spiel starten) drückst, öffnet sich das Fenster **Review Starting Widgets** (Start-Widgets prüfen). Es listet jedes Start-Widget auf, damit du es anpassen kannst, bevor das Spiel es festschreibt.

In diesem Fenster stehen dir offen:

- **Edit** (bearbeiten) bei einem Widget drücken, um Startwerte zu ändern oder **Stat Block**-Felder umzubenennen.
- **Remove** (entfernen) drücken, um ein Widget loszuwerden, das du nicht willst.
- **Back** (zurück) drücken, um das Fenster ohne Spielstart zu schließen.
- **Start Game** drücken, um mit den gezeigten Widgets loszuspielen.

Ein ähnliches Fenster erscheint, wenn du in einem laufenden Spiel eine neue Sitzung beginnst. Es heißt dann **Prepare Next Session Widgets** (Widgets für die nächste Sitzung vorbereiten) und hat statt **Start Game** eine Schaltfläche **Start Next Session**. Die Schließen-Schaltfläche heißt dort **Cancel** statt **Back**.

## Ein Widget im laufenden Spiel bearbeiten

Während des Spiels pflegt der GM die Widget-Werte, während die Geschichte voranschreitet. Vergisst er eine Aktualisierung, korrigierst du das Widget einfach von Hand.

1. Suche das Widget-Panel am linken oder rechten Bildschirmrand.
2. Klick auf die Stift-Schaltfläche (**Edit**) in der Kopfzeile des Widgets.
3. Ändere die Werte im Editor-Fenster. Setze bei einem Balken zum Beispiel einen neuen **Current value** und **Maximum value**.
4. Klick auf **Save Changes** (Änderungen speichern).

In der Kopfzeile sitzt außerdem ein kleines Plus- oder Minuszeichen. Ein Klick auf die Kopfzeile klappt das Widget zu oder wieder auf.

## Panels verschieben und fixieren

Widget-Panels sind standardmäßig fixiert. Jedes Panel trägt ein Schloss-Symbol in der Kopfzeile.

1. Klick auf das Schloss-Symbol, um das Panel zu lösen. Eine zarte Umrandung zeigt, dass es sich jetzt bewegen lässt.
2. Zieh das Panel an eine neue Stelle.
3. Klick erneut auf das Schloss-Symbol, um es dort zu fixieren.

Zurück an den Standardplatz kommt ein Panel per Doppelklick auf sein Schloss-Symbol oder mit der Taste R, während das Symbol den Fokus hat. Position und Sperrzustand merkt sich jedes Panel pro Spiel. Von einem Spiel ins andere wandert das Layout nicht mit.

Auf dem Handy erscheinen Widgets als kleine Pillen statt als volle Panels. Tipp auf eine Pille, um das Widget zu öffnen, und auf das X, um es wieder zu schließen.

## Eigene Widgets bauen

Du kannst Widgets auch selbst entwerfen, statt sie dem GM zu überlassen. Den manuellen Widget-Editor erreichst du an zwei Stellen:

- Im Einrichtungsassistenten: Aktiviere **Custom HUD Widgets** und danach den Schalter **Build Widget Setup**. Der Editor erscheint direkt darunter.
- In einem bestehenden Spiel: Öffne **Chat Settings** (Chat-Einstellungen) und dort den Bereich **Widgets**.

Wähle im Editor einen Widget-Typ aus dem Dropdown-Menü und drück auf **Add** (hinzufügen). Pro Widget legst du fest:

- **Icon**: ein kurzes Symbol oder Emoji für die Kopfzeile.
- **Label**: der Name, der oben im Widget steht.
- **Type**: einer der acht Widget-Typen.
- **Side**: **Left HUD** oder **Right HUD**.
- **Accent**: die Farbe des Widgets.

Darunter bringt jeder Typ eigene Felder mit. Ein Balken nutzt **Value** und **Max**, ein Zähler **Count**, ein Inventarraster **Slots** und **Contents**, ein Timer **Seconds** und **Running**. Der Editor zeigt dabei an, wie viele der 4 erlaubten Widgets schon vergeben sind.

Drück in den **Chat Settings** auf **Save Widgets** (Widgets speichern), um die Änderungen ins Spiel zu übernehmen, oder auf **Reset** (zurücksetzen), um ungespeicherte Bearbeitungen zu verwerfen.

## Widgets über Import und Export teilen

Ein Widget-Layout lässt sich in eine Datei speichern und in einem anderen Spiel wieder laden. Die passenden Schaltflächen findest du sowohl im Einrichtungsassistenten als auch im Bereich **Widgets** der **Chat Settings**.

1. Drück auf **Export Widgets** (Widgets exportieren), um die aktuellen Widgets als JSON-Datei herunterzuladen. JSON ist ein reines Textdatenformat.
2. Drück im anderen Spiel auf **Import Widgets** (Widgets importieren) und wähle diese Datei aus, um dieselben Widgets zu laden.

Denk in den **Chat Settings** daran, nach einem Import auf **Save Widgets** zu drücken – sonst greifen die geladenen Widgets nicht.

## Verwandte Anleitungen

- [Game Mode: Erste Schritte](getting-started.md)
- [Roleplay: HUD und Tracker](../roleplay/hud-and-trackers.md)
