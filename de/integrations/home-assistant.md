# Home-Assistant-Integration

In dieser Anleitung erfährst du, wie du Marinara Engine mit Home Assistant verbindest. Danach steuern deine KI-Charaktere echte Smart-Home-Geräte direkt aus einem Chat heraus: Licht, Klima, Rollläden und Media-Player. Umgekehrt können Home-Assistant-Automationen Nachrichten nach Marinara schicken.

Home Assistant ist eine kostenlose Open-Source-Plattform zur Steuerung von Smart-Home-Geräten. Ohne Home Assistant brauchst du diese Integration nicht.

## Was die Integration macht

Die Integration ist ein kleines Programm, das innerhalb von Home Assistant installiert wird. Sie verbindet ein laufendes Home Assistant mit einem laufenden Marinara-Engine-Server. Nach der Installation erledigt sie drei Dinge automatisch:

- Sie legt Smart-Home-Werkzeuge in Marinara an. Die tauchen im Bereich **Functions** (Funktionen) des Presets-Panels auf. Marinara nennt sie „custom tools“ oder „Functions“. Wie Functions grundsätzlich arbeiten, steht unter [Eigene Werkzeuge](../extending/custom-tools.md).
- Sie legt in Marinara einen Agenten namens **Home Assistant** an. Ein Agent ist ein KI-Helfer, der parallel zum Chat läuft. Mehr dazu unter [Agenten im Überblick](../agents/agents-overview.md).
- Sie legt mehrere Home-Assistant-Entitäten an, damit du Marinara auch von der Home-Assistant-Seite aus beobachten und steuern kannst. Eine Entität ist ein Gerät, ein Sensor oder ein Bedienelement in Home Assistant.

Werkzeug-Adressen musst du nirgends kopieren, Werkzeuge nirgends von Hand einrichten. Die Integration verdrahtet beim ersten Einrichten alles selbst.

## Voraussetzungen

Bevor du loslegst, muss all das erfüllt sein.

- Ein laufendes Home Assistant, Version 2024.1.0 oder neuer.
- HACS in Home Assistant installiert. HACS ist der Home Assistant Community Store, ein Werkzeug zum Installieren von Integrationen, die nicht standardmäßig dabei sind.
- Marinara Engine installiert, laufend und vom Home-Assistant-Rechner aus erreichbar. Die Standardadresse lautet `localhost:7860`. Läuft Home Assistant auf einem anderen Gerät, lies unten den Hinweis zu Passwörtern.
- Die Einstellung `WEBHOOK_LOCAL_URLS_ENABLED=true` in der `.env`-Datei von Marinara.

Die `.env`-Datei ist die Klartext-Einstellungsdatei des Marinara-Servers. Wo sie liegt und wie du sie bearbeitest, steht unter [Server-Konfiguration](../CONFIGURATION.md).

Diese letzte Einstellung ist nötig, weil die Integration einen Webhook nutzt. Ein Webhook ist eine Web-Adresse, über die eine App automatisch Daten an eine andere schickt. Die Webhook-Adresse von Home Assistant ist eine lokale, unverschlüsselte `http`-Adresse. Solche Aufrufe blockiert Marinara aus Sicherheitsgründen standardmäßig. `WEBHOOK_LOCAL_URLS_ENABLED=true` erlaubt sie.

Trag diese Zeile in die `.env`-Datei ein:

```
WEBHOOK_LOCAL_URLS_ENABLED=true
```

Die Einstellung greift nach ein paar Sekunden. Ein Neustart des Marinara-Servers ist nicht nötig.

### Wenn Home Assistant auf einem anderen Gerät läuft

Die Integration verbindet sich ohne Benutzernamen und Passwort mit Marinara. Im Einrichtungsformular gibt es dafür schlicht kein Feld. Deshalb spielt es eine Rolle, wo Home Assistant läuft:

- Laufen Home Assistant und Marinara auf demselben Rechner, klappt die Verbindung sofort.
- Läuft Home Assistant auf einem anderen Gerät, blockiert Marinara die Verbindung standardmäßig. Du musst diesem Gerät den Zugriff ohne Passwort erlauben. Ein Weg: Trag die IP-Adresse des Geräts in `IP_ALLOWLIST` in der `.env`-Datei von Marinara ein. Eine IP-Adresse ist die Nummernadresse eines Geräts im Netzwerk. In einem vollständig vertrauenswürdigen Heimnetzwerk kannst du stattdessen `ALLOW_UNAUTHENTICATED_PRIVATE_NETWORK=true` setzen.
- Ist Marinara mit `BASIC_AUTH_USER` und `BASIC_AUTH_PASS` geschützt, kann sich die Integration nicht anmelden. Sie funktioniert dann nur vom selben Rechner aus oder von einem Gerät, das in `IP_ALLOWLIST` steht.

Wie diese Einstellungen wirken und welche die richtige ist, steht unter [Fernzugriff](../REMOTE_ACCESS.md).

## Die Integration in Home Assistant installieren

Die Installation läuft in zwei Etappen: erst in HACS hinzufügen, dann einrichten.

### In HACS hinzufügen

1. Öffne in Home Assistant **HACS**.
2. Öffne das Drei-Punkte-Menü und klick auf **Custom repositories** (eigene Quellen).
3. Trag ins Feld für die Quelle diese Adresse ein:

```
https://github.com/Pasta-Devs/Marinara-Engine
```

4. Setz die Kategorie auf **Integration** und klick auf **Add** (hinzufügen).
5. Such nach **Marinara Engine** und installier die Integration.
6. Starte Home Assistant neu.

### Einrichten

1. Geh zu **Settings** (Einstellungen), dann **Devices & Services** (Geräte und Dienste), und klick auf **Add Integration** (Integration hinzufügen).
2. Such nach **Marinara Engine**.
3. Trag unter **Host** und **Port** ein, wo Marinara läuft. Die Standardwerte sind `localhost` und `7860`.
4. Klick auf **Submit** (absenden).

Ist Marinara unter dieser Adresse nicht erreichbar, zeigt Home Assistant einen Fehler und bricht ab. Sieh dann unten unter „Fehlerbehebung“ nach.

## Was Marinara Engine automatisch anlegt

Läuft die Einrichtung durch, baut die Integration alles Weitere selbst auf.

- Sie registriert einen privaten Webhook in Home Assistant.
- Sie legt die Smart-Home-Werkzeuge im Bereich **Functions** von Marinara an, jedes bereits auf diesen Webhook gerichtet.
- Sie legt in Marinara den Agenten **Home Assistant** an und trägt dort jedes aktivierte Werkzeug ein.
- Sie legt die Home-Assistant-Entitäten an, die weiter unten beschrieben sind.

## Den Home-Assistant-Agenten zu einem Chat hinzufügen

Angelegt heißt nicht überall aktiv: Du musst den Agenten jedem Chat einzeln hinzufügen, in dem die Smart-Home-Steuerung funktionieren soll.

1. Öffne den gewünschten Chat.
2. Öffne **Chat Settings** (Chat-Einstellungen) und dort den Bereich **Agents** (Agenten).
3. Füg dem Chat den Agenten **Home Assistant** hinzu.

Der Home-Assistant-Agent läuft in Roleplay-, Conversation- und Game-Chats. Sobald er hinzugefügt ist, stehen der KI in diesem Chat automatisch die Smart-Home-Werkzeuge zur Verfügung. Sonst musst du im Chat nichts weiter aktivieren.

## Prüfen, ob alles funktioniert

Ein einfacher Testauftrag zeigt, ob die Verbindung steht.

1. Füg wie oben beschrieben den Agenten **Home Assistant** zu einem Chat hinzu.
2. Tipp in diesem Chat einen ganz normalen Auftrag ein, zum Beispiel: `Turn on the office lights`.
3. Schick die Nachricht ab.

Die KI sollte nun ein Smart-Home-Werkzeug aufrufen, etwa `ha_turn_on`, und das passende Licht sollte angehen. Anschließend bestätigt die KI, was sie getan hat. Passiert nichts, prüf, ob `WEBHOOK_LOCAL_URLS_ENABLED=true` gesetzt ist, und sieh unter „Fehlerbehebung“ nach.

## Freigegebene Werkzeug-Kategorien

Die Integration sortiert ihre Smart-Home-Werkzeuge in acht Kategorien. Du entscheidest, welche Kategorien Marinara nutzen darf.

Zum Ändern öffne **Settings**, dann **Devices & Services**, klick auf **Marinara Engine** und dann auf **Configure** (konfigurieren). Dort gibt es zwei Optionen:

- **Primary Chat** (Haupt-Chat): der Standard-Chat, auf den die Home-Assistant-Dienste wirken. Diese Dienste sind weiter unten beschrieben.
- **Exposed Tool Categories** (freigegebene Werkzeug-Kategorien): die Liste der Werkzeug-Kategorien, die Marinara nutzen darf.

Diese Tabelle zeigt jede Kategorie, ihren Standard und die enthaltenen Werkzeuge.

| Kategorie | Standard | Werkzeuge |
|---|---|---|
| Lights & Switches | On | ha_turn_on, ha_turn_off, ha_toggle, ha_set_brightness, ha_set_color, ha_set_color_temp |
| Climate | On | ha_set_temperature, ha_set_hvac_mode |
| Covers (Blinds & Garage) | On | ha_open_cover, ha_close_cover, ha_set_cover_position |
| Locks | Off | ha_lock, ha_unlock |
| Media Players | On | ha_media_play, ha_media_pause, ha_set_volume |
| Scenes & Scripts | On | ha_activate_scene, ha_run_script |
| Query | On | ha_get_state, ha_list_areas, ha_list_entities, ha_notify |
| Generic Service Calls (Advanced) | Off | ha_call_service |

**Locks** und **Generic Service Calls (Advanced)** sind standardmäßig aus. Schalte sie nur ein, wenn du sie wirklich brauchst. Mit **Generic Service Calls (Advanced)** darf die KI jeden beliebigen Home-Assistant-Dienst aufrufen – entsprechend vorsichtig solltest du damit umgehen.

Die meisten Werkzeuge akzeptieren entweder ein bestimmtes Gerät oder einen Raumnamen. Bei einem Raumnamen wirkt das Werkzeug auf alle passenden Geräte in diesem Raum gleichzeitig.

Änderungen an den Kategorien greifen erst, wenn du **Marinara Sync HA Tools** drückst oder Home Assistant neu startest. Diese Schaltfläche ist im nächsten Abschnitt beschrieben.

## Home-Assistant-Entitäten

Die Integration legt diese Entitäten unter einem Home-Assistant-Gerät namens **Marinara Engine** an.

| Entität | Typ | Funktion |
|---|---|---|
| Marinara Chat Count | Sensor | Zeigt die Gesamtzahl der Marinara-Chats |
| Marinara Active Agent Count | Sensor | Zeigt, wie viele Marinara-Agenten aktiviert sind |
| Marinara Active Chat | Select | Legt fest, auf welchen Chat die Home-Assistant-Dienste wirken |
| Marinara Agent: (Name) | Switch | Schaltet einen Marinara-Agenten ein oder aus. Pro Agent gibt es einen Schalter |
| Marinara Abort Generation | Button | Bricht eine gerade laufende KI-Generierung ab |
| Marinara Sync HA Tools | Button | Schickt alle Werkzeuge erneut und baut den Home-Assistant-Agenten neu auf |

Alle 30 Sekunden fragt die Integration bei Marinara nach neuen Chats und Agenten. Ein Chat oder Agent, den du gerade in Marinara angelegt hast, erscheint hier also erst nach bis zu 30 Sekunden.

## Marinara aus Home-Assistant-Automationen steuern

Die Integration ergänzt zwei Home-Assistant-Dienste. Die nutzt du in Home-Assistant-Automationen, nicht in Marinara. Beide wirken standardmäßig auf den **Primary Chat**.

### Send Message (marinara_engine.send_message)

Schickt eine Nachricht in einen Marinara-Chat.

- `message`: der Nachrichtentext. Pflichtfeld.
- `chat_id`: der Ziel-Chat. Bleibt das Feld leer, wird der Primary Chat verwendet.
- `role`: von wem die Nachricht stammt. Möglich sind `user`, `assistant`, `system` und `narrator`. Standard ist `user`.
- `trigger_generation`: bei true antwortet die KI nach dem Senden zusätzlich. Standard ist false.

Diese Automation meldet der KI, dass die Haustür aufgegangen ist:

```yaml
automation:
  trigger:
    platform: state
    entity_id: binary_sensor.front_door
    to: "on"
  action:
    service: marinara_engine.send_message
    data:
      message: "Someone just arrived at the front door."
      trigger_generation: true
```

### Trigger Generation (marinara_engine.trigger_generation)

Startet eine KI-Antwort in einem Chat, ohne dass du eine sichtbare Nachricht schickst.

- `chat_id`: der gewünschte Chat. Bleibt das Feld leer, wird der Primary Chat verwendet.
- `user_message`: eine optionale Nachricht, die dem Antwortzug beiliegt.

## Nach Einstellungsänderungen neu synchronisieren

Hast du die aktivierten Kategorien geändert, drück auf **Marinara Sync HA Tools**, damit die Änderung wirksam wird. Die Schaltfläche findest du in Home Assistant auf der Geräteseite von **Marinara Engine**.

Ein Druck auf **Marinara Sync HA Tools** bewirkt Folgendes:

- Bestehende Werkzeuge werden an Ort und Stelle aktualisiert, sodass jede Änderung in Marinara ankommt.
- Der Agent **Home Assistant** wird neu aufgebaut, falls du ihn in Marinara gelöscht hast.
- Jedes Werkzeug aus einer abgeschalteten Kategorie wird deaktiviert. Gelöscht wird es nicht.

Bearbeite die Home-Assistant-Werkzeuge in Marinara nicht von Hand. Die nächste Synchronisierung überschreibt deine Änderungen und schaltet die Werkzeuge wieder ein.

## Fehlerbehebung

### Das Einrichtungsformular meldet, dass keine Verbindung möglich ist

Prüf, ob Marinara Engine läuft. Kontrollier, ob **Host** und **Port** zu der Adresse passen, auf der Marinara lauscht. Standard ist `localhost` und `7860`.

Läuft Home Assistant auf einem anderen Gerät als Marinara, blockiert Marinara es standardmäßig. Die Integration kann kein Passwort mitschicken, also muss Marinara das Gerät ohne Passwort akzeptieren. Trag die IP-Adresse des Home-Assistant-Geräts in `IP_ALLOWLIST` in der `.env`-Datei von Marinara ein. Diese und weitere Möglichkeiten beschreibt [Fernzugriff](../REMOTE_ACCESS.md). Ein mit `BASIC_AUTH_USER` und `BASIC_AUTH_PASS` geschütztes Marinara weist die Integration ebenfalls ab, sofern das Gerät nicht in `IP_ALLOWLIST` steht.

Diese Regeln gelten auch nach der Einrichtung weiter. Blockiert Marinara das Home-Assistant-Gerät später, hören die Sensoren und die Chatliste still und leise auf, sich zu aktualisieren.

### Die KI versucht ein Geräte-Werkzeug, aber nichts passiert

Höchstwahrscheinlich wird der Webhook-Aufruf blockiert. Trag `WEBHOOK_LOCAL_URLS_ENABLED=true` in die `.env`-Datei von Marinara ein und speicher sie. Das greift nach ein paar Sekunden. Ohne diese Einstellung scheitern Werkzeugaufrufe mit einer Meldung, dass `http` nicht erlaubt ist oder dass eine private Adresse abgelehnt wurde.

Laufen Marinara und Home Assistant auf demselben Rechner, nutzt die Integration für den Webhook automatisch die interne Adresse. Läuft Marinara auf einem anderen Gerät, achte darauf, dass die lokale Netzwerkadresse von Home Assistant von diesem Gerät aus erreichbar ist.

### Die Werkzeuge tauchen nicht in der Functions-Liste auf

Drück auf **Marinara Sync HA Tools** oder starte Home Assistant neu. Schau danach im Bereich **Functions** des Presets-Panels in Marinara nach.

### Der Home-Assistant-Agent fehlt in meinem Chat

Prüf zuerst, ob es den Agenten **Home Assistant** in Marinara unter Agents überhaupt gibt. Fehlt er, drück auf **Marinara Sync HA Tools**, um ihn neu aufzubauen. Öffne dann **Chat Settings**, öffne den Bereich **Agents** und füg dem Chat den Agenten **Home Assistant** hinzu.

### Die Webhook-Adresse von Hand finden

Nötig ist das selten, denn jedes Werkzeug hat die Adresse bereits hinterlegt. Zum Nachschlagen öffnest du in Home Assistant **Settings**, dann **Devices & Services**, dann **Marinara Engine**. Der Webhook folgt diesem Muster, wobei 8123 der Standard-Port von Home Assistant ist:

```
http://<homeassistant-ip>:8123/api/webhook/<webhook-id>
```

## Deinstallieren

Zum Entfernen löschst du die Integration in Home Assistant unter **Settings**, dann **Devices & Services**, dann **Marinara Engine**. Damit verschwinden die Home-Assistant-Entitäten. Die Werkzeuge, die sie im Bereich **Functions** angelegt hat, bleiben in Marinara erhalten – genauso wie der Agent **Home Assistant**. Beides löschst du bei Bedarf von Hand in Marinara.

## Verwandte Anleitungen

- [Eigene Werkzeuge](../extending/custom-tools.md)
- [Agenten im Überblick](../agents/agents-overview.md)
- [Server-Konfiguration](../CONFIGURATION.md)
- [Fernzugriff](../REMOTE_ACCESS.md)
