# Game Mode: Kampf

In dieser Anleitung erfährst du, wie der Kampf im Game Mode von Marinara Engine abläuft. Sie zeigt, wie eine Kampfbegegnung beginnt, was das Aktionsmenü bietet und welche Würfelmathematik hinter jedem Treffer steckt. Dazu kommen Statuseffekte, elementare Reaktionen, Boss-Mechaniken, Beute, die **Interrupt**-Schaltfläche (unterbrechen) und Quick-Time-Events. Den Kampf leitet der KI-Game-Master (GM) – der Charakter, der dein Abenteuer erzählt.

## Eine Kampfbegegnung beginnt

Den Kampf startest du nicht selbst. Der GM eröffnet ihn, sobald die Geschichte es verlangt: etwa wenn du einen Gegner reizt oder in einen Hinterhalt läufst. Dann legt sich ein vollständiger Kampfbildschirm über die Erzählung. Die Engine baut den Kampf aus dem, was gerade in der Geschichte passiert – deine Party (deine Abenteuergruppe), die Gegner, deren Werte und etwaige Sonderregeln.

Auf dem Kampfbildschirm steht deine Party auf der einen Seite, die Gegner stehen auf der anderen. Jeder Kämpfer hat eine Lebensleiste (HP, Trefferpunkte) und, sofern er Fertigkeiten einsetzt, eine Magieleiste (MP, Magiepunkte). Oben zeigt **Next:** an, wer als Nächstes am Zug ist. Ein Rundenzähler nennt **Round** und die aktuelle Rundennummer.

## Das Aktionsmenü

Bist du am Zug, wählst du genau eine Aktion aus dem Menü. Es gibt sechs davon:

- **Attack** (Angriff): Ein Gegner kassiert einen einfachen Angriff.
- **Skills** (Fertigkeiten): eine besondere Fähigkeit einsetzen. Fertigkeiten können MP kosten. Manche heilen einen Verbündeten, manche treffen einen Gegner, manche verteilen einen Buff oder Debuff.
- **Special** (Sonderaktion): Tipp eine frei formulierte Aktion in eigenen Worten ein und drück dann auf **Ask GM** (den GM fragen). Zum Beispiel: „Ich kicke Sand in die gesprungene Linse des Ruin Guard.“ Was daraus wird, entscheidet der GM.
- **Defend** (verteidigen): Für den Rest der Runde steigt deine Verteidigung, du nimmst also weniger Schaden.
- **Items** (Gegenstände): einen Gegenstand aus der Tasche nutzen. Über **Full inventory** (vollständiges Inventar) öffnest du von hier aus die komplette Gegenstandsliste.
- **Flee** (fliehen): den Kampf sofort verlassen. Eine Flucht beendet den Kampf augenblicklich.

Nach deiner Wahl läuft die Runde ab. Die Ergebnisse erscheinen als aufsteigende Schadenszahlen, als Ausschlag der Lebensleisten und als Zeilen im Kampfprotokoll.

## So rechnet der Kampf

Sobald ein Kampf läuft, entscheidet feste Würfelmathematik über jede Runde – nicht die KI. Der GM erzählt lediglich die Ergebnisse. Wer trifft und wie viel Schaden ankommt, bestimmt er nie. Damit bleibt der Kampf fair und nachvollziehbar. „W20“ steht im Folgenden für den Wurf eines zwanzigseitigen Würfels, also eine Zahl von 1 bis 20.

### Initiative (Zugreihenfolge)

Zu Beginn jeder Runde würfelt jeder Kämpfer einen W20 und addiert einen Bonus aus seiner Geschwindigkeit. Wer höher liegt, handelt früher. Eingefrorene, betäubte oder gefesselte Kämpfer setzen die ganze Runde aus – ebenso alle, deren Geschwindigkeit auf 0 gefallen ist.

### Angriff und Verteidigung

Greift ein Kämpfer einen anderen an:

1. Der Angreifer würfelt einen W20 und addiert einen Bonus aus seinem Angriffswert.
2. Der Verteidiger würfelt einen W20 und addiert einen Bonus aus seinem Verteidigungswert.
3. Liegt die Summe des Angreifers unter der des Verteidigers, geht der Angriff daneben.
4. Ein kritischer Treffer gelingt bei einer natürlichen 20 oder wenn der Angreifer den Verteidiger um 10 oder mehr übertrifft.

### Schaden

Bei einem Treffer ergibt sich der Grundschaden aus dem Angriffswert des Angreifers und wächst mit dessen Stufe. Dazu kommen zusätzliche Schadenswürfel, von denen höherstufige Kämpfer mehr werfen. Ein kritischer Treffer multipliziert die Summe mit 1,5. Anschließend senkt die Verteidigung des Ziels den Schaden und blockt dabei bis zu 40 Prozent des Verteidigungswerts.

### Skalierung nach Schwierigkeit

Im letzten Schritt skaliert der Schaden mit der Schwierigkeit des Spiels, die du im Einrichtungsassistenten festlegst. Die vier Stufen wirken so auf den Endschaden:

| Schwierigkeit | Schadensmultiplikator |
|---|---|
| Casual | 0.6 |
| Normal | 1.0 |
| Hard | 1.3 |
| Brutal | 1.6 |

Je höher die Schwierigkeit, desto härter treffen beide Seiten – Kämpfe werden kürzer und riskanter.

## Statuseffekte und elementare Reaktionen

Ein Statuseffekt verändert Angriff, Verteidigung, Geschwindigkeit oder HP eines Kämpfers vorübergehend. Buffs helfen, Debuffs schaden. Ein Status hält eine festgelegte Zahl an Runden und verfliegt dann. Gifteffekte zehren jede Runde an den HP, Regenerationseffekte füllen sie auf. Drei Effekte mit eigenem Namen lassen den betroffenen Kämpfer seinen Zug aussetzen: eingefroren, betäubt und gefesselt.

Manche Angriffe und Fertigkeiten tragen ein Element: Fire, Ice, Lightning, Poison, Holy oder Shadow. Das erste Element, das ein Ziel trifft, hinterlässt eine Aura – eine nachwirkende Spur dieses Elements. Trifft dann ein anderes Element dasselbe Ziel, löst das eine elementare Reaktion aus. Die Reaktion bringt Bonusschaden und oft einen Statuseffekt.

Zu den Reaktionen zählen Melt, Shatter, Overload, Superconduct, Toxic Blaze, Purification, Eclipse und Electrotoxin. Dieses System läuft von allein. Du musst es weder aktivieren noch einstellen. Reaktionen entstehen automatisch, sobald die passenden Elemente auf demselben Ziel aufeinandertreffen.

## Boss-Mechaniken und Beute

Starke Gegner können Boss-Mechaniken mitbringen – Sonderregeln, die der GM für genau diesen Kampf schreibt. Eine Mechanik greift nach Zeitplan, etwa alle paar Runden, oder sobald der Boss unter einen bestimmten Lebensstand fällt. Sie kann die ganze Party treffen, den Boss stärken oder einen Statuseffekt verteilen. Löst eine Mechanik aus, erscheint der Effekt im Kampfprotokoll, sodass du reagieren kannst.

Gewinnst du einen Kampf, lassen die Gegner Beute fallen. Jeder Gegenstand hat eine Seltenheit, von häufig bis selten: common, uncommon, rare, epic und legendary. Höhere Schwierigkeit verschiebt die Beute zu selteneren Gegenständen und wirft etwas mehr davon ab. Bei einem Sieg erscheint das Banner **Victory!**, fällt deine Party, erscheint **Defeat...**.

## Den GM unterbrechen

Solange der GM noch an seiner Antwort schreibt, kannst du mit der Schaltfläche **Interrupt** dazwischengehen. Getippter Text zählt erst, wenn du ihn wirklich abschickst. Ein Klick auf **Interrupt** öffnet ein Bestätigungsfenster mit dem Titel **Attempt to Interrupt?** und drei Möglichkeiten:

- **No**: abbrechen und den GM weiterschreiben lassen.
- **Force Interrupt**: sauber dazwischengehen. Der GM erfährt nichts von der Unterbrechung. Das Eingabefeld bekommt einen grünen Rahmen.
- **Yes**: eine Unterbrechung innerhalb der Geschichte versuchen, gegen die sich der GM wehren kann. Das Eingabefeld färbt sich rot, die App weist mit „using dice recommended“ auf Würfel hin, und die Würfel-Schaltfläche pulsiert. Ein Würfelwurf kann deinen Versuch hier gelingen lassen.

Nach der Bestätigung tippst du deine Nachricht und schickst sie ab. Überlegst du es dir anders, drück auf **Resume** (fortsetzen): Die offene Unterbrechung verfällt und die Erzählung läuft weiter. Nützlich ist das in angespannten Momenten – etwa als Reaktion in der Sekunde, bevor ein Kampf losbricht.

## Quick-Time-Events

Für schnelle Actionmomente wie Ausweichen oder Verfolgen kann der GM ein Quick-Time-Events-Overlay auslösen, kurz QTE. Das Overlay zeigt eine schrumpfende Countdown-Leiste, die Aufforderung **React quickly!** (schnell reagieren) und je eine Schaltfläche pro Möglichkeit. Jede Schaltfläche ist nummeriert (1, 2, 3 und so weiter). Klick auf die Schaltfläche der Aktion, die du willst.

Wähle eine Aktion, bevor die Zeit abläuft, dann gibt es einen Bonus. Je schneller du reagierst, desto größer fällt er aus. Läuft die Zeit vorher ab, kassierst du stattdessen einen Malus. Ein Quick-Time-Event kommt ohne Würfel aus. Hier zählt reines Tempo.

## Kampf auf dem Handy

Auf dem Handy ordnet sich der Kampfbildschirm für das kleine Display neu. Die Aktionsschaltflächen kleben am unteren Bildschirmrand. Panels, die daneben keinen Platz mehr finden, wandern in ein Panel, das sich von unten aufschiebt und vier Tabs hat:

- **Party**: deine Partymitglieder und deren Lebensstand.
- **Boss Mechanics** (Boss-Mechaniken): die Sonderregeln des laufenden Kampfes.
- **Dialogue** (Dialog): Kampfsprüche der Kämpfer.
- **Combat Log** (Kampfprotokoll): der Verlauf Runde für Runde.

Tipp auf einen Tab, um dessen Panel zu öffnen. Zum Schließen tippst du daneben oder auf die Schließen-Schaltfläche.

## Verwandte Anleitungen

- [Game Mode: Würfel und Fertigkeitsproben](dice-and-skill-checks.md)
- [Game Mode: Party und NPCs](party-and-npcs.md)
- [Game Mode: Erste Schritte](getting-started.md)
- [Kampfbegegnungen im Roleplay](../roleplay/combat-encounters.md)
