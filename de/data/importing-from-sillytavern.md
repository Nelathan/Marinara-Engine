# Import aus SillyTavern

In dieser Anleitung erfährst du, wie deine SillyTavern-Daten nach Marinara Engine kommen. Entweder importierst du einzelne Dateien, oder du lässt einen kompletten SillyTavern-Ordner durchsuchen und übernimmst alles auf einmal.

## Was sich übernehmen lässt

Marinara Engine importiert diese Arten von SillyTavern-Daten:

- Charaktere (Charakterkarten)
- Chats (Nachrichtenprotokolle)
- Gruppenchats (Chats mit mehr als einem Charakter)
- Presets (Einstellungen für die Generierung)
- Lorebooks (in SillyTavern heißen sie „World Info“)
- Hintergründe (Hintergrundbilder für den Chat)
- Personas (deine eigenen **{{user}}**-Profile)

Ein Lorebook ist eine Sammlung von Weltwissen: Notizen, die die KI liest, sobald bestimmte Wörter im Chat auftauchen. Ein Preset ist ein gespeichertes Bündel von Einstellungen für die Generierung. Eine Persona ist das Profil, das dich im Chat vertritt.

Für den Import gibt es zwei Wege. Für eine einzelne Datei nimmst du die Schaltflächen für den Einzelimport. Für eine komplette SillyTavern-Installation nimmst du den Einrichtungsassistenten **Import from SillyTavern Folder** (Aus SillyTavern-Ordner importieren).

## Schneller Import einzelner Dateien

Öffne **Settings** (Einstellungen), dann den Tab **Imports** (Importe), und dort den Bereich **SillyTavern Import**. Die Beschreibung dazu lautet „Bring over characters, chats, presets, and lorebooks from SillyTavern files.“

In diesem Bereich liegen vier Schaltflächen für je eine Datei. Jede öffnet eine gewöhnliche Dateiauswahl, ganz ohne weitere Optionen:

- **Import Character (JSON/PNG)** übernimmt eine Charakterkarte als `.json` oder `.png`.
- **Import Chat (JSONL)** übernimmt ein Chatprotokoll als `.jsonl`. Daraus entsteht immer ein **Roleplay**-Chat, und Marinara wechselt direkt dorthin.
- **Import Preset (JSON)** übernimmt eine Preset-Datei als `.json`.
- **Import Lorebook (JSON)** übernimmt eine World-Info-Datei als `.json`.

JSONL bedeutet: ein JSON-Datensatz pro Zeile. In diesem Format speichert SillyTavern seine Chatprotokolle.

Steckt in einer Charakterkarte ein eingebettetes Lorebook, fragt der Browser beim Import nach, ob du es zusätzlich als eigenständiges Marinara-Lorebook übernehmen willst. Mit **OK** bleibt die World Info als separates Lorebook erhalten und lässt sich wiederverwenden. Mit **Cancel** überspringst du diesen Schritt, und nur der Charakter wandert herüber.

Die Schnell-Schaltflächen arbeiten mit festen Vorgaben, die sich hier nicht ändern lassen. Sie behalten alle Tags (Schlagwörter) aus der Quelle und begrenzen jedes Regex-Skript auf den jeweiligen Charakter. Ein Regex-Skript ist eine Such-und-Ersetzen-Regel, die Text verändert, bevor oder nachdem die KI ihn sieht. Willst du diese Optionen selbst festlegen, nimm stattdessen die Schaltfläche **Import** (Importieren) im Panel **Characters** (Charaktere). Mehr dazu unter [Charakterkarten importieren und exportieren](../characters/import-export.md).

### Einen Chat in einen bestimmten Modus importieren

Die Schaltfläche **Import Chat (JSONL)** von oben erzeugt immer einen **Roleplay**-Chat. Soll der Chat in einem anderen Modus landen, nimm die kleine Import-Schaltfläche oben in der Chatliste. Ihr Tooltip (Kurzhinweis beim Draufzeigen) lautet **Import SillyTavern or Marinara chat JSONL**. Sie importiert die Datei in genau den Modus-Tab, der gerade offen ist – also Conversation, Roleplay oder Game. Mehr zu Import und Export von Chats findest du unter [Chats exportieren und importieren](../chats/export-import.md).

## Import aus dem SillyTavern-Ordner

Dieser Einrichtungsassistent durchsucht einen kompletten SillyTavern-Ordner und importiert viele Elemente auf einmal. Er liest Charaktere, Chats, Gruppenchats, Presets, Lorebooks, Hintergründe und Personas gemeinsam ein.

Zum Öffnen gehst du auf **Settings**, dann **Imports**, dann in den Bereich **SillyTavern Import**, und klickst auf **Import from SillyTavern Folder**. Es öffnet sich ein Fenster mit dem Titel **Import from SillyTavern**.

### Schritt 1: den SillyTavern-Ordner angeben

1. Trag im Feld **SillyTavern Folder Path** (Pfad zum SillyTavern-Ordner) den Pfad zu deinem SillyTavern-Ordner ein, zum Beispiel `/path/to/SillyTavern`.
2. Oder klick auf **Browse** (Durchsuchen) und wähl den Ordner über die Ordnerauswahl deines Rechners. Auf einem entfernten oder headless betriebenen Server ohne Ordnerauswahl öffnet sich stattdessen ein Ordner-Browser in der App, mit einer Schaltfläche **Select This Folder** (Diesen Ordner auswählen).
3. Gib dabei den Haupt-Ordner von SillyTavern an. Der Hinweis im Fenster nennt ihn den Ordner, in dem üblicherweise ein Unterordner `data/` oder `public/` liegt.
4. Klick auf **Scan Folder** (Ordner durchsuchen). Währenddessen zeigt die Schaltfläche **Scanning...**.

Nach dem Durchsuchen meldet Marinara, wie viele Elemente pro Kategorie gefunden wurden. Lässt sich der Ordner nicht lesen, erscheint eine Fehlermeldung wie „Could not find SillyTavern data directory.“

### Schritt 2: auswählen, was importiert wird

Der nächste Bildschirm trägt den Titel **Choose exactly what to import**. Er zeigt eine Auswahlliste je Kategorie: **Characters**, **Chats**, **Group Chats**, **Presets**, **Lorebooks**, **Backgrounds** und **Personas**. Ein Zähler hält fest, wie viele Elemente ausgewählt sind.

Jede Kategorie hat die Schaltflächen **All** (Alle) und **None** (Keine) sowie einen Schalter **Show** oder **Hide** (Anzeigen bzw. Ausblenden), mit dem du die einzelnen Elemente samt Datum siehst.

Fast alles ist von Anfang an ausgewählt. Die Ausnahme sind die mitgelieferten Presets von SillyTavern. Marinara erkennt sie, lässt sie unmarkiert und erklärt das in einem Hinweisbanner. Gemeint sind die Standard-Presets wie `default`, `deterministic`, `neutral` und die `universal-*`-Presets. Lass sie unmarkiert, solange du keine Kopien davon brauchst.

Hat die Suche Charaktere gefunden, kommen zwei weitere Bedienelemente dazu:

- **Imported character tags** legt fest, wie Tags importiert werden. **All tags** behält die Tags aus der Quelle, **No tags** überspringt sie, und **Existing only** behält nur die Tags, die es in Marinara schon gibt. Standard ist **All tags**.
- **Imported regex scripts** legt fest, wohin Regex-Skripte wandern. Mit **Character only** gelten sie jeweils nur für den einzelnen Charakter, mit **Global** landen sie unter **Presets -> Regexes** und greifen in jedem Chat. Standard ist **Character only**.

Passt die Auswahl, klick auf **Import Selected** (Auswahl importieren). Über **Back** (Zurück) geht es wieder zum Ordner-Schritt.

### Schritt 3: den Fortschritt verfolgen

Marinara importiert die Elemente nacheinander. Zu sehen sind ein Ladesymbol, die aktuelle Kategorie samt Elementname, ein Fortschrittsbalken und laufende Zählerstände je Kategorie.

### Schritt 4: das Ergebnis lesen

Der letzte Schritt zeigt bei Erfolg das Banner **Import complete!**, bei einem Fehlschlag ein Fehlerbanner. Klappt alles, nennt eine Karte pro Kategorie den Endstand. Ist ein einzelnes Element gescheitert, listet eine Warnliste jeden Fehlschlag in einer eigenen Zeile auf, etwa `Character "Foo": error message`. Mit **Done** (Fertig) schließt du das Fenster.

### Wie der Einrichtungsassistent mit deinen Daten umgeht

- Der Import läuft pro Element nach bestem Bemühen. Scheitert ein Charakter, Chat, Preset, Lorebook, Hintergrund oder eine Persona, überspringt Marinara das Element, notiert eine Warnung und macht mit dem Rest weiter.
- Mehrere Chatdateien, die zu einem Charakter gehören, landen als Verzweigungen eines einzigen Chats – nicht als getrennte Chats.
- Gruppenchats werden immer zu **Roleplay**-Chats.
- Importierte Elemente behalten das Änderungsdatum der Quelldatei als ihr Datum in Marinara. Der Zeitpunkt des Imports spielt dabei keine Rolle.

## Zugriff und Ordnerregeln

Die Schaltflächen für den Einzelimport funktionieren für alle, ganz ohne Vorbereitung.

Der Einrichtungsassistent **Import from SillyTavern Folder** liest Dateien von der Festplatte und braucht deshalb erhöhte Rechte. Auf demselben Rechner wie der Server (Loopback) läuft er ohne weitere Einrichtung. Von einem anderen Gerät oder Browser aus musst du auf dem Server ein Admin-Secret setzen. Denselben Wert speicherst du anschließend unter **Settings -> Advanced -> Admin Access**. Wie das Admin-Secret gesetzt wird, steht in der [Referenz zur Server-Konfiguration](../CONFIGURATION.md).

Setzt der Server `IMPORT_ALLOWED_ROOTS`, weist Marinara getippte Pfade außerhalb dieser Ordner ab. Pfade, die du über **Browse** oder den Ordner-Browser in der App auswählst, funktionieren auch bei aktivierter Einstellung immer.

## Was nicht mitkommt

Der Einrichtungsassistent für Ordner durchsucht nur die sieben oben genannten Kategorien. Andere SillyTavern-Daten wie globale App-Einstellungen und Quick Replies liest er weder ein noch importiert er sie.

Die mitgelieferten Presets von SillyTavern bleiben standardmäßig unmarkiert und kommen deshalb nur mit, wenn du sie selbst markierst.

Jedes einzelne Element, dessen Umwandlung scheitert, überspringt Marinara. Was genau ausgelassen wurde, zeigt die Warnliste im letzten Schritt des Einrichtungsassistenten.

## Verwandte Anleitungen

- [Charakterkarten importieren und exportieren](../characters/import-export.md)
- [Lorebooks importieren und exportieren](../lorebooks/import-export.md)
- [Chats exportieren und importieren](../chats/export-import.md)
- [Regex-Skripte](../extending/regex-scripts.md)
