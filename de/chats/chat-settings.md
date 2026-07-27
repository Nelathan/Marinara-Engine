# Chat Settings im Überblick

In dieser Anleitung geht es um das Panel **Chat Settings** (Chat-Einstellungen) – dort stellst du einen einzelnen Chat für sich ein. Erklärt werden die Grundlagen: Chatname, Verbindung und gespeicherte Einstellungsbündel. Für alles Weitere im Panel folgen Verweise auf die ausführlichen Anleitungen.

Jede Einstellung in diesem Panel gilt nur für den aktuellen Chat. Andere Chats bleiben davon unberührt.

## Das Panel Chat Settings öffnen

Das Panel öffnest du aus einem geöffneten Chat heraus.

1. Öffne einen beliebigen Chat.
2. Klick in der Chat-Werkzeugleiste auf die Zahnrad-Schaltfläche; ihr Tooltip (Kurzhinweis beim Draufzeigen) lautet **Chat Settings**.
3. Das Panel **Chat Settings** fährt auf.

Zu sehen ist nun ein Panel mit dem Titel **Chat Settings** und einem Zahnrad-Symbol. Bei einem ganz neuen Chat geht dieses Panel von selbst auf, damit du sofort loslegen kannst.

## Chat Name

Im Abschnitt **Chat Name** (Chatname) steht der Name, der in der Chatliste erscheint. Diesen Namen siehst nur du. Er geht nicht an die KI und verändert den Chat in keiner Weise.

1. Klick im Abschnitt **Chat Name** auf den aktuellen Namen.
2. Der Name wird zu einem Textfeld.
3. Tipp einen neuen Namen ein.
4. Drück Enter oder klick auf das Häkchen, um zu bestätigen.

## Connection

Der Abschnitt **Connection** (Verbindung) legt fest, welcher KI-Anbieter und welches Modell in diesem Chat antworten. Eine Verbindung ist eine gespeicherte Verknüpfung zu einem KI-Anbieter, samt API-Key und ausgewähltem Modell. Ein API-Key ist ein geheimer Zugangscode, mit dem Marinara Engine dein Konto beim Anbieter nutzen darf.

Wähl im Dropdown-Menü eine gespeicherte Verbindung. Möglich ist außerdem **Random**: Dann kommt jedes Mal eine andere Verbindung aus dem Zufallspool zum Zug, den du selbst markiert hast.

Wie du überhaupt eine Verbindung anlegst, steht unter [Mit einem KI-Anbieter verbinden](../connections/connecting-to-a-provider.md).

## Einstellungsprofile

Ganz oben im Panel sitzt das Bedienelement **Profile** (Profil). Ein Einstellungsprofil ist ein gespeichertes Bündel von Chat-Einstellungen, das sich auf andere Chats übertragen lässt. Wähl im Dropdown-Menü ein Profil, um es auf den aktuellen Chat anzuwenden.

Ein Profil bündelt Verbindung, Prompt-Preset, Agenten, Tools, Übersetzung, Memory Recall, erweiterte Parameter und weitere Einstellungen dieses Chats. Charaktere, Persona, Lorebooks, Sprites, Zusammenfassung, Tags und Szenen-Prompt bleiben unangetastet – sie hängen am Chat selbst.

Die Leiste enthält eine Reihe kleiner Symbol-Schaltflächen ohne Beschriftung. Zeigst du auf eine davon, nennt ein Tooltip ihren Namen:

- Die Diskette (**Save current chat settings into this profile**) schreibt die Einstellungen des aktuellen Chats in das ausgewählte Profil.
- Der Stift (**Rename profile**) benennt das ausgewählte Profil um.
- Das Symbol aus Datei und Plus (**Save current chat settings as a new profile**) legt aus den Einstellungen des aktuellen Chats ein neues Profil an.
- Der Abwärtspfeil (**Import settings profile (.json)**) lädt ein Profil aus einer `.json`-Datei.
- Der Aufwärtspfeil (**Export settings profile (.json)**) speichert das ausgewählte Profil in eine `.json`-Datei.
- Der Papierkorb (**Delete profile**) löscht das ausgewählte Profil.

Neben dem Dropdown-Menü liegt eine Stern-Schaltfläche. Ein Klick darauf macht ein Profil zum Standard für neue Chats in diesem Modus. Legst du danach einen neuen Chat in diesem Modus an, wendet Marinara das markierte Profil automatisch an. Pro Modus kann nur ein Profil der Standard sein.

Jeder Modus, der diese Funktion unterstützt, bringt ein eingebautes Profil **Default** mit. Es lässt sich weder umbenennen noch überschreiben oder löschen. Wendest du es an, fallen die profilgesteuerten Einstellungen auf die Standards der App zurück.

Im Game Mode gibt es die Profil-Bedienelemente nicht.

Der Begriff **preset** ist in Marinara für Prompt-Presets reserviert. Ein Prompt-Preset bestimmt den Aufbau des System-Prompts und die Generierungsparameter; ein Einstellungsprofil bündelt die oben genannte, wiederverwendbare Chat-Konfiguration. Alle Regeln dazu stehen unter [Einstellungsprofile](settings-profiles.md).

## Weitere Abschnitte im Panel

Das Panel **Chat Settings** beherbergt außerdem viele Funktionen, die jeweils nur für einen Chat gelten. Zu jeder gibt es eine eigene Anleitung:

- **Persona** legt fest, wen du in diesem Chat spielst. Der Abschnitt erscheint in Conversation- und Roleplay-Chats. Siehe [Die Persona für einen Chat auswählen](../characters/choosing-your-persona.md).
- **Characters** verwaltet die Charaktere in Conversation- und Roleplay-Chats. Für Chats mit zwei oder mehr Charakteren siehe [Gruppenchats und Gruppen-Conversations](group-chats.md).
- **Party** erscheint nur in Game-Chats. Der Abschnitt ersetzt **Persona** und **Characters** und vereint beides an einer Stelle.
- **Lorebooks** hängt World Info an diesen Chat. Siehe [Lorebooks im Überblick](../lorebooks/overview.md).
- **Agents** schaltet KI-Helfer für diesen Chat frei. Siehe [Agenten: KI-Helfer für deine Chats](../agents/agents-overview.md).
- **Translation** richtet die automatische Übersetzung von Nachrichten ein. Siehe [Nachrichten übersetzen](../integrations/message-translation.md).
- **Advanced Parameters** überschreibt für diesen Chat die Generierungseinstellungen, etwa Temperature und maximale Token-Zahl. Siehe [Generierungsparameter](../prompts/generation-parameters.md).

Welche Abschnitte du siehst, hängt vom Chat-Modus ab. Manche erscheinen nur in Roleplay-, Conversation- oder Game-Chats.

## Verwandte Anleitungen

- [Die Chatliste verwalten](managing-chats.md)
- [Die Persona für einen Chat auswählen](../characters/choosing-your-persona.md)
- [Lorebooks im Überblick](../lorebooks/overview.md)
- [Agenten: KI-Helfer für deine Chats](../agents/agents-overview.md)
- [Einstellungsprofile](settings-profiles.md)
- [Generierungsparameter](../prompts/generation-parameters.md)
