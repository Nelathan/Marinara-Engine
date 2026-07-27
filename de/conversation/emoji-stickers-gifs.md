# Eigene Emojis, Sticker und GIFs

In dieser Anleitung erfährst du, welche zusätzlichen Bilder in einem Chat im Conversation Mode möglich sind: eigene Emojis, eigene Sticker und gesuchte GIFs. Außerdem steuerst du, welche eigenen Emojis und Sticker der Charakter in seinen Antworten verwenden darf.

Diese Werkzeuge gibt es nur im Conversation Mode. Roleplay und Game Mode bieten nur die einfache Emoji-Auswahl – ohne eigene Emojis, ohne Sticker, ohne GIF-Suche.

## Wo du diese Werkzeuge findest

Schau dir in einem Chat im Conversation Mode die Eingabeleiste an. Dort sitzt eine runde Schaltfläche mit Smiley-Symbol, beschriftet mit **Emoji, GIFs & stickers** (Emoji, GIFs und Sticker). Ein Klick darauf öffnet ein kleines Panel oberhalb der Eingabeleiste.

Das Panel hat diese Tabs:

- **Emoji**: das übliche Emoji-Raster, dazu ein Stern-Tab namens **Custom emojis** (eigene Emojis) für deine hochgeladenen Bilder.
- **GIFs**: die Live-Suche nach GIFs.
- **Stickers**: deine hochgeladenen Sticker.

Sind weitere Eingabewerkzeuge aktiviert, kommt ein Tab **Tools** dazu. Auf dem Handy öffnen sich dieselben Tabs in einer Leiste über der Tastatur.

## Eigene Emojis

Ein eigenes Emoji ist ein kleines Bild, das du einmal hochlädst und danach in jedem Conversation-Chat wiederverwendest. In einer Nachricht schreibst du es als Shortcode – also den Emoji-Namen zwischen zwei Doppelpunkten, etwa `:kekw:`.

Eigene Emojis gelten für dein gesamtes Profil. Einmal hochladen, überall benutzen.

### Ein eigenes Emoji hochladen

1. Öffne das Panel **Emoji, GIFs & stickers** und wechsle zum Tab **Emoji**.
2. Klick auf den Stern-Tab **Custom emojis**.
3. Klick auf **Upload** (Hochladen) und wähle eine oder mehrere Bilddateien aus.
4. Gib im Dialogfenster **Name this emoji** (Emoji benennen) einen Namen ein und klick auf **Add** (Hinzufügen).

Das neue Emoji sollte danach im Raster **Custom emojis** auftauchen.

Für Emoji-Namen gelten strenge Regeln. Ein Name ist 1 bis 32 Zeichen lang. Erlaubt sind nur Kleinbuchstaben, Ziffern und Unterstriche. Tippst du Leerzeichen oder Großbuchstaben, räumt die App den Namen automatisch auf: Buchstaben werden klein, alle anderen Zeichen werden zu Unterstrichen.

Das Bild eines eigenen Emojis darf höchstens 256 mal 256 Pixel groß sein. Die App prüft das beim Hochladen. Außerdem muss jeder Name innerhalb deiner eigenen Emojis eindeutig sein. Ist ein Name schon vergeben, erscheint eine Fehlermeldung wie `An emoji named ":name:" already exists.`

Auch ein animiertes GIF lässt sich als eigenes Emoji hochladen. Es läuft im Chat animiert ab. Damit hat der Tab **GIFs** weiter unten nichts zu tun.

### Ein eigenes Emoji verwenden

Klick im Raster **Custom emojis** auf eine Kachel, dann landet der zugehörige Shortcode in deiner Nachricht. Abgeschickt wird dabei nichts – es wird nur Text eingefügt. Du kannst den Shortcode auch selbst tippen, zum Beispiel `:kekw:`. Schreib den Namen klein und genau so, wie du ihn gespeichert hast.

### Umbenennen, löschen, exportieren und importieren

Klick oben im Tab **Custom emojis** auf **Edit** (Bearbeiten), um den Bearbeitungsmodus einzuschalten.

Im Bearbeitungsmodus gilt:

- Ein Klick auf eine Kachel öffnet das Dialogfenster **Rename emoji** (Emoji umbenennen); bestätige mit **Rename**.
- Ein Klick auf das kleine Papierkorb-Symbol einer Kachel löscht dieses Emoji. Das Dialogfenster **Delete emoji** (Emoji löschen) weist darauf hin, dass Nachrichten mit diesem Emoji künftig nur noch den reinen Text zeigen.
- **Export** lädt alle eigenen Emojis als Datei `marinara-custom-emojis.json` herunter. Die Bilder stecken in der Datei selbst, sie ist also vollständig portabel.
- **Import** liest eine zuvor exportierte Datei wieder ein. Übersprungen werden dabei Emojis, die gegen die Namens- oder Größenregeln verstoßen oder mit einem vorhandenen Namen kollidieren.

## Eigene Sticker

Ein eigener Sticker funktioniert wie ein eigenes Emoji, nur für größere Bilder. Du schreibst ihn als `sticker:name:`, und er erscheint immer als großes Bild in einer eigenen Zeile.

Öffne im selben Panel den Tab **Stickers**. Hochladen, Benennen, Umbenennen, Löschen, Exportieren und Importieren laufen genauso ab wie bei Emojis – mit diesen Unterschieden:

- Das Dialogfenster beim Hochladen heißt **Name this sticker** (Sticker benennen).
- Ein Sticker-Bild darf höchstens 512 mal 512 Pixel groß sein.
- Sticker-Namen müssen innerhalb deiner Sticker eindeutig sein. Bei einem Dubletten-Namen erscheint `A sticker named "sticker:name:" already exists.`
- Der Export erzeugt die Datei `marinara-custom-stickers.json`.

### Einen Sticker senden

Klick im Raster auf eine Sticker-Kachel. Das Dialogfenster **Send sticker** (Sticker senden) fragt, wie du ihn verwenden willst, und bietet zwei Möglichkeiten:

- **Send & reply**: schickt den Sticker sofort als eigene Nachricht ab, und der Charakter antwortet darauf.
- **Add to message**: fügt den Text `sticker:name:` in deine Nachricht ein, sodass du weiterschreiben kannst.

## GIF-Suche (Giphy)

Der Tab **GIFs** durchsucht Giphy, eine große GIF-Sammlung im Netz. Tipp einen Suchbegriff ins Suchfeld oder stöbere in den Trends. Ein Klick auf ein GIF schickt es in den Chat.

### Die GIF-Suche braucht einen Key

Für die GIF-Suche brauchst du einen kostenlosen Giphy-API-Key. Ein API-Key ist ein geheimer Zugangscode, ähnlich einem Passwort, mit dem Marinara Engine in deinem Namen mit Giphy spricht. Ohne Key zeigt der Tab **GIFs** statt Ergebnissen eine Einrichtungskarte.

So richtest du die GIF-Suche ein:

1. Öffne das Giphy Developer Dashboard unter `https://developers.giphy.com/dashboard/`.
2. Erstelle einen kostenlosen API-Key für eine Web-App.
3. Trag den Key in die Datei `.env` ein. Das ist die Server-Einstellungsdatei von Marinara.

Ergänze in `.env` eine Zeile wie diese:

```
GIPHY_API_KEY=your_key_here
```

Starte Marinara nach dem Eintragen neu. Ausführlich beschrieben ist die Datei `.env` in der unten verlinkten Anleitung zur Server-Konfiguration.

### Altersfreigabe der GIFs

Die GIF-Ergebnisse laufen mit Giphys Freigabestufe für nicht jugendfreie Inhalte. Sie ist fest eingestellt und lässt sich in der App nicht ändern. Unter den Treffern können also anzügliche oder erwachsene GIFs sein – such entsprechend bewusst. Eine Offline-Quelle oder eine rein jugendfreie GIF-Quelle gibt es nicht.

## Ein Galeriebild als Emoji oder Sticker markieren

Jedes Bild, das bereits in einer Charakter- oder Persona-Galerie liegt, lässt sich als eigenes Emoji oder als Sticker markieren. Ein so markiertes Galeriebild gehört nur zu diesem einen Charakter beziehungsweise dieser einen Persona. Es funktioniert ausschließlich in Chats, in denen sie vorkommen.

So markierst du ein Galeriebild:

1. Öffne den **Character Editor** (Charakter-Editor) oder den **Persona Editor** (Persona-Editor).
2. Wechsle zum Tab **Gallery** (Galerie) und dort zum Unter-Tab **Images** (Bilder).
3. Zeig auf ein Bild und klick auf die kleine Tag-Schaltfläche oben links.
4. Wähle **Make emoji** (Als Emoji verwenden) oder **Make sticker** (Als Sticker verwenden).
5. Gib im Dialogfenster **Custom Emoji** beziehungsweise **Custom Sticker** einen Namen ein.

Die Tag-Schaltfläche sollte danach den vergebenen Namen anzeigen.

Es gelten dieselben Größengrenzen: **Make emoji** erlaubt höchstens 256 mal 256 Pixel, **Make sticker** höchstens 512 mal 512 Pixel. Ist ein Bild für die gewählte Variante zu groß, erscheint eine rote Fehlermeldung.

Um ein markiertes Bild später zu ändern, klick erneut auf seine Tag-Schaltfläche. Das Menü bietet **Rename**, eine Umschaltoption wie **Switch to sticker** und eine Entfernen-Option wie **Remove emoji**. Beim Markieren wird das Bild weder verschoben noch kopiert – es bleibt zusätzlich ein normales Galeriebild.

## Auswahl-Einstellungen

Marinara kann dem antwortenden Charakter mitteilen, welche deiner eigenen Emojis und Sticker er in seiner Antwort verwenden darf. Gesteuert wird das über **Selection preferences** (Auswahl-Einstellungen).

Klick auf das Zahnrad-Symbol **Selection preferences**, um das Panel zu öffnen. Es sitzt jeweils oben im Tab **Custom emojis** und im Tab **Stickers**. Beide führen zur selben Einstellung. Marinara speichert sie pro Chat, jeder Chat kann also andere Werte haben.

Das Panel enthält eine Zeile mit drei Modi zur Auswahl:

- **Semantic** (der Standard): bietet die Emojis und Sticker an, die am besten zum bisherigen Verlauf passen. Der Modus nutzt einen lokalen Embedder, also ein kleines KI-Modell auf deinem eigenen Rechner. Steht es nicht zur Verfügung, greift der Modus auf Zufall zurück.
- **Random**: bietet bei jeder Antwort eine zufällige Auswahl an.
- **Tool-call**: ein Modellaufruf sucht für jede Antwort die passenden heraus. Dafür musst du im eingeblendeten Dropdown-Menü eine Verbindung wählen. Fehlt die Verbindung oder schlägt sie fehl, greift Marinara auf **Semantic** zurück. Antwortet in einem Gruppenchat mehr als ein Charakter am Zug, überspringt Marinara **Tool-call** für diesen Zug und wählt ebenfalls semantisch aus.

Unter den Modi steht **Max offered (each)** (Maximal angeboten, je). Der Wert legt fest, wie viele Namen eigener Emojis und wie viele Sticker-Namen dem Charakter pro Zug angeboten werden. Der Standard ist 20, möglich sind Werte von 1 bis 100.

## So erscheinen eigene Emojis und Sticker

In einem Conversation-Chat wird ein Emoji-Shortcode wie `:kekw:` als kleines Bild direkt in der Textzeile dargestellt. Enthält eine Nachricht ausschließlich Emoji-Shortcodes und sonst nichts, fällt die Darstellung größer aus.

Ein Sticker wie `sticker:wave:` erscheint immer als großes Bild in einer eigenen Zeile.

Lässt sich ein Name nicht auflösen – etwa weil du das Emoji gelöscht hast –, zeigt die Nachricht stattdessen den reinen Shortcode, also `:kekw:`.

## Reaktionen nutzen nur die globalen Emojis

Auf eine Nachricht kannst du mit einem eigenen Emoji reagieren. Für Reaktionen kommen allerdings nur deine allgemeinen eigenen Emojis infrage, also der globale Bestand. Galerie-markierte Emojis, Sticker und GIFs stehen als Reaktion nicht zur Verfügung. Mehr zu Reaktionen auf Nachrichten steht in der Einstiegsanleitung zum Conversation Mode.

## Verwandte Anleitungen

- [Conversation Mode: Erste Schritte](getting-started.md)
- [Charakter- und Persona-Galerien](../characters/galleries.md)
- [Referenz zur Server-Konfiguration](../CONFIGURATION.md)
