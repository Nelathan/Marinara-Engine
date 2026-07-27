# Personal Extensions

**Personal Extensions** (persönliche Erweiterungen) sind private Code-Entwürfe, die Professor Mari für dich schreibt. Du findest sie unter **Settings** (Einstellungen) > **Addons** (Zusatzfunktionen) > **Personal Extensions**.

Standardmäßig steht dort:

> Ask Professor Mari to create an extension for you. Nothing runs until you enable it and approve the exact code hash.

Einen Befehl für einen neuen Entwurf gibt es in diesem Bereich nicht, und Import-Bedienelemente ebenso wenig. Bitte Professor Mari darum, einen Entwurf anzulegen oder zu überarbeiten. Sie darf Code speichern – freigeben oder aktivieren darf sie ihn nicht.

## Prüfen und aktivieren

Jeder Entwurf ist zunächst deaktiviert. Marinara berechnet aus dem ausführbaren Code einen SHA-256-Fingerabdruck. Öffne den Entwurf, sieh dir den Code an, vergleiche den angezeigten Hash und wähle **Review and Run** (prüfen und ausführen) nur dann, wenn du genau dieser Version vertraust. Jede Änderung am ausführbaren Code und jede wiederhergestellte Fassung deaktiviert die Erweiterung wieder und verlangt eine neue Freigabe.

Eine Sandbox beschränkt die Rechte, macht beliebigen Code aber nicht vertrauenswürdig. Eine bösartige Erweiterung kann trotzdem CPU-Leistung verschwenden, bis der Watchdog sie stoppt, ihren eigenen Speicher bis ans erlaubte Limit vollschreiben oder sich über Log-Ausgaben täuschend verhalten. Prüfe den Code deshalb immer, bevor du ihn aktivierst.

## Isolierung zur Laufzeit

Eine Browser-Erweiterung läuft in einem eigenen Worker innerhalb eines Sandbox-iframes mit undurchsichtigem Origin. Sie kommt weder an Marinaras Seite noch an DOM, Cookies, Browser-Speicher, Origin-APIs oder das Netzwerk heran. Erlaubt sind ihr: privater Erweiterungs-Speicher, Logging, verwaltete Timer, Aufräum-Registrierung, eingeschränkte Fenster und sichere Beitragspunkte in der Oberfläche.

Mit `marinara.ui.registerContribution(...)` kann eine Erweiterung Aktionen in der oberen Leiste, Einträge im Extensions-Menü und dauerhafte Panels am rechten Rand ergänzen. Marinara zeichnet diese Flächen im aktiven Theme und mit einem festen Satz an Bedienelementen: Überschriften, Text, vorformatierte Ausgabe, Schaltflächen, Texteingaben, Auswahlfelder, Schalter, Schieberegler, Farbwähler und Abstandshalter. Eine Erweiterung liefert nur Inhalt und Zustand – niemals HTML, CSS, URLs, React-Komponenten oder Event-Handler des Hosts.

Diese Oberflächen-Funktionen und -Regeln gelten für jede Browser-Erweiterung gleichermaßen, egal woher sie stammt. Auch eine importierte externe Erweiterung erhält dieselbe Contribution-API, sobald sie die Freischaltungen in `.env` und in der Danger Zone sowie die Freigabe per exaktem Hash durchlaufen hat. An Marinaras DOM oder APIs kommt sie trotzdem nicht heran.

### Ein von Marinara gezeichnetes Panel ergänzen

```js
const panel = marinara.ui.registerContribution({
  id: "weather-settings",
  kind: "panel",
  label: "Weather controls",
  description: "Tune a weather scene without leaving Marinara.",
  icon: "sparkles",
  elements: [
    { kind: "heading", text: "Atmosphere" },
    {
      kind: "select",
      id: "weather",
      label: "Weather",
      value: "rain",
      options: [
        { value: "rain", label: "Rain" },
        { value: "snow", label: "Snow" },
        { value: "aurora", label: "Aurora" },
      ],
    },
    { kind: "slider", id: "intensity", label: "Intensity", min: 0, max: 100, value: 60 },
    { kind: "toggle", id: "lightning", label: "Lightning", checked: false },
    { kind: "color", id: "tint", label: "Tint", value: "#6d8cff" },
    { kind: "button", id: "apply", label: "Apply" },
  ],
  onActivate: async () => {
    const settings = await marinara.storage.get();
    // Update the panel when stored state should be reflected in the controls.
  },
  onEvent: async ({ elementId, values }) => {
    if (elementId !== "apply") return;
    await marinara.storage.patch(values);
  },
});

marinara.onCleanup(() => panel.remove());
```

`kind: "button"` eignet sich für eine kompakte Aktion in der oberen Leiste oder im Extensions-Menü, `kind: "menu-item"` für eine reine Menü-Aktion. Beide rufen `onActivate` auf. Ein `panel` ruft `onActivate` beim Öffnen auf; seine Schaltflächen rufen `onEvent` mit den aktuellen Werten aller Panel-Bedienelemente auf. Der zurückgegebene Handle unterstützt `update({ label?, description?, icon?, elements? })` und `remove()`. IDs dürfen Buchstaben, Zahlen sowie `.`, `_` und `-` enthalten.

Aufwendigere Werkzeuge bauen mehrstufige Oberflächen, indem sie die Panel-Elemente nach einem Ereignis austauschen. Halte den Anwendungszustand in `marinara.storage` – nicht im Markup.

### Ältere Erweiterungen portieren

Wetter-Steuerungen, Prompt-Editoren und andere umfangreiche Abläufe sind völlig legitime Einsatzzwecke für Contributions. Sichere Portierungen kombinieren einen Starter im Menü oder in der oberen Leiste mit Panels, die sich Schritt für Schritt aktualisieren. Bestehende Pakete, die DOM-Overlays einfügen, Marinaras CSS-Selektoren abfragen, React-Interna durchsuchen oder `/api`-Routen derselben Origin aufrufen, lassen sich nicht unverändert in die sichere Laufzeitumgebung importieren.

Beiträge zur Oberfläche liefern nur die Bedienfläche, keine Rechte im Hintergrund. Funktionen, die Chats, Presets, Lorebooks, Charaktere, Personas oder visuelle Szeneneffekte brauchen, benötigen zusätzlich eine eigene Broker-Funktion, die Marinara bereitstellt und die du ausdrücklich freigibst. Solange es diese Funktion nicht gibt, darf eine Erweiterung sie nicht über Zugriffe auf das Host-DOM oder ungefilterte Netzwerkanfragen nachbauen.

Die ältere API `marinara.ui.showWindow(...)` steht weiterhin für ein temporäres Fenster im iframe mit undurchsichtigem Origin bereit. Sie nutzt dieselben festen Bedienelemente und liefert die Handles `update(...)` und `close()`. Greif lieber zu Contributions, wenn sich das Werkzeug über Marinaras normale Navigation erreichen lassen soll.

Eine Server-Erweiterung läuft in einem separaten, rechtebeschränkten Node-Prozess innerhalb von macOS Seatbelt oder Linux Bubblewrap. Sie kommt weder an Marinaras Dateien noch an deine eigenen Dateien, geerbte Server-Geheimnisse, das Netzwerk, Kindprozesse, Worker oder native Addons heran. Lässt sich keine unterstützte Betriebssystem-Sandbox einrichten, bleiben Server-Erweiterungen deaktiviert.

### Unterstützte Plattformen

Browser-Erweiterungen sperrt bereits der Browser selbst in eine Sandbox – sie laufen deshalb überall. Server-Erweiterungen brauchen eine unterstützte Betriebssystem-Sandbox; fehlt sie, bleiben sie deaktiviert und lassen sich auch nicht einschalten. Marinara führt sie niemals ersatzweise ohne Sandbox aus.

| Plattform               | Browser-Erweiterungen | Server-Erweiterungen                        |
| ----------------------- | --------------------- | ------------------------------------------- |
| macOS                   | ✅ In Sandbox         | ✅ In Sandbox (Seatbelt)                    |
| Linux (mit Bubblewrap)  | ✅ In Sandbox         | ✅ In Sandbox (Bubblewrap)                  |
| Linux (ohne `bwrap`)    | ✅ In Sandbox         | ⛔ Deaktiviert – `bwrap` installieren       |
| Windows                 | ✅ In Sandbox         | ⛔ Deaktiviert – Browser-Erweiterung nutzen |
| Android                 | ✅ In Sandbox         | ⛔ Deaktiviert – Browser-Erweiterung nutzen |

Unter Windows und Android gibt es keine unterstützte Prozess-Sandbox des Betriebssystems, deshalb entfallen Server-Erweiterungen dort bewusst. Nimm stattdessen eine Browser-Erweiterung – oder betreibe den Marinara-Server auf macOS oder Linux (mit `bwrap`), wenn du eine Server-Erweiterung brauchst.

## Externe Erweiterungen

Importe von Fremdanbietern sind standardmäßig gesperrt und ausgeblendet. Dafür sind zwei Schritte nötig:

1. Setze auf dem Marinara-Host `ENABLE_EXTERNAL_EXTENSIONS=true` in `.env`.
2. Öffne **Settings** > **Advanced** (Erweitert) > **Danger Zone** (Gefahrenbereich), scroll unter die Bedienelemente zum Löschen von Daten, lies die Warnung und aktiviere **Allow third-party extension imports** (Importe von Fremdanbietern erlauben).

Erst danach zeigt **Settings** > **Addons** den Bereich **External Extensions** samt Bedienelementen für Datei- und Ordner-Import. Diese Formate versteht Marinara immer:

- `.personal-extension.zip` und kompatible `.zip`-Pakete;
- `.json`-Manifeste;
- `.css`;
- `.js`, `.mjs` und `.cjs`;
- `.server.js`, `.server.mjs` und `.server.cjs`.

Ein Import bringt nie eine Freigabe mit und kann sich nicht selbst aktivieren. Als extern gelten außerdem alte Einträge, aus einem Profil importierte, von Hand abgelegte und solche unbekannter Herkunft. Sie bleiben ausgeblendet, lassen sich nicht freigeben und sind aus beiden Laufzeitumgebungen ausgeschlossen, solange nicht beide Schalter offen sind.

Sobald du einen der beiden Schalter umlegst, stoppt Marinara laufende externe Server-Prozesse, entfernt die Browser-Worker und deaktiviert die gespeicherten externen Einträge. Wer die Schalter erneut öffnet, startet sie damit nicht automatisch wieder.

Erweiterungen von Fremdanbietern können bösartigen oder gefährlichen Code enthalten. Prüfe jede einzelne Zeile, bevor du sie herunterlädst, importierst oder aktivierst. Du handelst dabei vollständig auf eigene Verantwortung.

## Export, Fassungen und Notfallhilfe

Über die Export-Aktion einer Erweiterung lädst du ein portables Paket herunter. Exportierte und wiederhergestellte Pakete bleiben deaktiviert. Auch wer eine frühere Fassung wiederherstellt, erhält wieder einen deaktivierten Entwurf.

Verhält sich eine Erweiterung daneben, wähle **Disable** (deaktivieren). Ist die Oberfläche nicht erreichbar, beende Marinara und setze im passenden `installed_extensions`-Eintrag den Wert `enabled` auf `"false"`. Setze `approvedHash` niemals von Hand.

## Verwandte Anleitungen

- [Professor Mari](../home/professor-mari.md)
- [Server-Konfiguration](../CONFIGURATION.md)
- [Backup und Wiederherstellung](../data/backup-and-restore.md)
- [Fernzugriff](../REMOTE_ACCESS.md)
