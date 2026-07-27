# Die Persona für einen Chat auswählen

In dieser Anleitung erfährst du, wie du festlegst, welche Persona dich in einem Chat vertritt. Es geht um die global aktive Persona, um Persona-Überschreibungen pro Chat und um die Schnellumschalter.

## Aktive Persona und Personas pro Chat

Eine Persona ist deine eigene Charakterkarte – die Identität, mit der Marinara Engine dich darstellt. Sie liefert der KI deinen Namen und weitere Details, damit die KI weiß, mit wem sie spricht. Wie du eine anlegst, steht unter [Nutzer-Personas](personas.md).

Marinara wählt die Persona auf zwei Ebenen:

- Die **aktive Persona** ist dein globaler Standard. Marinara greift in jedem Chat darauf zurück, der keine eigene Persona hat.
- Eine Chat-Persona überschreibt die aktive Persona – aber nur für diesen einen Chat.

Aktiv ist immer höchstens eine Persona. Auch gar keine ist möglich.

## Die aktive Persona festlegen

So legst du deinen globalen Standard fest:

1. Öffne über die rechte Seitenleiste das Panel **Personas** (das Personen-Symbol).
2. Zeig in der Liste auf die gewünschte Persona.
3. Klick auf **Set as active** (als aktiv festlegen) – das Häkchen-Symbol in dieser Zeile.

Die aktive Persona trägt ein kleines Häkchen am Avatar. Legst du eine neue fest, verschwindet das Häkchen bei der alten. So ist immer nur eine Persona aktiv.

Mit den Chips **Active** (aktiv) und **Inactive** (inaktiv) filterst du die Liste und siehst sofort, welche Persona dein Standard ist.

Neue, duplizierte und importierte Personas sind nie von selbst aktiv. Das musst du jeweils selbst festlegen.

## Eine Persona für einen einzelnen Chat wählen

Jeder Chat kann eine eigene Persona speichern. Diese Chat-Persona überschreibt die aktive Persona immer.

### Über Chat Settings

1. Öffne **Chat Settings** (Chat-Einstellungen) – das Zahnrad neben dem Chat.
2. Such den Abschnitt **Persona**. Sein Hilfetext beginnt mit „Your persona defines who you are in this chat.“
3. Ist keine Persona gesetzt, steht dort „No persona selected.“
4. Klick auf **Choose Persona** (Persona wählen). Sobald eine Persona gesetzt ist, heißt die Schaltfläche **Change Persona**.
5. Such im Auswahlfenster (Platzhalter „Search personas...“) und klick auf eine Persona.

Zum Entfernen der Chat-Persona klick daneben auf die Schaltfläche X oder wähle oben im Auswahlfenster **None** (keine).

Im Game Mode ist dieser Abschnitt als deine Ingame-Party formuliert, er trägt aber weiterhin die Beschriftung **Persona**.

### Beim Anlegen eines Chats

Der Einrichtungsassistent **New Chat** hat ein Feld **Your Persona**. Es nutzt dasselbe durchsuchbare Auswahlfenster samt Option **None**. Im Assistenten **New Game Setup** heißt dieses Feld stattdessen **Player's Persona**.

## Der Quick Persona Switcher

Ist ein Chat geöffnet, sitzt neben dem Nachrichtenfeld eine kleine runde Avatar-Schaltfläche: der **Quick Persona Switcher** (schneller Persona-Wechsel). Ohne gesetzte Persona zeigt der Tooltip (Kurzhinweis beim Draufzeigen) genau diesen Namen.

1. Klick auf die Avatar-Schaltfläche.
2. Es öffnet sich ein Menü mit dem Titel **Personas**.
3. Klick auf eine beliebige Persona, um sofort zu wechseln – oder auf **None**, um ganz ohne Persona zu chatten.

Personas sind nach Ordnern gruppiert. Personas ohne Ordner stehen unter **Ungrouped** (ohne Gruppe).

Auf dem Handy teilt sich der Persona-Wechsel ein Menü mit dem Wechsel der Verbindung. Tipp neben dem Nachrichtenfeld auf den Pfeil **Quick Switcher** und öffne dann den Tab **Personas**. Der Tab **Connections** liegt im selben Menü.

## Welche Persona gewinnt

Marinara wählt die Chat-Persona in dieser Reihenfolge:

1. die Chat-eigene Persona, sofern du eine gesetzt hast;
2. sonst die global aktive Persona;
3. gibt es beides nicht, spricht dich die KI als „User“ an und schickt keine Persona-Details mit.

Im Game Mode wählst du die Persona einmalig im Assistenten **New Game Setup**. Der Chat behält genau diese Persona. Auf dem Bildschirm wechselt ein Game-Mode-Chat nicht zur aktiven Persona.

Wechselst du mitten im Chat die Persona, ändert das frühere Nachrichten nicht. Jede bereits gesendete Nachricht behält die Persona, unter der sie gesendet wurde.

## Verwandte Anleitungen

- [Nutzer-Personas: anlegen und bearbeiten](personas.md)
- [Chat Settings im Überblick](../chats/chat-settings.md)
