# Noodle-Prompt-Interna (Entwicklung)

Entwickler-Referenz: wo die Generierungs-Prompts von Noodle im Code liegen, wie du sie anpasst und wie du die fertigen Prompts debuggst. Ein Prompt ist der Text, den Marinara an die KI schickt. Endnutzende konfigurieren Noodle über das **Settings**-Panel (Einstellungen); dazu gibt es die Noodle-Anleitungen in `docs/noodle/`.

## Übersicht der Prompt-Quellen

Noodle hat aktuell einen inline hinterlegten Prompt für die Textgenerierung, einen registrierten Text-Override und einen registrierten Bild-Override.

| Zweck                                                       | Quelle                                                             | Hauptsymbol                                     | Anpassung                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Timeline-Posts, Antworten, Follows, Umfragen, Stimmen und Digests | `packages/server/src/routes/noodle.routes.ts`                      | `buildRefreshPrompt()`                          | Bearbeite die inline hinterlegten System- und Kontext-Nachrichten im Code. Der Teil zu Ton und kreativer Freiheit wandert in den weiter unten beschriebenen Override **Noodle Timeline Voice & Tone**; der Rest – die schemakritischen Regeln zum Ausgabeformat – lässt sich nicht über die Oberfläche anpassen. |
| Anweisungen zu Stimme und Ton der Timeline (Teilmenge des System-Prompts) | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_TIMELINE_VOICE` (`noodle.timelineVoice`) | Bearbeite **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Timeline Voice & Tone** (Einstellungen → Generierungen → Prompt-Overrides für die Bildgenerierung) oder ändere den registrierten Standard (`noodleTimelineVoiceDefaultText(enhanced)` in `noodle-prompt.ts`) im Code. Der Umfang ist bewusst auf den Ton beschränkt: Grenzen für strukturierte Aktionen, Regeln für Zielfelder und weitere schemakritische Anweisungen bleiben außerhalb dieses Overrides fest im Code, damit eine Umformulierung das Parsen von `noodleGeneratedRefreshSchema` nicht zerstört. Solange niemand den Standard bearbeitet, richtet er sich nach der Noodle-Einstellung `enableEnhancedTimelineWriting` (`ctx.enhanced`; deaktiviert entspricht das der ursprünglichen einzeiligen Ton-Anweisung). Sobald jemand einen eigenen Override-Text speichert, gilt dieser unabhängig von der Einstellung. |
| Erstmalige Profile für Charakter-Accounts                       | `packages/server/src/routes/noodle.routes.ts`                      | `generateMissingNoodleProfiles()`               | Bearbeite die inline hinterlegten System- und Nutzer-Nachrichten im Code. Zuerst läuft die Auswahl der Teilnehmenden; an diesen Prompt gehen nur ausgewählte Charakter-Accounts ohne `profileGenerated`.                       |
| Prompt für generierte Post-Bilder                                 | `packages/server/src/services/prompt-overrides/registry/noodle.ts` | `NOODLE_IMAGE_POST` (`noodle.imagePost`)        | Bearbeite **Settings -> Generations -> Image Generation Prompt Overrides -> Noodle Post Image** oder ändere den registrierten Standard im Code. |
| Standardmäßige Noodle-spezifische Bildanweisungen                  | `packages/shared/src/schemas/noodle.schema.ts`                     | `DEFAULT_NOODLE_SETTINGS.imageGenerationPrompt` | Ändere die Noodle-Einstellung in der Oberfläche oder den Schema-Standard im Code.                                                                    |
| Freigegebener Chat-Kontext, der in die Timeline-Generierung einfließt     | `packages/server/src/routes/noodle.routes.ts`                      | `buildOptedInChatContext()`                     | Ändere den Aufbau des Kontexts im Code; die Freigabe bleibt in den Einstellungen des jeweiligen Chats.                                                     |
| Bild-Eingaben für Timeline-Posts und -Antworten                        | `packages/server/src/services/noodle/noodle-vision.ts`             | `prepareNoodleVisionAttachments()`              | Ändere Bildauswahl, Normalisierung, Limits oder den reinen Text-Fallback für Kompatibilität im Code.                                           |
| Noodle-Aktivität, die in Chat-Prompts einfließt                  | `packages/server/src/services/noodle/noodle-context.ts`            | `buildRecentSocialMediaActivityBlock()`         | Ändere Filterung oder Blockaufbau im Code; Zielmodi und Element-Limits steuern die Nutzenden in den Noodle-Einstellungen, und der eingebettete Block hat eine harte Obergrenze von 8.192 Tokens.                                  |
| Generierter JSON-Vertrag                                     | `packages/shared/src/schemas/noodle.schema.ts`                     | `noodleGeneratedRefreshSchema`                  | Nur zusammen mit dem Prompt, der Routen-Verarbeitung, den gemeinsamen Typen und der Regressionsabdeckung ändern.                                            |
| Lorebook-Welt- und Lore-Kontext, der in die Timeline-Generierung einfließt | `packages/server/src/routes/noodle.routes.ts`                    | `buildRefreshPrompt()` (ruft `processLorebooks()` auf) | Hängt an der Noodle-Einstellung **Lorebook context** (`enableLorebookContext`, standardmäßig aus). Ein Lorebook ist eine Sammlung von Weltwissen. Genutzt wird dasselbe `processLorebooks()` für mehrere Charaktere wie in Gruppenchats, mit einem Noodle-eigenen Token-Budget aus `noodleLorebookTokenBudget()` in `noodle-prompt.ts`. Es skaliert mit der Zahl aktiver Charaktere und ist hart auf 8.192 Tokens gedeckelt. Der Aufruf läuft mit `previewOnly: true`, weil Noodle keinen Slot pro Chat hat, um Timing-Zustände für Sticky und Cooldown zu speichern. |

Timeline- und Profil-Prompts stehen derzeit nicht in der Oberfläche unter Prompt Overrides. Die Vorlage **Noodle Post Image** ist dort der einzige Noodle-Generierungs-Prompt. Das Noodle-eigene Feld **Prompt instructions** (Prompt-Anweisungen) fließt in genau diese Bildvorlage ein – den Prompt für das Schreiben der Timeline berührt es nicht.

Die Bild-Route lädt `NOODLE_IMAGE_POST` und schickt das Ergebnis durch `compileImagePrompt()`, bevor es an den Bild-Anbieter geht. Auf die fertige Anfrage wirken sich deshalb auch das gewählte Bildstil-Profil und die Standardwerte der Verbindung aus.

## Fertige Prompts prüfen

Läuft ein manueller Refresh bei aktiviertem **Debug Mode** (Debug-Modus), schreibt der gemeinsame Server-Logger die fertigen Modell-Nachrichten für Profil und Timeline ins Log. Achte auf:

```text
[debug/noodle] Profile prompt sent to model
[debug/noodle] Prompt sent to model
[debug/noodle] Attached N timeline image input(s) to the refresh prompt
```

Bilddaten der Timeline landen nie als Base64 im Debug-Log. Der protokollierte Text enthält dieselben Anhang-Schlüssel für Posts und Antworten, die auch an das Modell gehen, dazu die Anzahl der nativen Bild-Eingaben. Noodle normalisiert und begrenzt diese Eingaben in `noodle-vision.ts`. Lehnt ein Anbieter Vision-Inhalte ausdrücklich ab, protokolliert die Route das und schickt stattdessen den zusammengebauten reinen Text-Prompt.

Für Bilder aktivierst du **Expose media prompts before sending** (Medien-Prompts vor dem Senden anzeigen) unter **Settings -> Generations -> Image Generation**. Dann lassen sich der fertige positive und negative Prompt vor dem Absenden noch prüfen und bearbeiten.

## Sicher bearbeiten

Der Aufbau des Prompts ist eine Kompatibilitätsgrenze mit hohem Risiko. Halte bei Änderungen den Prompt, `noodleGeneratedRefreshSchema`, die Routen-Verarbeitung sowie die Regressionen für Noodle-Erwähnungen und Umfragen im Einklang. Führe mindestens aus:

```bash
pnpm check
pnpm regression:prompt
pnpm regression:noodle
```

## Verwandte Anleitungen

- [Noodle: die In-App-Social-Timeline](../noodle/overview.md)
- [Noodle-Einstellungen und Chat-Übernahme](../noodle/settings.md)
- [Architektur-Übersicht (Entwicklung)](architecture-map.md)
