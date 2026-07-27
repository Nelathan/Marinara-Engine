# Haptisches Feedback einrichten

In dieser Anleitung erfährst du, wie ein KI-Charakter in Marinara Engine angeschlossene haptische Geräte steuert. Es geht um die Installation der Begleit-App, das Hinzufügen des **Haptic Feedback**-Agenten zu einem Chat, die Verbindung zum Gerät und die Einstellungen für Berührungen.

## Was haptisches Feedback ist

Beim haptischen Feedback schickt ein KI-Charakter während des Chats Berührungsimpulse an ein angeschlossenes haptisches Gerät (ein intimes Spielzeug). Marinara Engine spricht das Gerät nicht direkt an. Stattdessen gehen die Befehle an eine kostenlose Begleit-App namens **Intiface Central**, und die steuert dann das Gerät.

**Intiface Central** beherrscht ein Geräteprotokoll namens **Buttplug.io** – denselben offenen Standard, den viele Spielzeuge und andere Apps unterstützen. Du installierst **Intiface Central** einmal, koppelst das Gerät damit, und Marinara verbindet sich über eine lokale Netzwerkadresse.

Haptisches Feedback steckt in einem der Chat-**Agents** (Agenten), also den KI-Helfern, die sich einem Chat hinzufügen lassen. Es funktioniert im Conversation Mode und im Roleplay Mode. Im Game Mode gibt es das nicht.

## Bevor du loslegst

Drei Dinge müssen bereitstehen, bevor du haptisches Feedback einschaltest.

1. Installiere **Intiface Central** von der offiziellen Website. Öffne dafür diese Adresse im Browser.

```
https://intiface.com/central/
```

2. Öffne **Intiface Central** und starte den Server. Die Schaltfläche zum Serverstart findest du in der App.
3. Koppele oder verbinde dein Gerät in **Intiface Central**, damit die App es sieht.

Läuft **Intiface Central** nicht mit gestartetem Server, kann Marinara keine Berührungsimpulse schicken.

## Den Haptic-Feedback-Agenten hinzufügen

Haptisches Feedback fügst du wie jeden anderen Agenten hinzu – über die Einstellungen des Chats.

1. Öffne einen Conversation- oder Roleplay-Chat. Im Game Mode wird haptisches Feedback nicht angeboten.
2. Öffne **Chat Settings** (Chat-Einstellungen) für diesen Chat.
3. Wechsle zum Abschnitt **Agents**.
4. Füge dem Chat den Agenten **Haptic Feedback** hinzu.
5. Suche die Karte **Haptic Feedback**, die nun in der Liste **Agents** auftaucht.

Aktiviere oben auf der Karte den Schalter **Haptic Feedback**. Ist er aus, steht dort „Allow this agent to send touch cues during the chat.“ Ist er an, steht dort „Touch cues are enabled for this chat.“ Standardmäßig ist der Schalter aus.

Sobald der Schalter an ist, kann die KI beim Schreiben verdeckte Berührungsimpulse senden. Als Text tauchen diese Impulse im Chat nicht auf. Sie gehen an jedes verbundene Gerät.

## Verbinden, suchen und das Gerät finden

Öffnest du die Karte **Haptic Feedback**, versucht Marinara automatisch eine Verbindung zu **Intiface Central** über die gespeicherte Adresse. Von Hand geht es ebenfalls.

Die Karte zeigt eine Statuszeile mit einem farbigen Punkt. Grün heißt verbunden, Rot heißt nicht verbunden. Daneben sitzt eine Schaltfläche: **Connect** (verbinden), solange keine Verbindung besteht, und **Disconnect** (trennen), sobald sie steht.

Für eine Verbindung von Hand klick auf **Connect**. Klappt es, zeigt die Zeile „Connected“ samt Serveradresse.

Schlägt es fehl, erscheint eine Meldung, dass die App keine Verbindung herstellen konnte. Sie bittet dich zu prüfen, ob **Intiface Central** läuft und der Server gestartet ist. Die Meldung enthält einen Link zur Website von **Intiface Central**.

Steht die Verbindung, zeigt die Karte die Zahl der gefundenen Geräte. Ohne angeschlossenes Gerät steht dort „No devices found“, sonst die Anzahl. Klick auf **Scan for devices** (nach Geräten suchen), um erneut zu suchen. Während der Suche steht auf der Schaltfläche „Scanning...“. Die Karte listet jedes Gerät mit Namen und unterstützten Aktionen auf, etwa Vibrieren oder Rotieren.

### Das Feld Intiface URL

Im Feld **Intiface URL** steht die Netzwerkadresse deines **Intiface Central**-Servers. Es ist eine WebSocket-Adresse – schlicht eine lokale Verbindung, über die sich beide Apps unterhalten. Der Standard steht unten.

```
ws://127.0.0.1:12345
```

Die Adresse `127.0.0.1` bedeutet „genau dieser Computer“. Bleibt das Feld leer, nutzt Marinara den Standard des Servers. Marinara merkt sich die Adresse außerdem im Browser und verwendet sie in allen Chats und auf allen Geräten wieder.

Läuft Marinara in Docker oder öffnest du Marinara im Browser eines anderen Geräts, erreicht `127.0.0.1` dein **Intiface Central** nicht. Trag dann die Adresse des Computers ein, auf dem **Intiface Central** läuft. Sie sieht aus wie im Beispiel unten – ersetze die Zahlen durch die echte Adresse dieses Computers.

```
ws://192.168.1.50:12345
```

## Berührungsempfindlichkeit

In einem Roleplay-Chat zeigt die Karte **Haptic Feedback** das Bedienelement **Touch sensitivity** (Berührungsempfindlichkeit) mit drei Stufen. Daneben steht der kleine Hinweis „Roleplay only“. Diese Einstellung wirkt ausschließlich in Roleplay-Chats. In anderen Modi wird sie ignoriert, und die Presets begrenzen die Impulse nicht.

Die drei Stufen legen fest, wie stark und wie lang ein einzelner Impuls sein darf.

| Stufe | Wirkung | Hinweise |
|---|---|---|
| **Subtle** | Geringere Intensität, kürzeres Feedback | Sanfteste Stufe |
| **Standard** | Ausgewogenes Feedback für die meisten Szenen | Der Standard |
| **Intense** | Stärkeres Feedback mit höherer Obergrenze | Kräftigste Stufe |

Standardmäßig ist **Standard** ausgewählt. Wähl, was zur Szene passt. In Roleplay-Chats begrenzt Marinara jeden Impuls auf den Bereich deiner Wahl. Darüber hinaus kommt die KI nicht.

## Beiläufige Berührungen

Unterhalb der Empfindlichkeit zeigen Roleplay-Chats zusätzlich den Schalter **Incidental contact** (beiläufige Berührung). Dort steht „Tiny taps for accidental brushes and bumps.“ Standardmäßig ist der Schalter aus.

Ist er aus, ignoriert die KI kleine, zufällige Berührungen in der Geschichte. Impulse gibt es dann nur bei bewusstem oder festem Kontakt. Schalte ihn an, wenn auch Streifen und Anstoßen kleine Impulse auslösen sollen. Wie die Berührungsempfindlichkeit erscheint auch dieses Bedienelement nur in Roleplay-Chats.

## Nutzung von einem anderen Gerät aus

Standardmäßig nimmt Marinara haptische Befehle nur von dem Computer an, auf dem der Marinara-Server läuft. So bleibt die Gerätesteuerung lokal und privat.

Deshalb funktioniert haptisches Feedback nicht, wenn du Marinara vom Handy oder einem anderen Gerät aus öffnest. Das gilt, sobald dieses Gerät auf einen Marinara-Server zugreift, der woanders läuft. Verbinden, Suchen und Befehle werden abgelehnt, solange die Server-Einstellungen unverändert bleiben.

Für haptische Steuerung von einem anderen Gerät aus aktivierst du die Server-Einstellung `HAPTICS_ALLOW_REMOTE`. Außerdem brauchst du einen Zugriffsschutz, etwa Basic Auth oder ein Admin-Secret. Die Einstellung beschreibt die [Referenz zur Server-Konfiguration](../CONFIGURATION.md). Den Zugriffsschutz erklärt die [Anleitung zum Fernzugriff](../REMOTE_ACCESS.md). Den Admin-Zugang trägst du unter **Settings** (Einstellungen) im Bereich **Advanced** im Abschnitt **Admin Access** ein.

## Wenn etwas nicht funktioniert

Löst die KI dein Gerät nie aus, prüf der Reihe nach:

1. Läuft **Intiface Central** und ist der Server gestartet?
2. Ist dein Gerät gekoppelt und erscheint es nach einem Klick auf **Scan for devices** in der Geräteliste?
3. Ist der Statuspunkt grün und der Schalter **Haptic Feedback** an?
4. Bist du am Handy oder an einem entfernten Gerät? Dann schau dir die Hinweise zum Fernzugriff oben an.

Ist **Intiface Central** nicht verbunden oder kein Gerät angeschlossen, überspringt Marinara den Berührungsimpuls stillschweigend. Eine Fehlermeldung erscheint im Chat nicht.

## Verwandte Anleitungen

- [Agenten: KI-Helfer für deine Chats](../agents/agents-overview.md)
- [Referenz der herunterladbaren Agenten](../agents/built-in-agents.md)
- [Fernzugriff: Basic Auth und IP-Allowlist](../REMOTE_ACCESS.md)
