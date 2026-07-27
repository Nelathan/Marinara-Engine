# Lorebooks importieren und exportieren

In dieser Anleitung erfährst du, wie Lorebooks nach Marinara Engine kommen und wie du sie als Datei sicherst. Es geht um einzelne Dateien, um viele Dateien auf einmal und um die beiden Exportformate. Ein Lorebook ist eine Sammlung von Weltwissen: Notizen mit Schlüsselwörtern, die Marinara in den Prompt einfügt – also in den Text, der an die KI geht –, sobald ein passendes Wort fällt. Manche anderen Roleplay-Programme nennen diese Funktion **World Info**.

## Was sich importieren lässt

Marinara liest zwei Arten von Lorebook-Datei und erkennt automatisch, welche davon vorliegt:

- Ein Lorebook, das aus Marinara selbst stammt. Hier bleiben alle Felder und alle Ordner erhalten.
- Eine **World-Info**-Datei aus einem anderen Programm. Dazu zählen die World-Info-Dateien von SillyTavern und das „character-book“-Format der V2-Charakterkarten. Marinara ordnet die fremden Felder den eigenen zu.

Beides sind schlichte `.json`-Dateien. Für den Import brauchst du weder ein Konto noch einen API-Key.

## Ein Lorebook importieren

So importierst du eine einzelne Lorebook-Datei:

1. Öffne links in der App das Panel **Lorebooks**.
2. Klick in der oberen Aktionsleiste auf das Symbol mit dem Download-Pfeil. Sein Tooltip – der Kurzhinweis beim Draufzeigen – lautet **Import** (Importieren). Es sitzt zwischen dem Plus-Symbol (**New**, Neu) und dem Häkchen-Symbol (**Select**, Auswählen). Die drei Schaltflächen zeigen nur Symbole; zeig also darauf, um die Namen zu sehen.
3. Das Fenster **Import Lorebook** öffnet sich. Darin steht ein Feld mit dem Text **Drop one or more lorebook files here or click to browse**.
4. Zieh die `.json`-Datei auf dieses Feld oder klick darauf und such die Datei aus.
5. Warte das Ergebnis ab. Jede Datei bekommt entweder ein grünes Häkchen mit **Imported lorebook** oder eine rote Markierung mit einer Fehlermeldung.
6. Klick auf **Close** (Schließen). Das neue Lorebook steht jetzt in der Liste im Panel **Lorebooks**.

Als Erstellungsdatum übernimmt Marinara das Datum aus der importierten Datei – nicht den Zeitpunkt des Imports.

## Viele Lorebooks auf einmal importieren (Massenimport)

Das Fenster **Import Lorebook** nimmt auch mehrere Dateien in einem Durchgang an.

1. Öffne das Panel **Lorebooks** und klick auf das Symbol mit dem Download-Pfeil. Sein Tooltip lautet **Import**.
2. Zieh mehrere `.json`-Dateien gleichzeitig auf das Feld oder klick darauf und markier mehrere Dateien.
3. Marinara importiert eine Datei nach der anderen und zeigt für jede eine eigene Ergebniszeile. Eine Zusammenfassung nennt am Ende die Zahl der geglückten und der fehlgeschlagenen Importe.

Marinara-Dateien und **World-Info**-Dateien dürfen im selben Durchgang gemischt sein. Marinara prüft jede Datei einzeln.

## Ein Lorebook exportieren

Beim Export landet ein Lorebook als Datei auf dem Gerät. Genau so gibst du ein Lorebook weiter oder bringst es in eine andere Installation.

1. Klick im Panel **Lorebooks** auf ein Lorebook, um den Editor zu öffnen.
2. Klick oben im Editor auf das Export-Symbol. Sein Tooltip lautet **Export lorebook** (Lorebook exportieren).
3. Das Fenster **Export Lorebook** öffnet sich und bietet zwei Möglichkeiten. Wähl eine davon:
   - **Marinara Native** behält die Marinara-Ordner und jedes Feld der Einträge. Nimm das, wenn ein Lorebook verlustfrei in eine andere Marinara-Installation umziehen soll. Der Dateiname endet auf `.marinara.json`.
   - **Compatible JSON** speichert eine ordnerlose **World-Info**-Datei für andere Roleplay-Programme. Einige Marinara-eigene Details gehen dabei verloren. Der Dateiname endet auf `.json`.
4. Der Browser lädt die Datei herunter.

Bleibt die Datei in der Marinara-Welt, nimm **Marinara Native**. Geht sie an ein anderes Programm, nimm **Compatible JSON**.

## Viele Lorebooks auf einmal exportieren (Massenexport)

Mehrere Lorebooks lassen sich zusammen in einer ZIP-Datei sichern.

1. Klick im Panel **Lorebooks** in der oberen Aktionsleiste auf das Häkchen-Symbol. Sein Tooltip lautet **Select**.
2. Setz bei jedem Lorebook, das mit soll, ein Häkchen im Kontrollkästchen.
3. Klick unten in der Auswahlleiste auf **Export** (Exportieren).
4. Der Browser lädt eine einzelne ZIP-Datei namens `marinara-lorebooks.zip` herunter.

Der Massenexport nutzt immer das Format **Marinara Native**. Deshalb kommt alles verlustfrei nach Marinara zurück.

## Einen kompletten SillyTavern-Ordner importieren

Bisher ging es um Lorebook-Dateien, die schon vorliegen. Lorebooks lassen sich aber auch direkt aus einem vollständigen SillyTavern-Installationsordner holen. Dieser Weg nimmt Charaktere, Chats und Presets gleich mit. Dafür gibt es einen eigenen Einrichtungsassistenten für den Ordner-Import. Siehe [Import aus SillyTavern](../data/importing-from-sillytavern.md).

## Nach dem Import

Mit Schlüsselwörtern als Auslöser funktioniert ein importiertes Lorebook sofort. Nutzt du die semantische Suche, die Einträge nach Bedeutung findet, musst du die Vektoren nach dem Import neu aufbauen. Siehe [Semantische Suche für Lorebooks](semantic-search.md).

## Verwandte Anleitungen

- [Lorebooks im Überblick](overview.md)
- [Lorebooks mit Charakteren und Personas verknüpfen](linking-to-characters.md)
- [Semantische Suche für Lorebooks](semantic-search.md)
- [Import aus SillyTavern](../data/importing-from-sillytavern.md)
