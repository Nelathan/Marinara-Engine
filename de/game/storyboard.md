# Anleitung zur Storyboard-Engine

Diese Anleitung erklärt Storyboards in Marinara Engine. Ein Storyboard macht aus einem abgeschlossenen Game-Mode-Zug eine kurze Folge von Keyframe-Bildern. Dazu kommen auf Wunsch kurze animierte Clips, auch durchgehende Aufnahmen im Anime-Stil. Der Zug liest sich dann wie eine kleine Zwischensequenz. Storyboards gibt es ausschließlich im Game Mode – in Roleplay- oder Conversation-Chats fehlen sie.

## Was Storyboards sind

Game Mode ist der Chat-Modus, in dem ein KI-Game Master (GM) ein rundenbasiertes Abenteuer erzählt. Sobald der GM einen Erzählzug beendet hat, kann die Storyboard-Engine genau diesen Zug bebildern.

Marinara liest die GM-Erzählung und zerlegt sie in eine kurze Folge geordneter Keyframes. Jedes Keyframe zeigt einen Moment aus dem Zug. Ein Storyboard umfasst 1 bis 6 Keyframes, standardmäßig 3.

Jedes Keyframe gehört zu einem Textabschnitt des Zuges. Diese Textabschnitte heißen Leseabschnitte. Während du den Zug durchliest, zeigt ein kleiner Viewer immer das Keyframe zur aktuellen Textstelle.

Bevor Marinara die Bilder plant, entfernt es die GM-Befehls-Tags aus dem Zug. GM-Befehls-Tags sind versteckte Anweisungs-Tags in einer GM-Nachricht, etwa für Würfelwürfe oder Änderungen am Spielzustand. Sie fliegen raus, damit sie nicht im Bild landen.

Standbilder der Keyframes landen in der **Gallery** (Galerie) im Tab **Images**. Keyframe-Clips werden als Szenenvideos im Tab **Videos** abgelegt. Da es ganz normale Gallery-Einträge sind, lässt sich jedes Keyframe einzeln ansehen, herunterladen, anpinnen oder sein Prompt kopieren.

## Bevor du loslegst

Ein paar Dinge müssen eingerichtet sein, damit ein Storyboard entstehen kann.

1. Ein Game-Mode-Chat. Die Funktion arbeitet nur im Game Mode.
2. Eine funktionierende Bild-Verbindung für den Illustrator des Spiels. Eine der beiden Stellen genügt:
   - Bestehendes Spiel: Öffne **Chat Settings** (Chat-Einstellungen), geh zu **Agents** und dort zur Karte **Illustrator**. Aktiviere **Game Illustrator** und wähle eine **Image Connection**.
   - Neues Spiel: Aktiviere im Einrichtungsassistenten **Visual Generation** und wähle eine **Image Generation Connection**.
3. Empfehlenswert ist ein starkes, aktuelles Bildmodell. Die App schlägt ein topaktuelles Bildmodell vor oder etwas Vergleichbares zu Google Nano Banana 2 Lite.

Für animierte Clips brauchst du zusätzlich eine Video-Verbindung. Die Schritte dazu stehen weiter unten.

Fehlt die Bild-Verbindung, scheitert die Storyboard-Anfrage mit dieser Meldung: "Choose an Illustrator image connection in Game Settings first."

Damit die Charaktere über alle Keyframes hinweg gleich aussehen, nimm Charakterkarten mit Avataren und aktiviere **Send Avatar References** in der Karte **Illustrator**. Marinara schickt dann den Avatar jedes Charakters als Referenzbild mit.

## Schnellstart

1. Öffne oder erstelle einen Game-Mode-Chat.
2. Richte die Bild-Verbindung wie im Abschnitt oben ein.
3. Spiel weiter, bis der GM einen Erzählzug abschließt.
4. Öffne das Panel **Gallery**.
5. Klick auf **Create storyboard** (Storyboard erstellen). Während der Generierung zeigt die Schaltfläche **Creating...** mit einem Ladekringel.
   - Ist **Expose image prompts before sending** unter **Settings > Generation** aktiviert, prüfe und bearbeite den fertigen Prompt für jedes Keyframe und bestätige dann die Generierung.
6. Lies den Zug weiter. Der schwebende Viewer erscheint und wechselt beim Lesen das Keyframe.

Hast du den Viewer geschlossen, hol ihn zurück: Klick im Panel **Gallery** auf **View storyboard**.

Während ein Storyboard entsteht, zeigt die **Gallery** dieses Banner: "Storyboard generation is running. Keyframes will appear in the game storyboard viewer when ready."

## Automatische und manuelle Storyboards

Storyboards entstehen entweder auf Knopfdruck oder automatisch.

Manuell heißt: die Schaltfläche **Create storyboard** in der **Gallery**. Sie baut ein Storyboard für den zuletzt abgeschlossenen GM-Erzählzug, und zwar nur auf Zuruf. Damit lässt sich der aktuelle Zug auch neu bebildern, selbst wenn automatische Storyboards aus sind.

Automatische Storyboards stellst du pro Chat ein. Die Regler findest du an zwei Stellen:

- Neues Spiel: Einrichtungsassistent, **Visual Generation**, dann der Unterabschnitt **Storyboards**.
- Bestehendes Spiel: **Chat Settings**, **Agents**, dann die Karte **Storyboards**.

**Automatic Storyboard Illustrations** erzeugt nach jedem abgeschlossenen GM-Zug Keyframe-Standbilder, ganz ohne Klick. Das ist die günstigere Variante. Bei einem neuen Spiel aus dem Einrichtungsassistenten ist die Option automatisch an, sobald **Visual Generation** aktiv ist. Wirksam wird sie erst, wenn **Game Illustrator** eingerichtet ist.

Automatische Storyboards halten die Pipeline nach dem fertigen Zug nicht für eine Prompt-Prüfung an. Bei aktivem **Expose image prompts before sending** nimm die manuelle Aktion **Create storyboard**, um jeden fertig kompilierten Keyframe-Prompt zu sehen und zu ändern. Automatische Durchläufe laufen ohne Fenster durch, damit das Spiel nicht stockt, während niemand am Chat sitzt.

**Automatic Storyboard Animations** erzeugt zusätzlich einen MP4-Clip pro Keyframe. Diese Option ist standardmäßig aus. Sie braucht Standbilder plus eine Video-Verbindung. Wer Animationen aktiviert, aktiviert damit auch die Illustrationen. Und wer die Illustrationen abschaltet, schaltet die Animationen mit ab.

So richtest du Clips ein:

1. Lege unter **Settings**, dann **Connections**, eine **Video Generation**-Verbindung an.
2. Wähle sie im Feld **Video Generation Connection** des Assistenten aus – oder unter **Chat Settings**, **Agents**, **Scene Videos**, dann **Video Connection**.
3. Aktiviere **Automatic Storyboard Animations**.

Aktivierst du Animationen ohne Video-Verbindung, warnt der Einrichtungsassistent: "Choose a Video Generation connection below to save automatic storyboard animations."

Ein Storyboard erzeugt normalerweise 3 Bild-Aufträge, einen pro Keyframe. Mit aktiven Animationen kommen bis zu 3 Video-Aufträge dazu. Die Anzahl richtet sich nach **Keyframes per Turn**: Bei 5 sind es also 5 Bild-Aufträge und bis zu 5 Video-Aufträge. Video-Aufträge dauern deutlich länger und kosten mehr. Fang mit Standbildern an und schalte Animationen nur dort dazu, wo Wartezeit und Kosten passen.

## Storyboard-Einstellungen

Alles davon steckt in der Karte **Storyboards**. Öffne **Chat Settings**, geh zu **Agents**, dann zu **Storyboards**.

| Einstellung | Standard | Wirkung |
| --- | --- | --- |
| **Automatic Storyboard Illustrations** | On bei neuen Assistenten-Spielen mit Visual Generation, sonst Off | Erzeugt nach jedem GM-Zug Keyframe-Standbilder |
| **Automatic Storyboard Animations** | Off | Ergänzt einen MP4-Clip pro Keyframe; braucht eine Video-Verbindung |
| **Keyframes per Turn** | 3 (Bereich 1 bis 6) | Wie viele Keyframes pro Zug geplant werden |
| **Animation Clip Duration** | 6 Sekunden (Bereich 1 bis 15) | Länge jedes Clips |
| **Viewer Display** | Floating | Schwebendes Panel oder vollflächiger Hintergrund |
| **Illustration Planner** | Still Keyframes | Plant fertige Standbild-Keyframes und ihre Bildbeschreibungen |
| **Animation Planner** | Comic Page Animation | Plant animationsfertige Ausgangsbilder und Bewegungsanweisungen |
| **Use Storyboard Template** | On | Formatiert geplante Szenen mit dem gewählten Storyboard Illustration Prompt. Für direkte NovelAI-Tag-Prompts abschalten |
| **Storyboard Illustration Prompt** | Game Scene Illustration | Formatiert jedes geplante Keyframe für das Bildmodell |
| **Storyboard Video Prompt** | Wie Game Video Prompt | Bewegungs-Prompt nur für Storyboard-Keyframe-Clips |

**Keyframes per Turn** ist ein Schieberegler. Die Engine versucht, so viele Keyframes zu planen. Bei einem kurzen Zug werden es womöglich weniger. Mehr als 6 plant sie nie.

**Animation Clip Duration** ist eine Sekundenzahl. Das Feld ist ausgegraut, solange **Automatic Storyboard Animations** aus ist. Bis du einen Wert setzt, gelten die 6 Sekunden Standard, erkennbar an der Plakette **Storyboard default**. Sobald ein eigener Wert drinsteht, erscheint die Schaltfläche **Use storyboard default**, um ihn zurückzunehmen. Manche Video-Anbieter kappen den Wert auf ein niedrigeres Maximum – die exakte Länge ist also nicht garantiert.

Im Viewer-Modus **Background** startet jede Animation einmal mit Ton, sobald ihr Erzählmoment aktiv wird. Die Erzählung darf währenddessen erscheinen, ihre automatische Wiedergabe wartet aber auf das Ende des Clips. Danach bleibt die Animation auf dem letzten Bild stehen. Über die Spiel-Werkzeugleiste steuerst du am Rechner wie am Handy Wiederholung, Wiedergabe/Pause und Stummschaltung. Auch schwebende Storyboard-Videos laufen einmal durch und lassen sich wiederholen, statt endlos in Schleife zu spielen.

Den visuellen Plan erstellen die beiden Planner. **Illustration Planner** greift bei Standbild-Storyboards. **Animation Planner** kommt zum Zug, sobald Videos entstehen, und liefert sowohl eine animationsfertige Bildbeschreibung als auch eine knappe Bewegungsanweisung.

**Storyboard Illustration Prompt** gießt die Bildbeschreibung des Planners anschließend in die fertige Anfrage an das Bildmodell. In bestehenden Chats steht das standardmäßig auf **Game Scene Illustration**. **Storyboard Illustration** stellt das Planner-Ergebnis in den Vordergrund und ergänzt Charakterreferenzen, Aussehen-Notizen, die Kunstrichtung der Kampagne sowie Bildanweisungen.

**Storyboard Video Prompt** ist unabhängig vom allgemeinen **Game Video Prompt** in der Karte **Scene Videos**. Es verbindet das erzeugte Keyframe, die Bewegungsanweisung des Animation Planners und den aktuellen Szenenkontext zur fertigen Anfrage an das Videomodell. Belass es auf der geerbten Auswahl, um den allgemeinen Prompt weiterzuverwenden – oder wähle **Anime Game Video** für Keyframe-Clips, ohne manuelle Gallery- und Game-Assets-Videos anzurühren.

Für die dauerbewussten Comic-Ausgangsseiten wählst du **Comic Page Animation** und dazu **Comic Page Video**, damit die Panels als geordnete visuelle Referenzmomente für einen Clip gelesen werden. Das ursprüngliche **Comic Page** bleibt für gewöhnliche Illustrationen erhalten. Die getrennte Video-Auswahl lässt den geerbten **Game Video Prompt** sowie manuelle Gallery- und Game-Assets-Videos unverändert.

Neue Spiele mit der Darstellung **Storyboard Optimized** wählen **Storyboard Game Prompt**, den Planner **Comic Page Animation**, **Storyboard Illustration** und **Comic Page Video**. Auf die Einzelaufnahmen-Kombination stellst du den Chat jederzeit um, indem du **Still Keyframe Animation** und **Anime Game Video** wählst.

### LTX 2.3 Image-to-Video

Für einen lokalen LTX-2.3-Workflow in ComfyUI startest du mit **LTX Simple Image-to-Video** als Animation Planner, **Storyboard First Frame** als Storyboard Illustration Prompt und **LTX Director Video** als Storyboard Video Prompt. Der Animation Planner erzeugt sowohl den natürlichsprachlichen T=0-Bild-Prompt als auch den vollständigen Bewegungsabsatz. Storyboard First Frame reicht die T=0-Szene mit minimaler Umrahmung an einen natürlichsprachlichen Bild-Anbieter weiter, während LTX Director Video den Bewegungsabsatz an den Eingang `%prompt%` des Workflows schickt. **LTX Director Storyboard** ist die ausführlichere, dauerbewusste Alternative; sie nutzt denselben Video-Prompt und denselben Workflow-Vertrag.

Modellauswahl, ComfyUI-Platzhalter, das komplette Einstellungsprofil für das Spiel, Prüfschritte und Fehlerbehebung findest du unter [LTX 2.3 Storyboards im Game Mode](ltx-2-3-storyboards.md).

## Stil-Presets

Die Planner-Presets bestimmen, wie jedes Keyframe ausgewählt und beschrieben wird. Zwei Auswahlfelder legen sie fest:

- **Illustration Planner** greift, wenn Storyboards Standbild-Keyframes ohne Videos erzeugen. Standard: **Still Keyframes**.
- **Animation Planner** greift, wenn **Automatic Storyboard Animations** aktiv ist. Standard: **Comic Page Animation**.

Die beiden Auswahlfelder haben getrennte Preset-Listen. Illustrations-Presets beschreiben fertige Standbilder und dürfen Comic- oder Manga-Beschriftungen für die Leserin enthalten. Animations-Presets beschreiben ein stabiles erstes Bild plus eine dauerbewusste Bewegungsanweisung. Ein Illustrations-Preset taucht nie im Menü des Animation Planners auf und ein Animations-Preset nie im Menü des Illustration Planners.

| Bereich | Preset | Am besten für |
| --- | --- | --- |
| Illustration | **Still Keyframes** | Normales Lesen. Einzelszenen-Keyframes ohne Comic-Panels, Sprechblasen, Bildunterschriften oder SFX-Text. |
| Illustration | **NovelAI Keyframes** | Kompakte Tag-Prompts für Standbilder, abgestimmt auf NovelAI V4 und V4.5. Für einen direkten Tag-Prompt schalte **Use Storyboard Template** ab. |
| Illustration | **Comic Page** | Fertige Comicseiten-Illustrationen mit 2 bis 6 Panels, Sprechblasen, Bildunterschriften und Beschriftung. |
| Illustration | **Colored Manga** | Fertige farbige Manga-Inszenierung mit Cel-Shading, Rastertönen, Sprechblasen und SFX. |
| Illustration | **B&W Manga** | Fertige Schwarz-Weiß-Manga-Zeichnungen mit Rastertönen, kräftigem Schwarz, Sprechblasen und SFX. |
| Animation | **Still Keyframe Animation** | Geordnete Einzelaufnahmen mit exaktem ersten Bild, einer Hauptbewegung, schlichter Kameraführung, Bewegung im Umfeld und einem ruhigen Schluss. |
| Animation | **Anime Episode Director** | Einzelaufnahmen im TV-Anime-Stil mit durchgehendem ersten Bild, knapper Bewegungsanweisung und anbietertauglicher Inszenierung. |
| Animation | **NovelAI Keyframe Animation** | Erste Bilder aus NovelAI-Tags, wobei Timing und Bewegung in einer separaten Animationsanweisung stehen. |
| Animation | **Comic Page Animation** | Dauerbewusste Comic-Ausgangsseiten, deren chronologische Panels als geordnete visuelle Referenz für einen Clip dienen. |
| Animation | **Colored Manga Animation** | Textfreie farbige Manga-Ausgangsbilder mit Bewegung, die Linienführung und Cel-Shading erhält. |
| Animation | **B&W Manga Animation** | Textfreie monochrome Ausgangsbilder mit Bewegung, die Zeichnung und Rastertöne erhält. |

Das Preset **Still Keyframe Animation** ist das stilneutrale Bewegungs-Gegenstück zu **Still Keyframes**. **Anime Episode Director** ist eine eigene Spezialoption und passt zu **Anime Game Video**, wenn du Aufnahmen im TV-Anime-Stil planen willst. Schwere Gewalt hält es unblutig und inszeniert sie nach Möglichkeit über Vorahnung, Verdeckung, Reaktion oder Nachwirkung – das senkt die Zahl der Sicherheitsablehnungen beim Anbieter, ohne die Geschichte des GM zu verändern.

Das Preset **Comic Page Animation** steuert die Seitendichte über die Cliplänge. Bei 6 bis 7 Sekunden sind es standardmäßig 2 Panels, ein drittes nur bei drei einfachen Momenten von je etwa 2 Sekunden; bei 8 bis 10 Sekunden sind es 2 bis 3 Panels und bei längeren Clips höchstens 4. Animationsseiten stellen das visuelle Timing über die Comic-Beschriftung, halten jedes Panel fokussiert und lassen am Ende einen kurzen ruhigen Moment. Die Panels folgen in Leserichtung dem Prinzip von Ursache und Wirkung. **Comic Page Video** steigt normalerweise sofort in Panel 1 ein; eine ganz kurze Gesamtansicht zu Beginn ist nur erlaubt, wenn sie keine spätere Folge vorwegnimmt.

Das Preset **NovelAI Keyframes** schreibt kompakte Danbooru-Tags. Danbooru-Tags sind kurze, per Komma getrennte Schlüsselwort-Tags, die manche Anime-Bildmodelle erwarten. Ein Animations-, Comic- oder Manga-Preset schaltet die Animationen nicht von allein ein. Für Clips brauchst du weiterhin **Automatic Storyboard Animations** und eine Video-Verbindung.

## Kunststil der Kampagne und Image-Style-Profile

Beim Einrichten des Spiels entsteht ein kampagnenweiter Kunststil für ein einheitliches Bild. In einem bestehenden Spiel siehst du ihn unter **Chat Settings > Agents > Illustrator** bei **Campaign art style**. Du kannst ihn bearbeiten, leeren, den ursprünglichen Wortlaut aus der Einrichtung zurückholen oder **Use Campaign Art Style** abschalten.

Der Kunststil der Kampagne und das **Image Style**-Profil sind zwei getrennte Prompt-Ebenen. Sind beide aktiv, nimmt Marinara beide mit. Schaltest du den Kampagnenstil ab oder leerst ihn, bleibt das gewählte Image-Style-Profil bestehen. Die Einstellung gilt für Storyboard-Keyframes und für die übrigen erzeugten Bildinhalte des Spiels.

Ist **Expose image prompts before sending** unter **Settings > Generation** aktiv, zeigen manuelle **Create storyboard**-Anfragen zuerst die exakt kompilierten positiven und negativen Prompts für alle geplanten Keyframes. Änderungen in dieser Prüfung gelten einmalig für dieses eine Storyboard; die Einstellungen für Kampagnenstil und Image-Style-Profil bleiben davon unberührt.

## Storyboard-Presets bearbeiten

Die mitgelieferten Presets sind schreibgeschützt. Für eigene Varianten öffnest du **Edit Illustration Planner Presets**, **Edit Animation Planner Presets**, **Edit Illustration Prompt Presets** oder **Edit Video Prompt Presets** in der Karte **Storyboards**. Jeder Abschnitt zeigt nur die mitgelieferten Presets und eigene Kopien für genau diese Stufe.

Kopiere ein mitgeliefertes Preset in eine bearbeitbare Vorlage für diesen Chat und wähle die Kopie dann im passenden Auswahlfeld. Kopien des Illustration Planners lassen sich nicht als Animation Planner wählen und umgekehrt. Kopien des Storyboard Illustration Prompt wirken nur auf Storyboard-Bilder. Kopien der Video-Prompts teilen sich weiterhin mit dem allgemeinen Game Video Prompt, sodass beide Video-Auswahlfelder sie nutzen können.

Jede eigene Kopie hat einen Namen, eine kurze Beschreibung und den Prompt-Text, den du bearbeitest. Ein Papierkorbsymbol löscht eine Kopie nach einer Rückfrage. Diese Kopien liegen nur bei diesem einen Chat, nicht app-weit.

## Der Storyboard-Viewer

Der Viewer folgt deiner Leseposition. Er zeigt das Keyframe, dessen Leseabschnitt zu deiner Stelle im Zugtext passt – also nicht einfach „das neueste Gallery-Bild“. Zwei Darstellungsarten stehen zur Wahl, festgelegt über **Viewer Display**.

**Floating** ist der Standard. Ein kleines, verschiebbares Panel liegt über dem Spiel. Seine Kopfzeile lautet **Storyboard**. Es spielt das Video des Keyframes ab, sobald es fertig ist, und zeigt so lange das Bild, wie ein Clip noch aussteht oder fehlgeschlagen ist.

Der schwebende Viewer bietet diese Bedienelemente:

- **Close storyboard viewer** blendet das Panel nur für den aktuellen Zug aus. Beim nächsten fertigen GM-Zug ist es wieder da. Auch ein Neuladen der Seite hebt das Ausblenden auf.
- **Drag storyboard viewer** ist der Griff in der Kopfzeile. Zieh das Panel an eine beliebige Stelle des Bildschirms.
- **Play storyboard video** und **Pause storyboard video** steuern die Wiedergabe. Clips starten stumm.
- **Mute storyboard video** und **Unmute storyboard video** erscheinen nur, wenn zum Keyframe ein fertiger Clip vorliegt.
- **Change storyboard viewer size** wechselt zwischen drei Breiten: klein, mittel (Standard) und groß.
- Ein Griff in der Ecke skaliert das Panel frei und hebt die eingestellte Größe auf.

**Background** füllt die gesamte Spielfläche mit dem aktiven Keyframe statt mit einer schwebenden Karte. Bild oder Clip liegen hinter den Spielbedienelementen. Die Logik zur Leseposition ist dieselbe wie beim schwebenden Viewer.

Der Hintergrundmodus hat einen Haken: Er schaltet den sonst erzeugten Szenen-Hintergrund von Marinara ab. Solange er läuft, ist die Schaltfläche **Generate background** im Illustrator-Popover deaktiviert. Sie zeigt dann diesen Hinweis: "Storyboard background display is active, so scene background generation is disabled."

## Bessere Ergebnisse erzielen

Ein Storyboard ist nur so klar wie der Zug, den es liest. Die besten Züge benennen, wer sich bewegt, was sich ändert und wo der entscheidende Moment liegt. Ein vages „der Kampf geht weiter“ gibt der Engine deutlich weniger zum Zeichnen als ein Zug mit konkreter Handlung und Details zum Schauplatz.

Für gleichmäßigere Ergebnisse:

- Halte Schauplatz, Ton und Kunststil des Spiels schon bei der Einrichtung konkret.
- Nimm Charakterkarten mit detaillierten Avataren und aktiviere **Send Avatar References**.
- Halte wichtige Kleidung, Wunden, Requisiten und Orte in der Erzählung klar benannt.
- Nutze Image-Style-Profile für den gewünschten Look.
- Nimm **Still Keyframes** fürs normale Lesen und ein Comic- oder Manga-Preset, sobald Clips laufen.

## NovelAI-Optionen

Für eine kompakte NovelAI-Anfrage wählst du **NovelAI Keyframes** und schaltest **Use Storyboard Template** in der Karte **Storyboards** ab. Marinara schickt dann den geplanten Szenen-Prompt direkt und lässt die getrennten Einstellungen für Aussehen, Referenzbild, Bildanweisungen und Stil weiterhin verfügbar.

**Use NovelAI Character Prompts** schickt jeden sichtbaren Charakter über die nativen NovelAI-Funktionen Add Character mit Bildunterschrift und Position. Die Option ist standardmäßig an. Wichtig: Sie greift nur bei einer offiziellen NovelAI-Verbindung mit einem V4- oder V4.5-Modell auf novelai.net. Bei jedem anderen Anbieter oder Modell bleibt der Schalter wirkungslos, und Marinara nutzt stattdessen den gemeinsamen alten Prompt.

## Fehlerbehebung

**"Choose an Illustrator image connection in Game Settings first."** Öffne **Chat Settings**, **Agents**, dann die Karte **Illustrator**. Aktiviere **Game Illustrator** und wähle eine **Image Connection**. Bei einem neuen Spiel aktivierst du im Einrichtungsassistenten **Visual Generation** und wählst eine **Image Generation Connection**.

**"Storyboards can only be generated from GM narration turns."** **Create storyboard** funktioniert nur bei einem abgeschlossenen GM-Erzählzug, nicht bei deinen eigenen Spielernachrichten. Warte, bis die Antwort des GM fertig ist, und versuch es dann erneut.

**"This GM turn has no narration to storyboard."** Der Zug enthält keinen Erzähltext zum Zeichnen. Das passiert, wenn ein GM-Zug nur versteckte Befehls-Tags und keine Erzählung enthält. Spiel weiter, bis der GM einen Zug mit Erzähltext schreibt, und erstell davon ein Storyboard.

**Bilder erscheinen, Videos aber nicht.** Für Videos müssen **Automatic Storyboard Animations** an und eine **Video Generation**-Verbindung ausgewählt sein. Ohne Animationen erzeugen Storyboards ausschließlich Standbild-Keyframes.

**Automatische Storyboards laufen nicht.** Prüfe, ob **Automatic Storyboard Illustrations** oder **Automatic Storyboard Animations** aktiv ist. Prüfe außerdem, ob die Bild-Verbindung eingestellt ist und der GM-Zug fertig gestreamt hat. Für einen Zug, der schon ein Storyboard hat, legt Marinara kein zweites an. Von Hand geht es trotzdem: über **Create storyboard** in der **Gallery**.

**Das Storyboard ist unvollständig oder hängt.** Meist sind ein oder mehrere Bild- oder Video-Aufträge fehlgeschlagen, ins Zeitlimit gelaufen oder an ein Ratenlimit des Anbieters gestoßen. Auch unzulässige Inhalte können einen Auftrag blockieren. Ist ein Anbieter langsam, erhöh die Zeitlimits für Bild- und Videogenerierung in der Datei `.env` und starte Marinara neu. Die genauen Variablennamen stehen in der [Konfigurationsanleitung](../CONFIGURATION.md).

Für eine genauere Diagnose stell die Log-Stufe auf debug und beobachte das Server-Log. Die Storyboard-Zeilen tragen die Markierungen `[debug/game/storyboard-illustrator]`, `[debug/game/storyboard-image-preview]`, `[debug/game/storyboard-image-assets]` und `[debug/game/storyboard-video]`.

## Verwandte Anleitungen

- [Szenen-Videogenerierung](../media/scene-video.md)
- [Anbieter für Bildgenerierung](../media/image-providers.md)
- [Game Mode: Erste Schritte](getting-started.md)
- [LTX 2.3 Storyboards im Game Mode](ltx-2-3-storyboards.md)
