# Lorebook-Einträge: Schlüsselwörter, Position und Timing

In dieser Anleitung erfährst du, wie du die Einträge in einem Lorebook aufbaust. Es geht um den Tab **Entries** (Einträge), um auslösende Schlüsselwörter und um die drei Eintragstypen. Außerdem klärt sie, an welcher Stelle im Prompt – dem Text, den Marinara an die KI schickt – ein Eintrag landet und welche Timing-Einstellungen über den Auslösezeitpunkt entscheiden. Sind Lorebooks, also Sammlungen von Weltwissen, für dich neu, lies zuerst [Lorebooks im Überblick](overview.md).

Ein Eintrag besteht aus einem Textblock und den Regeln dafür, wann Marinara Engine diesen Text in den Prompt an die KI einbaut. Löst ein Eintrag aus, fügt Marinara seinen Inhalt ein – und die KI „erinnert“ sich an etwas, das nie im Chat stand.

## Der Entries-Tab

Öffne ein Lorebook im Panel **Lorebooks**, um zum seitenfüllenden Editor zu gelangen. Der Editor hat zwei seitliche Tabs: **Overview** (Übersicht) und **Entries**. Klick auf **Entries**, um die Liste der Einträge zu sehen. Das Badge am Tab zeigt, wie viele Einträge das Lorebook enthält.

Die Werkzeugleiste oben im Tab **Entries** bietet diese Bedienelemente:

- Das Feld **Search entries…** (Einträge durchsuchen): filtert die Liste nach Name, Schlüsselwörtern oder Inhalt.
- Ein Sortier-Dropdown-Menü mit **Order**, **Entries**, **Name A→Z**, **Name Z→A**, **Tokens ↓**, **Keys ↓**, **Newest** und **Oldest**. Die ↓-Optionen sortieren absteigend.
- **Select** (Auswählen): schaltet die Mehrfachauswahl ein, damit du mehrere Einträge auf einmal kopieren, verschieben oder löschen kannst.
- **Add Folder** (Ordner hinzufügen): legt einen Ordner an, der Einträge gruppiert (siehe den Abschnitt zu den Eintrags-Ordnern weiter unten).
- **Add Entry** (Eintrag hinzufügen): erstellt ganz oben in der Liste einen neuen, leeren Eintrag.

Darunter fasst eine Zeile zusammen, wie viele Einträge und Ordner es gibt und wie groß der gesamte Inhalt geschätzt in Tokens – kleinen Textstücken – ist.

## Einträge anlegen und bearbeiten

So legst du einen Eintrag an:

1. Öffne das Lorebook und klick auf den Tab **Entries**.
2. Klick auf **Add Entry**. Eine neue Zeile erscheint in der Liste.
3. Trag im Namensfeld der Zeile einen Namen ein. Jeder Eintrag braucht einen Namen.
4. Klick auf die Zeile (oder auf ihren Pfeil), um das vollständige Editor-Panel aufzuklappen.
5. Füll die Schlüsselwörter und den Inhalt aus – beides beschreiben die folgenden Abschnitte.

Änderungen speichert Marinara automatisch. Während du tippst, zeigt das Panel erst **Autosaving…**, dann **Saving…** und schließlich **Saved automatically**. Schlägt das Speichern fehl, bleibt der Text erhalten, und Marinara versucht es bei der nächsten Änderung erneut. Eine eigene Speichern-Schaltfläche brauchen Einträge nicht.

Jeder Eintrag belegt in der Liste genau eine kompakte Zeile. Dort sitzen die am häufigsten gebrauchten Bedienelemente. Alles Weitere erreichst du, indem du die Zeile aufklappst.

Zum Duplizieren zeigst du auf die Zeile und klickst auf die Schaltfläche **Duplicate** (Duplizieren). Zum Entfernen klickst du auf **Delete** (Löschen). Marinara fragt zur Sicherheit nach: **Delete this lorebook entry?**

## Eintragsinhalt und Schlüsselwörter

Klapp einen Eintrag auf, um seine Hauptfelder zu bearbeiten.

- **Primary Keys** (Hauptschlüsselwörter): die Schlüsselwörter, die diesen Eintrag auslösen. Sobald eines davon im jüngsten Chatverlauf auftaucht, wird der Eintrag aktiv. Tipp ein Schlüsselwort ein und drück Enter, um es als Chip anzulegen.
- **Content** (Inhalt): der Text, den Marinara beim Auslösen in den Prompt an die KI einfügt. Formulier ihn als schlichte Tatsache, die die KI kennen soll. Im Inhalt funktionieren Prompt-Makros; unter dem Feld steht eine laufende Token-Schätzung.
- **Secondary Keys** (Zweitschlüsselwörter): weitere Schlüsselwörter, die nur beim Eintragstyp **Selective** greifen. Siehe den Abschnitt zu den Eintragstypen weiter unten.
- **Description** (Beschreibung): eine kurze Zusammenfassung des Eintrags. Nur der Agent **Knowledge Router** liest sie und entscheidet damit, ob er den Eintrag einfügt. An die eigentliche KI geht sie nie als Inhalt. Siehe [Wissensquellen](../agents/knowledge-sources.md).

Ein einfaches Beispiel:

- Name: `Silverhaven`
- Primary Keys: `Silverhaven`, `the capital`
- Content: `Silverhaven is the mountain capital. Its people mine blue crystal and distrust outsiders.`

Fällt im Chat `Silverhaven` oder `the capital` – von dir oder von der KI –, bekommt die KI diese Tatsache automatisch mitgeliefert.

## Regeln für Schlüsselwort-Treffer

Standardmäßig greift ein Primary Key, sobald das Wort irgendwo im jüngsten Chattext vorkommt; Groß- und Kleinschreibung spielt dabei keine Rolle. Drei Bedienelemente ändern dieses Verhalten. **Whole Words** und **Case Sensitive** stehen im aufgeklappten Panel. Der Schalter **Regex** ist das kleine Symbol in der kompakten Zeile und färbt sich orange, sobald er an ist.

| Bedienelement | Wo | Standard | Wirkung |
|---|---|---|---|
| **Whole Words** | Eintrags-Panel | Off | Das Schlüsselwort muss ein ganzes Wort treffen, nicht nur einen Teil eines längeren Worts. |
| **Case Sensitive** | Eintrags-Panel | Off | Groß- und Kleinschreibung müssen exakt übereinstimmen. |
| **Regex** | Kompakte Zeile | Off | Behandelt jedes Schlüsselwort als regulären Ausdruck statt als einfachen Text. |

Ein regulärer Ausdruck (Regex) ist eine Mustersprache für Text. Nutz ihn nur, wenn du dich mit Regex auskennst. Marinara führt jedes Regex-Schlüsselwort mit einem kurzen Sicherheits-Zeitlimit aus. Ein Muster, das zu lange läuft, trifft bei diesem Durchlauf nicht – halte Muster deshalb einfach.

## Eintragstypen: Normal, Constant, Selective

Jeder Eintrag hat einen Typ. Klick auf den kleinen farbigen Punkt in der Eintragszeile, um das Typmenü zu öffnen und einen auszuwählen.

- **Normal** (grüner Punkt): löst aus, wenn ein Primary Key im gescannten Text vorkommt. Das ist der Standard.
- **Constant** (gelber Punkt): wird jedes Mal eingefügt, solange das Lorebook aktiv ist – ganz ohne Schlüsselwort. Gedacht für Fakten, die immer präsent sein müssen.
- **Selective** (roter Punkt): die Primary Keys müssen treffen, und zusätzlich muss die Logik der Secondary Keys aufgehen.

Auch ein **Constant**-Eintrag hält sich an Timing, Wahrscheinlichkeit und alle gesetzten Filter. Er braucht lediglich kein Schlüsselwort.

Steht ein Eintrag auf **Selective**, legst du ein oder mehrere **Secondary Keys** an und wählst im Panel eine **Logic**-Schaltfläche (Verknüpfung):

- **AND Any**: mindestens eines der Secondary Keys muss ebenfalls vorkommen.
- **AND All**: jedes Secondary Key muss ebenfalls vorkommen.
- **NOT Any**: der Eintrag wird blockiert, sobald irgendein Secondary Key vorkommt.
- **NOT All**: der Eintrag wird nur blockiert, wenn alle Secondary Keys vorkommen.

Ein Beispiel: ein **Selective**-Eintrag mit dem Primary Key `king`, dem Secondary Key `Silverhaven` und der Einstellung **AND Any**. Er löst nur aus, wenn im Chat der König und Silverhaven gemeinsam vorkommen. So löst ein Allerweltswort wie `king` nicht in der falschen Szene aus.

## Position, Depth und Order

Diese Bedienelemente legen fest, wo ein ausgelöster Eintrag im Prompt landet. Auf breiten Bildschirmen sitzen sie in der kompakten Zeile. Auf schmalen Bildschirmen tippst du auf die Schnellzugriff-Schaltfläche der Zeile.

- **Position**: zur Wahl stehen **Before chat**, **After chat**, **@ Depth** und **Outlet**. Before chat und After chat setzen den Eintrag vor beziehungsweise hinter den Chatverlauf. **@ Depth** fügt ihn mitten in den Chatverlauf ein. **Outlet** – eine benannte Ausgabestelle im Prompt – fügt gar nichts automatisch ein, sondern stellt den aktivierten Inhalt einem benannten Makro `{{outlet::name}}` bereit. Auf breiten Bildschirmen zeigt die Zeile die ersten drei Positionen als Kurzbeschriftungen **↑Char**, **↓Char** und **@Depth**.
- **Depth**: erscheint nur, wenn **Position** auf **@ Depth** steht. Der Wert bestimmt, wie viele Nachrichten vor der neuesten der Eintrag eingefügt wird. Der Standard ist 4.
- **Order**: die Reihenfolge beim Einfügen, wenn mehrere Einträge gleichzeitig auslösen. Ein niedrigerer Wert steht früher im Prompt. Der Standard ist 100.

Wählst du **Outlet**, erscheint das Feld **Outlet name** (Outlet-Name). Trag dort einen exakten Namen ein – Groß- und Kleinschreibung zählt –, etwa `character_rules`, und setz dann `{{outlet::character_rules}}` in einen Prompt-Abschnitt. Jeder Eintrag mit diesem Outlet folgt weiterhin seinen üblichen Regeln für Schlüsselwörter, Constant, Wahrscheinlichkeit, Filter, Timing, Eintragslimit und Token-Budget. Gesammelt werden nur die Einträge, die für die aktuelle Generierung ausgelöst haben. Einträge mit demselben Outlet-Namen hängt Marinara in der Reihenfolge von **Order** aneinander, getrennt durch Zeilenumbrüche.

Ein Outlet-Makro ohne passende aktive Einträge löst sich zu nichts auf. Outlet-Inhalte können kein weiteres Outlet-Makro aufrufen; damit sind rekursive Outlet-Schleifen ausgeschlossen. Outlet-Makros funktionieren in den Prompt-Abschnitten der Modi Conversation, Roleplay und Game Mode.

## Auslöse-Wahrscheinlichkeit

Jeder Eintrag hat einen Wert **Probability** (Wahrscheinlichkeit), den die Zeile als Prozentwert anzeigt. Der Standard sind 100 % – der Eintrag löst also immer aus, wenn seine Schlüsselwörter treffen. Ein niedrigerer Wert lässt ihn nur manchmal auslösen. Bei 25 % etwa liegt die Chance bei eins zu vier, jedes Mal, wenn die Schlüsselwörter treffen.

## Timing: Sticky, Cooldown, Delay, Ephemeral

Die **Timing**-Felder im Panel steuern, wie sich ein Eintrag über mehrere Nachrichten hinweg verhält. **Sticky**, **Cooldown** und **Delay** zählen in Nachrichten, **Ephemeral** zählt Aktivierungen. Alle vier stehen anfangs auf 0 und sind damit aus.

- **Sticky**: Nach dem Auslösen bleibt der Eintrag noch so viele Nachrichten lang aktiv, auch ohne frischen Schlüsselwort-Treffer.
- **Cooldown**: Nach dem Auslösen wartet der Eintrag so viele Nachrichten, bevor er erneut auslösen kann.
- **Delay**: Der Eintrag wartet so viele Nachrichten im Chat ab, bevor er zum ersten Mal aktiv werden kann.
- **Ephemeral**: Nach so vielen Aktivierungen schaltet sich der Eintrag selbst ab. Der Wert 0 bedeutet unbegrenzt.

Setz **Sticky** zum Beispiel auf 3, damit eine Tatsache nach ihrem Auftauchen noch ein paar Züge im Prompt bleibt. So vergisst die KI sie nicht mitten in der Szene.

## Weitere Eintragsoptionen

Im aufgeklappten Panel warten noch ein paar Felder.

- **Role** (Rolle): legt fest, ob der eingefügte Text als **System**, **User** oder **Assistant** gekennzeichnet wird. Das wirkt sich nur aus, wenn **Position** auf **@ Depth** steht. Der Standard ist **System**.
- **Group** und **Tag**: Steck Einträge in dieselbe **Group** (Gruppe), damit von ihnen immer nur einer gleichzeitig aktiv wird. **Tag** ist ein frei wählbares Schlagwort für deine eigene Sortierung.
- **Locked** (Gesperrt): verhindert, dass der Agent **Lorebook Keeper** diesen Eintrag verändert. Siehe [Referenz der herunterladbaren Agenten](../agents/built-in-agents.md).
- **No Vector** und das Vektor-Status-Badge gehören zur semantischen Suche. Siehe [Semantische Suche für Lorebooks](semantic-search.md).

Das Panel enthält außerdem den Abschnitt **Context filters & matching sources** (Kontextfilter und Trefferquellen). Dort schränkst du einen Eintrag auf bestimmte Charaktere, Charakter-Tags oder Generierungsarten ein. Möglich ist außerdem, weitere Felder der Charakterkarte – etwa die Charakterbeschreibung – nach den Schlüsselwörtern des Eintrags zu durchsuchen.

## Das Werkzeug Keyword test

Mit dem Panel **Keyword test** (Schlüsselwort-Test) oben im Tab **Entries** prüfst du die Schlüsselwörter, ohne einen Chat zu starten. Klapp es auf und füg einen Beispielabsatz oder ein paar Nachrichten in das Feld ein.

Einträge, deren Schlüsselwörter treffen würden, bekommen einen grünen Akzent und den Chip **Would activate**. **Constant**-Einträge erhalten den Chip **Always active**, weil sie unabhängig vom Text auslösen. Eine Zählzeile nennt, wie viele der eingeschalteten Einträge auslösen würden.

Der Test prüft ausschließlich die Schlüsselwort-Regeln. Timing, Wahrscheinlichkeit, Charakterfilter und semantische Treffer bleiben außen vor – der echte Chat kann also von der Vorschau abweichen.

## Eintrags-Ordner

Ordner gruppieren Einträge innerhalb eines einzelnen Lorebooks. Mit den Bibliotheks-Ordnern im Panel **Lorebooks** haben sie nichts zu tun.

- Klick auf **Add Folder**, um einen anzulegen, und benenn ihn direkt in der Liste um.
- Zieh einen Eintrag auf einen Ordner, um ihn dort abzulegen, oder nutz die Auswahl **Folder** (Ordner) im Eintrag.
- Zieh einen Ordner auf einen anderen, um ihn zu verschachteln, oder zieh ihn auf den oberen Streifen, um die Verschachtelung aufzuheben.
- Jeder Ordner hat einen Schalter **Enabled** (Aktiviert). Schaltest du einen Ordner aus, löst kein Eintrag darin mehr aus – auch dann nicht, wenn sein eigener Schalter an ist.
- Die Ordner-Kopfzeile bietet zusätzlich **Clone** (Klonen) und **Delete**. **Clone** kopiert den Ordner samt allen Einträgen und Unterordnern. **Delete** entfernt nur den Ordner selbst; seine Einträge und Unterordner rutschen eine Ebene nach oben.

Als Gruppen erscheinen Ordner nur, wenn du nach **Order** sortierst und keine Suche aktiv ist. Jede andere Sortierung und jede Suche schaltet auf eine flache Liste um und zeigt den Hinweis **Folder view paused (clear search and sort by Order)**.

## Verwandte Anleitungen

- [Lorebooks im Überblick](overview.md)
- [Lorebook-Token-Budgets und Rekursion](token-budgets.md)
- [Semantische Suche für Lorebooks](semantic-search.md)
- [Wissensquellen: Retrieval- und Router-Agenten](../agents/knowledge-sources.md)
