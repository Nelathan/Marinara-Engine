# Untere Safe Area bei iOS-PWAs (für Entwickler)

In dieser Anleitung geht es um einen farbigen Streifen, der am unteren Bildschirmrand auftauchen kann. Er zeigt sich, wenn Marinara Engine als iPhone-App vom Home-Bildschirm läuft. Beschrieben werden der Fix, den Marinara mitliefert, der Kompromiss, den dieser Fix erzwingt, und die Diagnose des Streifens, falls eine spätere Änderung ihn zurückbringt.

Eine PWA (Progressive Web App) ist eine Website, die man auf dem Home-Bildschirm installiert und wie eine native App öffnet. Dieser Text richtet sich auf Code-Ebene an Mitwirkende, nicht an Endnutzende.

## Das Problem

Auf iPhones mit Home-Indikator (Face-ID-Modelle) ist der untere Bildschirmrand eine reservierte Safe Area für die Home-Geste. iOS behandelt diese Zone als rund 34 px hoch. Das entspricht dem Wert der CSS-Variablen `env(safe-area-inset-bottom)`.

Steht der Statusleisten-Stil der PWA auf `black-translucent`, lässt iOS kein `position: fixed`-Element mehr in diese Zone zeichnen. Jeder CSS-Workaround scheitert. WebKit begrenzt negative `bottom`-Offsets, `calc(100dvh + env(safe-area-inset-bottom))` und negative Höhenüberschreibungen.

Übrig bleibt ein sichtbarer Streifen unterhalb des Chat-Eingabefelds. Dieser Streifen – oft „Chin“ genannt – hat eine andere Farbe als der Rest der Oberfläche.

## Der ausgelieferte Fix

Marinara setzt den Statusleisten-Stil auf `black` statt auf `black-translucent`. Der Meta-Tag steht in `packages/client/index.html`.

```html
<meta name="apple-mobile-web-app-status-bar-style" content="black" />
```

Der Viewport-Tag behält `viewport-fit=cover` und das Standardverhalten der Tastatur.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
```

Im Modus `black` sperrt iOS die untere Zone nicht. Die App-Shell nutzt `fixed inset-0` ohne Überschreibung der Viewport-Höhe und zeichnet deshalb bis ganz nach unten in die Safe Area hinein. Der className der Shell in `packages/client/src/components/layout/AppShell.tsx` lautet:

```
mari-app mari-app-background-paint fixed inset-0 flex overflow-hidden
```

Füge dem Viewport-Tag kein `interactive-widget=resizes-content` hinzu. In mobilen PWAs kann das die gesamte Chat-Shell umskalieren, während die Tastatur einfährt, und das Scrollen der Nachrichten abgeschnitten zurücklassen.

## Der Kompromiss

Eine gläserne Statusleiste und ein gefüllter unterer Rand sind nicht gleichzeitig zu haben. Im Modus `black` ist die Statusleiste ein durchgehend dunkler Balken. `black-translucent` sieht oben mit seiner Transparenz hübscher aus, macht den unteren Streifen aber unentfernbar. Das ist eine harte Beschränkung von iOS.

## So wurde der Fehler gefunden

Der Streifen ließ sich einkreisen, indem jede Ebene eingefärbt und die App neu geöffnet wurde. Füge die Diagnose-Styles in `packages/client/dist/index.html` ein, und zwar in den dortigen Inline-Block `<style>`. Diese Datei landet nicht im Cache des Service Workers und wird immer frisch ausgeliefert. Änderungen sind beim nächsten Öffnen sichtbar, ganz ohne Cache-Leerung.

```
html, body { background-color: #ff0000 !important; }
.mari-chat-input-box { background-color: #00ff00 !important; }
.mari-app { background: #0000ff !important; }
```

Das Ergebnis liest sich so:

- Chin rot heißt: Dort zeichnet die HTML-Fläche. Im Modus `black-translucent` kann kein fixiertes Element sie überdecken.
- Chin blau heißt: Die Box der App-Shell reicht bis nach unten. Das ist der gewünschte Zustand.
- Chin grün heißt: Das Eingabefeld selbst füllt die Fläche bis zur Kante.

## Wenn ein Update den Fix zerlegt

### Symptom: Der Chin-Streifen unter dem Eingabefeld ist zurück

Prüfung 1. Vergewissere dich, dass `apple-mobile-web-app-status-bar-style` in `packages/client/index.html` weiterhin auf `black` steht. Wurde der Wert zurück auf `black-translucent` gesetzt, stell ihn wieder auf `black`.

Prüfung 2. Vergewissere dich, dass der AppShell-className in `packages/client/src/components/layout/AppShell.tsx` weiterhin `mari-app mari-app-background-paint fixed inset-0 flex overflow-hidden` lautet. Kombiniere `inset-0` niemals mit `h-screen`, `h-dvh` oder `max-h-screen`. Das schnürt die fixierte Shell zu stark ein, und die Tastatur auf dem Handy schiebt die Oberfläche hin und her.

Prüfung 3. Führe die Farbdiagnose von oben aus, um zu sehen, welche Ebene den Chin zeichnet. Beende die App hart und öffne sie neu. Eine Cache-Leerung ist nicht nötig, denn `dist/index.html` liegt nicht im Precache.

- Chin rot, Shell sonst blau: Die Box der Shell reicht nicht bis nach unten. Prüfe, ob der Statusleisten-Stil `black` ist.
- Chin weiterhin rot bei blauer Shell: Die Shell deckt nicht ab. Prüfe, ob `fixed inset-0` unversehrt ist.
- Chin blau: Die Shell deckt ab, aber das Eingabefeld füllt nicht bis nach unten. Prüfe den Innenabstand des Eingabe-Wrappers weiter unten.

### Symptom: Das Eingabefeld klebt an der Bildschirmkante

Die drei Eingabe-Komponenten brauchen `pb-3` an ihrem äußeren Wrapper, damit der Abstand natürlich wirkt – nicht `pb-0`.

- `packages/client/src/components/chat/ChatInput.tsx`: Der Wrapper lautet `mari-chat-input chat-input-container px-3 pb-3`.
- `packages/client/src/components/chat/ConversationInput.tsx`: Der Wrapper lautet `mari-chat-input chat-input-container relative px-2 sm:px-3 pb-3`.
- `packages/client/src/components/game/GameInput.tsx`: Der Wrapper lautet `px-3 pt-2 pb-3`.

## Neu bauen

Der Server liefert den gebauten Client aus `packages/client/dist` aus. Jede Quelltextänderung braucht deshalb einen neuen Build.

```
pnpm build:client
```

Lösche danach die Website-Daten auf dem Gerät und öffne die PWA neu. Auf dem Handy öffnest du dafür **Settings** (Einstellungen), dann **Safari**, dann **Advanced** (Erweitert), dann **Website Data** (Website-Daten). Der Service Worker cacht JS und CSS nach Inhalts-Hash – bei geändertem Hash laden die neuen Chunks erst nach dem Löschen der Website-Daten.

`dist/index.html` landet nicht im Cache des Service Workers und wird immer frisch ausgeliefert. Nutze die Datei für schnelle Diagnose-Styles, ohne komplett neu zu bauen.

## Die wichtigsten Fakten

- `black-translucent` liefert eine transparente Statusleiste, sperrt aber die untere Safe Area. Einen CSS-Workaround gibt es nicht.
- `black` oder `default` liefert eine deckende Statusleiste und lässt fixierte Elemente bis in die untere Safe Area reichen.
- `env(safe-area-inset-bottom)` beträgt auf Face-ID-iPhones etwa 34 px. Damit lässt sich bedienbarer Inhalt bei Bedarf über den Home-Indikator anheben.
- Im Modus `black-translucent` entsprechen die Viewport-Einheiten `dvh` und `lvh` der sicheren Inhaltshöhe, nicht der physischen Bildschirmhöhe. Zieh die Shell damit nicht über diese Grenze hinaus.
- `interactive-widget=resizes-content` kann die fixierte Chat-Shell beim Öffnen der Tastatur umskalieren. Bleib besser beim Standardverhalten des Viewports.

## Verwandte Anleitungen

- [Frontend-Architektur (für Entwickler)](frontend.md)
- [Anleitung für iOS-/iPadOS-PWAs](../installation/ios-pwa.md)
