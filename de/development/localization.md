# Oberflächen-Lokalisierung

Marinara Engine übersetzt den Text der Oberfläche. Unangetastet bleiben dagegen die Prompts an das Modell (der
Text, den Marinara an die KI schickt), eigene Inhalte, generierte Chat-Inhalte, Bezeichner, Protokollwerte,
Dateipfade und gespeicherte Maschinenwerte.

Englisch ist das kanonische Locale und zugleich der Fallback zur Laufzeit. Fehlt eine Übersetzung aus der Community,
erscheint deshalb der englische Text – und nicht ein Schlüsselname oder ein leeres Bedienelement.

Die Oberflächensprache wählst du unter **Settings > General > App Behavior > Language** (Einstellungen > Allgemein >
App-Verhalten > Sprache). Die Auswahl wirkt sich auf Marinaras Bedienelemente und Hinweistexte aus, nicht auf
Prompts, selbst verfasste Inhalte oder Chat-Nachrichten.

## Unterstützte Oberflächensprachen

| Sprache | Locale-Datei | Schreibrichtung |
| --- | --- | --- |
| Arabisch | `ar.json` | Von rechts nach links |
| Chinesisch (vereinfacht) | `zh-Hans.json` | Von links nach rechts |
| Englisch | `en.json` | Von links nach rechts |
| Französisch | `fr.json` | Von links nach rechts |
| Deutsch | `de.json` | Von links nach rechts |
| Hindi | `hi.json` | Von links nach rechts |
| Japanisch | `ja.json` | Von links nach rechts |
| Koreanisch | `ko.json` | Von links nach rechts |
| Polnisch | `pl.json` | Von links nach rechts |
| Portugiesisch (Brasilien) | `pt-BR.json` | Von links nach rechts |
| Russisch | `ru.json` | Von links nach rechts |
| Spanisch | `es.json` | Von links nach rechts |

Gepflegt wird als Quellkatalog das Englische. Die übrigen mitgelieferten Kataloge sind als maschinell unterstützte
Übersetzungen entstanden; Korrekturen von Muttersprachlerinnen und Muttersprachlern sind ausdrücklich willkommen.
Das Herauslösen der Oberflächentexte läuft noch, deshalb erscheint Text ohne übersetzten Schlüssel weiterhin auf
Englisch.

## Locale-Dateien

Die Locale-Dateien des Clients liegen unter:

```text
packages/client/src/localization/locales/
```

Jedes BCP-47-Locale bekommt genau eine JSON-Datei, benannt nach seinem kanonischen Locale – etwa `pl.json`,
`ko.json` oder `pt-BR.json`. Vite findet diese Dateien von selbst; ein neues Locale erfordert also keinen Eintrag in
einer Registry. Englisch lädt zusammen mit der Anwendung, alle anderen Locales erst bei Auswahl.

```json
{
  "_meta": {
    "locale": "pl",
    "direction": "ltr"
  },
  "chat.input.placeholder": "Napisz odpowiedź…",
  "common.actions.save": "Zapisz"
}
```

Verwende sprechende Schlüssel, geordnet nach Bereich der Oberfläche. Ein englischer Satz taugt nicht als Schlüssel:
Schon eine gewöhnliche Textkorrektur würde sonst sämtliche Übersetzungen entwerten.

## Übersetzungsregeln

- Übersetze ausschließlich die Werte. Benenne die sprechenden Schlüssel nicht um.
- Erhalte Platzhalter wie `{{name}}` und Auszeichnungs-Tags wie `<strong>`.
- Halte die Übersetzungsschlüssel alphabetisch sortiert.
- Produktnamen wie Marinara Engine bleiben unverändert, solange das Projekt keinen offiziellen übersetzten Namen einführt.
- Triff Bedeutung und Ton von `en.json`; ergänze kein Verhalten und keine Zusagen, die das englische Original nicht macht.
- Prüfe, ob die übersetzten Beschriftungen am Desktop und auf dem Handy passen.

In Community-Locales dürfen Schlüssel vorübergehend fehlen, solange die Übersetzung eines Funktionsbereichs
vorbereitet wird. Fehlende Schlüssel fallen auf Englisch zurück. Unbekannte Schlüssel, leere Übersetzungen,
fehlerhafte Metadaten und veränderte Platzhalter lassen die Lokalisierungsprüfung fehlschlagen.

Ein PR für eine neue Funktion muss den kanonischen englischen Schlüssel anlegen oder aktualisieren, aber nicht jedes
Community-Locale anfassen. Übersetze einen Community-Wert nur dann, wenn du eine brauchbare Übersetzung beisteuern
kannst. Kopiere den englischen Wert nicht in alle Locale-Dateien, nur damit die Schlüssellisten gleich lang sind:
Den englischen Text liefert der Fallback zur Laufzeit ohnehin, und ein fehlender Schlüssel erspart Übersetzenden
unnötige Merge-Konflikte.

Maschinell erzeugte Übersetzungen sind als erster Entwurf willkommen, wenn der PR sie als solche kennzeichnet. Bevor
ein Locale als geprüft gilt, sollte eine sprachkundige Person Terminologie, Ton, abgeschnittene Texte und das Layout
auf dem Handy durchsehen.

## Korrektur an einer bestehenden Übersetzung einreichen

Für eine kleine Formulierungskorrektur genügt der Web-Editor von GitHub:

1. Öffne das Locale unter
   [`packages/client/src/localization/locales/`](../../packages/client/src/localization/locales/).
2. Klick auf das Stiftsymbol, um die Datei zu bearbeiten. GitHub bietet dir bei Bedarf an, einen Fork anzulegen.
3. Ändere nur den übersetzten Wert. Der Schlüssel, zeichengenaue Platzhalter wie `{{name}}` und die JSON-Syntax
   bleiben erhalten.
4. Committe die Änderung in deinem Fork auf einen eng umrissenen Branch.
5. Öffne einen Pull Request gegen den Branch **`staging`** von Marinara Engine, nicht gegen `main`.
6. Nenne in der PR-Beschreibung die Sprache, erläutere die korrigierte Bedeutung und gib an, ob du die Sprache
   fließend beherrschst oder maschinell nachgeholfen hast.

Wähle einen Titel wie `Improve French UI translation`. Mehrere zusammenhängende Korrekturen an einem Locale dürfen
sich einen PR teilen. Unabhängige Codeänderungen gehören separat.

## Eine neue Lokalisierung einreichen

Für eine neue Sprache arbeitest du vom aktuellen Branch `staging` aus:

```bash
git clone https://github.com/YOUR-NAME/Marinara-Engine.git
cd Marinara-Engine
git checkout staging
git pull
git checkout -b translation/LOCALE
pnpm install
```

Danach:

1. Kopiere `en.json` in eine kanonisch benannte BCP-47-Locale-Datei, etwa `it.json` oder `pt-PT.json`.
2. Halte `_meta.locale` identisch zum Dateinamen ohne `.json`.
3. Setze `_meta.direction` auf `ltr` oder `rtl`.
4. Übersetze die Werte nach den obigen Regeln. Für ein neues Locale ist ein vollständig übersetzter englischer
   Katalog die bessere Wahl, auch wenn ein unvollständiger Katalog auf Englisch zurückfallen kann.
5. Starte den Locale-Validator und die Grundprüfung des Repositorys:

   ```bash
   pnpm localization:check
   pnpm check
   ```

6. Wähle die Sprache unter **Settings > General** aus und sieh sie dir am Desktop und auf dem Handy an. Prüfe lange
   Beschriftungen, Tooltips (Kurzhinweise beim Draufzeigen), Lade- und Fehlerzustände sowie die Schreibrichtung.
7. Schieb den Branch in deinen Fork und
   [öffne einen Pull Request](https://github.com/Pasta-Devs/Marinara-Engine/compare); wähle dabei
   `Pasta-Devs/Marinara-Engine:staging` als Basis.

Die PR-Beschreibung nennt das Locale, die Quelle der Übersetzung, das Sprach- oder Prüfniveau, die ausgeführten
Prüfbefehle und alle Stellen, die noch eine muttersprachliche Durchsicht brauchen. Fülle die PR-Vorlage ehrlich aus
und hake nur die manuellen Punkte ab, die du selbst überprüft hast.

## Übersetzungen im Client-Code nutzen

React-Komponenten greifen auf `useTranslation` zurück:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <button>{t("common.actions.save")}</button>;
```

Hinterlege in Oberflächen-Konfigurationen auf Modulebene die Übersetzungsschlüssel statt der übersetzten Werte. So
greift ein Sprachwechsel sofort, ganz ohne Neuladen der Seite. Client-Helfer außerhalb von React nutzen die
exportierte Funktion `translate` aus `packages/client/src/localization/i18n.ts`.

Übersetze jeden sichtbaren Text: Beschriftungen, Platzhalter, Tooltips, Barrierefreiheitsnamen, Alternativtexte,
Lade- und Leerzustände, Toasts, Bestätigungen und feste Tutorials. Prompts und selbst verfasste Inhalte laufen
niemals über den Oberflächen-Übersetzer.

Gemeinsam genutzte Altbausteine wie Settings-Bedienelemente, Hilfe-Tooltips und Fenstertitel erkennen zusätzlich
exakte kanonisch-englische Katalogwerte, solange ältere Aufrufstellen noch migriert werden. Das ist eine
Kompatibilitätsbrücke, keine bevorzugte Schnittstelle: Neue und stark überarbeitete Komponenten müssen weiterhin
direkt sprechende Schlüssel im Format `t("area.control.label")` verwenden. Ein englischer Satz, der nicht in
`en.json` steht, lässt sich nicht übersetzen.

Die Lokalisierungsprüfung des Repositorys durchsucht außerdem das TSX des Clients nach unübersetztem
Oberflächentext:

```bash
pnpm localization:ui-check
```

Sie erfasst sichtbares JSX, direkt eingesetzte Beschriftungen und Hinweise, Barrierefreiheitsnamen, Platzhalter,
Lade- und Leerzustände, Toasts sowie Bestätigungen. Literale Inhalte in den Elementen `code`, `pre`, `script` und
`style` bleiben bewusst außen vor, damit Befehle, Konfigurationen, URLs, Makros und andere maschinennahe Beispiele
exakt erhalten bleiben. Dynamische Werte aus Nutzerhand, generierte, gespeicherte, Prompt- und Protokollwerte
gehören ebenfalls nicht in den Oberflächen-Übersetzer.

## Oberflächen herunterladbarer Agenten

Agent-Oberflächen, die zur Engine gehören, greifen auf die Locale-Dateien der Engine zu. Herunterladbare Capability-
Clients pflegen ihre übersetzten Texte selbst, und zwar im Repository Marinara-Agents.

Jedes Capability-Custom-Element bekommt das gewählte Locale über die Attribute `lang` und `dir` – und zusätzlich
darüber:

```ts
capabilityProps.localization = {
  locale: "pl",
  direction: "ltr",
};
```

Das bestehende Event `marinara-capability-props` feuert bei jedem Sprachwechsel. Die Oberfläche eines Pakets sollte
daraufhin ihr mitgeliefertes Locale wählen, notfalls auf das Englisch des Pakets zurückfallen und neu rendern.
