# Installationsanleitung für Windows

In dieser Anleitung erfährst du, wie du Marinara Engine unter Windows installierst. Zur Wahl stehen der Ein-Klick-Installer (der bequeme Weg) und die Installation aus dem Quellcode. Außerdem geht es um Systemvoraussetzungen, optionale Funktionen und spätere Updates.

## Systemvoraussetzungen

Marinara Engine läuft auf deinem eigenen Windows-PC. Nötig ist Folgendes:

- Windows 10 oder Windows 11 (64 Bit).
- Ein paar Gigabyte freier Speicherplatz für die App und ihre Abhängigkeiten.
- Eine Internetverbindung während der Installation (zum Herunterladen von Code und Paketen).

Beide Installationswege brauchen zwei Werkzeuge. Der Installer holt sie auf Wunsch selbst. Beim Weg über den Quellcode installierst du sie selbst:

- **Node.js** in Version 24, 25 oder 26. Node.js führt die App aus. Empfohlen ist die LTS-Version 24. LTS steht für Long Term Support, also eine besonders stabile Version.
- **Git**. Git lädt den Code herunter und ermöglicht der App später eigene Updates.

pnpm ist der Paketmanager, der die Bestandteile der App installiert. Beim Installer und beim Starter **start.bat** musst du pnpm nicht selbst installieren. Beide holen die passende pnpm-Version über Corepack, ein pnpm-Hilfsprogramm aus dem Lieferumfang von Node.js, oder über einen temporären Download. Nur die manuelle Einrichtung ohne Starter setzt den Befehl `pnpm` auf dem System voraus. Der Installationsschritt dafür steht in diesem Abschnitt.

## Weg 1: Windows-Installer (empfohlen)

Der Installer ist der einfachste Einstieg. Er prüft, ob Node.js und Git vorhanden sind, hilft bei der Installation der fehlenden Werkzeuge, lädt die App herunter, baut sie und legt Verknüpfungen an.

So geht's:

1. Öffne die Releases-Seite von Marinara Engine im Browser.

```text
https://github.com/Pasta-Devs/Marinara-Engine/releases
```

2. Lade dort die neueste Installer-Datei für Windows herunter.
3. Starte den Installer und folge den Anweisungen auf dem Bildschirm. Fehlen Node.js oder Git, lass sie den Installer mitinstallieren.
4. Wähle den Installationsordner, wenn du gefragt wirst, oder übernimm den Standard.
5. Warte, bis der Installer die App heruntergeladen und gebaut hat. Das dauert einige Minuten.
6. Klick zum Schluss doppelt auf die neue Desktop-Verknüpfung, um Marinara Engine zu starten.

Nach kurzer Zeit sollte sich der Browser mit der App öffnen. Falls nicht, öffne den Browser selbst und ruf diese Adresse auf:

```text
http://127.0.0.1:7860
```

Der Installer richtet eine Git-basierte Kopie der App ein. Dadurch kann sie sich beim nächsten Start selbst aktualisieren. Mehr dazu im Abschnitt zu Updates weiter unten.

Warnt das Antivirenprogramm vor dem Installer, ist das ein bekannter Fehlalarm. Der Installer lädt Node.js und Git herunter, und manche Antivirenprogramme stufen genau das als verdächtig ein. Starte den Installer nur, wenn du ihn von der oben verlinkten offiziellen Releases-Seite geladen hast.

## Weg 2: Installation aus dem Quellcode

Nimm diesen Weg, wenn du die Befehle lieber selbst ausführst oder die Tester-Version (staging) willst.

### Schritt 1: Node.js und Git installieren

1. Lade den Node.js-Installer von der offiziellen Seite herunter und starte ihn.

```text
https://nodejs.org/en/download
```

2. Lade den Git-Installer von der offiziellen Seite herunter und starte ihn.

```text
https://git-scm.com/download/win
```

3. Öffne ein neues Fenster der Eingabeaufforderung. Prüfe, ob Node.js in Version 24, 25 oder 26 vorliegt:

```bat
node -v
```

4. Prüfe, ob Git installiert ist:

```bat
git --version
```

Beide Befehle sollten eine Versionsnummer ausgeben. Wird ein Befehl nicht gefunden, schließe die Eingabeaufforderung und öffne sie neu – oder installiere das fehlende Werkzeug noch einmal.

### Schritt 2: Code herunterladen und starten

Das Starter-Skript **start.bat** übernimmt die Einrichtung. Es wählt die passende pnpm-Version, installiert die Abhängigkeiten, baut die App und öffnet den Browser.

1. Lade den Code mit Git herunter:

```bat
git clone https://github.com/Pasta-Devs/Marinara-Engine.git
```

2. Wechsle in den neuen Ordner:

```bat
cd Marinara-Engine
```

3. Optional: auf die Tester-Version wechseln. Der Download startet mit der stabilen Version. Willst du stattdessen die Tester-Version (staging), führ diesen Befehl vor dem ersten Start aus. Bei der stabilen Version überspringst du den Schritt. Sichere die Daten, bevor du Tester-Builds einsetzt.

```bat
git checkout staging
```

Nach dem Wechsel bleibt der Starter auch bei Updates auf der Tester-Version.

4. Starte den Starter:

```bat
start.bat
```

Der erste Start dauert einige Minuten, weil dabei alles installiert und gebaut wird. Sobald das erledigt ist, öffnet der Browser die App unter `http://127.0.0.1:7860`. Für spätere Starts führst du **start.bat** einfach erneut im selben Ordner aus.

Der Starter öffnet die App standardmäßig fürs lokale Netzwerk, sodass andere Geräte im Netzwerk sie erreichen. Siehe „Zugriff von einem anderen Gerät“ weiter unten.

### Manuelle Einrichtung ohne Starter

Wenn du jeden Befehl lieber selbst ausführst statt **start.bat** zu nutzen, mach das aus dem Ordner `Marinara-Engine` heraus.

1. Installiere pnpm. Dieser Weg nutzt den Starter nicht, deshalb muss der Befehl `pnpm` auf dem System vorhanden sein. Der Befehl `npm` gehört zu Node.js. Führ das einmalig aus:

```bat
npm install -g pnpm
```

2. Installiere die Abhängigkeiten:

```bat
pnpm install --force
```

3. Bau die App:

```bat
pnpm build
```

4. Starte den Server:

```bat
pnpm start
```

5. Öffne die App im Browser:

```text
http://127.0.0.1:7860
```

Alles läuft auf deinem eigenen Rechner. Bei dieser manuellen Variante lauscht die App auf `127.0.0.1` – erreichbar ist sie damit nur von diesem Rechner. Damit andere Geräte im Netzwerk sich verbinden können, leg im Ordner `Marinara-Engine` eine Datei namens `.env` an. Trag diese Zeile ein und starte den Server neu:

```env
HOST=0.0.0.0
```

## Optional: KI-Freistellung für Sprites

Marinara Engine fordert für generierte Standbild-Sprites echte Transparenz an und bringt eine adaptive Matte-Bereinigung für flache Chroma-Hintergründe und ältere weiße Hintergründe mit. Zusätzlich lässt sich das optionale Werkzeug `backgroundremover` installieren, das bei detaillierten Landschaften und anderen ungleichmäßigen Hintergründen einspringt. Optional ist es deshalb, weil es große Machine-Learning-Dateien herunterlädt.

Dafür brauchst du zuerst Python. Installiere Python 3.11 von der offiziellen Seite und führ dann den Installationsbefehl aus dem Ordner `Marinara-Engine` aus:

```text
https://www.python.org/downloads/windows/
```

Führ den Installationsschritt aus:

```bat
pnpm backgroundremover:install
```

Das legt unter dem Datenordner einen eigenen Python-Ordner an (ein venv). Marinara Engine nutzt ihn danach automatisch für die Sprite-Bereinigung. Ein venv ist eine in sich geschlossene Python-Umgebung, die den Rest des Systems unangetastet lässt.

Alternativ installiert **start.bat** das Werkzeug beim nächsten Start für dich. Trag dazu diese Zeile in die Datei `.env` ein:

```env
BACKGROUNDREMOVER_AUTO_INSTALL=true
```

## Zugriff von einem anderen Gerät

Marinara Engine lässt sich auch vom Handy, Tablet oder einem anderen Rechner im selben Netzwerk öffnen. Die Einrichtungsschritte und die Sicherheitsoptionen stehen in der Anleitung [Häufige Fragen](../FAQ.md).

## Marinara Engine aktualisieren

Chats, Charaktere und Einstellungen bleiben beim Update erhalten. Unter Windows bietet Marinara Engine drei Wege zum Aktualisieren.

### Automatische Updates über den Starter

Startest du die App über die Desktop-Verknüpfung oder **start.bat** aus einer Git-basierten Kopie, sucht der Starter zuerst nach Updates. Gibt es eine neuere Version, lädt er die Änderungen, installiert die Abhängigkeiten neu, baut die App neu und startet sie dann. Das funktioniert sowohl bei Installer-Installationen als auch bei manuellen Klonen.

Mit `start.bat --skip-update` überspringst du eine einzelne Prüfung. Soll die installierte Engine-Version über alle Starts hinweg erhalten bleiben, trag `AUTO_UPDATE_ENABLED=false` in `.env` ein. Manuelle Prüfung, Anwenden in der App und manuelle Git-Updates bleiben weiterhin möglich.

Hast du ungespeicherte lokale Änderungen am Code, versucht der Starter, sie sicher beiseitezulegen. Nach dem Update spielt er sie zurück. Klappt das nicht, behält er die aktuelle Version bei und gibt einen Hinweis aus.

### Updates in der App

Nach Updates kannst du auch direkt in der App suchen.

1. Öffne **Settings** (Einstellungen).
2. Wechsle zum Tab **Advanced** (Erweitert).
3. Such den Abschnitt **Updates**.
4. Wähl unter **Release Channel** (Update-Kanal) einen Kanal. **Latest Stable** liefert die normale Version, **Staging/UAT** die frühen Tester-Builds. Sichere die Daten, bevor du Tester-Builds einsetzt.
5. Klick auf **Check for Updates** (nach Updates suchen). Die App meldet dir, ob eine neuere Version bereitsteht.

Die Schaltfläche **Apply Update** (Update anwenden) ist zur Sicherheit standardmäßig deaktiviert. Das Anwenden aus der App heraus braucht etwas Vorbereitung. Setze in der Datei `.env` diese Werte:

```env
UPDATES_APPLY_ENABLED=true
ADMIN_SECRET=your-own-secret-value
```

Öffne danach **Settings**, wechsle zum Tab **Advanced**, such **Admin Access** (Admin-Zugang) und füg dort denselben geheimen Wert ein. Anschließend steht **Apply Update** zur Verfügung.

Öffnest du die App von einem iPhone oder iPad, das sich mit diesem Windows-PC verbindet, aktualisiert **Apply Update** diesen Windows-Server. Fürs Anwenden aus der Ferne braucht `.env` noch einen Wert:

```env
UPDATES_ALLOW_REMOTE_APPLY=true
```

Ohne aktiviertes Anwenden in der App genügt zum Aktualisieren ein Neustart über die Verknüpfung oder **start.bat**.

### Manuelles Update

Nutzt du eine Git-Kopie ohne Starter, kannst du von Hand aktualisieren. Führ diese Befehle aus dem Ordner `Marinara-Engine` aus.

1. Hol den neuesten stabilen Code:

```bat
git fetch origin +refs/heads/main:refs/remotes/origin/main
```

2. Wechsle auf die neueste stabile Version:

```bat
git merge --ff-only origin/main || git checkout --detach origin/main
```

3. Installiere die Abhängigkeiten neu:

```bat
pnpm install --force
```

4. Bau die App neu:

```bat
pnpm build
```

5. Starte den Server erneut:

```bat
pnpm start
```

Für Tester-Builds nimmst du stattdessen den Branch staging. Führ diese zwei Befehle anstelle der Schritte 1 und 2 aus. Danach machst du mit den Installations- und Build-Schritten weiter:

```bat
git fetch origin +refs/heads/staging:refs/remotes/origin/staging
```

```bat
git checkout -B staging origin/staging
```

## Wenn etwas schiefgeht

Schlägt die Installation oder der Start fehl, prüf zuerst, ob Node.js in Version 24, 25 oder 26 vorliegt und ob Git installiert ist. Blockiert das Antivirenprogramm den Installer oder den Download, ist das der oben beschriebene bekannte Fehlalarm.

Weitere Lösungen findest du in der Anleitung [Fehlerbehebung in Marinara Engine](../TROUBLESHOOTING.md).

## Verwandte Anleitungen

- [Marinara Engine installieren](../INSTALLATION.md): den passenden Installationsweg für dein Gerät finden.
- [Marinara Engine aktualisieren](../UPGRADING.md): mehr Details dazu, wie die App aktuell bleibt.
- [Fehlerbehebung in Marinara Engine](../TROUBLESHOOTING.md): Lösungen für häufige Probleme.
- [Häufige Fragen](../FAQ.md): kurze Antworten, auch zum Netzwerkzugriff.
