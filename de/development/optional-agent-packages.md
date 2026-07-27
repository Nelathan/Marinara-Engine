# Optionale Agent- und Capability-Pakete

Status: umgesetzt im Entwicklungszyklus für v2.3.0, Issue #3612.

## Ziel

Die Basis-Auslieferung von Marinara Engine darf optionale Agent- und Capability-Implementierungen weder kompilieren noch mitliefern. Eine frische Installation startet ganz ohne optionale Pakete. Bei einem Update bleiben alle Fähigkeiten erhalten, die es schon vor diesem Paketsystem gab.

Der offizielle Katalog, die Paketquellen, reproduzierbare Artefakte, Prüfskripte und der Beitragsprozess liegen in [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents). Installierte Artefakte landen unterhalb des konfigurierten Marinara-Datenordners, damit ein Update der Anwendung sie nicht überschreiben kann.

## Paketmodell

Ein Agent-Paket kann einen oder mehrere deklarative Agenten beisteuern, dazu optional vertrauenswürdigen, ausführbaren Capability-Code:

- Server-Einstiegspunkte für Routen, Lifecycle-Hooks, Prompt-Provider, Result-Handler und Storage-Migrationen;
- Client-Einstiegspunkte für Panels, Chat-Oberflächen, Einstellungsbereiche, Auswahlpunkte in der Einrichtung und Laufzeitanzeigen;
- gemeinsam genutzte JSON-Schemas und stabile Wire-Contracts;
- paketeigene Assets, Dokumentation und Wissensfragmente für Professor Mari.

Pakete richten sich nach einer versionierten Marinara-Capability-API. Private Quellpfade der Engine dürfen sie nicht importieren.

Client-seitige Capability-Elemente erhalten die in der Engine gewählte UI-Sprache über ihre Attribute `lang` und `dir` sowie über
das Objekt `capabilityProps.localization`. Paketeigene Oberflächen bringen eigene Sprachdateien mit und fallen sonst auf das
Englisch des Pakets zurück; die Engine übersetzt weder Paket-Prompts noch maschinenlesbare Werte aus dem Paket. Ein Sprachwechsel
nutzt weiterhin das bestehende Event `marinara-capability-props` – eine installierte Oberfläche rendert also ohne Neustart der Engine neu.

Capability-API 1.1 ergänzt den Server-Aktivierungskontext um eine generische Runtime-Fassade.
Pakete lesen darüber den effektiven Agent-Debug-Status und schreiben über den Pino-Logger
der Engine, inklusive expliziter Debug-Modus-Überschreibungen – ohne den privaten Logger
oder die Module der Laufzeitkonfiguration zu importieren. Die Fassade stellt Operationen
bereit, nicht die dahinterliegenden Engine-Objekte.

Capability-API 1.2 ergänzt transaktionsgebundene Chat- und Nachrichten-Operationen,
eng begrenzte Schreibzugriffe auf Chat-Metadaten, Existenzprüfungen für Lorebook-Einträge
sowie den Kompatibilitätsspeicher für räumliche Snapshots. Pakete prüfen fachliche
Änderungen damit innerhalb einer Engine-Transaktion und schreiben Metadaten atomar
zusammen mit der zugehörigen Nachricht, einem Swipe oder einem räumlichen Snapshot fest –
ganz ohne Datenbank-Handle oder Tabellenobjekt. Rollback und Kompatibilität mit
historischen Speicherständen bleiben Sache der Engine, Validierung und Fachlogik Sache
der Pakete. Dieselbe API liefert außerdem normalisierte Chat- und Charakterdatensätze,
die Auswahl passender Lorebook-Einträge, das Parsen JSON-ähnlicher Antworten und aufgelöste
Sprachmodell-Aufrufe. Zugangsdaten von Verbindungen, Anbieter-Implementierungen,
Datenbank-Handles und Speicherobjekte bleiben der Engine vorbehalten.

## Erste Pakete

- alle bisher fest eingebauten Agenten;
- hierarchische räumliche Karten für Roleplay und Game;
- Audio- und Videoanrufe in Conversation;
- UNO;
- Chess;
- Poker;
- 8-Ball Pool;
- Tic-Tac-Toe;
- Rock-Paper-Scissors.

In der Basis bleiben nur der Paketmanager, der Katalog-Client, die generischen Verträge für die Agent-Pipeline, die generischen Verträge für Turn-Game-Hosts und die inerten Host-Schnittstellen. Die konkreten Implementierungen gehören in die Pakete.

## Vertrauen und Installation

Der offizielle Katalog ist ein schemavalidiertes, versioniertes JSON-Dokument und wird über HTTPS geladen. Jeder Release-Eintrag nennt unveränderliche Artefakt-URLs, SHA-256-Prüfsummen, Dateigrößen in Byte, die Engine-Kompatibilität, die Berechtigungen und ob die Laufzeit einen Neustart braucht.

Beim Serverstart lädt der Host den Katalog genau einmal, sofern mindestens ein offizielles Paket installiert ist. Er wählt nur neuere Versionen aus, die zur laufenden Engine und zur Capability-API passen, prüft sie über die normale Installationsstrecke und installiert sie, bevor die Paket-Laufzeiten aktiv werden. Fehler bleiben auf das jeweilige Paket beschränkt. Ist der Katalog offline oder schlägt eine Prüfung fehl, bleiben vorhandene Dateien und der Registry-Stand nutzbar; scheitert die Bereitschaft einer Server-Laufzeit, greift der Rollback auf die Vorgängerversion.

Der Installer muss:

1. privilegierten Loopback-/Admin-Zugriff verlangen;
2. HTTPS, Download-Grenzen und Zeitlimits durchsetzen;
3. vor dem Entpacken das Katalogvertrauen und die SHA-256-Prüfsumme des Artefakts verifizieren;
4. absolute Pfade, Traversal, Links, Gerätedateien und nicht deklarierte Dateien ablehnen;
5. das Manifest und die Engine-Kompatibilität validieren;
6. in einen temporären Nachbarordner entpacken;
7. erst nach erfolgreicher Validierung atomar aktivieren;
8. die Vorgängerversion behalten, bis die neue Laufzeit sauber startet;
9. die Aktivierung im Fehlerfall zurückrollen;
10. niemals Install-, Update- oder Uninstall-Skripte ausführen.

Der offizielle Katalog aktiviert ausschließlich vertrauenswürdige, ausführbare Pakete aus erster Hand. Ein späterer Weg für Drittanbieter braucht ein eigenes, ausdrückliches Vertrauenskonzept.

## Laufzeit- und Neustartverhalten

Der Server verwaltet die Registry der installierten Pakete und stellt den Clients die installierten Fähigkeiten bereit. Deklarative und nachladbare Module werden sofort aktiv. Nach der Aktivierung verwirft die Oberfläche die Abfragen zu Katalog, Agenten, Modus-Fähigkeiten und aktivem Chat.

`restartRequired` darf im Manifest nur stehen, wenn der Host diesen Einstiegspunkt nicht gefahrlos neu laden kann. Nach erfolgreicher Aktivierung im laufenden Betrieb meldet Marinara `Agent installed. It is ready to use.` Ist ein Neustart nötig, lautet die Meldung `Agent installed. Restart Marinara Engine to finish setup.`

Turn-Game-Pakete lassen sich im laufenden Betrieb neu laden: Die Installation registriert Server-Engine und manuellen Slash-Befehl sofort, die Deinstallation löst die Laufzeit ohne Neustart der Engine wieder ab. Die Einstellung **Conversation Commands** (Chat-Befehle) je Chat regelt nur, ob Charaktere den versteckten Befehl des Pakets auslösen dürfen – den eigenen Slash-Befehl schränkt sie nicht ein. Die aktuellen offiziellen Turn-Game-Manifeste tragen aus Vorsicht weiterhin die alte Neustart-Markierung, damit sie mit Engine 2.x kompatibel bleiben; Engine 3.x erkennt die Art `turn-game`, aktiviert sicher im laufenden Betrieb und meldet das Paket als aktiv und einsatzbereit.

## Kompatibilitäts-Migration

Beim ersten Start nach dem Update gilt:

- eigene Agenten bleiben unangetastet;
- jeder alte, fest eingebaute Agent, den diese Installation kennt, wird als installiert vermerkt;
- Karten, Conversation-Anrufe und Conversation-Spiele bleiben genauso verfügbar wie zuvor;
- vorhandene Chat-Konfiguration, Snapshots, Spielzustand, Anrufverlauf und Agent-Gedächtnis bleiben erhalten;
- die Migration ist wiederholbar und vermerkt ihren Abschluss erst, wenn alle alten Verfügbarkeitseinträge dauerhaft gespeichert sind.

Die alten Paket-Artefakte bleiben als Migrationsquelle im offiziellen Katalog verfügbar. Frische Installationen zeigen und aktivieren sie erst, wenn du sie selbst installierst.

## Deinstallation

Beim Deinstallieren entfernt Marinara das Paket aus der Auswahl aktiver Chats, löscht seine Agent-Konfiguration und die heruntergeladenen ausführbaren Dateien und löst seine Laufzeit bei Bedarf mit dem nächsten Neustart ab. Bisherige Chats, Nachrichten, Karten-Snapshots, Anrufzusammenfassungen und abgeschlossene Spielstände bleiben lesbar – das Entfernen eines Pakets kann deine Arbeit also nicht zerstören. Fachdaten aus der Historie endgültig zu löschen, ist ein separater, ausdrücklicher Schritt.

Jede Deinstallation muss bestätigt werden. Betroffene Chats fallen auf ihre gewöhnlichen Basis-Oberflächen zurück, ohne dass der Verlauf Schaden nimmt.

## Katalog-Oberfläche

Im **Agents**-Panel gibt es die Schaltfläche `Download Agents`, passend zum `Download Cards` im **Card Browser** (Kartenbrowser). Sie öffnet eine bildschirmfüllende, responsive Bibliothek mit Suche, Paketarten, Kompatibilitätsangaben, Installations- und Update-Status, Berechtigungen, Speicherbedarf, Dokumentation und Schaltflächen zum Deinstallieren.

Am Desktop steht neben der Übersichtsliste ein Detailbereich. Auf dem Handy gibt es nur ein Panel, dafür eine ausdrückliche Zurück-Navigation und fingerfreundliche Aktionen. Leere, offline, inkompatibel, beschädigter Download, abgebrochene Installation, Update, Rollback und „Neustart nötig“ sind vollwertige Zustände der Oberfläche.

## Kriterium für eine abgeschlossene Auslagerung

Eine Auslagerung gilt erst dann als abgeschlossen, wenn die produktiven Basis-Bundles von Client und Server die Paket-Implementierung nicht mehr enthalten, eine frische Installation sie ohne Download des Pakets nicht aktivieren kann, eine aktualisierte Installation sie behält und Installation, Update und Deinstallation des Pakets am Desktop, auf dem Handy und auf Termux-kompatiblen Dateisystemen durchlaufen.
