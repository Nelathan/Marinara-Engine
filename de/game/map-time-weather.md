# Game Mode: Karte, Zeit und Wetter

In dieser Anleitung erfährst du, wie das Karten-Panel im Game Mode funktioniert und welche Systeme die Welt rund um die Party (deine Abenteuergruppe) mitführen: Tag und Uhrzeit, das Wetter und die Moral der Party. Beschrieben werden außerdem die beiden Kartenansichten, das Bewegen und Zoomen sowie das manuelle Einstellen von Tag und Uhrzeit.

## Das Karten-Panel

Im Game Mode sitzt auf dem Spielbildschirm ein kleines Karten-Panel. Es zeigt den Namen der aktuellen Karte, den Spieltag und ein Himmelssymbol für die Tageszeit.

Am Computer ist die Karte ein eingebettetes Panel, das du auf einen Blick erfassen kannst. Am Handy tippst du oben links auf das Kartensymbol. Die Schaltfläche heißt **Open map** (Karte öffnen) und blendet die Karte in einem Popover ein, also in einem kleinen Einblendfenster.

Das Panel lässt sich verschieben und an Ort und Stelle fixieren. Wie verschiebbare Panels genau funktionieren, steht in der unten verlinkten Anleitung zu den HUD-Widgets.

## Grid-Ansicht und Node-Ansicht

Die Karte kennt zwei Ansichten. Welche davon erscheint, entscheidet Marinara Engine anhand der Art des dargestellten Ortes. Von Hand umschalten kannst du nicht.

- Die **grid**-Ansicht (Raster) ist für offene Gebiete gedacht, etwa eine Oberwelt, eine Region oder eine Stadt. Sie zeigt Quadrate, die nach Gelände eingefärbt sind: Gras, Wald, Wasser, Gebirge, Wüste, Schnee, Stadt, Straße und Höhle.
- Die **node**-Ansicht (Knotenpunkte) ist für geschlossene Bereiche wie Dungeons und Innenräume gedacht. Orte erscheinen als Kreise, die durch Linien verbunden sind. Ein noch unentdeckter Ort trägt ein Fragezeichen. Eine gestrichelte Linie steht für einen Weg, den du noch nicht gegangen bist, eine durchgezogene für einen bereits genutzten Weg.

## Die Party bewegen

Zum Reisen wählst du ein Ziel auf der Karte. Anwählbar ist allerdings nicht alles. Auf einer Grid-Karte muss ein Quadrat direkt an die Party grenzen und bereits entdeckt sein. Auf einer Node-Karte muss ein Knoten mit dem aktuellen Ort verbunden oder bereits entdeckt sein. Alle anderen Quadrate und Knoten reagieren nicht auf einen Klick.

1. Klick auf ein Rasterquadrat oder auf einen Knoten der Node-Karte.
2. Über dem Nachrichtenfeld erscheint ein Chip **Destination:** (Ziel:) mit dem Namen des Ortes.
3. Schreib deine Nachricht und schick sie ab. Marinara stellt ihr eine kurze Zeile wie `*moves to <place>*` voran.

Zum Abbrechen klickst du auf die kleine Löschen-Schaltfläche (das X) am Chip **Destination:**.

Am Handy läuft es etwas anders. Tippe einmal auf einen Knoten, um ihn auszuwählen, und dann in der Fußzeile auf **Set destination** (Ziel festlegen). Der Knoten mit der Markierung **You are here** (Du bist hier) ist der aktuelle Standort.

## Die Karte zoomen

Jede Karte hat oben rechts eine Zoom-Steuerung.

- **Zoom in** (die Plus-Schaltfläche) holt die Karte näher heran.
- **Zoom out** (die Minus-Schaltfläche) zeigt mehr davon.

Der Zoom reicht von 75 % bis 180 %, in Schritten von 25 %.

## Zwischen Karten wechseln

Manche Spiele haben mehrere Karten oder Regionen. Gibt es mehr als eine Karte, erscheint oben im Karten-Panel ein kleines Dropdown-Menü. Darüber rufst du eine andere Karte auf. Die Karte, auf der du dich tatsächlich befindest, ist mit **(Current)** markiert.

## Eine neue Karte generieren

Oben links im Karten-Panel sitzt eine Zauberstab-Schaltfläche mit der Beschriftung **Generate another map** (weitere Karte generieren). Ein Klick darauf ersetzt die aktuelle Karte durch eine frische.

Hat ein Spiel noch gar keine Karte, zeigt das Panel **No map yet** (noch keine Karte) und dazu eine Schaltfläche **Generate**, die dasselbe tut.

## Tag und Uhrzeit von Hand setzen

Ganz oben im Karten-Panel sitzt die Steuerung für Tag und Uhrzeit. Sie zeigt **Day** (Tag) mit einer Zahl und daneben ein kleines Himmelssymbol für die Tageszeit.

1. Klick auf die Steuerung **Day**.
2. Trag im Feld eine neue Tageszahl ein. Möglich sind Werte von 1 bis 9999.
3. Wähl im Dropdown-Menü eine Tageszeit. Zur Auswahl stehen **Dawn**, **Morning**, **Afternoon**, **Evening**, **Night** und **Midnight**.
4. Klick daneben oder drück Enter, um zu speichern.

Das ist eine manuelle Übersteuerung: Du setzt Tag und Uhrzeit selbst, unabhängig von der automatischen Uhr, die im nächsten Abschnitt beschrieben wird. Die Uhr kann von sich aus auch **Noon** anzeigen, doch Noon steht bei der manuellen Auswahl nicht zur Verfügung.

## Wie die Zeit automatisch vergeht

Die Spieluhr läuft von allein. Sie rechnet mit festen Werten statt mit der KI und ist deshalb immer konsistent. Jedes neue Spiel startet an Tag 1 um 08:00 Uhr morgens. Jede Aktion stellt die Uhr um einen festen Betrag vor.

| Aktion | Zeit, die vergeht |
|---|---|
| Reden | 15 Minuten |
| Erkunden | 30 Minuten |
| Eine Kampfrunde | 5 Minuten |
| Eine kurze Rast | 1 Stunde |
| Eine lange Rast | 8 Stunden |
| Reisen | 2 Stunden |

Sobald die Uhr Mitternacht überschreitet, steigt die Tageszahl um eins.

## Wetter

Auch das Wetter führt das Spiel selbst mit, mit festen Werten und ohne KI. Es hängt vom Biom und von der Jahreszeit ab. Ein Biom ist die Art von Umgebung, in der die Party unterwegs ist, zum Beispiel Wüste, Arktis, Küste oder Gebirge. Zum Wetter gehören unter anderem klar, bewölkt, Regen, Sturm, Schnee, Blizzard, Nebel und Sandsturm.

Das Wetter kann sich durch deine Aktionen ändern. Am häufigsten passiert das beim Reisen und bei einer langen Rast, manchmal beim Erkunden, sonst nur selten. Das Wetter färbt darauf ab, wie der Game Master – die KI, die das Spiel leitet – jede Szene beschreibt.

Damit das Wetter auch auf dem Bildschirm sichtbar wird, aktiviere in den Darstellungs-Einstellungen der App die Option **Dynamic weather effects (rain, snow, fog, etc.)** (dynamische Wettereffekte). Sie ist standardmäßig aktiv. Ist sie eingeschaltet, legen sich animierte Partikel wie Regen, Schnee und Nebel über das Spiel, passend zu Wetter und Tageszeit. Weitere Darstellungsoptionen findest du in der unten verlinkten Anleitung zu den Darstellungs-Einstellungen.

## Moral der Party

Das Spiel führt im Verborgenen einen Moralwert der Party von 0 bis 100. Er kennt fünf Stufen, von der niedrigsten zur höchsten: Broken, Low, Steady, High und Inspired.

Die Moral verschiebt sich mit dem, was in der Geschichte passiert. Ein gewonnener Kampf, eine abgeschlossene Quest oder ein Schatzfund heben sie. Eine verlorene Schlacht, eine gescheiterte Quest oder der Verlust eines Verbündeten drücken sie. Mit der Zeit driftet die Moral wieder zur Mitte zurück.

Als Zahl taucht die Moral im Spiel nicht auf. Sie wirkt stattdessen im Hintergrund: Sie verändert die Würfelwürfe, von plus 2 bei Inspired bis minus 2 bei Broken. Und sie färbt darauf ab, wie der Game Master die Stimmung der Party beschreibt.

## Verwandte Anleitungen

- [Game Mode: Erste Schritte](getting-started.md)
- [Game Mode: HUD-Widgets](hud-widgets.md)
- [Darstellungs-Einstellungen](../appearance/appearance-settings.md)
