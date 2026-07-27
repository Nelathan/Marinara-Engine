# Memory Recall und Chat-Zusammenfassungen

In dieser Anleitung erfährst du, wie Marinara Engine einen langen Chat zusammenhängend hält, sobald er länger wird, als das KI-Modell auf einmal lesen kann. Es geht um **Memory Recall** (semantische Suche über frühere Nachrichten), **Chat Summary** (Chat-Zusammenfassung) für Roleplay-Chats und **Automatic Summarization** (automatische Zusammenfassung) für Conversation-Chats.

## Die zwei Gedächtnissysteme

Jedes KI-Modell kann immer nur eine begrenzte Textmenge auf einmal lesen. Diese Grenze heißt Kontextfenster. Wird ein Chat lang, fallen die ältesten Nachrichten aus dem Fenster heraus und die KI vergisst sie. Marinara Engine (im Folgenden nur Marinara) hat dafür zwei getrennte Systeme.

- **Memory Recall** durchsucht die älteren Nachrichten nach den Stellen, die am besten zu deiner letzten Eingabe passen, und schiebt sie unauffällig zurück in den Prompt – also in den Text, den Marinara an die KI schickt. Das funktioniert in jedem Chat-Modus.
- Zusammenfassungen pressen alte Nachrichten zu kurzen Rückblicken zusammen, die im Prompt an die Stelle der Originalnachrichten treten. In Roleplay-Chats übernimmt das **Chat Summary**, in Conversation-Chats **Automatic Summarization**.

Game-Mode-Chats bekommen ausschließlich **Memory Recall**. Beide Zusammenfassungs-Funktionen fehlen dort.

Beide Systeme lassen sich gleichzeitig nutzen. Sie erledigen unterschiedliche Aufgaben und kommen sich nicht in die Quere.

## Memory Recall einrichten

**Memory Recall** sucht passende Bruchstücke aus dem bisherigen Chat und fügt sie als Erinnerungen in den Prompt ein. Grundlage ist ein Embedding: ein numerischer Fingerabdruck der Bedeutung einer Nachricht. Marinara vergleicht den Fingerabdruck deiner neuen Nachricht mit den gespeicherten Fingerabdrücken früherer Nachrichten und ergänzt die ähnlichsten Treffer.

### Memory Recall aktivieren

1. Öffne einen Chat und klick auf die Schaltfläche **Chat Settings** (Chat-Einstellungen) in der Kopfzeile des Chats.
2. Such den Abschnitt **Memory Recall** (Symbol: ein Gehirn).
3. Aktiviere den Schalter **Enable Memory Recall**.

**Enable Memory Recall** gilt pro Chat. Der Standard hängt vom Modus ab:

- In Conversation-Chats standardmäßig an.
- In Roleplay- oder Game-Chats mit aktiver Szene standardmäßig an.
- In allen übrigen Chats standardmäßig aus.

Schaltest du den Schalter aus, landen keine abgerufenen Erinnerungen mehr im Prompt. Bereits Gespeichertes bleibt aber erhalten.

### Die Embedding-Quelle

Für die Bedeutungs-Fingerabdrücke braucht **Memory Recall** eine Embedding-Quelle. Die legst du an einer Verbindung fest, nicht in den Chat-Einstellungen. Eine Verbindung ist eine gespeicherte Anbindung an einen KI-Anbieter.

1. Öffne das Panel **Connections** (Verbindungen) und bearbeite eine Verbindung.
2. Such den Abschnitt **Semantic Search (Embeddings)**.
3. Trag im Modellfeld den Namen eines Embedding-Modells ein, zum Beispiel `text-embedding-3-small`.
4. Optional legst du unter **Embedding Endpoint URL** eine abweichende Adresse fest.
5. Optional borgst du dir über das Dropdown-Menü **Embedding Connection** Key und Adresse einer anderen Verbindung. Zur Auswahl stehen unter anderem **Same as this connection** und **Local Model (sidecar)**.

Manche Anbieter bieten gar keine Embeddings an. Dann weist Marinara mit einem Hinweis darauf hin, dass du eine eigene Embedding-Verbindung wählen sollst – etwa eine OpenAI-kompatible, Google oder das Local Model.

Trägst du überhaupt keine Embedding-Verbindung ein, greift Marinara auf ein eingebautes lokales Embedding-Modell zurück. Es lädt dieses Modell einmalig herunter und führt es auf dem eigenen Rechner aus, ganz ohne API-Key. Mehr zum eingebauten Modell steht unter [Local Model einrichten](../connections/local-model.md).

Dieselbe Einstellung **Semantic Search (Embeddings)** treibt auch die semantische Suche in Lorebooks an. Einmal eingerichtet, profitieren also beide Funktionen davon.

### Memories for This Chat

Was ein Chat gespeichert hat, zeigt **Chat Settings** im Abschnitt **Memory Recall**: Klick dort auf **Access memories for this chat**. Damit öffnet sich das Fenster **Memories for This Chat**.

Das Fenster nennt die Anzahl gespeicherter Chunks – also abgelegter Textabschnitte – und eine grobe Schätzung in Tokens, den kleinen Textstücken, in denen KI-Modelle rechnen. Jede Chunk-Karte zeigt den abgedeckten Zeitraum, die Anzahl der Nachrichten, einen Status und den Zeitpunkt der Erstellung. Als Status erscheint eines von drei Kürzeln:

- **Vectorized**: Der Fingerabdruck steht und ist durchsuchbar.
- **Waiting for vector**: Der Fingerabdruck entsteht gerade noch.
- **Embedding unavailable**: Keine Embedding-Quelle konnte ihn erzeugen.

Über die Symbolleiste exportierst und importierst du Erinnerungen, baust sie neu auf oder löschst alle auf einmal. Zusätzlich hat jeder Chunk ein eigenes Papierkorb-Symbol, um nur ihn zu vergessen.

- Das Papierkorb-Symbol eines Chunks öffnet das Dialogfenster **Forget Memory**. Bestätige mit **Forget**.
- Das Papierkorb-Symbol für alle öffnet das Dialogfenster **Clear Memories**. Bestätige mit **Clear**. Das entfernt die Erinnerungen, nicht aber die Nachrichten im Chat.
- Das Aktualisieren-Symbol baut sämtliche Chunks aus den aktuellen Chat-Nachrichten neu auf. Nutze es, nachdem du das Embedding-Modell gewechselt hast.
- Der Export legt eine `.marinara.json`-Datei an. Der Import akzeptiert `.json`- oder `.marinara`-Dateien und führt sie mit den vorhandenen Erinnerungen zusammen.

### Wie sich Memory Recall verhält

Behalte diese Punkte im Hinterkopf:

- Sobald eine Embedding-Quelle bereitsteht, legt Marinara im Hintergrund Chunks an – auch bei ausgeschaltetem **Enable Memory Recall**. Der Schalter steuert nur, ob gespeicherte Erinnerungen eingefügt werden. Willst du das Speichern ganz unterbinden, entferne die Embedding-Quelle oder leere die Erinnerungen von Zeit zu Zeit.
- Ein Chunk entsteht erst ab 5 neuen Nachrichten. Kleinere Häppchen warten auf die nächste Antwort.
- Abgerufene Bruchstücke müssen eine Ähnlichkeitsprüfung bestehen. Schwache Treffer fallen weg – der Abruf kann also leer ausgehen, obwohl Erinnerungen vorhanden sind.
- Für abgerufene Erinnerungen steht nur ein kleines Budget im Prompt bereit. Es landen also immer nur die relevantesten paar darin.
- Wechselst du das Embedding-Modell, nachdem bereits Erinnerungen existieren, passen die alten Chunks nicht mehr. Bau sie über das Aktualisieren-Symbol neu auf.
- Löschst du die Nachrichten eines Chats, verschwinden auch dessen Chunks.

Einige Container-Builds von Marinara, bekannt als Marinara Lite, deaktivieren **Memory Recall** vollständig. Dort taucht der Abschnitt **Memory Recall** überhaupt nicht auf.

## Chat Summary (Roleplay)

**Chat Summary** presst ältere Nachrichten zu kurzen erzählerischen Rückblicken zusammen, den sogenannten Summary Entries. Jeder Eintrag stammt entweder von der KI oder von dir selbst, und jeder lässt sich einzeln an- und abschalten. Die Funktion gibt es nur in Roleplay-Chats.

Zum Öffnen klick auf die Schaltfläche **Chat Summary** (Schriftrollen-Symbol) in der Kopfzeile des Roleplay-Chats. Es öffnet sich das Popover **Chat Summary**, ein kleines Einblendfenster.

### Einen Summary Entry anlegen

1. Wähl unter **Summary Scope** entweder **Last**, um die neuesten Nachrichten zusammenzufassen, oder **Range** für einen bestimmten Nachrichtenbereich.
2. Klick auf **Generate**, damit die KI daraus einen Eintrag schreibt.
3. Oder klick auf **Write**, um einen leeren Eintrag anzulegen und den Rückblick selbst zu tippen.

Jeder Eintrag in der Liste zeigt einen Titel, den Quellbereich oder die Anzahl der Nachrichten sowie die geschätzte Größe in Tokens. Einträge lassen sich aktivieren und deaktivieren, ausklappen, über **Edit** bearbeiten oder mit **Delete** entfernen. Sammel-Schaltflächen blenden inaktive Einträge mit **Show Inactive** und **Hide Inactive** ein oder aus und schalten mit **Activate All** und **Deactivate All** alle auf einmal um.

### Automatic Summaries

Das Panel **Automatic Summaries** hält die Zusammenfassungen aktuell, während du weiterchattest. Es erscheint nur in Roleplay-Chats.

- Aktiviere im Panel **Automatic Summaries** den Schalter **Enabled**.
- Im Feld **Every** legst du das Intervall fest, gezählt in deinen eigenen Nachrichten. Der Standard ist 5, möglich sind 1 bis 200.
- **Backfill Summary** holt Zusammenfassungen für einen älteren Chat nach, der bisher keine hatte. Marinara arbeitet den Chat dabei in Häppchen ab und zeigt einen Fortschrittsbalken. Mit **Stop** brichst du vorzeitig ab.

### Vorlagen unter Summary Prompt

Das Panel **Summary Prompt** steuert die Anweisungen, mit denen die KI eine Zusammenfassung schreibt. Über **Edit** änderst du den aktiven Prompt. **Templates** öffnet die Vorlagenverwaltung. Dort speicherst du mit **New template** einen Prompt unter einem Namen. Jede gespeicherte Vorlage hat eigene Bedienelemente: **Duplicate**, **Edit** und **Delete**.

Gespeicherte Vorlagen gelten global für die ganze App. Bearbeitest oder wechselst du eine Vorlage in einem Roleplay-Chat, ändert sich der Summary Prompt in allen Roleplay-Chats.

### Summary Connection und Ausgabegröße

Im Panel **Summary Connection** legst du fest, welche Verbindung die Zusammenfassungen schreibt. Der Standard heißt **Agent default (falls back to chat connection)**. Marinara nimmt also zuerst die Standard-Agent-Verbindung und erst danach die Verbindung des Chats selbst.

Das Feld **Maximum output size** begrenzt die Länge einer generierten Zusammenfassung. Der Standard sind 4096 Tokens, möglich sind 1 bis 32768.

### Anzeigeoptionen

Die Bedienelemente unter **Display** im Popover bestimmen, wie zusammengefasste Nachrichten auf dem Bildschirm erscheinen:

- **Hide summarised messages**: blendet die Originalnachrichten aus, sobald eine Zusammenfassung sie abdeckt. Standardmäßig aus.
- **Recent message tail**: hält so viele der neuesten Nachrichten weiterhin voll sichtbar, auch wenn das Ausblenden an ist. Der Standard ist 10, erlaubt ist jede nicht-negative ganze Zahl. Bei 0 verschwindet der zusammengefasste Block komplett. Höhere Werte vergrößern den Prompt und damit die Kosten beim Modell.
- **Collapse hidden messages**: bestimmt, wie ausgeblendete Nachrichten im Verlauf dargestellt werden.

Verlangt dein Chat eine Freigabe für Agent-Schreibzugriffe (eine eigene Einstellung unter Agents), warten KI-generierte Zusammenfassungen erst auf deine Prüfung, bevor sie greifen.

## Automatic Summarization (Conversation)

Conversation-Chats arbeiten mit einem anderen System namens **Automatic Summarization**. Es fasst jeden Kalendertag zu einer Tageszusammenfassung zusammen und bündelt abgeschlossene Wochen aus Tageszusammenfassungen zu einer Wochenzusammenfassung. In den Prompt wandern dann nur noch die Wochenzusammenfassungen, die Tageszusammenfassungen der laufenden Woche und die heutigen Nachrichten. So bleibt jede Anfrage klein.

Diese Funktion läuft von allein und lässt sich in Conversation-Chats nicht abschalten.

### Den Editor öffnen

1. Öffne einen Conversation-Chat und klick auf **Chat Settings**.
2. Such den Abschnitt **Automatic Summarization** (Symbol: ein Kalender).
3. Klick auf **Edit Summaries**, um das Fenster **Automatic Summarization** zu öffnen.

Das Fenster listet zuerst die Wocheneinträge auf, danach alle Tage, die noch in keiner Woche stecken. Klapp einen Eintrag auf, um den Text unter **Summary** und die Liste **Key Details** zu bearbeiten; dort lassen sich Zeilen ergänzen und entfernen.

### Day Rollover Hour und Recent Message Tail

Zwei Einstellungen im Abschnitt **Automatic Summarization** bestimmen, wie die Tage geschnitten werden:

- **Day Rollover Hour**: die Stunde, ab der für Zusammenfassungen ein neuer Tag beginnt. Der Standard ist 4 AM, zur Auswahl steht jede Stunde von 12 AM (Mitternacht) bis 11 AM. Nachrichten vor dieser Uhrzeit zählen noch zum Vortag. Wähl eine Zeit, zu der du nie chattest – sonst zerschneidet Marinara eine durchgemachte Nacht mittendrin.
- **Recent Message Tail**: wie viele der neuesten Nachrichten von heute wortgetreu erhalten bleiben, auch nachdem sie zusammengefasst wurden. Der Standard ist 10, erlaubt ist jede nicht-negative ganze Zahl. Höhere Werte vergrößern den Prompt und damit die Kosten beim Modell.

Änderst du **Day Rollover Hour**, obwohl schon Zusammenfassungen existieren, warnt dich Marinara: Die älteren Zusammenfassungen beruhen noch auf der vorherigen Einstellung.

### Fehlende Tage nachtragen

Manchmal bleibt ein Tag ohne Zusammenfassung, etwa nach dem Import eines alten Chats. Im Panel **Missing Summaries** des Fensters sitzt die Schaltfläche **Backfill**: Sie nimmt sich die letzten Tage ohne Zusammenfassung noch einmal vor und schaut dabei bis zu 14 Tage zurück.

Wechselst du Verbindung oder Modell für die Zusammenfassungen, schreibt Marinara bereits vorhandene Tages- und Wocheneinträge nicht neu.

## Fehlerbehebung

### Memory Recall ruft nichts ab

- Prüf, ob eine Embedding-Quelle eingerichtet ist. Zeigen die Chunks unter **Memories for This Chat** den Status **Embedding unavailable**, richte an einer Verbindung den Abschnitt **Semantic Search (Embeddings)** ein oder verlass dich auf das eingebaute lokale Modell. Siehe [Local Model einrichten](../connections/local-model.md).
- Steht dort **Waiting for vector**, gib den Chunks etwas Zeit. Die Fingerabdrücke entstehen nach den Antworten.
- Der Abruf ergänzt nur Erinnerungen, die eng mit deiner letzten Nachricht zusammenhängen. Passt nichts, kommt auch nichts dazu. Das ist normal.
- Hast du kürzlich das Embedding-Modell gewechselt, bau die alten Chunks über das Aktualisieren-Symbol unter **Memories for This Chat** neu auf, damit sie zum neuen Modell passen.

### Es entstehen keine Zusammenfassungen

- Achte darauf, dass der Chat eine funktionierende Textverbindung hat. Chat Summary nutzt die **Summary Connection**, Automatic Summarization die ermittelte Verbindung für Zusammenfassungen. Funktioniert keine davon, entfällt die Generierung.
- Verlangt dein Chat eine Freigabe für Agent-Schreibzugriffe, warten KI-Zusammenfassungen auf deine Bestätigung.
- Eine fehlgeschlagene Zusammenfassung versucht Marinara nach kurzer Zeit von allein erneut. Hängt sie weiterhin fest, stoß sie von Hand mit **Backfill Summary** (Roleplay) oder **Backfill** (Conversation) noch einmal an.

## Verwandte Anleitungen

- [Local Model einrichten](../connections/local-model.md)
- [Mit einem KI-Anbieter verbinden](../connections/connecting-to-a-provider.md)
- [Conversation Mode: Erste Schritte](../conversation/getting-started.md)
- [Roleplay Mode: Erste Schritte](../roleplay/getting-started.md)
- [Fehlerbehebung in Marinara Engine](../TROUBLESHOOTING.md)
