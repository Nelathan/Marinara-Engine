# Hierarchische Karten und räumlicher Kontext V3

Status: Vorgeschlagen, nach Freigabe durch die Maintainer umsetzungsbereit

Zielgruppe: Produkt, Design und Mitwirkende an Marinara Engine

Ersetzt: `hierarchical-locations-prd-v2.md`

## Architektonische Abgrenzung

Dieser Plan behandelt räumliche Orientierung als eng umrissene Produktfunktion mit klar begrenztem Zustandsbereich.

Die Funktion ist ein System für hierarchische Karten und räumliche Orientierung, keine generische Szenario-Engine im Stil von Voxta. Ein nützliches Muster übernimmt sie von Voxta: Dauerhafter Zustand wählt einen kleinen, passenden Prompt-Kontext aus. Flags, Variablen, Events, Skripte, Timer oder ein eigenes Modell zur Aktionserkennung kommen zunächst nicht dazu.

Unterstützte Owner-Modi sind Roleplay und Game.

Der Plan besteht aus fünf klar getrennten Ebenen:

| Ebene | Verantwortung | Beispiel |
| --- | --- | --- |
| Kartendefinition | Stabile räumliche Wahrheit | Die Bibliothek liegt im Zauberturm |
| Laufzeitzustand | Der aktuelle Szenenort | Die Szene spielt gerade in der Bibliothek |
| Prompt-Projektion | Begrenzte Orientierung für das Modell | Breadcrumb, aktuelles Gedächtnis, erreichbare Ausgänge |
| Visuelle Identität | Optionale ortsbezogene Grafik-Referenzen | Die Bibliothek behält ihre Bögen, Fenster und Materialien über alle Szenen hinweg |
| Übergang | Validierte Zustandsänderung | Wechsel von der Bibliothek zum Observatorium |

Der Zustandsautomat bleibt bewusst klein:

```text
current location + requested destination + definition revision
                              ↓
                  validate ownership and reachability
                       ↙ accepted       rejected ↘
              persist snapshot         preserve state
```

Zuerst erscheint die manuelle Bewegung. Später kann ein eingeschränktes Modell-Tool wie `change_location({ destinationId })` denselben Übergang anfordern. Validiert und angewendet wird er vom Server, nicht vom Modell. Ein eigener Aufruf zur Aktionserkennung bleibt zurückgestellt, solange sich kein Bedarf dafür zeigt.

## Zusammenfassung

Roleplay und Game bekommen eine gemeinsame Funktion **Hierarchical Map** (hierarchische Karte). Sie liefert eine von der Autorin definierte Orts-Hierarchie, genau einen maßgeblichen Fokus-Ort, begrenzten Prompt-Kontext zum aktuellen Ort und servergeprüfte Bewegung.

Lorebooks (Sammlungen von Weltwissen) bleiben die kanonische Quelle für wiederverwendbare Weltfakten. Die Hierarchie darf bestehende Lorebook-Einträge über stabile IDs referenzieren, damit der aktive Ort passendes Wissen auswählt, ohne es zu kopieren oder umzuschreiben. Der KI-Kartenentwurf darf ausdrücklich ausgewählte Lorebooks als verankertes Quellmaterial nutzen und muss quellgestützte Orte von abgeleiteten oder erfundenen Ergänzungen unterscheiden.

Ein Ort kann außerdem ein optionales Kit für visuelle Identität besitzen: einen kurzen visuellen Anker plus stabile Referenzen auf Bilder der Profil-Galerie. Der Ort bleibt eine räumliche Einheit, kein Bild. Das Bildstil-Profil des Chats steuert den Gesamtstil der Darstellung, Ortsreferenzen bewahren den Ort, und Charakter- oder Persona-Referenzen bewahren die Menschen darin.

Ein verbundener Conversation-Chat kann später eine sichere Projektion des verknüpften Geschichtsorts lesen, besitzt oder verändert den räumlichen Zustand aber nie.

```text
authoritative hierarchy + current location
                    ↓
resolve breadcrumb, context, and valid destinations
                    ↓
build the mode-specific prompt
                    ↓
commit a validated move with the next owner turn
                    ↺
```

Das ist keine allgemeine Szenario-Engine. Flags, Events, Autoren-JavaScript oder Pfadfindung kommen nicht dazu. Enthalten ist dagegen ein visueller, verschachtelter Kartenbrowser mit Karten-, Ebenen- und Listendarstellung.

## Produktentscheidungen

Diese Entscheidungen klären die offenen Fragen aus V2:

1. Hierarchie-Definition und aktueller Ort werden getrennt gespeichert.
2. Der aktuelle Ort wird zusammen mit dem festgeschriebenen Nachrichten- und Swipe-Zustand als Snapshot gesichert, damit Verzweigungen, neue Generierungen und Checkpoints die richtige Position wiederherstellen.
3. Manuelle Bewegung wird atomar mit dem nächsten Nutzerzug im Owner-Modus festgeschrieben, noch vor der Prompt-Generierung.
4. Ist Spatial Context aktiv, ist er maßgeblich. Der alte Freitext-Ort von Game darf keine zweite Quelle der Wahrheit werden.
5. Roleplay und Game nutzen einen gemeinsamen Vertrag für die räumliche Projektion mit dünnen, modusspezifischen Prompt-Adaptern.
6. `awarenessSummary` schreibt die Autorin selbst. Fehlt der Wert, erhält Conversation nur einen begrenzten Auszug der öffentlichen Beschreibung.
7. Conversation formuliert auf Szenenebene, solange keine maßgeblichen Anwesenheitsdaten belegen, dass der verbundene Charakter anwesend ist.
8. Direkte Verknüpfungen und die visuelle Platzierung von Kindorten gehören zum MVP.
9. Bestehende Raster- und Knotenkarten aus Game dürfen sich ausdrücklich an Hierarchie-Orte binden; Namen werden nie automatisch abgeglichen.
10. Lorebooks besitzen die kanonischen, wiederverwendbaren Weltfakten; die Karte besitzt räumliche Identität, Verschachtelung, Navigation und den Zustand des aktuellen Orts. Kartenorte referenzieren Lorebook-Einträge über stabile IDs und kopieren deren Inhalt nie.
11. Eine Ortsverknüpfung ist eine ausdrückliche, chatweite Aktivierungsquelle. Solange genau dieser Ort aktuell ist, dürfen seine aktivierten Einträge ohne Schlüsselwort-Treffer aktiv werden; deaktivierte oder ausdrücklich ausgeschlossene Bücher und Einträge bleiben deaktiviert.
12. Der Lorebook-verankerte Kartenentwurf folgt der Laufzeit-Oberfläche des Owner-Modus und kommt vor dem verbundenen Conversation-Chat. Sind Quell-Lorebooks ausgewählt, muss der Entwurf offenlegen, welche Orte quellgestützt, abgeleitet oder erfunden sind, statt unbelegte Geografie als Kanon auszugeben.
13. Ein Ort wird nie durch ein Bild ersetzt. Er darf optionale Assets für visuelle Identität über stabile Bild-IDs referenzieren, mit einer primären Establishing-Referenz und einer begrenzten Zahl ergänzender Referenzen.
14. Visuelle Ortsreferenzen fließen nur in dafür zugelassene Pfade der Bildgenerierung. Textgenerierung, Lore-Aktivierung und der verbundene Conversation-Chat erhalten nie Bilddaten oder rein visuelle Notizen.
15. Storyboard ist ein nachgelagerter Konsument desselben visuellen Resolvers. Jedes Storyboard friert ein an Nachricht und Swipe verankertes Referenz-Manifest ein, damit spätere neue Generierungen nicht stillschweigend neuere Orts- oder Charaktergrafik übernehmen.
16. Vom Modell angeforderte Bewegung bleibt einer späteren Phase vorbehalten.

## Umfang

| Modus | Besitzt Hierarchie | Bewegt Fokus-Ort | Geschichts-Projektion | Verbundene Projektion |
| --- | ---: | ---: | ---: | ---: |
| Roleplay | Ja | Ja | Ja | Entfällt |
| Game | Ja | Ja | Ja | Entfällt |
| Conversation | Nein | Nein | Nein | Spätere Phase, nur lesend |

## Nutzungserlebnis

### Erstellen

**Chat Settings** (Chat-Einstellungen) zeigt einen kompakten Abschnitt **Spatial Context** mit:

- Aktivierungszustand
- Aktuellem Breadcrumb
- Anzahl der Orte und Warnungen
- Aktion **Open Location Editor** (Orts-Editor öffnen)

Der Editor ist ein verzögert geladener Kartenarbeitsbereich, kein schmales Einstellungsformular:

- Am Desktop gibt es ein Hierarchie-Panel, eine lokale Karten- oder Ebenenansicht und ein Panel mit den Ortsdetails.
- Mobil erscheint jeweils ein Panel mit klarer Zurück-Navigation.
- Validierungshinweise stehen direkt neben dem betroffenen Feld oder Knoten.
- Speicherzustand und Revisionskonflikte sind jederzeit sichtbar.
- Archivieren ist die primäre Entfernungsaktion; hartes Löschen ist eingeschränkt.
- Die Auswahl zeigt eine Ortsvorschau. Eine eigene Aktion **Enter** (Betreten) navigiert dorthin, damit ein Klick nie zugleich Ansehen, Bearbeiten und Bewegen bedeutet.
- Jeder übergeordnete Ort stellt seine Kindorte als positionierte Karte, als geordnete Ebenen oder als barrierefreie Liste dar.
- Das Duplizieren eines Teilbaums ermöglicht Wiederverwendung, ohne dass das MVP chatübergreifende Vorlagen braucht.
- Jeder Ort hat einen progressiven Abschnitt `Linked lore`, der bestehende Lorebook-Einträge durchsucht, deaktivierte oder fehlende Referenzen anzeigt und **Open entry** (Eintrag öffnen) sowie **Detach** (Trennen) unterstützt, ohne Lore-Inhalte zu kopieren oder zu löschen.
- Jeder Ort hat einen progressiven Abschnitt `Visual identity` mit primärem Bild, ergänzenden Referenzen, Nutzungshinweisen und ausdrücklichen Aktionen für Galerie, Upload oder Generierung. Bilder ersetzen nie den Ortsnamen, das Icon oder die barrierefreie Navigationsbeschriftung.

### Lorebook-verankerter Entwurf

Der KI-Kartenbauer bietet Lorebook-Verankerung an, sobald der Owner-Chat Lorebooks ausgewählt oder aktiv hat. Die Verankerung ist ausdrücklich und einsehbar, kein gewöhnlicher Schlüsselwort-Scan.

- Das Game-Setup nutzt die im Schritt **Lorebooks** ausgewählten Bücher als Standard-Kartenquellen.
- Roleplay nimmt die aktiven Lorebooks des offenen Chats als Standard und lässt die Quellauswahl im Kartenbauer ändern.
- `Strict canon` erzeugt jeden benannten Knoten aus mindestens einem ausgewählten Lore-Eintrag. Mehrere belegte Wurzeln bleiben erhalten, statt unbelegte Verbindungsorte zu erfinden.
- `Canon with expansion` bewahrt belegte Namen und Beziehungen und lässt klar gekennzeichnete abgeleitete oder erfundene Orte praktische Lücken füllen.
- `Setup only` behält das bisherige Verhalten bei und nutzt Setup, Weltüberblick, Handlungsbogen, Szenario und Charakterkontext ohne Lorebook-Verankerung.
- Gibt es ausgewählte Lorebooks, ist `Canon with expansion` der zugängliche Standard. `Strict canon` bleibt für Lorebook-affine Erstellerinnen einen Klick entfernt.

Jeder generierte Knoten in der Entwurfsvorschau zeigt `Lore-backed`, `Inferred` oder `Added by AI`. Lore-gestützte Knoten führen ihre Quelleinträge auf und bieten **Open entry**. Die Kennzeichnung belegt eine gültige Quellreferenz, nicht die perfekte Deutung des Textes durch das Modell – die semantische Instanz bleibt also die Prüfung durch die Erstellerin. **Apply** (Übernehmen) verändert nur die lokale Arbeitskopie, und **Save** (Speichern) bleibt die Grenze zur Persistenz.

### Visuelle Ortsidentität und Referenzgrafik

Ortsbilder sollen die Szenenkonsistenz verbessern, ohne die Hierarchie in eine Galerie oder eine zweite Quelle räumlicher Wahrheit zu verwandeln.

- Die Erstellerin kann ein Bild hochladen, ein vorhandenes Bild aus der Profil-Galerie wählen, eine generierte Szene befördern oder eine Establishing-Referenz aus Breadcrumb, öffentlicher Beschreibung, visuellem Anker, verknüpfter Lore und gewähltem Bildstil-Profil des Orts generieren.
- Wird ein Bild aus der Chat-Galerie, ein generierter Game-Hintergrund oder eine andere temporäre Quelle angehängt, entsteht zuerst ein dauerhaftes Asset in der Profil-Galerie. Die Karte speichert die stabile Galerie-Bild-ID, nie einen Dateipfad, eine externe URL oder Base64-Daten.
- Ein `identity`-Bild darf primär sein. Ergänzende Bilder können ein markantes Detail, eine andere Ansicht, einen Grundriss oder einen vererbbaren Stilhinweis zeigen.
- `layout`-Referenzen bleiben Editor-Hilfen, solange nicht ausdrücklich ein spezialisierter Hintergrund oder Grundriss angefordert wird. Sie gehen nicht automatisch in gewöhnliche Szenenillustrationen, weil sie die Bildkomposition verzerren können.
- Nur `style`-Referenzen dürfen an Nachfahren vererbt werden. Identitäts- und Detailbilder gelten für genau diesen Ort, damit die Skyline einer Stadt nicht stillschweigend zur visuellen Identität jedes Raums darin wird.
- Generierte Szenengrafik wird nie automatisch Kanon. **Set as location reference** (Als Ortsreferenz festlegen) ist eine ausdrückliche Prüfaktion und verhindert, dass wiederholte Generierungen zufällige Details oder Stilabweichungen verstärken.
- Der Inspektor des gewählten Orts zeigt das primäre Bild und die Referenzrollen. Dichte Hierarchie- und Kartenansichten bleiben namensorientiert; sie dürfen bei genug Platz ein kleines Vorschaubild zeigen, doch die Navigation hängt nie am Wiedererkennen eines Bildes.
- Die Vorschau der Bildgenerierung benennt jede aufgelöste Orts- und Charakterreferenz, ihre Rolle und jede Referenz, die wegen Anbieter-Limits entfällt. Rohes Base64 taucht weder in Logs noch in der Diagnose auf.

Der angestrebte Konsistenz-Stapel sieht so aus:

```text
chat image style profile  -> shared rendering language
current location refs     -> stable architecture and place identity
character/persona refs    -> stable people and appearance
scene prompt              -> current action, framing, weather, and lighting
```

Referenzgrafik ist visuelles Belegmaterial, keine automatische Lore. Ein neues Bild erzeugt nie Orte, ändert nie die Verschachtelung und schreibt keine Lorebook-Fakten. Das Ableiten einer Karte aus Bildern bleibt ein separat zu prüfender künftiger Ablauf.

### Referenzkontinuität im Storyboard

Storyboard soll die geprüften visuellen Identitäten des abgeschlossenen GM-Zugs nutzen, ohne dass die räumliche Funktion von Storyboard abhängig wird.

- Profil-Galerie und Entitäts-Galerien bilden eine Referenzbank, die mehrere geprüfte Bilder pro Ort, Charakter oder Persona enthalten kann. Ein generiertes Keyframe erhält daraus nur eine Auswahl in Anbietergröße.
- Beim Anlegen eines Storyboards wird der exakte räumliche Snapshot zu Quellnachricht und Swipe aufgelöst. Der aktuellste Ort des Chats ersetzt nie einen früheren Zug.
- Das Storyboard friert aufgelösten Ort, geordnete Kandidaten-Bild-IDs, Auswahl pro Keyframe, Auslassungen und Anbieterkapazität in einem Manifest für visuelle Referenzen ein. Neue Generierungen nutzen dieses Manifest weiter, bis die Erstellerin ausdrücklich **Refresh references** (Referenzen aktualisieren) wählt.
- Derselbe primäre Ortskandidat steht jedem Keyframe zur Verfügung. Charakter- und Persona-Kandidaten richten sich nach der Liste der sichtbaren Charaktere des Bildes, damit Figuren außerhalb des Bildes keine Referenzplätze belegen.
- Die erste Version wählt automatisch ein primäres Bild je dargestellter Entität und höchstens ein ergänzendes Ortsbild. Reichere Bänke bleiben für manuelle Auswahl und für künftige einstellungsbewusste Treffer bei Blickwinkel, Kleidung, Gesichtsausdruck oder Detail nützlich, doch Marinara schickt nicht jedes gespeicherte Bild in jedes Bild.
- Bleibt nur ein automatischer Slot, wählt ein Keyframe mit sichtbaren Charakteren die führende sichtbare Figur; ein Establishing-Keyframe ohne sichtbare Charaktere wählt den primären Ort. Ab zwei Slots kommt der primäre Ort vor weiteren Referenzen sichtbarer Charaktere.
- Ein Anbieter mit höherer Kapazität ergänzt ein bestehendes Storyboard nicht stillschweigend um Referenzen. Ein Anbieter mit geringerer Kapazität erzeugt stattdessen einen Inline-Konflikt **Review references** (Referenzen prüfen), statt die eingefrorene Auswahl unbemerkt zu ändern.
- Jede Keyframe-Vorschau hat eine progressive Aufklappung `Visual sources` mit aufgelöstem Ort, gewählten Charakteren, Bildrollen, Reihenfolge und Gründen für Auslassungen. **Refresh references** ist dort verfügbar, ohne einen eigenen Asset-Manager oder ein blockierendes Fenster in Storyboard.
- Generierte Keyframes werden nie automatisch zu Charakter- oder Ortsreferenzen. Die vorhandenen ausdrücklichen Beförderungsaktionen bleiben die einzige Grenze zur Persistenz.

### Bewegung zur Laufzeit

Die Chat-Oberflächen im Owner-Modus zeigen:

- Den gespeicherten aktuellen Breadcrumb
- Die Auswahl gültiger Ziele
- Ein klar gekennzeichnetes ausstehendes Ziel

Die Auswahl eines Ziels ändert den maßgeblichen Zustand nicht sofort. Erst mit der nächsten Nachricht gehen Ziel-ID und erwartete Revision getrennt vom sichtbaren Nachrichtentext an den Server. Der Server schreibt den Wechsel fest, bevor er den Antwort-Prompt zusammenbaut.

Scheitert die Validierung, werden Nachricht und Bewegung nicht teilweise festgeschrieben. Der Client behält den Entwurf und erklärt den Konflikt.

## Datenmodell

Definitionen gehören in die Chat-Metadaten. Die Laufzeitposition gehört in die Snapshot-Historie.

```ts
export type SpatialOwnerMode = "roleplay" | "game";

export type LocationVisualReferenceRole = "identity" | "detail" | "layout" | "style";

export interface LocationVisualReference {
  imageId: string;
  role: LocationVisualReferenceRole;
  primary?: boolean;
  usageNote?: string;
  inheritToDescendants?: boolean;
  sortOrder: number;
}

export interface ChatLocation {
  id: string;
  name: string;
  parentId: string | null;
  description: string;
  kind: "region" | "settlement" | "place" | "building" | "floor" | "room";
  modelMemory?: string;
  icon?: string;
  childPresentation: "map" | "layers" | "list";
  placement?: { x: number; y: number };
  layerOrder?: number;
  awarenessSummary?: string;
  visualIdentity?: string;
  visualReferences: LocationVisualReference[];
  lorebookEntryIds: string[];
  links: ChatLocationLink[];
  status: "active" | "archived";
  sortOrder: number;
}

export interface ChatLocationLink {
  targetId: string;
  label?: string;
  bidirectional: boolean;
  state: "available" | "hidden" | "blocked";
}

export interface SpatialContextDefinition {
  schemaVersion: 1;
  ownerMode: SpatialOwnerMode;
  enabled: boolean;
  locations: ChatLocation[];
  startingLocationId: string | null;
  revision: number;
}

export interface SpatialContextSnapshot {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  createdAt: string;
}

export interface PendingSpatialTransition {
  destinationId: string;
  expectedDefinitionRevision: number;
  expectedCurrentLocationId: string | null;
  commandId: string;
}
```

Speichere `ownerChatId` nicht innerhalb von `SpatialContextDefinition`; Eigentümer ist der umgebende Chat. Stabile, undurchsichtige IDs überstehen Umbenennungen und das Umhängen an neue Eltern.

Das erste Owner-MVP behandelt ein fehlendes Feld `lorebookEntryIds` oder `visualReferences` als leeres Array. So können spätere Pakete Schema-Version 1 erweitern, ohne bestehende Definitionen vorab umzuschreiben. Eintrags- und Bildreferenzen sind ausschließlich stabile IDs. Lorebook-Namen, Eintragsnamen, Schlüssel, Inhalte, Bildpfade und Bilddaten werden erst bei der Nutzung aufgelöst und nie in die räumliche Definition kopiert. `imageId` wird über die dauerhafte Profil-Galerie aufgelöst; beim Anhängen eines temporären oder chatweiten Bildes entsteht zuerst eine dauerhafte Kopie.

## Graph-Regeln

Gültige Ziele sind aktiv:

- Kindorte des aktuellen Orts
- Der übergeordnete Ort des aktuellen Orts
- Ziele direkter Verknüpfungen
- Rückziele bidirektionaler Verknüpfungen

Geschwisterorte grenzen nicht automatisch aneinander.

Abgelehnt werden:

- Doppelte IDs
- Fehlende Eltern- oder Verknüpfungsziele
- Ein Ort als eigener Elternort oder Eltern-Zyklen
- Mehr als 500 Orte
- Tiefe über 20
- Mehr als 50 Verknüpfungen pro Ort
- Mehr als 50 Lorebook-Eintragsreferenzen pro Ort
- Doppelte Lorebook-Eintragsreferenzen an einem Ort
- Mehr als 6 visuelle Referenzen pro Ort
- Doppelte visuelle Bildreferenzen an einem Ort
- Mehr als eine primäre visuelle Referenz oder eine primäre Referenz, deren Rolle nicht `identity` ist
- Vererbung an Nachfahren bei einer anderen Rolle als `style`
- Platzierungskoordinaten außerhalb von 0 bis 100
- Ungültige oder doppelte Ebenenreihenfolge innerhalb eines Ebenen-Elternorts
- Bewegung zu archivierten, versteckten, blockierten oder unerreichbaren Orten
- Veraltete Revisionen oder ein geänderter aktueller Ort
- Wiederverwendete Kommando-IDs mit abweichendem Inhalt
- Änderungsversuche aus Conversation heraus

Textgrenzen:

- Name: 200 Zeichen
- Beschreibung: 4.000 Zeichen
- Awareness-Zusammenfassung: 1.000 Zeichen
- Privates Modell-Gedächtnis: 8.000 Zeichen
- Visuelle Identität: 800 Zeichen
- Nutzungshinweis einer visuellen Referenz: 300 Zeichen

Zyklen über direkte Verknüpfungen sind gültig. Eltern-Zyklen nicht.

### Archivieren und Löschen

- Der aktuelle oder der Startort braucht vor dem Archivieren einen atomaren Ersatz.
- Ein Ort mit aktiven Kindorten lässt sich nicht archivieren.
- Hartes Löschen ist nur für ein archiviertes Blatt ohne eingehende Verknüpfungen erlaubt.
- Nachfahren werden nie stillschweigend umgehängt.
- Fehlende Lorebook-Referenzen erscheinen als Warnung, nicht als Graph-Fehler.
- Beim Archivieren oder Löschen eines Orts verschwinden nie die referenzierten Lorebook-Einträge.
- Beim Löschen eines Lorebooks oder Eintrags wird die Karte nie stillschweigend umgeschrieben. Der Ort behält eine reparierbare gebrochene Referenz, bis die Erstellerin sie trennt oder ersetzt.
- Beim Archivieren oder Löschen eines Orts verschwindet nie ein gemeinsam genutztes Bild aus der Profil-Galerie.
- Das Löschen eines Galeriebildes, das noch von einem Ort oder einem eingefrorenen Storyboard-Manifest referenziert wird, ist blockiert, bis die Erstellerin es trennt oder jedes abhängige Manifest aktualisiert. Fehlende Bildreferenzen bleiben reparierbare Warnungen und werden nie zu Rückfällen auf rohe Pfade.

## Persistenz und Historie

### Definitionen

Speichere `SpatialContextDefinition` in `chat.metadata.spatialContext`. Definitions-Updates verlangen `expectedRevision`; angenommene Updates erhöhen die Revision.

### Laufzeitposition

Speichere die aktuelle Position über Snapshots, die per Nachricht und Swipe adressierbar sind – analog zum bestehenden Muster der Game-State-Snapshots.

- Neue Owner-Chats starten bei `startingLocationId`.
- Ein festgeschriebener Zug erzeugt nach jeder angenommenen Bewegung einen Snapshot.
- Eine neue Generierung verknüpft die Position mit dem entstehenden Swipe.
- Beim Wechsel des Swipes wird der passende Snapshot aufgelöst.
- Beim Verzweigen an einer Nachricht wird der dort wirksame Snapshot kopiert, nicht die aktuellste Position des Ursprungs-Chats.
- Game-Checkpoints referenzieren den zugehörigen räumlichen Snapshot oder enthalten ihn.
- Beim Neuladen wird der zuletzt festgeschriebene Snapshot aufgelöst.

Das Bearbeiten der Definition wird im MVP durch gewöhnliches Verzweigen von Nachrichten nicht zurückgespult. Eine Verzweigung erhält eine Kopie der aktuellen Definition mit eigener künftiger Revisionshistorie. Ihre Laufzeitposition stammt vom Verzweigungspunkt.

## Prompt-Projektionen

Ein gemeinsamer Projektionsdienst auf dem Server löst strukturierte Projektionsdaten auf. Dünne Modus-Adapter machen daraus den endgültigen Prompt-Text.

### Geschichts-Projektion im Owner-Modus

Enthalten:

- Breadcrumb-Namen
- ID des aktuellen Orts
- Öffentliche Beschreibung
- Privates Modell-Gedächtnis des aktuellen Orts
- Namen, IDs und Verknüpfungsbeschriftungen der verfügbaren Ziele
- Eine Anweisung zum maßgeblichen Zustand

Ausgeschlossen sind alle Beschreibungen und Gedächtnisse fremder Orte, versteckte oder blockierte Ziele, Canvas-Koordinaten und Editor-Metadaten.

### Lore-Aktivierung am aktuellen Ort

Der räumliche Resolver im Owner-Modus liefert neben der normalen räumlichen Projektion die `lorebookEntryIds` genau des aktuellen Orts. Der Formatter fügt weder diese IDs noch Eintragsinhalte in den räumlichen Block ein. Stattdessen reicht der Prompt-Aufbau die IDs als erzwungene Kandidaten mit der Aktivierungsquelle `current_location` an den bestehenden Lorebook-Prozessor weiter.

Regeln:

- In der ersten Version aktiviert nur genau der aktuelle Ort seine verknüpfte Lore. Eltern und Nachfahren erben Einträge nicht implizit.
- Eine ausdrückliche Ortsverknüpfung kann einen aktivierten Eintrag auch dann auslösen, wenn sein Lorebook weder global noch charakter- oder personagebunden noch an den Chat angeheftet ist.
- Ein global deaktiviertes Lorebook, ein deaktivierter Eintrag oder ein ausdrücklicher Chat-Ausschluss schlägt die Verknüpfung immer.
- Bestehende Lorebook-Makros, Einfügepositionen, Rekursion, Reihenfolge sowie Token- und Eintragsgrenzen je Buch werden weiterverwendet.
- Ortsverknüpfte Lore hat zusätzlich eine reservierte Gesamtobergrenze von 2.048 Tokens pro Owner-Prompt. Die Kürzung ist deterministisch und erscheint in Active Context.
- Ein Eintrag, den sowohl der Ort als auch gewöhnliche Schlüsselwort-, semantische, rekursive oder konstante Regeln aktivieren, wird einmal eingefügt und meldet alle Aktivierungsquellen.
- Ein festgeschriebener Wechsel löst die Einträge des Ziels auf, bevor der Owner-Antwort-Prompt zusammengebaut wird. Ausstehende oder abgelehnte Bewegung ändert die Lore-Aktivierung nicht.
- Die Game-Formulierung behandelt den Ort als maßgebliche Position der Party. Die Roleplay-Formulierung behandelt ihn als Fokus-Szene und leitet nicht ab, dass jeder Charakter anwesend ist.

Die Oberfläche von Active Context gruppiert diese Einträge unter `Current location` und zeigt das besitzende Lorebook, die Aktivierungsquellen, den Token-Verbrauch oder die Kürzung sowie **Open entry**. Gebrochene, deaktivierte und ausgeschlossene Referenzen bleiben im Karteneditor sichtbar, gelangen aber nie in den Prompt.

### Projektion für den verbundenen Conversation-Chat

Kommt in Phase 3 dazu. Enthalten ist nur:

- Name und Modus der verknüpften Geschichte
- Breadcrumb
- `awarenessSummary` oder ein begrenzter Auszug der öffentlichen Beschreibung
- Nur-Lese-Anweisung
- Anwesenheit von Charakteren nur, wenn der maßgebliche Zustand sie belegt

Nie enthalten sind privates Modell-Gedächtnis, interne IDs, versteckte Ziele, die vollständige Hierarchie, ortsverknüpfte Lorebook-IDs oder -Inhalte, IDs visueller Ortsreferenzen, Notizen zur visuellen Identität, Nutzungshinweise, Bildpfade oder Bilddaten.

Game kann Anwesenheit über seinen festgeschriebenen Zustand `presentCharacters` belegen. Roleplay nutzt neutrale Formulierungen wie „Die aktuelle Szene der verknüpften Geschichte ist …“, bis eine ausdrückliche Anwesenheitsquelle vorliegt. Leite Anwesenheit nie aus einem Charakternamen ab.

### Erforderliche Prompt-Pfade

Derselbe Projektions-Resolver muss folgende Pfade versorgen:

- Roleplay-Generierung
- Game-GM-Generierung
- Trockenlauf-Vorschau
- Live-Aufbau von Peek Prompt

Der zwischengespeicherte Peek Prompt zeigt weiterhin genau den ursprünglich gesendeten Prompt. Das Debug-Log enthält die endgültige Projektion, darf privates Modell-Gedächtnis auf normalen Stufen aber nicht protokollieren.

### Visuelle Projektion des aktuellen Orts für die Bildgenerierung

Visuelle Referenzen nutzen einen eigenen Resolver, getrennt vom Geschichts-Prompt. Er löst den räumlichen Snapshot auf, der zum Bildziel gehört, nicht bloß den aktuellsten Ort des Chats. Automatische Game-Grafik nutzt den Snapshot, der für diese Assistenznachricht festgeschrieben wurde. Ein erneuter Grafikversuch für einen früheren Swipe und der Aufruf des Illustrators aus einer früheren Nachricht nutzen den Ort, der für diese Nachricht und diesen Swipe aufgelöst wurde.

Zugelassene Pfade sind automatische Game-Szenengrafik, manuelle Game-Szenenillustration sowie Szenen- oder Hintergrundgenerierung des Roleplay-Illustrators, sofern der Schalter für Ortsreferenzen im jeweiligen Chat aktiv ist. Porträt-, Selfie-, Avatar- und Sprite-Generierung erhalten nie automatisch Ortsreferenzen.

Zwei Schalter in den Chat-Metadaten spiegeln die bestehenden Avatar-Referenz-Schalter: `illustratorUseLocationReferences` und `gameImageUseLocationReferences`. Fehlt der Wert oder ist er false, bleibt die Funktion aus Kompatibilitätsgründen aus. Setzt die Erstellerin das erste primäre Ortsbild, bietet derselbe Speicherablauf `Use this location in scene art` an – standardmäßig angehakt, aber ausdrücklich. So gehen nie Bilddaten an einen Anbieter, bloß weil ein Bild im Karteneditor zu sehen ist.

Die Reihenfolge der Kandidaten ist deterministisch und anbieterbewusst:

1. Ausdrücklich für diese Bildanfrage gewählte Referenzen.
2. Die primäre `identity`-Referenz genau des aufgelösten Orts.
3. Referenzierte Charaktere und die Persona in Szenenreihenfolge.
4. Die ergänzenden `identity`- und `detail`-Referenzen genau dieses Orts in `sortOrder`.
5. Die vererbbare `style`-Referenz des nächstgelegenen Vorfahren.

Ein Rückfall auf Geschwisterorte oder Namen ist nicht erlaubt. Für eine gewöhnliche Szenenanfrage kommen höchstens zwei Ortsbilder als Kandidaten infrage, und der bestehende Anbieter-Adapter wendet sein Gesamtlimit an. Ausdrücklich angeforderte Referenzen belegen immer zuerst Slots. Für die verbleibenden automatischen Slots gilt: Eine Hintergrundanfrage stellt die Ortsidentität über Charakterreferenzen, eine Illustration wählt die primäre Ortsreferenz vor weiteren Referenzen dargestellter Personen. Kann ein Anbieter nicht zugleich den Ort und jede angeforderte Person aufnehmen, meldet die Vorschau die deterministische Abwägung und jeden Grund für eine Auslassung.

Der Prompt-Compiler für Bilder ergänzt den Orts-Breadcrumb, die begrenzte `visualIdentity` und den begrenzten `usageNote` jeder gewählten Referenz. Das im Chat gewählte `ImageStyleProfile` bleibt die maßgebliche Instanz für den Stil. Referenzbilder bewahren die Identität von Ort oder Motiv und dürfen Stiltext, positive Tags, negative Tags oder Prompt-Modus des Profils nicht stillschweigend ersetzen.

Referenzrollen drücken die Absicht der Erstellerin und die Auswahlpriorität aus; sie garantieren nicht, dass jeder Anbieter ein Bild als Identität, Detail, Grundriss oder Stil interpretiert. Hinweise zu Anbieterfähigkeiten und die generierte Vorschau halten die Erstellerin in der visuellen Verantwortung.

Anfragen an Textmodelle erhalten nichts davon: weder Bilddaten noch rein visuelle Nutzungshinweise. Der verbundene Conversation-Chat erhält weder die IDs visueller Referenzen noch deren Inhalte. Bild-Debug-Logs dürfen Bild-IDs, Orts-IDs, Rollen, Auswahlgründe und Auslassungen enthalten, aber nie Base64 oder Dateisystempfade.

### Manifeste visueller Referenzen im Storyboard

Der Storyboard-Adapter löst die visuellen Kandidaten einmal für den abgeschlossenen GM-Zug auf, nachdem dessen Nachricht und Swipe festgeschrieben sind. Er speichert eine eingefrorene Bank und die anbietergerechte Auswahl für jedes Keyframe. Das trennt die dauerhafte Referenzidentität von einer Anbieteranfrage, die vielleicht nur eine kleine Teilmenge annimmt.

Die Auswahl ist deterministisch:

1. Ausdrückliche Keyframe-Referenzen belegen zuerst Slots.
2. Bleibt ein automatischer Slot, wählt ein Establishing-Bild den primären Ort und ein Bild mit sichtbaren Charakteren die führende sichtbare Figur.
3. Bleiben zwei oder mehr automatische Slots, wird zuerst der primäre Ort gewählt, dann je eine primäre Referenz für jeden sichtbaren Charakter und jede Persona in erzählerischer Reihenfolge.
4. Die restliche Kapazität geht an eine ergänzende `identity`- oder `detail`-Referenz genau dieses Orts, dann an sekundäre Referenzen dargestellter Entitäten, dann an den nächstgelegenen vererbbaren Ortsstil.

Storyboard erstellt nie implizit ein Kontaktbogen- oder Kompositbild als Referenz. Solche Techniken können die Interpretation des Anbieters verändern und bleiben eine künftige anbieterspezifische Optimierung. Fehlende Bilder, ein Anbieterwechsel oder ein gesunkenes Anbieterlimit markieren das Manifest als `needs_review`; eine andere Entität wird nicht stillschweigend gewählt. Auch mehr Kapazität lässt die eingefrorene Auswahl unangetastet, bis **Refresh references** bestätigt wird.

Das Manifest speichert IDs, Beschriftungen, Rollen, Reihenfolge, Auswahlgründe, Auslassungen, Quellnachricht und Swipe, aufgelöste Orts-ID, Definitions-Revision, Anbieteridentität und das verwendete Referenzlimit. Bilddaten oder Dateisystempfade speichert es nicht. Die Debug-Ausgabe darf das Manifest beschreiben, folgt dabei aber denselben Regeln ohne Base64 und ohne Pfade wie die gewöhnliche Bildgenerierung.

## Game-Kompatibilität

Bestehende Raster- und Knotenkarten aus Game bleiben lokale oder taktische Darstellungen. Die Hierarchie wird zur Welt- und Verschachtelungsebene darüber.

Bei aktivem Spatial Context gilt:

- Spatial Context liefert den maßgeblichen benannten Ort an die Prompts.
- Der Game-Tracker zeigt den räumlichen Breadcrumb als seinen Ort.
- Alte Modell- oder manuelle Patches können den Freitext-Ort von Game nicht mehr eigenständig ändern.
- `GameMap.spatialLocationId` kann eine ganze Karte an einen Hierarchie-Ort binden.
- `GridCell.spatialLocationId` und `MapNode.spatialLocationId` können ein betretbares Ziel binden.
- Bindungen nutzen ausschließlich stabile IDs; Namen werden nie automatisch abgeglichen.
- Die Auswahl eines gebundenen Ziels erzeugt denselben ausstehenden Übergang wie der Hierarchie-Browser.
- Bewegung zwischen ungebundenen Zellen oder Knoten ändert nur die taktische Position der Party.
- Beim Betreten eines Orts kann seine gebundene lokale Karte aktiv werden; beim Verlassen die nächstgelegene gebundene Vorfahrenkarte.

Ist die Funktion deaktiviert, bleibt das bisherige Game-Ortsverhalten unverändert.

Diese Abgrenzung erhält die aktuelle Karten-Oberfläche und die Spielstände und verhindert zugleich zwei Quellen benannter räumlicher Wahrheit.

## API-Form

```text
GET  /api/chats/:chatId/spatial-context
PUT  /api/chats/:chatId/spatial-context
```

Definitions-Update:

```ts
interface UpdateSpatialContextRequest {
  expectedRevision: number;
  expectedCurrentLocationId: string | null;
  replacementCurrentLocationId?: string | null;
  definition: SpatialContextDefinition;
}
```

`replacementCurrentLocationId` kommt nur zum Einsatz, wenn eine Definitionsänderung den wirksamen aktuellen Ort archiviert. Der Server muss diesen Ersatz im selben Schreibvorgang wie die Definitions-Revision validieren und anwenden. Gewöhnliche Bewegung läuft weiterhin über die Zug-Übermittlung im Owner-Modus.

Ausstehende Bewegung wird über die bestehende Zug-Anfrage des Owner-Modus übermittelt, nicht über einen eigenen Endpunkt für Sofortübergänge.

Der Server validiert Definitionsintegrität, Owner-Modus, erwartete Revision, erwarteten aktuellen Ort, Erreichbarkeit und Kommando-Idempotenz in derselben Transaktion wie die Nachrichtenübermittlung.

Gib `409 Conflict` bei veraltetem Zustand zurück und `400 Bad Request` bei ungültigen Graphen oder Zielen. Fehlermeldungen dürfen keine versteckten Ziele verraten.

## Umsetzungsplan

### Phase 0: gemeinsamer Kern und Nachweis-Fixtures

- Gemeinsame Typen und Zod-Schemas ergänzen.
- Reine Helfer für Graph-Validierung, Breadcrumb und Ziele ergänzen.
- Deterministische Fixtures für gültige und ungültige Graphen ergänzen.
- Integrationspunkte der Nachrichten- und Swipe-Snapshots für Roleplay und Game bestätigen.
- Repräsentative Prompt-Projektionen vermessen.

Abschlusskriterium: Schema, Bewegungssemantik und Snapshot-Verhalten sind ohne Oberfläche nachgewiesen.

### Phase 1: Owner-MVP

1. Definitions-Persistenz mit optimistischer Nebenläufigkeit ergänzen.
2. Speicherung und Auflösung räumlicher Snapshots ergänzen.
3. Atomare ausstehende Bewegung in die Zug-Übermittlung des Owner-Modus einbauen.
4. Neuladen, Swipes, Verzweigungen und Game-Checkpoints behandeln.
5. Den gemeinsamen Projektionsdienst in jeden erforderlichen Prompt-Pfad einhängen.
6. Kompakten Einstellungsabschnitt, Hierarchie-Navigator, lokales Karten-Canvas, Ebenenauswahl und Editor-Arbeitsbereich ergänzen.
7. Breadcrumb, Zielauswahl, Vorschau und ausstehenden Zustand in die Owner-Oberflächen ergänzen.
8. Bestehende Game-Karten, -Zellen und -Knoten über stabile Orts-IDs binden.
9. Den Ort im Game-Tracker abgleichen, sobald die Funktion aktiv ist.

Abschlusskriterium: Roleplay und Game können aus demselben räumlichen Modell heraus erstellen, bewegen, speichern, wiederherstellen und prompten. Gebundene Game-Kartenbewegung und ungebundene taktische Bewegung bleiben getrennt.

### Phase 2A: Lorebook-Bindungen an Orte und Laufzeit

- `lorebookEntryIds` an Orten ergänzen, mit leerem Array als Kompatibilitätsstandard.
- Inline-Zustände für Anhängen, Öffnen, Trennen, Deaktiviert, Ausgeschlossen und Gebrochene Referenz im Orts-Editor ergänzen.
- Referenzen genau des aktuellen Orts als erzwungene Kandidaten durch den bestehenden Lorebook-Prozessor auflösen.
- Normale Makros, Einfügung, Rekursion, Reihenfolge und Grenzen je Buch weiterverwenden; deterministische Deduplizierung und eine Gesamtobergrenze von 2.048 Tokens für Ortslore ergänzen.
- `current_location` neben allen Schlüsselwort-, semantischen, rekursiven oder konstanten Aktivierungsquellen in Active Context melden.
- Identisches Verhalten in Roleplay und Game nachweisen, inklusive Bewegung, Neuladen, neuer Generierung, Swipes und Verzweigungen.
- Nachweisen, dass der verbundene Conversation-Chat weder Ortslore-IDs noch -Inhalte erhält.

Abschlusskriterium: Erstellerinnen können bestehende Lore ausdrücklich an Orte binden, und nur der angenommene aktuelle Ort aktiviert diese Einträge in Owner-Prompts.

### Phase 2B: Lorebook-verankerter Kartenentwurf

- Anfragen zum Erstellen, Ersetzen und zum historiensicheren Erweitern um Verankerungsmodus und ausdrückliche Lorebook- oder Eintragsauswahl erweitern.
- Ausgewählte aktivierte Lore-Einträge für diesen Erstellungsvorgang direkt lesen, statt auf Schlüsselwort-Aktivierung oder den generierten Weltüberblick zu setzen.
- Einen verbindungsbewussten, begrenzten Quellkatalog mit sichtbaren Auslassungszahlen und deterministischer Reihenfolge aufbauen.
- Dem Modell temporäre Quellschlüssel geben, jeden zurückgegebenen Schlüssel serverseitig validieren und nur stabile Eintrags-IDs speichern.
- Das Verhalten von `setup_only`, `lore_strict` und `lore_expand` mit Herkunftsangaben in der Vorschau unterstützen.
- Gültige Quelleinträge automatisch an generierte Orte binden und dabei **Apply** und **Save** als getrennte Prüfgrenzen erhalten.
- Bei rein additiver Erweiterung jede bestehende Orts-ID und Lore-Bindung bewahren.

Abschlusskriterium: Eine Lorebook-erfahrene Erstellerin kann eine Karte erzeugen, die direkt im ausgewählten Kanon verankert ist, jede unbelegte Ergänzung erkennen und sie vor dem Speichern ablehnen oder bearbeiten.

### Phase 2C: Visuelle Ortsidentität und Szenenreferenzen

- Begrenzte Felder `visualIdentity` und `visualReferences` mit leeren Kompatibilitätsstandards ergänzen.
- Dauerhafte Bild-IDs der Profil-Galerie sowie die bestehenden sicheren Pfade für Galerie-Upload, Metadaten und Bildgenerierung weiterverwenden. Nie rohe Pfade, externe URLs oder Base64 in der Definition speichern.
- Die parallelen Schalter je Chat für Illustrator und Game-Ortsreferenzen ergänzen. Der Speicherablauf beim ersten primären Bild holt ausdrückliche Zustimmung zur Anbieternutzung ein.
- Eine Establishing-Referenz nur aus begrenztem Kontext genau dieses Orts und aktivierter verknüpfter Lore generieren. Fremde Lorebooks oder Hierarchie-Zweige nicht durchsuchen.
- Inline-Zustände für Primär, Ergänzend, Rolle, Nutzungshinweis, Galerieauswahl, Upload, Generieren, Trennen, Gebrochene Referenz und Backlink im Orts-Editor ergänzen.
- Den exakten Ort von Nachricht und Swipe in zugelassene Game- und Roleplay-Anfragen für Szenengrafik auflösen, dann Orts-, Charakter-, Persona- und ausdrückliche Referenzen unter den anbieterspezifischen Grenzen zusammenführen.
- Ausdrückliche Beförderung **Set as location reference** für generierte Grafik ergänzen. Generierte Szenen nie automatisch befördern.
- IDs visueller Referenzen über Verzweigungen und den JSONL-Metadaten-Export bewahren, bei fehlenden Ziel-Assets warnen und die Assets in Profil-Backup und -Wiederherstellung einschließen.
- Nachweisen, dass Geschichts-Prompts und der verbundene Conversation-Chat weder Orts-Bild-IDs, Bilddaten, Pfade noch rein visuelle Notizen erhalten.

Abschlusskriterium: Eine Erstellerin kann einen Ort visuell festlegen, mehrere Szenen mit seiner geprüften Identität erzeugen, genau sehen, welche visuellen Referenzen gesendet wurden, und diese entfernen oder ersetzen, ohne räumliche oder Lore-Wahrheit zu verändern.

### Phase 2D: Manifeste visueller Referenzen im Storyboard

- Einen nachgelagerten Storyboard-Adapter um den visuellen Resolver aus Phase 2C bauen, statt die räumliche Persistenz an Storyboard zu koppeln.
- Den räumlichen Snapshot von Quellnachricht und Swipe auflösen, dann Ort und Entitäts-Referenzbank samt Anbieter-Auswahl je Keyframe einfrieren.
- Den primären Ort bei ausreichender Kapazität über alle Keyframes hinweg wiederverwenden und Charakter- sowie Persona-Referenzen aus der Liste sichtbarer Charaktere jedes Bildes wählen.
- Anbieteridentität, Referenzkapazität, geordnete Auswahl und Auslassungsgründe speichern, damit neue Generierungen reproduzierbar sind.
- Inline-Zustände `Visual sources`, **Review references** und ausdrückliches **Refresh references** in Vorschau und erneuter Generierung ergänzen.
- Stille Neuauswahl ablehnen, wenn ein Bild fehlt oder die Anbieterkapazität schrumpft. Neu verfügbare Kapazität nicht automatisch auffüllen.
- Das Manifest über den bestehenden Storyboard-Lebenszyklus bewahren und nachweisen, dass Keyframe-zu-Video weiterhin nur das gerenderte Keyframe als erstes Bild nutzt.

Abschlusskriterium: Jedes Storyboard-Keyframe kann seine visuellen Eingaben erklären und reproduzieren, wiederkehrende Bilder teilen die historisch korrekte Ortsidentität, und Anbietergrenzen tauschen nie stillschweigend den Ort oder die dargestellten Personen aus.

### Phase 3: verbundener Conversation-Chat

- Den aktuellsten Owner-Zustand zur Generierungszeit über `connectedChatId` auflösen.
- Eine begrenzte Nur-Lese-Projektion ergänzen.
- Zurückhaltende Formulierungen zur Anwesenheit verwenden.
- Ortsverknüpfte Lore-IDs und -Inhalte, IDs und Metadaten visueller Referenzen, Bildpfade und Bilddaten ausschließen – auch dann, wenn die Generierung im Owner-Modus sie nutzt.
- Trennen, erneutes Verknüpfen, gelöschten Owner, fehlerhafte Verknüpfungen, abgeschlossene Geschichten und Negativkontrollen zur Ortslore abdecken.

### Phase 4: vom Modell angeforderte Bewegung

- Eine typisierte Anfrage `change_location` für die Owner-Modi ergänzen.
- Dieselbe Prüfung von Revision, Erreichbarkeit und Idempotenz anwenden.
- Angenommene und abgelehnte Anfragen in der Debug-Diagnose festhalten.
- Conversation kann weiterhin keine Übergänge anfordern.

### Phase 5: Vorlagen für Erstellerinnen

- Wiederverwendbare Orts-Teilbäume oder vollständige Karten speichern und importieren.
- Erstellerinnen erlauben, Startkarten mit Charakteren auszuliefern, sobald Eigentums- und Merge-Verhalten festgelegt sind.
- Interne Referenzen bewahren und beim Kopieren in einen anderen Chat neue IDs vergeben.

## Blaupause für die Umsetzung im Repository

Planungsbasis: `hierarchical-locations` nach dem Merge von `staging` bei `4fd752ea` am 13.07.2026. Auf diesem Stand enthält der Branch nur die Planungsdokumente V1, V2 und V3. Laufzeitcode für Spatial Context existiert noch nicht.

### Bestätigte Integrationsbedingungen

| Thema | Aktuelles Verhalten im Repository | Folge für die Umsetzung |
| --- | --- | --- |
| Definitionsspeicherung | Chat-Metadaten sind JSON, und generische Metadaten-Updates sind Teil-Merges. | Räumliche Definitionen bleiben in `chat.metadata.spatialContext`, nutzen aber einen eigenen validierten Endpunkt statt der generischen Metadaten-Patch-Route. |
| Laufzeit-Historie | `game_state_snapshots` ist die einzige per Nachricht und Swipe adressierbare Weltzustands-Historie. | Eine modusneutrale Tabelle für räumliche Snapshots ergänzen. Keine Spatial-Context-Spalten zu den Game-eigenen Snapshots hinzufügen. |
| Beginn des Owner-Zugs | `/api/generate` schreibt den sichtbaren Spielzustand fest, erzeugt die Nutzernachricht und aktualisiert Anhänge und Persona-Daten anschließend in separaten Aufrufen. | Einen kleinen, transaktionsgebundenen Owner-Zug-Dienst ergänzen, damit das Anlegen der Nutzernachricht und ein angenommener räumlicher Wechsel gemeinsam gelingen oder gemeinsam scheitern. Anbieteraufrufe bleiben außerhalb der Transaktion. |
| Swipes und Verzweigungen | Das Löschen eines Swipes verschiebt die Indizes der Game-Snapshots. Beim Verzweigen werden alle Game- und Zug-Game-Snapshots auf neue Nachrichten-IDs kopiert. | Räumliche Snapshots müssen an beiden Pfaden teilnehmen und den an einem früheren Verzweigungspunkt wirksamen Snapshot kopieren. |
| Prompt-Aufbau | Live-Generierung, Trockenlauf, Live-Peek-Prompt, zwischengespeicherter Peek Prompt und Game-GM-Prompts haben eigene Aufbaupfade. | Strukturierte räumliche Daten einmal auflösen, dann aus jedem Live-Pfad denselben Formatter/Injector aufrufen. Der zwischengespeicherte Peek Prompt liest weiterhin genau die gespeicherte Anbieteranfrage. |
| Client-Daten | Serverdaten laufen über React Query. Eingabeentwürfe je Chat überstehen Navigation und Neuladen. Schwere Editoren werden über `AppShell` verzögert geladen. | Einen eigenen Query-/Mutation-Hook ergänzen, ausstehende Übergänge neben den Entwürfen je Chat speichern und einen verzögert geladenen Orts-Editor über das bestehende Detailansichts-Modell einbinden. |
| Reisen in Game | Game-Karten haben bereits Raster- und Knotenpositionen sowie einen ausstehenden Kartenwechsel, der als sichtbarer Text `*moves to ...*` erscheint. | Optionale Bindungen über stabile IDs ergänzen. Gebundene Ziele nutzen strukturierte räumliche Anfragen ohne sichtbaren Prosatext; ungebundene Bewegung behält den bisherigen taktischen Ablauf. |
| Speicherung | Dateinative Snapshots sind das einzige Persistenz-Backend. Kleine Transaktionen sind üblich, große Transaktionsschleifen werden vermieden, damit Schreibvorgänge reaktionsschnell bleiben. | Die Owner-Zug-Transaktion konstant groß halten und gegen die dateinative Speicherung nachweisen, bevor die Funktion wächst. |
| Lorebook-Verarbeitung | Die Lorebook-Aktivierung unterstützt bereits ausdrückliche Chat-IDs, Schlüsselwort- und semantische Treffer, Makros, Rekursion, Reihenfolge und Prompt-Marker. Das anfängliche Game-Setup läuft ohne Chat-Nachrichten, daher verankern gewöhnliche Schlüsselwort-Einträge den späteren Kartenentwurf nicht direkt. | Erzwungene Kandidaten für den aktuellen Ort im gemeinsamen Lorebook-Prozessor ergänzen und dem Kartenentwurf einen eigenen ausdrücklichen, begrenzten Quellkatalog-Pfad geben. Kartenkanon nicht allein aus dem Weltüberblick ableiten. |
| Bildkonsistenz | Bildstil-Profile steuern den Prompt-Stil, Charakter- und Persona-Avatare lassen sich bereits als Referenzen senden, und Anbieter akzeptieren unterschiedlich viele Referenzen. Galerien speichern stabile Bild-IDs getrennt von Dateipfaden. | Ortsidentität von globalem Stil und Charakteridentität trennen. Den passenden räumlichen Snapshot auflösen, stabile Galeriebilder nur an zugelassene Szenengrafik-Anfragen hängen und Kandidaten deterministisch über die bestehenden Anbieter-Adapter kürzen. |
| Storyboard-Referenzen | Storyboard plant bereits sichtbare Charaktere je Keyframe, löst anbieterspezifische Referenzlimits auf, sendet Charakterbilder durch Vorschau und Rendering, speichert seine Quellnachricht und den Swipe und nutzt jedes gerenderte Keyframe als erstes Videobild. | Ein eingefrorenes Manifest visueller Referenzen ergänzen, das den historischen Ort einmal auflöst, Charaktere je Keyframe variiert und die geordnete Auswahl über neue Generierungen hinweg bewahrt. Die Eingabe für Keyframe-zu-Video bleibt unverändert. |

### Zielkarte der Module

Neue gemeinsame Module:

- `packages/shared/src/types/spatial-context.ts`: öffentliche Typen für Definition, Snapshot, Übergang, Projektion, Antwort, Warnung und Fehlercodes.
- `packages/shared/src/schemas/spatial-context.schema.ts`: Zod-Schemas und sämtliche Speicher- und Anfragegrenzen.
- `packages/shared/src/utils/spatial-context.ts`: reine Graph-Indizierung, Validierung, Breadcrumb, Erreichbarkeit, Archivprüfungen und deterministische Zielsortierung.
- `packages/shared/src/index.ts`: ausdrückliche Exporte für den neuen gemeinsamen Vertrag.

Neue Server-Module:

- `packages/server/src/db/schema/spatial-context.ts`: Schema für `spatial_context_snapshots`.
- `packages/server/src/services/storage/spatial-context.storage.ts`: Snapshot-Lesen und -Schreiben, Kopien beim Verzweigen, Swipe-Verschiebungen, Kommandosuche und Aufräumen.
- `packages/server/src/services/spatial-context/state-resolution.ts`: Auflösung des wirksamen Snapshots für Bootstrap, sichtbaren Swipe, neue Generierung, Verzweigung und Checkpoints.
- `packages/server/src/services/spatial-context/projection.ts`: strukturierte Owner- und verbundene Projektionen plus begrenzte Textformatierung.
- `packages/server/src/services/spatial-context/visual-reference-resolution.ts`: snapshot-bewusste visuelle Ortsauswahl, Vererbung, Anbieterkandidaten und sichere Diagnose.
- `packages/server/src/services/spatial-context/storyboard-reference-manifest.ts`: eingefrorene Storyboard-Bänke, Auswahl je Keyframe, Prüfung der Anbieterkapazität, Aktualisierung und sichere Serialisierung.
- `packages/server/src/services/spatial-context/owner-turn.ts`: Validierung und konstant großer atomarer Wechsel plus Festschreiben der Nutzernachricht.
- `packages/server/src/services/spatial-context/game-map-binding.ts`: maßgebliche Breadcrumb-Projektion plus Auflösung ausdrücklicher Bindungen an Game-Karte, -Zelle und -Knoten.
- `packages/server/src/routes/spatial-context.routes.ts`: eigene GET- und revisionierte PUT-Routen.

Neue Client-Module:

- `packages/client/src/hooks/use-spatial-context.ts`: Query-Keys, GET, Definitions-PUT, Konfliktbehandlung und Cache-Invalidierung.
- `packages/client/src/features/spatial-context/SpatialContextSettingsSection.tsx`: kompakte Zusammenfassung in **Chat Settings** samt Editor-Aktion.
- `packages/client/src/features/spatial-context/SpatialMapWorkspace.tsx`: verzögert geladene Editor-Hülle über die volle Seite.
- `packages/client/src/features/spatial-context/components/HierarchyNavigator.tsx`: Hierarchie-Navigation und Tastaturbedienung.
- `packages/client/src/features/spatial-context/components/LocalMapCanvas.tsx`: positionierte Karte der Kindorte.
- `packages/client/src/features/spatial-context/components/LayerSelector.tsx`: geordnete Stockwerks-, Turm- und Dungeon-Ebenen.
- `packages/client/src/features/spatial-context/components/LocationInspector.tsx`: Feldbearbeitung, Vorschau, Verknüpfungen, Archivsteuerung und Inline-Validierung.
- `packages/client/src/features/spatial-context/components/SpatialContextRuntimeBar.tsx`: Breadcrumb, Zielauswahl, ausstehender Zustand und Zurücksetzen.
- `packages/client/src/features/spatial-context/lib/editor-state.ts`: Operationen auf der Arbeitskopie und Zuordnung von Serverfehlern. Bleibt client-lokal und wird nicht über ein Barrel exportiert.

Bestehende Integrationsdateien, die sich voraussichtlich ändern:

- Persistenz: `packages/server/src/db/migrate.ts`, `packages/server/src/db/schema/index.ts`, `packages/server/src/db/file-backed-store.ts`, `packages/server/src/services/storage/chats.storage.ts` und `packages/server/src/routes/backup.routes.ts`, soweit für die Tabellenregistrierung nötig.
- Chat-Lebenszyklus: `packages/server/src/routes/chats.routes.ts`, `packages/server/src/routes/generate.routes.ts` und `packages/shared/src/schemas/chat.schema.ts`.
- Prompt-Pfade: `packages/server/src/routes/generate/dry-run-route.ts`, `packages/server/src/services/generation/game-gm-prompt-runtime.ts` und der Live-Vorschau-Teil von `packages/server/src/routes/chats.routes.ts`.
- Lorebook-Verankerung und -Aktivierung: `packages/server/src/services/lorebook/`, `packages/server/src/routes/spatial-context.routes.ts`, `packages/client/src/features/spatial-context/components/LocationInspector.tsx`, der Lorebook-Editor und die Oberfläche von Active Context.
- Referenzgrafik für Orte: `packages/server/src/db/schema/gallery.ts`, Galerie-Speicherung und -Routen, `packages/server/src/services/image/`, `packages/server/src/routes/generate/illustrator-references.ts`, Game-Illustration und Storyboard-Aufbau in `packages/server/src/routes/game.routes.ts`, `packages/server/src/services/storage/game-storyboards.storage.ts`, die gemeinsamen Storyboard-Prompt-Verträge, `packages/client/src/features/spatial-context/components/LocationInspector.tsx` sowie die Oberflächen für Bildgenerierung und Storyboard-Vorschau.
- Client-Routing und Sendepfade: `packages/client/src/stores/ui.store.ts`, `packages/client/src/stores/chat.store.ts`, `packages/client/src/components/layout/AppShell.tsx`, `packages/client/src/components/chat/ChatSettingsDrawer.tsx`, `packages/client/src/components/chat/ChatArea.tsx`, `packages/client/src/components/chat/ChatRoleplaySurface.tsx`, `packages/client/src/components/chat/ChatInput.tsx`, `packages/client/src/components/game/GameSurface.tsx` und `packages/client/src/components/game/GameInput.tsx`.
- Portabilität und Nachweis: Code für den nativen Chat-Import/-Export in `packages/server/src/routes/chats.routes.ts` und `packages/server/src/services/import/`, `scripts/regressions/`, `e2e/core-flows.e2e.ts` sowie die Skripte in der Wurzel-`package.json`.

Die Dateiliste ist eine Abgrenzung, keine Pflicht, jede Datei in einem einzigen Pull Request zu ändern. Jedes Arbeitspaket unten sollte seinen Diff eng halten.

### Persistenz-Vertrag

Definitionen bleiben in den Chat-Metadaten und werden automatisch mitkopiert, wenn eine Verzweigung die Chat-Metadaten kopiert. Der Laufzeitzustand nutzt eine eigene Tabelle:

```ts
interface SpatialContextSnapshotRow {
  id: string;
  chatId: string;
  messageId: string;
  swipeIndex: number;
  currentLocationId: string | null;
  definitionRevision: number;
  source: "bootstrap" | "owner_turn" | "assistant_swipe" | "definition_repair" | "branch_copy";
  transitionCommandId: string | null;
  transitionPayloadHash: string | null;
  createdAt: string;
}
```

Erforderliche Indizes und Invarianten:

- Genau eine wirksame Zeile je `(chatId, messageId, swipeIndex)`.
- Eine Übergangs-Kommando-ID ist innerhalb ihres Chats eindeutig, sofern sie nicht null ist.
- Eine wiederholte Kommando-ID mit abweichendem Ziel, abweichender erwarteter Revision oder abweichendem erwarteten aktuellen Ort liefert `409 spatial_transition_command_mismatch`.
- Eine wiederholte Kommando-ID mit identischer Nutzlast liefert `409 spatial_transition_already_applied`, enthält den festgeschriebenen Snapshot und die ID der Nutzernachricht und schreibt kein zweites Mal. Der Client gleicht sich anhand der Antwort ab, statt den Zug erneut zu senden.
- Snapshot-Zeilen nutzen stabile Orts-IDs. Umbenennungen und Umhängen schreiben Snapshots nicht um.
- Eine Bootstrap-Zeile nutzt `messageId: ""` und Swipe `0`, bis ein festgeschriebener Nachrichtenanker existiert.
- Beim Löschen eines Chats, einer Nachricht oder eines Swipes werden die passenden räumlichen Zeilen an denselben Stellen entfernt oder verschoben, die heute schon Game- und Zug-Game-Snapshots pflegen.

Die neue Tabelle muss in den Datei-Tabellendefinitionen, der Liste dateigestützter Tabellen, dem Kaskadengraph, dem Profil-Backup samt Wiederherstellung und den Integritäts-Metadaten der Mari-DB registriert werden. Das Nachschlageverhalten muss durch dateinative Regressionen abgedeckt sein.

### Regeln für wirksamen Zustand und Historie

Nutze einen Resolver für APIs, Prompts, Verzweigungen und die Client-Antwort:

1. Sind eine bestimmte Nachricht und ein bestimmter Swipe angefragt, gib genau diesen räumlichen Snapshot zurück.
2. Für die aktuelle Ansicht die letzte sichtbare Assistenznachricht und ihren aktiven Swipe prüfen.
3. Hat dieser Assistenz-Swipe keine Zeile, in sichtbarer Nachrichtenreihenfolge rückwärts bis zum nächsten Nutzerzug- oder Assistenz-Snapshot gehen.
4. Andernfalls auf die Bootstrap-Zeile zurückfallen.
5. Existiert kein Snapshot und hat die aktivierte Definition einen gültigen Startort, einen Startzustand im Arbeitsspeicher zurückgeben und ihn beim ersten Owner-Zug materialisieren.

Verankerung des Owner-Zugs:

- Vor der Persistenz den Ausgangszustand aus der aktuell sichtbaren Historie auflösen, nicht allein aus der neuesten Zeile nach Zeitstempel.
- In der atomaren Zug-Transaktion die Nutzernachricht, den ersten Swipe, die Chat-Zeitstempel und einen `owner_turn`-Snapshot anlegen, verankert an dieser Nutzernachricht.
- Nach dem Speichern einer Assistenzantwort denselben Zustand unter ihrer `(messageId, swipeIndex)` als `assistant_swipe` materialisieren.
- Ein gescheiterter oder abgebrochener Anbieteraufruf lässt den angenommenen Nutzerzug und seinen räumlichen Snapshot festgeschrieben. Nach dem Neuladen sind daher der Wechsel und die gespeicherte Nutzernachricht sichtbar, ohne dass eine Assistenzantwort erfunden wird.
- Eine neue Generierung löst den Zustand unmittelbar vor der Ziel-Assistenznachricht auf und schreibt ihn in den neuen Swipe. Eine Fortsetzung behält den Zustand des Ziel-Swipes.
- Die Auswahl eines Swipes ändert den wirksamen Zustand über die bestehende Aktiv-Swipe-Zeile. Andere Snapshots werden dabei nicht umgeschrieben.
- Beim Verzweigen werden die Definition kopiert, alle kopierten räumlichen Snapshots auf die neuen Nachrichten-IDs umgeschlüsselt und die Bootstrap-Zeile eingeschlossen. Eine Verzweigung an einer früheren Nachricht kopiert nur bis zum gewählten Schnittpunkt.
- Game-Checkpoints speichern die ID des zugehörigen räumlichen Snapshots oder eine stabile Kopie seines aktuellen Orts und seiner Definitions-Revision. Beim Laden eines Checkpoints werden Spielzustand und räumlicher Zustand wiederhergestellt.

Das Bearbeiten der Definition ist nicht historisch. Eine Umbenennung oder ein Umhängen ändert den Breadcrumb, der für alte Snapshots gerendert wird, weil die stabile Orts-ID gegen die aktuelle Definition des Branches aufgelöst wird. Ein alter Snapshot darf auf einen archivierten Ort zeigen; er bleibt lesbar, doch das nächste Ziel muss ein aktiver, erreichbarer Knoten sein. Archiviert der Editor den gerade wirksamen Ort, ist `replacementCurrentLocationId` erforderlich, und der Server schreibt in derselben Transaktion wie die neue Definitions-Revision einen `definition_repair`-Snapshot am aktuellen sichtbaren Anker.

### Ablauf des atomaren Owner-Zugs

Erweitere `generateRequestSchema` und den Generierungsvertrag des Clients um das optionale `pendingSpatialTransition`. Es wird nur für Roleplay- und Game-Owner-Chats akzeptiert.

Der Server geht so vor:

1. Die bestehende Generierungssperre für den Chat holen.
2. Die Anfrage parsen und den Chat innerhalb des Anfrage-Lebenszyklus laden.
3. Gibt es keinen räumlichen Übergang, den bisherigen Nachrichtenfluss beibehalten.
4. Gibt es einen Übergang, eine konstant große Datenbanktransaktion starten.
5. Definition und sichtbaren Zustand innerhalb der Transaktion erneut lesen.
6. Owner-Modus, Aktivierungszustand, erwartete Definitions-Revision, erwarteten aktuellen Ort, Kommando-ID, Zielstatus und Erreichbarkeit validieren.
7. Nutzernachricht und ersten Swipe über eine transaktionsgebundene Chat-Speicherinstanz anlegen.
8. Den räumlichen Snapshot einfügen und die Chat-Zeitstempel aktualisieren.
9. Für Game den sichtbaren Game-Snapshot nach Möglichkeit in derselben Transaktion festschreiben.
10. Festschreiben, dann Anhänge anreichern, die Persona als Snapshot sichern, den Prompt aufbauen und die Anbieterarbeit außerhalb der Transaktion erledigen.

Validierungsfehler treten auf, bevor der optimistische Client-Zustand als maßgeblich gilt. Ein `400`-Fehler zu Graph oder Ziel und ein `409`-Fehler zu veraltetem Zustand enthalten stabile Maschinencodes, unbedenklichen Text für die Oberfläche, die aktuelle Revision und den aktuellen Breadcrumb. Namen versteckter oder blockierter Ziele enthalten sie nie.

Der Client behält gesendeten Text, Anhänge und ausstehendes Ziel, bis der Server den Zug annimmt. Bei einem Konflikt entfernt er die optimistische Nachricht, aktualisiert die Spatial-Context-Query, stellt den Entwurf wieder her und bietet **Review destinations** (Ziele prüfen) an. Bei Annahme räumt er alle drei gemeinsam auf.

### Gemeinsamer Projektionsvertrag

Der Resolver liefert strukturierte Daten, bevor irgendein Prompt-Text entsteht:

```ts
interface ResolvedOwnerSpatialProjection {
  kind: "owner";
  chatId: string;
  ownerMode: SpatialOwnerMode;
  definitionRevision: number;
  currentLocationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  description: string;
  modelMemory: string | null;
  lorebookEntryIds: string[];
  destinations: Array<{ id: string; name: string; label?: string }>;
  omittedDestinationCount: number;
}

interface ResolvedLocationVisualProjection {
  chatId: string;
  messageId: string | null;
  swipeIndex: number | null;
  locationId: string;
  breadcrumb: Array<{ id: string; name: string }>;
  visualIdentity: string | null;
  references: Array<{
    imageId: string;
    role: LocationVisualReferenceRole;
    usageNote: string | null;
    sourceLocationId: string;
    inherited: boolean;
  }>;
}

interface StoryboardVisualReferenceCandidate {
  imageId: string;
  source: "explicit" | "location" | "character" | "persona" | "inherited_style";
  entityId?: string;
  label: string;
  role: string;
  order: number;
}

interface StoryboardKeyframeReferencePayload {
  keyframeIndex: number;
  imageIds: string[];
  omitted: Array<{
    imageId: string;
    reason: "provider_limit" | "not_visible" | "missing" | "setting_disabled";
  }>;
}

interface StoryboardVisualReferenceManifest {
  sourceMessageId: string;
  sourceSwipeIndex: number;
  locationId: string | null;
  definitionRevision: number | null;
  provider: string;
  model: string;
  providerReferenceLimit: number;
  status: "ready" | "needs_review";
  candidates: StoryboardVisualReferenceCandidate[];
  keyframes: StoryboardKeyframeReferencePayload[];
  createdAt: string;
}
```

Prompt-Grenzen sind von Speichergrenzen getrennt:

- Höchstens 20 Breadcrumb-Knoten.
- Höchstens 4.000 Zeichen Owner-Beschreibung.
- Höchstens 8.000 Zeichen privates Modell-Gedächtnis.
- Höchstens 50 Ziele, deterministisch nach `sortOrder`, Name und dann ID sortiert, gefolgt nur von einer Anzahl der ausgelassenen Ziele.
- Höchstens 50 Lorebook-Referenzen des aktuellen Orts, bevor der Lorebook-Prozessor Eintrags- und Token-Budgets anwendet.
- Höchstens 6 gespeicherte visuelle Referenzen pro Ort und höchstens 2 Ortsreferenz-Kandidaten für eine gewöhnliche Szenenanfrage, jeweils vor dem Gesamtlimit des Anbieters.
- Ein Storyboard-Manifest darf alle aufgelösten Kandidaten-IDs für Nachvollziehbarkeit und Aktualisierung behalten, doch jede Keyframe-Auswahl ist durch das Anbieterlimit begrenzt, das beim Anlegen des Manifests galt.
- Höchstens 1.000 Zeichen für eine verbundene `awarenessSummary` oder den ersatzweisen Auszug der öffentlichen Beschreibung.

Ein Formatter erzeugt den gemeinsamen strukturierten Owner-Block. Roleplay und Game nutzen dünne Adapter darum herum. Der Formatter serialisiert `lorebookEntryIds` nie; die Owner-Prompt-Pipeline verarbeitet sie über den Lorebook-Prozessor. Ein zweiter Formatter, der erst in Phase 3 dazukommt, erzeugt den datenschutzreduzierten Conversation-Block und erhält kein Feld mit Ortslore.

Jeder Live-Pfad ruft denselben Resolver und Formatter unmittelbar vor der endgültigen Vorbereitung der Modellanfrage auf:

- Standard-Roleplay-Generierung.
- Game-GM-Generierung.
- `/api/generate/dryRun`.
- Live-Aufbau von Peek Prompt, wenn keine exakt gespeicherte Anfrage existiert.
- Wiederholungs- und Fortsetzungspfade, die einen Prompt neu aufbauen.

Der exakte zwischengespeicherte Peek Prompt braucht keinen neuen Aufbau. Er zeigt die bereits gespeicherte Anbieteranfrage, die den für diesen Swipe verwendeten räumlichen Block enthalten muss. Die Regressionsabdeckung muss normalisierte räumliche Blöcke aus Live-Generierung, Trockenlauf und Live-Peek-Prompt für dasselbe Fixture vergleichen.

### Vertrag für den Lorebook-verankerten Entwurf

Die Kartenverankerung ist eine ausdrückliche Eingabe beim Erstellen:

```ts
interface SpatialMapGroundingRequest {
  mode: "setup_only" | "lore_strict" | "lore_expand";
  lorebookIds: string[];
  entryIds?: string[];
}
```

Das Game-Setup füllt `lorebookIds` standardmäßig aus `GameSetupConfig.activeLorebookIds`. Roleplay füllt sie aus den aktiven globalen, verknüpften und angehefteten Büchern des Chats. Die Erstellerin kann die Auswahl vor der Generierung ändern. Deaktivierte oder ausdrücklich ausgeschlossene Bücher und Einträge werden nie gesendet.

Das ist kein Lorebook-Aktivierungsscan. Der Server liest die gewählten Quellen direkt, löst unterstützte Makros gegen den Owner-Setup-Kontext auf, ohne den aufgelösten Text zu speichern, und baut einen Katalog mit:

- Temporärem Quellschlüssel
- Eintrags- und Lorebook-Namen
- Aktivierungsschlüsseln und Tags
- Eintragsbeschreibung, sofern vorhanden
- Andernfalls einem begrenzten Inhaltsauszug

Den Katalog begrenzt der kleinste Wert aus 100 Einträgen, 16.000 Zeichen und dem Verbindungskontext, der nach der Reservierung von Setup, System und angeforderter Ausgabe übrig bleibt. Die Priorität ist deterministisch:

1. Ausdrücklich gewählte `entryIds`.
2. Einträge mit ortsartigen Tags, Namen oder Schlüsseln.
3. Einträge mit geschriebenen Beschreibungen.
4. Übrige Einträge in stabiler Lorebook- und Eintragsreihenfolge.

Fallen Einträge weg, meldet die Vorschau die Anzahl und bietet **Refine sources** (Quellen verfeinern) an. Sie erweckt nie den Eindruck, das ganze Lorebook sei berücksichtigt worden.

Der vereinfachte Modellplan ergänzt jeden vorgeschlagenen Ort um temporäre Quellschlüssel. Der Server lehnt unbekannte Schlüssel ab, ordnet gültige Schlüssel stabilen Eintrags-IDs zu, entfernt Duplikate und berechnet die Herkunft für die Vorschau:

- `Lore-backed`: mindestens ein validierter Quelleintrag.
- `Inferred`: eine Beziehung oder ein umgebender Ort, abgeleitet aus dem Quellmaterial, aber nicht als eigener Quelleintrag vorhanden.
- `Added by AI`: kein Quelleintrag stützt den Knoten.

`lore_strict` lehnt jeden Knoten ohne validierten Quellschlüssel ab. `lore_expand` akzeptiert abgeleitete und ergänzte Knoten, kennzeichnet sie aber sichtbar. Ein gültiger Quellschlüssel belegt die Herkunft, nicht die inhaltliche Treue; die Vorschau muss daher Quellauszüge zeigen, damit die Erstellerin eine falsch gelesene Beziehung oder einen falschen Namen vor **Apply** bemerkt.

Der Generierungsendpunkt liefert die normalisierte Entwurfsdefinition plus eine flüchtige Herkunftszuordnung, geschlüsselt nach generierter Orts-ID. Nach **Save** bleiben nur die `lorebookEntryIds` erhalten. Ersetzen und Erweitern behalten die bestehenden Historienschutzmechanismen; eine Erweiterung darf Bindungen an neue Knoten ergänzen, aber bestehende Orte oder Bindungen nicht umschreiben.

### Abgrenzung zur Game-Kompatibilität

Ist Spatial Context für einen Game-Chat aktiv:

- `SpatialContextSnapshot.currentLocationId` ist maßgeblich.
- Das `location`-Feld des Spielzustands ist nur noch eine Kompatibilitätsprojektion.
- GET-Antworten zum Spielzustand und die Tracker-Oberfläche erhalten den aufgelösten Breadcrumb als angezeigten Ort.
- Patches des World-State-Agenten und manuelle Patches am Game-Tracker können `location` nicht eigenständig schreiben; der Server verwirft das Feld mit einer Debug-Diagnose oder liefert bei ausdrücklichen manuellen Änderungen einen Konflikt auf Feldebene.
- Neue Game-Snapshots spiegeln den Breadcrumb in ihren alten `location`-Wert, damit Sitzungshistorie und bestehende Oberfläche lesbar bleiben; der Prompt-Code liest dennoch die räumliche Projektion.
- Eine Game-Karte, eine Rasterzelle oder ein Knoten darf sich ausdrücklich an eine stabile Hierarchie-Orts-ID binden.
- Die Auswahl eines gebundenen Ziels erzeugt einen strukturierten ausstehenden räumlichen Übergang und fügt keinen Bewegungstext ein.
- Bewegung an ungebundenen Zellen und Knoten bleibt taktisch und ändert nur die Position der Party.
- Beim Betreten eines gebundenen Orts wird dessen lokale Karte gewählt, sofern vorhanden; beim Verlassen die nächstgelegene gebundene Vorfahrenkarte, sofern vorhanden.
- Sind beide Systeme sichtbar, kennzeichnet die Oberfläche sie klar als `Story location` und `Map position`.
- Beim Deaktivieren von Spatial Context gilt sofort wieder das bisherige Game-Ortsverhalten, ohne dass räumliche Definitionen oder Snapshots gelöscht werden.

Negativkontrollen müssen belegen, dass ein vom Modell ausgegebener Game-Orts-Patch, eine manuelle Tracker-Änderung und ein Klick auf eine ungebundene Karte `currentLocationId` nicht ändern können. Positivkontrollen belegen, dass ein gültiger gebundener Klick den normalen Übergangs-Validator nutzt.

### Vertrag für die Owner-Oberfläche

**Chat Settings** erhält genau einen kompakten Abschnitt `Hierarchical Map`, nur für Roleplay und Game. Er zeigt Aktivierungszustand, aktuellen Breadcrumb, Anzahl aktiver und archivierter Orte, Anzahl der Warnungen sowie **Open Map Editor** (Karteneditor öffnen). Den vollständigen Editor bettet er nicht in das Panel ein.

Der Orts-Editor folgt der bestehenden Route für ganzseitige Editoren:

- Am Desktop gibt es einen Hierarchie-Navigator, eine lokale Karten- oder Ebenenansicht und einen Inspektor für den gewählten Ort.
- Mobil erscheint zuerst die Hierarchie, dann die Details, mit sichtbarer Aktion **Back to locations** (Zurück zu den Orten). Keine Operation hängt an Hover oder Ziehen.
- Zeilen bieten über beschriftete Bedienelemente das Anlegen von Kind- und Geschwisterorten, Umhängen, Duplizieren eines Teilbaums, Archivieren und Verknüpfen.
- Die lokale Ansicht rendert Kindorte als positionierte Kartenknoten, als geordnete Ebenen oder als barrierefreie Liste.
- Die Auswahl zeigt eine Ortsvorschau; eine eigene Aktion **Enter** navigiert dorthin.
- Der Inspektor enthält Name, Art, öffentliche Beschreibung, privates Modell-Gedächtnis, Icon, Darstellung, Platzierung oder Ebenenreihenfolge, Status, Elternort, direkte Verknüpfungen und verknüpfte Lore.
- Die visuelle Identität ist ein Inline-Abschnitt im Inspektor, kein blockierendes Fenster. Sie zeigt zuerst die primäre Vorschau, dann ergänzende Referenzen, Rolle, Nutzungshinweis, Vererbungszustand, gebrochenen Zustand und Metadaten zur Bildquelle.
- Galerieauswahl und Upload nutzen die bestehenden Bild-Bedienelemente weiter. **Generate establishing reference** (Establishing-Referenz generieren) öffnet eine Vorschau; das Übernehmen des Bildes und das Setzen als primär sind ausdrückliche Aktionen.
- Eine generierte Szene bietet **Set as location reference** über ihre bestehenden Bildaktionen an. Der Ort ändert sich nie allein deshalb, weil die Szene dort generiert wurde.
- Verknüpfte Lore nutzt eine durchsuchbare Inline-Aufklappung statt eines blockierenden Fensters. Ergebnisse gruppieren Einträge nach Lorebook und zeigen deaktivierten oder ausgeschlossenen Zustand schon vor dem Anhängen.
- Angehängte Zeilen bieten **Open entry** und **Detach**. **Detach** löscht nie Lore, und das Duplizieren eines Teilbaums kopiert die Bindungen mit.
- Der Lorebook-Editor zeigt die Karten-Backlinks des aktuellen Chats, damit sich jeder Ort finden lässt, der einen Eintrag nutzt.
- Die Bedienelemente für den KI-Entwurf zeigen Quellbücher, Verankerungsmodus, Anzahl berücksichtigter und ausgelassener Einträge sowie die Herkunft – ohne technisches Prompt-Wissen vorauszusetzen.
- Die Validierung erfolgt inline und zusätzlich als Zusammenfassung neben **Save**. Die Auswahl eines Eintrags der Zusammenfassung springt zum betroffenen Knoten und Feld.
- Der Editor arbeitet mit einer lokalen Arbeitskopie und einer revisionierten Aktion **Save**. `editorDirty` schützt die Navigation. Bei Serverkonflikten bleibt die Arbeitskopie erhalten, und es erscheinen **Reload server version** (Serverstand neu laden) sowie **Review differences** (Unterschiede prüfen); ein blindes Überschreiben gibt es nicht.
- Der Leerzustand lehrt die erste Aktion: `Create a starting location`. Die Aktivierung ist gesperrt, bis ein gültiger aktiver Startort existiert.
- Beim Laden gilt die bestehende Skelett-Darstellung der Editoren. Zustände für Speichern, Konflikt, Archiviert, Versteckt, Blockiert und Ungültig nutzen Text oder Icons zusätzlich zur Farbe.

Die Owner-Chat-Oberflächen teilen sich `SpatialContextRuntimeBar`:

- Der gespeicherte Breadcrumb steht sichtbar über oder neben der Eingabe, ohne den Geschichtsinhalt zu verdecken.
- Die Zielauswahl listet Elternort, Kindorte und direkte Verknüpfungen in beschrifteten Gruppen und behält die deterministische Reihenfolge bei.
- Die Auswahl eines Ziels erzeugt einen klar gekennzeichneten ausstehenden Chip. Der Zustand ändert sich dadurch nicht sofort.
- Der Chip lässt sich entfernen und übersteht zusammen mit dem Textentwurf einen Chatwechsel oder ein Neuladen.
- Gesendet werden können Text, Anhänge oder nur ein ausstehendes Ziel. Der Übergang ist Anfragedaten und wird nicht an den sichtbaren Nachrichtentext angehängt.
- Ein veraltetes ausstehendes Ziel bleibt nach einem Konflikt sichtbar, markiert mit `Needs review`, bis ein gültiger Ersatz gewählt oder der Chip entfernt wird.
- Auf schmalen Bildschirmen kürzt der Breadcrumb in der Mitte, behält den Namen des aktuellen Orts und macht den vollen Pfad über eine barrierefreie Aufklappung zugänglich.

Editor und Laufzeit-Bedienelemente nutzen die bestehenden semantischen Theme-Tokens, unterstützen dunkle, helle und SillyTavern-Themes, halten 44 px Berührungsfläche für primäre mobile Aktionen ein und zeigen sichtbare Fokuszustände. Bewegung beschränkt sich auf Zustandsübergänge von 150 bis 250 ms und verschiebt Layout nie rein dekorativ.

### Abdeckung von Portabilität und Lebenszyklus

Der native Marinara-Chat-Export muss mitführen:

- Die aktuelle Definition in `marinara_metadata`.
- Räumliche Snapshots, geschlüsselt nach exportierter Nachrichten-Ordinalzahl und Swipe-Index, nicht nach Anzeigenamen.
- Den Bootstrap-Snapshot, sofern vorhanden.

Beim Import entstehen neue Chat-, Nachrichten- und Snapshot-IDs, während die Orts-IDs innerhalb der Definition erhalten bleiben. Fehlerhaft importierte Graphen deaktivieren Spatial Context, bewahren die Rohdefinition zur Reparatur und liefern Warnungen. Sie werden nie stillschweigend über Namen abgeglichen oder teilweise aktiviert.

Der Chat-JSONL-Export bewahrt die Zuordnung von Ort zu Eintrags-ID, weil sie Teil der Definition ist, bündelt aber keine Lorebook-Inhalte im Verborgenen. Der Import löst Referenzen gegen das Zielprofil auf und meldet fehlende Einträge als reparierbare Warnungen, ohne Namensabgleich. Profil-Backup und -Wiederherstellung bewahren funktionierende Referenzen, weil sie sowohl räumliche Definitionen als auch Lorebook-Tabellen mitnehmen. Ein künftiges ausdrückliches Kampagnenpaket könnte referenzierte Lorebooks für die profilübergreifende Portabilität bündeln.

Chat-JSONL bewahrt außerdem die Zuordnung von Ort zu Bild-ID, Rollen, Nutzungshinweise und Reihenfolge, bettet aber keine Bilddaten ein. Der Import löst diese IDs gegen das Zielprofil auf und meldet fehlende Bilder als reparierbare Warnungen, ohne Pfad- oder Dateinamensabgleich. Profil-Backup und -Wiederherstellung enthalten die Datensätze und Dateien der Profil-Galerie. Ein künftiges ausdrückliches Kampagnenpaket könnte `Include location images` anbieten, mit Anzahl der Assets, Gesamtgröße und Lizenzhinweis vor dem Export.

Wird der bestehende Storyboard-Lebenszyklus exportiert oder kopiert, bewahrt sein visuelles Manifest die Ordinalzahl der Quellnachricht und den Swipe, die aufgelöste Orts-ID, die Kandidaten-Bild-IDs und die Keyframe-Reihenfolge, ohne Bilddaten einzubetten. Der Import bildet Nachrichten- und Storyboard-IDs neu ab, löst Galerie-Bild-IDs im Zielprofil auf und markiert fehlende Assets als `needs_review`. Alte Storyboards ohne Manifest lösen bei der ersten neuen Generierung eines aus ihrer gespeicherten Quellnachricht und ihrem Swipe auf; sie fallen nie auf Namensabgleich oder den aktuellsten Chat-Ort zurück.

Profil-Backup und -Wiederherstellung schließen die neue Tabelle über `FILE_BACKED_TABLES` ein. Das Löschen von Chats, Massenlöschungen, Expunge, das Löschen von Verzweigungen, Swipes und Nachrichten folgen den bestehenden Kaskaden- und Aufräumpfaden. Bestehende Chats brauchen keine vorgezogene Migration, denn fehlende Metadaten bedeuten deaktivierten Spatial Context.

### Arbeitspakete und Merge-Reihenfolge

#### Paket A: Kernvertrag und Nachweis-Spike

- Gemeinsame Typen, Schemas, reine Graph-Helfer, Grenzen, Fixtures und stabile Fehlercodes ergänzen.
- Ein temporäres Nachweisgerüst für konstant große Transaktionen gegen die dateinative Speicherung ergänzen. Keine `.test.ts`-Dateien behalten.
- Den Zustands-Resolver mit Fixtures für Bootstrap, sichtbaren Swipe, früheren Verzweigungspunkt, archivierten historischen Ort und veraltete Definition nachweisen.
- Projektionsgrößen für flache, 20 Ebenen tiefe, 500 Orte breite, textlastige und stark verknüpfte Graphen messen.

Freigabe: Graph-Semantik, Projektionsgrenzen, Snapshot-Anker und Transaktionstauglichkeit sind belegt, bevor die Arbeit an der Oberfläche beginnt.

#### Paket B: Definitions-API und Speicherung

- Schema, Migration, Registrierung als dateigestützte Tabelle, Speicheradapter, GET und revisioniertes PUT ergänzen.
- Ersatz des aktuellen Orts für Archivvorgänge ergänzen.
- Löschen, Swipe-Verschiebung sowie Profil-Backup und -Wiederherstellung anschließen.
- Server-Regressionsabdeckung für Revisionskonflikte, ungültige Graphen, versteckte Fehler und Kommando-Wiederverwendung ergänzen.

Freigabe: Definitionen und Snapshots laufen auf beiden Speicher-Backends fehlerfrei hin und zurück, und ungültige Schreibvorgänge hinterlassen keinen Teilzustand.

#### Paket C: Integration von Owner-Zug und Historie

- Die Generierungsanfrage um `pendingSpatialTransition` erweitern.
- Atomare Owner-Zug-Persistenz und Materialisierung im Assistenz-Swipe ergänzen.
- Neue Generierung, Fortsetzung, aktive Swipes, Verzweigungen und Game-Checkpoints einbinden.
- Nativen Chat-Export und -Import von Definitionen und Snapshots ergänzen.

Freigabe: Neuladen, Anbieterausfall, Swipe-Wechsel, Verzweigen an einer früheren Nachricht, Import/Export und Checkpoint-Wiederherstellung lösen den erwarteten Ort auf.

#### Paket D: Prompt-Projektion und Game-Autorität

- Strukturierte Projektion und begrenzte Formatter ergänzen.
- Live-Generierung, Game-GM, Trockenlauf, Live-Peek-Prompt, Wiederholungen und Fortsetzungen einbinden.
- Die Game-Kompatibilitätsgrenze und die Breadcrumb-Anzeige im Tracker durchsetzen.
- Negativkontrollen für Datenschutz und inaktive Orte ergänzen.

Freigabe: Alle Prompt-Pfade enthalten denselben räumlichen Block, kein Text fremder Orte gelangt nach außen, und Game kann keinen konkurrierenden maßgeblichen Ort führen.

#### Paket E: Kartenbrowser und Editor

- React-Query-Hooks, Konfliktzuordnung, Einstellungs-Zusammenfassung und verzögert geladene Editor-Route ergänzen.
- Abläufe für Hierarchie, lokale Karte, Ebenen, Liste, Vorschau, Inspektor und Teilbaum-Duplikat ergänzen.
- Barrierefreie Desktop- und Mobilzustände ergänzen.
- Ungespeicherte Änderungen über Revisionskonflikte hinweg bewahren.

Freigabe: Erstellerinnen können verschachtelte Karten ohne Ziehen, Hover oder präzise Eingabe aufbauen und reparieren.

#### Paket E.1: KI-gestützter Kartenentwurf

- Einen auf Anforderung laufenden Generator zur Setup-Zeit ergänzen, der begrenzten Game- oder Roleplay-Setup-Kontext nutzt, nie implizite Änderungen zur Zug-Zeit.
- Einen vereinfachten, geschlüsselten Kartenplan erzeugen, dann stabile IDs vergeben, unbedenkliche Layout-Lücken reparieren und die vollständige Definition serverseitig validieren.
- Die generierte Hierarchie als lokalen Entwurf zeigen, bevor der Editor-Zustand ersetzt wird.
- Ausdrückliche Aktionen **Apply** und **Save** verlangen; die Generierung aktiviert Spatial Context nie von selbst und schreibt keine Definition.
- Gewöhnliche Chat-Historie aus dem Generierungs-Prompt heraushalten und die endgültigen Prompts über das Debug-Log zugänglich machen.

Freigabe: Eine nichttechnische Erstellerin kann eine Welt beschreiben, eine gültige verschachtelte Karte erhalten, sie prüfen und ablehnen oder übernehmen, ohne dass sich vor **Save** der gespeicherte Zustand ändert.

#### Paket E.1.1: historiensichere KI-Kartenerweiterung

- Die KI-Erstellung einer ganzen Karte als Ablauf vor der Kampagne behandeln. Sobald nachrichtenverknüpfte räumliche Historie existiert, bleibt serverseitig jede bestehende Orts-ID erhalten.
- Den Generator für laufende Kampagnen durch einen rein additiven Erweiterungsablauf ersetzen, begrenzt auf einen gewählten aktiven Ort.
- Aktuellen Ort, Startort, bestehende Beschreibungen, Verknüpfungen, Layout, archivierte Knoten und künftige Game-Bindungen bewahren. Neue stabile IDs bekommen nur hinzugefügte Orte.
- Die Erweiterung weiterhin auf begrenzten Setup- und Kontext des gewählten Orts stützen, nicht auf gewöhnliche Zug-Historie.
- Neue Orte als lokalen Entwurf zeigen und die bestehende Grenze aus **Apply** und **Save** beibehalten.
- Das Ersetzen der ganzen Karte nur erlauben, solange keine festgeschriebene räumliche Historie existiert; ist bereits eine Karte vorhanden, ist die Erweiterung der sicherere Standard.

Freigabe: Die KI kann eine aktive Kampagnenkarte erweitern, ohne Zug-Snapshots verwaisen zu lassen, den aktuellen Ort zu ändern oder bestehende IDs zu ersetzen.

#### Paket E.2: Kartenoption im Game-Einrichtungsassistenten

- Dem bestehenden Schritt **Features** die optionale Auswahl `Draft a hierarchical world map` mit einfacher Größenwahl hinzufügen.
- Die Kartengenerierung erst starten, nachdem `/game/setup` Weltüberblick und Handlungsbogen gespeichert hat. Ein Spielzug ist nicht nötig.
- Das Setup sichtbar beschäftigt halten, während der Folgeentwurf entsteht – auch nachdem eine reparierte Setup-Nutzlast angewendet wurde.
- Nach der Generierung die normale KI-Vorschau und den Karteneditor öffnen. Überspringen führt zurück ins Spiel, **Apply** ändert nur die Arbeitskopie, und **Save** bleibt die Grenze zur Persistenz.
- Scheitert die Kartengenerierung, das erfolgreich erstellte Spiel bewahren, den Fehler erklären und die Karte später über **Chat Settings** ermöglichen.
- Den vollständigen Karteneditor nicht in den schmalen Einrichtungsassistenten einbetten und keine generierte Definition stillschweigend aktivieren und speichern.

Freigabe: Eine Erstellerin kann schon beim Setup eine reichere Startkarte anfordern, ohne aus unvollständigem lokalem Assistentenzustand zu generieren oder die Prüfung zu umgehen.

#### Paket F: Laufzeit-Oberfläche für Roleplay und Game

- Die gemeinsame Laufzeitleiste und die Speicherung ausstehender Übergänge je Chat ergänzen.
- Die Sendepfade von Roleplay und Game einbinden, ohne den sichtbaren Nachrichtentext zu verändern.
- Ausdrückliche Bedienelemente zur Bindung von Game-Karte, -Zelle und -Knoten ergänzen.
- Nach angenommenen Übergängen gebundene Karten wählen und dabei ungebundene taktische Bewegung bewahren.

Freigabe: Roleplay und Game können sich bewegen, sich von veraltetem Zustand erholen, neu laden, den Chat wechseln und die Funktion mit Tastatur und Touch bedienen.

#### Paket F.1: Lorebook-Bindungen an Orte und Laufzeit-Aktivierung

- Gemeinsames Schema und Editor-Arbeitskopie um begrenzte `lorebookEntryIds` erweitern.
- Inline-Bedienelemente zum Anhängen an die Karte, Lorebook-Backlinks und Warnungen zu gebrochenen Referenzen ergänzen.
- Die gemeinsame Lorebook-Verarbeitung um erzwungene Kandidaten-IDs, Deduplizierung nach Aktivierungsquelle, Ausschlüsse und die reservierte Ortslore-Obergrenze erweitern.
- Denselben Resolver in die Pfade von Roleplay, Game-GM, Trockenlauf und Live-Peek-Prompt einbinden.
- Meldungen zu Quellen und Kürzungen in Active Context ergänzen.
- Referenz-IDs über Verzweigungen sowie JSONL-Export und -Import bewahren und warnen, wenn Lore am Ziel fehlt.

Freigabe: Ein Ortswechsel aktiviert in jedem Owner-Prompt-Pfad nur die aktivierte verknüpfte Lore des Ziels, ohne doppelte Einfügung und ohne Abfluss nach Conversation.

#### Paket F.2: Lorebook-verankerter Kartenentwurf

- Verankerungsmodus und ausdrückliche Quellauswahl in Anfragen zum Erstellen, Ersetzen und Erweitern ergänzen.
- Den begrenzten Quellkatalog aus den gewählten Lorebooks aufbauen, nicht aus gewöhnlichem Chat-Scannen.
- Temporäre Quellschlüssel validieren und gültige Einträge automatisch an generierte Knoten binden.
- Die Herkunft `Lore-backed`, `Inferred` und `Added by AI` samt Quellansicht in der Entwurfsvorschau zeigen.
- In `Strict canon` quellgestützte Knoten erzwingen und in `Canon with expansion` unbelegte Ergänzungen sichtbar machen.
- Die historiensichere, rein additive Erweiterung und die bestehende Prüfgrenze aus **Apply** und dann **Save** bewahren.

Freigabe: Ausgewählte Lorebook-Fakten verankern die generierte Hierarchie unmittelbar, jeder unbelegte Ort ist vor **Save** sichtbar, und der strikte Modus kann keinen unreferenzierten generierten Knoten speichern.

#### Paket F.3: Visuelle Ortsidentität und Referenzen für Szenengrafik

- Begrenzten Text zur visuellen Identität und stabile Bindungen an die Profil-Galerie in Ortsschema und Editor-Arbeitskopie ergänzen.
- Den Inline-Editor für visuelle Identität, primäre und ergänzende Rollen, ausdrückliche Stilvererbung, Galerie-Backlinks und die Reparatur gebrochener Referenzen ergänzen.
- Die parallelen Schalter je Chat für die Anbieternutzung durch Illustrator und Game ergänzen, mit Zustimmung beim ersten primären Bild und rückwärtskompatiblem Aus-Standard.
- Generierung einer Establishing-Referenz auf Anforderung und ausdrückliche Beförderung geprüfter generierter Szenen ergänzen.
- Den zu Nachricht und Swipe passenden Ort für Anfragen des Roleplay-Illustrators und der Game-Szenengrafik auflösen.
- Ausdrückliche, Orts-, Charakter-, Persona- und vererbte Stil-Kandidaten deterministisch unter dem bestehenden Limit jedes Anbieters zusammenführen, mit sichtbaren Auslassungsgründen.
- IDs und Metadaten über Verzweigungen und JSONL bewahren, Binärdateien in Profil-Backup und -Wiederherstellung einschließen und Negativkontrollen für Geschichts-Prompts und Conversation ergänzen.

Freigabe: Wiederholte Grafik an einem Ort kann eine geprüfte Ortsidentität wiederverwenden – mit deterministischen, sichtbaren Abwägungen gegenüber Charakterreferenzen –, historische Nachrichtengrafik löst ihren historischen Ort auf, und keine rein visuellen Daten gelangen in Text-Prompts.

#### Paket F.3.1: Manifeste visueller Referenzen im Storyboard

- F.3.1 als nachgelagerten Konsumenten von F.3 und als eigenständig prüfbare Änderung führen; die Persistenz-Freigabe von F.3 wächst dadurch nicht.
- Eine eingefrorene Referenzbank und ein geordnetes Manifest je Keyframe in den Storyboard-Metadaten ergänzen.
- Die Ortsauflösung an Quellnachricht und Swipe des Storyboards verankern und denselben Ortskandidaten über seine Bilder hinweg wiederverwenden.
- Charakter- und Persona-Referenzen aus der Liste sichtbarer Charaktere jedes Keyframes wählen und nie Kapazität an Figuren außerhalb des Bildes verschwenden.
- Prioritäten für ausdrückliche Referenzen, einen Slot, mehrere Slots, ergänzende Referenzen und vererbten Stil deterministisch über den bestehenden Resolver für Anbieterfähigkeiten anwenden.
- Progressive `Visual sources`, Auslassungsgründe, Needs-Review-Konflikte und ausdrückliches **Refresh references** in Vorschau und erneuter Generierung ergänzen.
- Das bisherige Storyboard-Verhalten bewahren, wenn Spatial Context deaktiviert ist oder keine geeignete Ortsreferenz existiert.

Freigabe: Die erneute Generierung eines Keyframes nutzt seine eingefrorene Auswahl wieder, Orts- und Charakterauswahl sind historisch korrekt und einsehbar, und eine geänderte Anbieterkapazität kann ein bestehendes Storyboard nicht stillschweigend verändern.

#### Paket G: verbundener Conversation-Chat

- Erst umsetzen, wenn die Pakete A bis F.3.1 stabil sind.
- Den verknüpften Owner zur Generierungszeit auflösen und den reduzierten Projektions-Formatter nutzen.
- Zurückhaltende Formulierungen zur Anwesenheit und eine Nur-Lese-Oberfläche ergänzen.
- Trennen, erneutes Verknüpfen, gelöschten Owner, fehlerhafte wechselseitige Verknüpfungen, Zyklen und das Verhalten bei abgeschlossenen Geschichten nachweisen.

Freigabe: Conversation erhält nie privates Modell-Gedächtnis, interne IDs, versteckte Ziele, ortsverknüpfte Lore-IDs oder -Inhalte, IDs oder Inhalte visueller Ortsreferenzen oder die Fähigkeit zur Änderung.

Vom Modell angeforderte Bewegung, Vorlagen für Erstellerinnen, portable Kampagnenpakete, das Ableiten von Karten aus Bildern, die Massengenerierung von Ortsgrafik, die automatische Mehransichts-Auswahl von Charakterreferenzen und Positionen je Charakter bleiben eigene spätere Pakete – nach dem Ausliefern der Arbeiten zu Owner-Verankerung, visueller Identität und Storyboard-Manifest.

### Abgrenzung von Issues und Pull Requests

Das ist eine große Funktion im Rahmen des Repository-Workflows. Bevor die Umsetzung von Paket A beginnt:

1. Das eine Tracking-Issue bestätigen oder anlegen und die Zuständigkeit dort sichtbar machen.
2. Nach einem bestehenden Issue-Branch, einem Pull-Request-Entwurf oder einem Eintrag im Projektboard suchen.
3. Sobald die Umsetzung startet, einen Pull-Request-Entwurf gegen `staging` öffnen.
4. Die Arbeitspakete nach Möglichkeit als prüfbare PR-Grenzen nutzen; Owner-MVP und verbundenen Conversation-Chat nicht bloß zusammenlegen, um weniger PRs zu haben.

Vorgeschlagene Aufteilung der Issues:

1. Gemeinsamer Kern, Persistenz und Definitions-API für Spatial Context.
2. Owner-Zug-Snapshots, Swipes, Verzweigungen, Checkpoints und Portabilität.
3. Owner-Prompt-Projektion und Game-Kompatibilität.
4. Owner-Editor und Laufzeit-Oberfläche für Bewegung.
5. Lorebook-Bindungen an Orte und Owner-Laufzeit-Aktivierung.
6. Lorebook-verankerter Kartenentwurf.
7. Visuelle Ortsidentität und Auflösung von Referenzen für Szenengrafik.
8. Eingefrorene Manifeste visueller Referenzen im Storyboard.
9. Nur-Lese-Projektion für den verbundenen Conversation-Chat.
10. Vom Modell angeforderte Bewegung.

### Nachweismatrix

| Behauptung | Automatischer Nachweis | Manueller Nachweis |
| --- | --- | --- |
| Die Lore-Aktivierung am Ort ist exakt und begrenzt | Fixtures decken angenommene Bewegung, ausstehende und abgelehnte Bewegung, deaktivierte und ausgeschlossene Einträge, doppelte Aktivierungsquellen, Token-Kürzung, Neuladen, Swipes und Verzweigungen ab | In Roleplay und Game zwischen zwei unterschiedlich verknüpften Orten wechseln, dann Active Context und Peek Prompt prüfen |
| Die Lorebook-Verankerung ist einsehbar | Strict-Mode-Fixtures lehnen unreferenzierte Knoten ab; Erweiterungs-Fixtures bewahren validierte Quellschlüssel und kennzeichnen unbelegte Knoten; Katalogobergrenzen und Auslassungszahlen sind deterministisch | Aus einem großen bestehenden Lorebook entwerfen, Quellauszüge öffnen, `Strict canon` und `Canon with expansion` vergleichen und einen erfundenen Ort ablehnen |
| Ortsgrafik bleibt konsistent und begrenzt | Fixtures decken exakte Ortsauswahl, historische Swipe-Auflösung, ausdrückliche Stilvererbung, fehlende Bilder, Anbietergrenzen, Anfragearten und deterministische Auslassungsgründe ab | Eine primäre Referenz setzen, mehrere Game- und Roleplay-Szenen am selben Ort generieren, weiterziehen, Grafik für einen älteren Swipe wiederholen und die Vorschau der visuellen Quellen prüfen |
| Storyboard-Referenzen sind reproduzierbar | Fixtures decken die Verankerung am Quell-Swipe, eingefrorene Bänke, Auswahl sichtbarer Charaktere, Anbieter mit einem und mit mehreren Slots, fehlende Assets, geringere und höhere Ersatzkapazität, alte Manifeste und ausdrückliche Aktualisierung ab | Ein mehrbildriges Storyboard erzeugen, Orte wechseln, ein primäres Charakter- und Ortsbild ändern, vor und nach **Refresh references** neu generieren und die `Visual sources` jedes Bildes prüfen |
| Die Graph-Validierung ist deterministisch | Eigenes räumliches Regressionsskript mit positiven und negativen Fixtures | Inline-Fehler im Editor für repräsentative ungültige Knoten prüfen |
| Wechsel und Nutzernachricht sind atomar | Eingeschleuster Speicherfehler vor und nach jedem Transaktionsschreiben auf beiden Backends | Eine veraltete Revision erzwingen, während Entwurf und Ziel ausstehen |
| Die Historie stellt den richtigen Ort wieder her | Snapshot-Regression für Neuladen, Swipes, neue Generierung, Verzweigungsschnitt und Checkpoint | Jeden Ablauf in Roleplay und Game durchspielen |
| Die Prompt-Pfade stimmen überein | Normalisierte Blöcke aus Generierungs-Helfer, Trockenlauf und Live-Peek-Prompt vergleichen | Peek Prompt und Debug-Ausgabe für je einen Chat pro Owner-Modus prüfen |
| Der Kontext bleibt begrenzt | Breite und textlastige Fixtures prüfen Zeichen- und Zielobergrenzen | Eine tiefe und breite Hierarchie im Editor und in der Zielauswahl prüfen |
| Der Datenschutz hält | Negativ-Assertions für privates Gedächtnis, versteckte Verknüpfungen, inaktive Knoten, fremde Beschreibungen, ortsverknüpfte Lore-IDs und -Inhalte sowie alle Felder und Daten visueller Ortsreferenzen | In Phase 3 einen Conversation-Chat verknüpfen und seine Text- und Bildanfrage-Vorschauen prüfen |
| Game hat genau eine Ortsautorität | Alte Patches ablehnen; gebundene Übergänge validieren; ungebundene Bewegung bewahren | Tracker-Änderung, gebundene und ungebundene Kartenwechsel, Checkpoint-Laden, Aktivieren und Deaktivieren ausprobieren |
| Die Oberfläche ist robust | Playwright-Ablauf für Anlegen, Bearbeiten, ausstehenden Wechsel, Konflikt und mobile Navigation | Dunkel, Hell, SillyTavern, Tastatur, Touch, lange Namen und Leerzustände prüfen |
| Die Portabilität bewahrt IDs und Zustand | Nativer Export/Import und Profil-Backup/-Wiederherstellung decken Bindungen zu Raum, Lore, Bild und Storyboard-Manifest ab; fehlende Lore oder Bilder am Ziel erzeugen Warnungen | Einen verzweigten Chat mit Storyboard exportieren, ihn mit und ohne seine Lorebooks und Galerie-Assets importieren und Breadcrumb, Historie, Bindungen, eingefrorene Keyframe-Quellen und Warnungen prüfen |

Ergänze `scripts/regressions/spatial-context.regression.ts` und ein Paketskript `regression:spatial`, und nimm es dann in `pnpm regression` auf. Keine dauerhaften `.test.ts`-Dateien hinzufügen. Jeder Umsetzungs-PR führt weiterhin die schmale räumliche Regression plus die zu seinem Umfang passenden Repository-Prüfungen aus.

## Abnahmekriterien

- Ein Kartenort speichert Referenzen auf Lorebook-Einträge, nie kopierte Lore-Inhalte.
- Ein Ort speichert optionale Metadaten zur visuellen Identität und stabile Galerie-Bildreferenzen, nie rohe Pfade, externe URLs oder Bilddaten.
- Bildstil-Profile steuern den Darstellungsstil, Ortsreferenzen die Ortsidentität und Charakter- oder Persona-Referenzen die Identität des Motivs.
- Zugelassene Anfragen für Szenengrafik lösen den exakten Ort zu ihrer Nachricht und ihrem Swipe auf, auch bei historischen Wiederholungen, und gleichen einen Ort nie unscharf über den Namen ab.
- Generierte Grafik wird erst nach einer ausdrücklichen Aktion der Erstellerin zur Ortsreferenz.
- Layout-Referenzen gelangen nie automatisch in gewöhnliche Szenengenerierung, und nur Stilreferenzen dürfen an Nachfahren vererbt werden.
- Text-Prompts und der verbundene Conversation-Chat erhalten keine IDs, Daten, Pfade oder rein visuellen Notizen visueller Ortsreferenzen.
- Storyboard löst den Ort aus Quellnachricht und Swipe auf, friert Referenzbank und geordnete Keyframe-Auswahl ein und nutzt sie bei neuen Generierungen weiter, bis ausdrücklich aktualisiert wird.
- Jedes Storyboard-Keyframe wählt Referenzen nur für seinen aufgelösten Ort und seine sichtbaren Personen; Figuren außerhalb des Bildes verbrauchen nie Kapazität.
- Das Verhalten bei Anbietern mit einem und mit mehreren Slots ist deterministisch und sichtbar, und ein Anbieterwechsel ergänzt, entfernt oder ersetzt eingefrorene Referenzen nie stillschweigend.
- Storyboard-Manifeste speichern stabile IDs und Metadaten, nie Bilddaten oder Dateisystempfade.
- Alte Storyboards ohne Manifest nutzen als implizite Reparatur nie den Ortsnamen-Abgleich oder den aktuellsten Chat-Ort.
- Nur der angenommene exakte aktuelle Ort erzwingt die Aktivierung verknüpfter Lore, und zwar unter den Regeln zu Deaktivierung, Ausschluss, Deduplizierung, Reihenfolge, Eintragsgrenze und Token-Budget.
- Active Context weist die Aktivierung durch den aktuellen Ort, kombinierte Aktivierungsquellen und deterministische Kürzung aus.
- Der verankerte Entwurf liest ausdrücklich gewählte Lore-Einträge direkt, statt sich auf Schlüsselwort-Scans oder generierte Weltüberblicke zu stützen.
- `Strict canon` erzeugt nur quellgestützte Orte; `Canon with expansion` kennzeichnet jede abgeleitete oder unbelegte Ergänzung vor **Save**.
- Der verbundene Conversation-Chat erhält keine ortsverknüpften Lore-IDs oder -Inhalte.
- Umbenennen und Umhängen bewahren die Ortsidentität.
- Ungültige Graphen und veraltete Schreibvorgänge ändern den Zustand nie.
- Bewegung wird mit einem Nutzerzug festgeschrieben oder gar nicht.
- Neuladen, Swipe-Auswahl, Verzweigen an einer früheren Nachricht und das Laden eines Game-Checkpoints lösen den richtigen Ort auf.
- Owner-Prompts enthalten nur den Kontext des aktiven Orts und gültige Ziele.
- Ist die Funktion aktiv, zeigt Game keinen konkurrierenden Freitext-Ort an und promptet auch nicht daraus.
- Bestehende Game-Karten können sich ausdrücklich an Hierarchie-Orte binden, ohne die taktische Bewegung zu stören.
- Roleplay und Game nutzen dieselben Hierarchie- und Übergangsregeln.
- Trockenlauf und Peek Prompt verhalten sich bei der Projektion genauso wie die Generierung.
- Bestehende Chats und deaktivierter Spatial Context behalten ihr bisheriges Verhalten.
- Conversation kann räumlichen Zustand weder besitzen noch ändern.
- Privates Modell-Gedächtnis gelangt nie in die Conversation-Projektion.

## Validierung

Die deterministische Abdeckung muss enthalten: Graph-Grenzen, Zyklen, Navigationsrichtungen, versteckte und blockierte Verknüpfungen, veraltete Revisionen, Idempotenz, Verzweigungspunkte, Swipes, Checkpoints, Grenzen für Lorebook-Referenzen, erzwungene Aktivierung, Ausschlüsse, Deduplizierung, Token-Kürzung, Obergrenzen des Verankerungskatalogs, Validierung der Quellschlüssel, Ablehnung im strikten Modus, Herkunft, Grenzen visueller Referenzen, Regeln zu Primär und Vererbung, historische visuelle Auflösung, Kürzung durch den Anbieter, Warnungen bei fehlenden Bildern, Ausschlüsse nach Anfrageart, Storyboard-Quellverankerung, erneute Generierung aus dem eingefrorenen Manifest, Filterung nach sichtbaren Charakteren, Auswahl bei einem und bei mehreren Slots, Änderungen der Anbieterkapazität, ausdrückliche Aktualisierung, Rückfall bei alten Manifesten, Datenschutzgrenzen und Negativkontrollen für inaktive Orte.

Repository-Prüfungen:

```bash
pnpm check
pnpm regression:prompt
pnpm smoke:ui
```

Die manuelle Verifikation umfasst Erstellen am Desktop und mobil, tiefe Breadcrumbs, Ebenen, positionierte Karten, lange Namen, Konfliktbehebung, Archivschutz, Roleplay, Game, gebundene und ungebundene Kartenbewegung, Neuladen, Verzweigen, Checkpoint-Wiederherstellung, Anhängen verknüpfter Lore und Backlinks, deaktivierte und gebrochene Lore, Auslassungswarnungen bei großen Quellen, Vorschauen von `Strict canon` und `Canon with expansion`, visuellen Upload und Galerieauswahl, primäre und ergänzende Referenzen, ausdrückliche Szenenbeförderung, vererbten Stil, gebrochene Bilder, Auslassungsmeldungen des Anbieters, Grafik für historische Swipes, `Visual sources` im Storyboard, Anbieter mit einem und mit mehreren Slots, eingefrorene Neugenerierung, Prüfung nach Anbieterwechsel, ausdrückliche Aktualisierung, alte Storyboards, Active Context und Peek Prompt. Die Validierungs-Kontrollkästchen im PR bleiben für die menschliche Prüfung ungehakt.

## Zurückgestellt

- Sofortige Bewegung ohne Chat-Zug
- Eigenständige Positionen einzelner Charaktere
- Allgemeine Flags, Events oder Skripte
- Ortsvorlagen und Szenariopakete
- Räumliches Wissen je Charakter
- Teilbare Ortslore in Conversation
- Automatisches Ableiten von Karten aus Bildern
- Automatische Beförderung generierter Szenen in den Ortskanon
- Massengenerierung von Referenzgrafik für jeden Ort
- Automatische einstellungsbewusste Auswahl unter mehreren Outfits, Blickwinkeln, Gesichtsausdrücken und Detailreferenzen eines Charakters
- Anbieterspezifische Komposit- oder Kontaktbogen-Referenzgenerierung
