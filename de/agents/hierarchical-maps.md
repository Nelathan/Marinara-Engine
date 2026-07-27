# Hierarchical Maps: Einrichtung, Aufbau und Reisen

> **Aktuelle Kompatibilität:** Diese Anleitung beschreibt Hierarchical Maps **1.1.5**
> auf Marinara Engine **2.3.3**. Maps 1.1.5 läuft ab Engine 2.3.2 bis hinauf zu den
> aktuellen 2.x-Versionen. Das Paket funktioniert in Roleplay- und Game-Chats.

Hierarchical Maps ergänzt Roleplay- und Game-Chats um eine dauerhafte Story-Karte. Statt einen einzelnen Freitext-Ort zu führen, lässt sich eine ganze Welt als verschachtelte Orte abbilden:

```text
The Shattered Coast
└── Brinewatch
    ├── Harbor District
    │   ├── Tideglass Inn
    │   └── Customs House
    └── Old Sewers
```

Marinara führt in dieser Hierarchie einen verbindlichen aktuellen Ort. Der aktuelle Pfad, die Details zum genauen Ort, Ziele in der Nähe und die passende Lore (das hinterlegte Weltwissen) zum genauen aktuellen Ort können in den Kontext der nächsten Antwort einfließen. Die KI kann die Story nicht verschieben, indem sie einfach erzählt, die Party sei irgendwohin gegangen; du wählst ein Ziel und schreibst den Ortswechsel mit deinem nächsten Zug fest.

Hierarchical Maps funktioniert in **Roleplay** und **Game**. Jeder Chat hat eine eigene Karte und einen eigenen aktuellen Ort.

## Was eine hierarchische Karte abbilden kann

Jeder Ort kann Folgendes haben:

- ein übergeordnetes Element sowie beliebig viele untergeordnete oder benachbarte Orte;
- einen Typ: Region, Settlement, Place, Building, Floor oder Room;
- eine öffentliche Beschreibung und private Ortsnotizen nur für die KI;
- Lorebook-Einträge, die genau an diesem Ort hängen;
- direkte Einbahn- oder Zweiwege-Verbindungen zu anderen Orten; und
- untergeordnete Orte als Liste, als platzierte Karte oder als geordnete Ebenen.

Direkte Verbindungen sind nicht auf Nachbarorte beschränkt. Sie können beliebige gültige Orte der Hierarchie koppeln: eine Fähre zwischen Städten, ein Treppenhaus zwischen Stockwerken, ein Portal zwischen Welten oder einen Geheimgang zwischen weit entfernten Räumen.

Typische Beispiele:

- `World → Continent → Region → City → District → Building → Room`
- `City → Neighborhoods → Streets → Shops and landmarks`
- `House → Floors → Rooms → Closets or hidden chambers`
- `Dungeon tower → Floors 1–25 → Rooms, stairs, and boss arenas`
- `Star system → Planets → Settlements → Buildings`

Ein Turm mit 25 Stockwerken gehört normalerweise als 25 benachbarte Orte unter einen Turm – nicht als 25 Ebenen tiefe Kette. Derzeit sind bis zu 500 Orte und 20 Hierarchieebenen möglich.

## Schnellstart

1. Öffne das **Agents**-Panel (Agenten), klick auf **Download Agents** (Agenten herunterladen) und installiere **Hierarchical Maps**. Bietet der Katalog danach ein **Update** an, installiere auch das.
2. Starte Marinara neu, sobald der Katalog darum bittet.
3. Öffne den Roleplay- oder Game-Chat, in dem die Karte liegen soll.
4. Öffne **Agents → Hierarchical Maps**, aktiviere **Use in this chat** (in diesem Chat verwenden) und klick auf **Create map** (Karte erstellen). Alternativ aktivierst du das Ganze über **Chat Settings → Agents → Tracker Agents** und öffnest dort **Hierarchical map**.
5. Wähle **Draft with AI** (Entwurf per KI), beschreibe, was du willst, und klick auf **Generate draft** (Entwurf generieren).
6. Durchsuche die vollständig generierte Hierarchie in der **Draft preview** (Entwurfsvorschau) und klapp sie auf. Wähle Orte aus, um Beschreibungen, privates Modellgedächtnis und die Lore-Herkunft zu prüfen. Bei Bedarf neu generieren oder den Prompt bearbeiten.
7. Klick auf **Continue to editor** (weiter zum Editor), sieh die ungespeicherte Arbeitskarte durch und nimm manuelle Änderungen vor.
8. Setze oder bestätige den Startort, stell die Karte auf **Enabled** (aktiviert) und klick auf **Save** (speichern).
9. Öffne im Chat die **Story map** (Story-Karte), wähle einen erreichbaren Ort und klick auf **Set destination** (Ziel festlegen). Schick die nächste Nachricht ab, um den Ortswechsel abzuschließen.

Ein angewendeter KI-Entwurf oder eine importierte Datei ändert nur die Arbeitskopie im Editor. Auf die Antworten wirkt sich die Karte erst aus, wenn du sie aktivierst und speicherst.

## Paket installieren und aktivieren

Öffne das **Agents**-Panel über den Sparkles-Tab in der rechten Seitenleiste. Klick auf **Download Agents**, wähle **Hierarchical Maps** und klick auf **Install** (installieren). Zeigt die installierte Karte weiterhin **Update** an, aktualisiere zuerst. Das Paket bringt Server-Code mit – folge deshalb der Neustart-Aufforderung, bevor du es benutzt.

Mit der Installation steht die Funktion bereit, eingeschaltet ist sie damit aber noch nicht in jedem Chat.

Die installierte Funktion taucht außerdem als **Hierarchical Maps** im Haupt-Panel **Agents** auf. Bei geöffnetem Roleplay- oder Game-Chat zeigt diese Seite die installierte Paketversion, den Bereitschaftsstatus, ob Maps im aktuellen Chat aktiv ist, den Status der gespeicherten Karte sowie eine Schaltfläche **Open map** (Karte öffnen) oder **Create map**. Karteninhalte, aktueller Ort, Lore-Verknüpfungen, Verlauf und Entwürfe bleiben an diesem Chat hängen und werden nicht zu globalen Agent-Einstellungen.

### Roleplay

1. Öffne den Roleplay-Chat.
2. Öffne **Chat Settings** (Chat-Einstellungen) über die Zahnrad-Schaltfläche.
3. Such **Agents** und aktiviere **Enable Agents** (Agenten aktivieren).
4. Aktiviere unter **Tracker Agents** den Eintrag **Hierarchical Maps** für diesen Chat.
5. Scroll zurück zur Einstellung **Hierarchical map**, die dadurch erscheint.
6. Klick auf **Edit hierarchical map** (hierarchische Karte bearbeiten) und danach auf **Create map**, falls der Hinweis für die leere Karte erscheint.

### Game

Hierarchical Maps lässt sich schon beim Anlegen eines Spiels auswählen oder später über **Chat Settings → Agents** in diesem Spiel ergänzen. Bei der Auswahl während der Einrichtung kann Marinara aus der akzeptierten Spielwelt eine Hierarchie vorbereiten, die du vor dem Spielen durchsiehst.

Überspringst du die generierte Karte bei der Einrichtung, kannst du sie später trotzdem über die Chat Settings aufbauen.

## Der Karteneditor im Überblick

Am Desktop zeigt der Editor drei Bereiche nebeneinander. Auf schmalen Bildschirmen nutzt du die Tabs **Hierarchy**, **Local** und **Details**.

- **Hierarchy** (Hierarchie) zeigt den kompletten Ortsbaum. Wähle einen Ort aus, um ihn zu bearbeiten. **Enter** wechselt nur den Ausschnitt der Hierarchie, den du gerade ansiehst; die Story bewegt sich dadurch nicht.
- **Local** (Umgebung) zeigt die direkt untergeordneten Orte des ausgewählten Ortes als Karte, als geordnete Ebenen oder als Liste.
- **Details** bearbeitet den ausgewählten Ort samt Lore, übergeordnetem Ort, Darstellungsart, direkten Verbindungen und Status.

In der Kopfzeile des Editors sitzen **Build with AI** (per KI aufbauen) bzw. **Expand with AI** (per KI erweitern), **Export**, **Import**, der Schalter Enabled und **Save**. Ungespeicherte Änderungen sind mit **Unsaved** markiert. Verlässt du den Editor mit offener Arbeit, fragt Marinara, ob sie verworfen werden soll.

## Karte per KI entwerfen

Klick bei einer leeren Karte auf **Draft with AI**. Bei einer vorhandenen Karte klickst du auf **Expand with AI**.

### Festlegen, was die KI liest

Wähle unter **Build from** (aufbauen aus) eine dieser Quellen:

- **Game setup** (Spiel-Einrichtung) nutzt die aktuelle Einrichtung und die Charaktere. In einem Roleplay-Chat sind das die Chat-Einrichtung und die Charakterkarten. In einem Game-Chat kommen der Weltüberblick und die Party-Charaktere dazu.
- **Selected lore** (ausgewählte Lore) lässt dich ein oder mehrere verfügbare Lorebooks auswählen. **Strict canon** erzeugt ausschließlich Orte, die durch Lore belegt sind. **Canon + expansion** erlaubt der KI, passende Orte rund um die ausgewählte Lore zu ergänzen.

Den bisherigen Zugverlauf liest die KI nicht. Nutze das optionale Feld **What should this world include?** bzw. **What should be added?** für Details, die weder in der Einrichtung noch in der ausgewählten Lore stehen.

Wähle eine Größe:

| Größe      | Ungefähres Ergebnis |
| ---------- | ------------------- |
| **Small**  | 8 Orte              |
| **Medium** | 16 Orte             |
| **Large**  | 28 Orte             |

Klick auf **Generate draft** oder **Generate expansion** (Erweiterung generieren). Beim Generieren wird noch nichts gespeichert.

Die aktuelle **Draft preview** ist eine durchsuchbare Vorschau der vollständig generierten Hierarchie. Sie nennt die Anzahl der Orte und Hierarchieebenen, schlägt einen Startort vor und lässt jeden Ast auf- und zuklappen. Wähle einen generierten Ort aus, um seinen vollständigen Pfad, die öffentliche Beschreibung, das private Modellgedächtnis und – bei Lore-Bindung – die Herkunft zu sehen: direkt aus der Lore, aus der Lore abgeleitet oder von der KI ergänzt.

### Ergebnis übernehmen und prüfen

Klick bei einer neuen Karte auf **Continue to editor**, bei einer Erweiterung auf **Add to working map** (zur Arbeitskarte hinzufügen). Das Ergebnis landet damit im ungespeicherten Karteneditor; aktiviert oder gespeichert wird es nicht. Klapp die Pfeile auf und wähle Orte im Bereich Hierarchy aus, um untergeordnete Orte, Beschreibungen, privates Gedächtnis, Verbindungen, Ebenen und Kartenpositionen zu prüfen.

Gefällt dir das Ergebnis nicht, nutz direkt aus der Vorschau heraus **Edit prompt** (Prompt bearbeiten), **Regenerate** (neu generieren) oder **Discard draft** (Entwurf verwerfen). Sobald du in den Editor gewechselt bist, generiert die KI nicht über unabhängige ungespeicherte Änderungen hinweg: Speichere oder verwirf die Arbeitsänderungen, bevor du sie erneut öffnest.

Existiert eine Karte, hat die Story aber noch keinen festgeschriebenen Kartenverlauf, bietet die KI zusätzlich **Replace draft** (Entwurf ersetzen) an. Sobald die Kampagne die Karte benutzt hat, ist das Ersetzen gesperrt: Erweitere dann lieber die vorhandene Hierarchie, damit gespeicherte Züge weiterhin auf dieselben Orts-IDs zeigen.

Bei einer gespeicherten Karte, die noch in keinem Zug verwendet wurde, öffnest du **Expand with AI**, wählst **Replace draft** und generierst einen Ersatz. Gibt es erst einmal festgeschriebenen Verlauf, erlaubt Marinara nur noch Erweiterungen, keinen kompletten Austausch. Exportiere die Karte vor größeren Umbauten.

## Karte manuell aufbauen oder bearbeiten

Klick bei einer leeren Karte auf **Build manually** (manuell aufbauen). Marinara legt einen groben Startort an. Wähle ihn in der Hierarchie aus und nutz dann:

- **Add child** (untergeordneten Ort hinzufügen) für einen Ort innerhalb des ausgewählten Ortes.
- **Add sibling** (Nachbarort hinzufügen) für einen Ort daneben unter demselben übergeordneten Ort.
- **Duplicate** (duplizieren), um einen Teilbaum zu kopieren und anschließend zu bearbeiten.
- **Archive** (archivieren), um einen Ort stillzulegen, ohne historische Bezüge zu zerstören.

Jeder Ort hat diese Hauptfelder:

- **Name** und **Icon** kennzeichnen ihn im Editor und in der Weltkarte.
- **Kind** (Art) kann Region, Settlement, Place, Building, Floor oder Room sein.
- **Public description** (öffentliche Beschreibung) beschreibt den aktiven Ort im Ortskontext.
- **Private model memory** (privates Modellgedächtnis) gibt der KI Fakten, die nur an diesem Ort gelten sollen.
- **Awareness summary** (Orientierungshinweis) ist ein kurzer Hinweis zur Einordnung.
- **Parent** (übergeordneter Ort) steuert, wo der Ort in der Hierarchie sitzt.
- **Child presentation** (Darstellung untergeordneter Orte) zeigt die direkt untergeordneten Orte als List, Map oder Layers.

Bei der Darstellung **Map** bekommt jeder untergeordnete Ort die Positionen **Map X** und **Map Y** von 0 bis 100. Bei **Layers** gibst du jedem untergeordneten Ort eine eigene Ebenenreihenfolge.

## Was tatsächlich bei der KI ankommt

Ist eine gespeicherte Karte aktiviert, erhält jede Generierung genau einen verbindlichen Block mit räumlichem Kontext. Er enthält:

- den aktuellen Breadcrumb-Pfad (die Pfadanzeige) samt der Namen übergeordneter Orte;
- die öffentliche Beschreibung des genauen aktuellen Ortes;
- das private Modellgedächtnis des genauen aktuellen Ortes, falls vorhanden; und
- die Ziele, die in einem Zug erreichbar sind.

Die Namen übergeordneter Orte dienen der Orientierung; deren Beschreibungen, privates Gedächtnis und verknüpfte Lore werden aber nicht vererbt. Lautet der aktuelle Ort `Tower → Floor 7 → Alchemy Lab`, sind Beschreibung und privates Gedächtnis des Labors aktiv; Turm und Stockwerk steuern nur ihre Namen zum Pfad bei.

**Private model memory** ist eine gespeicherte Notiz nur für die KI – kein Gedächtnis, das automatisch lernt oder sich selbst aktualisiert. Nutz es für Geheimnisse, Atmosphäre, dauerhafte Gefahren, lokale Regeln oder Fakten, die das Modell nur an genau diesem Ort kennen soll. Fakten, die das Modell zwingend erreichen müssen, gehören in **Public description** oder **Private model memory** – verlass dich dafür nicht allein auf **Awareness summary**.

### Reisewege ergänzen

Ein Ort ist von seinem übergeordneten Ort und von seinen aktiven untergeordneten Orten automatisch erreichbar. Für jeden anderen Weg nutzt du **Direct links** (direkte Verbindungen): etwa eine Fähre zwischen Städten, eine Treppe zwischen bestimmten Stockwerken oder einen Geheimgang zwischen Räumen in verschiedenen Gebäuden.

1. Wähle den Ausgangsort aus.
2. Wähle unter **Direct links** einen anderen Ort und klick auf **Link** (verbinden).
3. Ergänze optional eine Richtungsbezeichnung.
4. Wähle **Available**, **Hidden** oder **Blocked**.
5. Aktiviere **Both ways** (in beide Richtungen), wenn die Reise in beide Richtungen möglich sein soll.

Als Reiseziel erscheinen nur verfügbare Verbindungen. Eine Einbahn-Verbindung musst du an dem Ort anlegen, an dem die Reise beginnt.

### Startort setzen und speichern

Wähle den Ort, an dem die Story beginnt, und klick unter **Location status** (Ortsstatus) auf **Set as starting location** (als Startort festlegen). Ohne aktiven Startort lässt sich eine Karte nicht aktivieren.

Stell den Schalter in der Kopfzeile auf **Enabled** und klick dann auf **Save**. Meldet der Editor Probleme, behebe sie vor dem Speichern.

## Lore mit Orten verknüpfen

Hierarchical Maps nutzt Lore auf zwei verschiedene Arten:

1. Die KI kann beim Entwerfen oder Erweitern der Hierarchie ausgewählte Lorebooks lesen.
2. Ein gespeicherter Ort kann bestimmte Lorebook-Einträge aktivieren, solange genau dieser Ort aktuell ist.

So hängst du Lore für die Laufzeit an:

1. Wähle einen Ort aus und öffne **Linked lore** (verknüpfte Lore) im Bereich Details.
2. Durchsuche die verfügbaren Einträge.
3. Klick auf einen Eintrag, um ihn anzuhängen.
4. Speichere die Karte.

Verknüpfte Einträge werden nicht automatisch vom übergeordneten an den untergeordneten Ort weitergereicht. Lore an Brinewatch aktiviert sich nicht, während das Tideglass Inn der aktuelle Ort ist – dafür musst du den Eintrag auch am Gasthaus anhängen.

Ein passender verknüpfter Eintrag wird als **current-location lore** ausgewählt und braucht deshalb keinen Schlüsselwort-Treffer. Das ist präziser als die normale Aktivierung über Schlüsselwörter, hebelt die Lorebook-Regeln aber nicht bedingungslos aus: Deaktivierte oder vom Chat ausgeschlossene Bücher und Einträge bleiben unerreichbar, und Eintragsbedingungen, Timing, Wahrscheinlichkeit sowie Token-Budgets gelten weiterhin.

Deaktivierte Lorebooks, deaktivierte Einträge und vom Chat ausgeschlossene Lorebooks stehen der Karte nicht zur Verfügung. Der Editor zeigt unerreichbare oder fehlende Verweise weiterhin an, damit du sie reparieren oder lösen kannst – ans Modell gehen sie nicht.

## Während der Story reisen

Die Auswahl eines Ziels stellt den Ortswechsel nur in die Warteschlange; der aktuelle Ort ändert sich nicht sofort. Festgeschrieben wird der Wechsel zusammen mit der nächsten Nachricht, die du sendest. So bleiben Ort und Zug synchron, wenn du verzweigst, neu generierst oder Swipes wechselst.

Gültige Ziele sind:

- der übergeordnete Ort des aktuellen Ortes;
- aktive untergeordnete Orte des aktuellen Ortes; und
- Ziele, die über eine verfügbare direkte Verbindung angebunden sind.

Pro Zug lässt sich nur ein hierarchischer Ortswechsel festschreiben.

### Aktuelle Beschränkung auf einen Schritt

**Set destination gibt es in Maps 1.1.5 bereits**, akzeptiert aber nur Orte, die in einem Schritt erreichbar sind. Beim Stöbern in der Weltkarte siehst du auch weiter entfernte Orte, ohne sie direkt auswählen zu können.

Sind Floor 1 und Floor 25 zum Beispiel Nachbarorte unter einem Turm, sieht der Ablauf derzeit so aus:

1. Floor 1 verlassen, in den Turm wechseln und einen Zug senden;
2. Floor 25 betreten und einen weiteren Zug senden.

Du kannst eine direkte, verfügbare Verbindung anlegen, damit ein bestimmter Sprung in einem Schritt möglich wird. Ein automatisches mehrstufiges **Set target** oder **Plan route** – das ein weit entferntes Ziel merken und den Graph aus übergeordneten, untergeordneten und verbundenen Orten Schritt für Schritt abgehen würde – gibt es noch nicht.

### Reisen im Roleplay

Das Panel **Story location** (Story-Ort) sitzt über dem Nachrichtenfeld.

1. Öffne **Story location**, um **Leave**, **Enter** und **Routes** zu sehen.
2. Wähle ein Ziel.
3. Prüfe, ob der Status **Moves with your next turn** lautet.
4. Tipp deine Nachricht und schick sie ab.

Über das X am wartenden Ziel brichst du es vor dem Absenden ab. Haben sich Karte oder aktueller Ort nach deiner Auswahl geändert, wechselt der Status auf **Needs review**. Öffne dann die Auswahl und wähle erneut.

### Reisen im Game

Game Mode ergänzt eine **Hierarchical world map** (hierarchische Weltkarte). **You are here** markiert den aktuellen Story-Ort.

- Wähle einen Ort aus, um seine Beschreibung zu lesen.
- Mit **Explore** (erkunden) schaust du in einen Ort hinein. Die Party bewegt sich dabei nicht.
- Mit **Browse up** (nach oben stöbern) oder über die Pfadanzeige siehst du dir einen anderen Teil der Hierarchie an.
- **Center current story location** (aktuellen Story-Ort zentrieren) bringt dich zur Position der Party zurück.
- Klick auf **Set destination**, sobald der ausgewählte Ort erreichbar ist, und schick dann den nächsten Zug.

Steht bei einem Ort **Browse only from here**, ist er vom aktuellen Ort aus nicht in einem Schritt erreichbar. Stöbere zurück und wähle einen verfügbaren übergeordneten Ort, untergeordneten Ort oder eine direkte Route.

## Hierarchische Weltkarte und Game-Karte im Vergleich

Game Mode kann zwei Kartensysteme anzeigen:

- **Hierarchical Maps** führt den verbindlichen Story- oder Weltort, etwa `The Shattered Coast → Brinewatch → Tideglass Inn`.
- Das normale Game-Raster bzw. die Node-Karte führt die lokale, taktische Bewegung innerhalb dieses Story-Ortes und hängt zusätzlich an Zeit und Wetter im Game.

Weder eine von der KI erzählte Ankunft noch eine Markierung auf der normalen Game-Karte kann den hierarchischen Ort von sich aus ändern.

Für fortgeschrittene Game-Setups hat ein gespeicherter hierarchischer Ort den Abschnitt **Game map binding** (Bindung an die Game-Karte). Du kannst eine ganze Game-Karte, eine einzelne Rasterzelle oder einen einzelnen Node an diesen Story-Ort binden. Wählst du eine gebundene Game-Position, stellt das einen hierarchischen Ortswechsel in die Warteschlange; ungebundene Positionen bleiben normale taktische Bewegung.

Speichere die Hierarchie, bevor du Bindungen änderst. Eine Bindung lässt sich später wieder lösen, ohne dass eine der beiden Karten verloren geht.

## Sicher importieren, exportieren und archivieren

Mit **Export** lädst du die Arbeitshierarchie als `.hierarchical-map.json`-Datei herunter. Exportiere vor größeren Änderungen, wenn du ein kleines Backup nur für die Karte willst.

Mit **Import** lädst du eine Hierarchie in die Arbeitskopie. Sieh sie durch und klick auf **Save**, damit sie verbindlich wird. Der Import speichert nicht sofort.

Sobald sich der Kampagnenverlauf auf eine Karte bezieht, muss eine importierte Karte jede vorhandene Orts-ID beibehalten. Ergänze oder aktualisiere Orte, statt die Hierarchie durch fremde IDs zu ersetzen.

Das Archivieren erhält alte Bezüge. Vor dem Archivieren:

- verschiebe oder archiviere die aktiven untergeordneten Orte;
- wähle bei Bedarf einen anderen aktiven Startort; und
- wähle einen aktiven Ersatz, falls es der aktuelle Laufzeit-Ort ist.

Archivierte Orte lassen sich im Bereich Details wiederherstellen.

## Fehlerbehebung

### Hierarchical Maps fehlt in den Chat Settings

Prüfe, ob das Paket installiert ist, ob Marinara nach der Installation neu gestartet wurde und ob der Chat ein Roleplay- oder Game-Chat ist. Aktiviere im Chat den Hauptschalter **Enable Agents**, öffne **Tracker Agents** und schalte **Hierarchical Maps** ein. Scroll danach zurück zur Einstellung **Hierarchical map**, die dann erscheint.

### Die Karte lässt sich nicht aktivieren

Lege mindestens einen aktiven Ort an und setze einen aktiven Startort. Behebe jedes Problem, das oben im Editor angezeigt wird, und aktiviere und speichere dann erneut.

### Die KI-Generierung ist nicht verfügbar

Achte darauf, dass der Chat eine funktionierende Verbindung zu einem Sprachmodell hat. Speichere oder verwirf offene Editor-Änderungen, bevor du die KI öffnest. Wähle für eine Erweiterung unter **Expand beneath** (erweitern unterhalb von) einen aktiven Ort. Für eine Lore-gestützte Generierung brauchst du mindestens ein aktiviertes, nicht ausgeschlossenes Lorebook.

### Einen KI-Entwurf vor der Übernahme prüfen

Nutz in der Vorschau die Suche sowie **Expand all** (alles aufklappen) und **Collapse all** (alles zuklappen), um die vollständig generierte Hierarchie zu prüfen. Wähle einen Ort aus, um Beschreibung und privates Modellgedächtnis anzusehen. Nutz **Edit prompt**, **Regenerate** oder **Discard draft**, bevor du in den Editor wechselst.

### Ein Ziel lässt sich nicht auswählen

Der Ort muss der übergeordnete Ort des aktuellen Ortes, ein aktiver untergeordneter Ort oder das Ziel einer verfügbaren direkten Verbindung sein. **Explore**, **Browse up** und **Enter** im Editor dienen nur zum Stöbern. Sie umgehen keine Reiseregeln und berechnen keine mehrstufige Route.

### Ein wartendes Ziel meldet Needs review

Die Definition oder der aktuelle Ort hat sich nach der Auswahl des Ziels geändert. Öffne die Zielauswahl, prüfe den aktuellen Pfad und wähle das Ziel erneut.

### Die KI ignoriert die Karte

Prüfe, ob Hierarchical Maps für den Chat aktiv ist, die Hierarchie auf **Enabled** steht und die letzten Änderungen gespeichert wurden. Prüfe außerdem, ob im Panel **Story location** ein aktueller Ort steht.

### Verknüpfte Lore aktiviert sich nicht

Prüfe, ob der Eintrag an genau dem aktuellen Ort hängt. Prüfe außerdem, ob Eintrag und zugehöriges Lorebook aktiviert sind und ob das Lorebook nicht vom Chat ausgeschlossen ist.

## Verwandte Anleitungen

- [Agenten: KI-Helfer für deine Chats](agents-overview.md)
- [Referenz der herunterladbaren Agenten](built-in-agents.md)
- [Lorebooks](../lorebooks/overview.md)
- [Roleplay Mode: Erste Schritte](../roleplay/getting-started.md)
- [Game Mode: Erste Schritte](../game/getting-started.md)
- [Game Mode: Karte, Zeit und Wetter](../game/map-time-weather.md)
