# Lokalizacja interfejsu

Marinara Engine tłumaczy teksty interfejsu aplikacji, a bez zmian zostawia prompty modeli (prompt to tekst, który
Marinara wysyła do AI), treści od użytkownika, wygenerowane wiadomości czatu, identyfikatory, wartości protokołów,
ścieżki plików oraz zapisane wartości techniczne.

Angielski jest podstawowym językiem katalogu i awaryjnym wyborem w czasie działania aplikacji. Kiedy brakuje
tłumaczenia od społeczności, na ekranie pojawia się tekst angielski, a nie klucz tłumaczenia czy pusta kontrolka.

Język interfejsu wybiera się w ustawieniach: **Settings > General > App Behavior > Language** (**Settings** to
Ustawienia). Ten wybór zmienia kontrolki i teksty pomocy aplikacji Marinara Engine, a nie prompty modeli,
przygotowane treści ani wiadomości czatu.

## Obsługiwane języki interfejsu

| Język | Plik języka | Kierunek pisma |
| --- | --- | --- |
| arabski | `ar.json` | Od prawej do lewej |
| chiński uproszczony | `zh-Hans.json` | Od lewej do prawej |
| angielski | `en.json` | Od lewej do prawej |
| francuski | `fr.json` | Od lewej do prawej |
| niemiecki | `de.json` | Od lewej do prawej |
| hindi | `hi.json` | Od lewej do prawej |
| japoński | `ja.json` | Od lewej do prawej |
| koreański | `ko.json` | Od lewej do prawej |
| polski | `pl.json` | Od lewej do prawej |
| portugalski brazylijski | `pt-BR.json` | Od lewej do prawej |
| rosyjski | `ru.json` | Od lewej do prawej |
| hiszpański | `es.json` | Od lewej do prawej |

Katalog angielski jest utrzymywany jako źródło. Pozostałe dołączone katalogi powstały jako tłumaczenia maszynowe i
czekają na poprawki od osób biegle władających danym językiem. Wyodrębnianie tekstów interfejsu wciąż trwa, więc
fragmenty bez klucza tłumaczenia nadal wyświetlają się po angielsku.

## Pliki języków

Pliki języków po stronie klienta znajdują się w:

```text
packages/client/src/localization/locales/
```

Każdy język w standardzie BCP-47 ma jeden plik JSON nazwany kanonicznym kodem języka, na przykład `pl.json`,
`ko.json` lub `pt-BR.json`. Vite znajduje te pliki automatycznie, więc dodanie języka nie wymaga edytowania rejestru.
Angielski wczytuje się razem z aplikacją, pozostałe języki dopiero po wybraniu.

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

Stosuj klucze semantyczne pogrupowane według obszarów interfejsu. Nie używaj angielskiego zdania jako klucza, bo
zwykła korekta tekstu unieważniłaby wtedy każde tłumaczenie.

## Zasady tłumaczenia

- Tłumacz wyłącznie wartości. Nie zmieniaj nazw kluczy semantycznych.
- Zachowaj znaczniki interpolacji, takie jak `{{name}}`, oraz znaczniki tekstu sformatowanego, takie jak `<strong>`.
- Trzymaj klucze tłumaczeń w kolejności alfabetycznej.
- Nazwy produktów, na przykład Marinara Engine, zostają bez zmian, dopóki projekt nie przyjmie oficjalnej wersji lokalnej.
- Trzymaj się znaczenia i tonu pliku `en.json`; nie dodawaj zachowań ani obietnic, których nie ma w źródle angielskim.
- Sprawdź, czy przetłumaczone etykiety mieszczą się na ekranie komputera i telefonu.

Katalogi społecznościowe mogą chwilowo pomijać klucze, kiedy trwa przygotowanie tłumaczenia dla danego obszaru
funkcji. Brakujące klucze wracają do angielskiego. Nieznane klucze, puste tłumaczenia, błędne metadane i zmienione
znaczniki interpolacji nie przechodzą kontroli lokalizacji.

PR z nową funkcją musi dodać lub zaktualizować kanoniczny klucz angielski, ale nie musi ruszać każdego katalogu
społecznościowego. Wartość społecznościową tłumacz tylko wtedy, gdy da się podać przydatne tłumaczenie. Nie powielaj
angielskiej wartości w plikach języków tylko po to, żeby listy kluczy były równe: mechanizm awaryjny i tak poda ten
angielski tekst, a brak klucza oszczędza tłumaczom niepotrzebnych konfliktów scalania.

Tłumaczenia maszynowe są mile widziane jako pierwsza wersja robocza, o ile PR wyraźnie je tak oznacza. Zanim język
zostanie opisany jako sprawdzony, terminologię, ton, ucięte teksty i układ na telefonie musi przejrzeć osoba biegle
władająca tym językiem.

## Zgłoszenie poprawki do istniejącego tłumaczenia

Przy drobnej poprawce sformułowania wystarczy edytor internetowy serwisu GitHub:

1. Otwórz plik języka w folderze
   [`packages/client/src/localization/locales/`](../../packages/client/src/localization/locales/).
2. Kliknij ikonę ołówka, żeby edytować plik. GitHub sam zaproponuje utworzenie forka, jeśli będzie potrzebny.
3. Zmień tylko przetłumaczoną wartość. Zachowaj jej klucz, wrażliwe na interpunkcję znaczniki, takie jak `{{name}}`,
   oraz składnię JSON.
4. Zapisz zmianę w osobnej, wąsko zakrojonej gałęzi w swoim forku.
5. Otwórz pull request wobec gałęzi **`staging`** w repozytorium Marinara Engine, a nie wobec `main`.
6. W opisie PR podaj język, wyjaśnij poprawione znaczenie i napisz, czy tłumaczenie pochodzi od osoby biegle
   władającej tym językiem, czy powstało z pomocą maszyny.

Nadaj tytuł w rodzaju `Improve French UI translation`. Kilka powiązanych poprawek do jednego języka może trafić do
jednego PR. Niezwiązane zmiany w kodzie zostaw osobno.

## Zgłoszenie nowego tłumaczenia

Nowy język przygotowuje się na podstawie najnowszej gałęzi `staging`:

```bash
git clone https://github.com/YOUR-NAME/Marinara-Engine.git
cd Marinara-Engine
git checkout staging
git pull
git checkout -b translation/LOCALE
pnpm install
```

Następnie:

1. Skopiuj `en.json` do pliku o kanonicznej nazwie BCP-47, na przykład `it.json` lub `pt-PT.json`.
2. Ustaw `_meta.locale` na nazwę pliku bez `.json`.
3. Ustaw `_meta.direction` na `ltr` albo `rtl`.
4. Przetłumacz wartości zgodnie z powyższymi zasadami. Przy nowym języku lepiej przetłumaczyć cały angielski katalog,
   choć niekompletny katalog też zadziała dzięki powrotowi do angielskiego.
5. Uruchom walidator języków i podstawową kontrolę repozytorium:

   ```bash
   pnpm localization:check
   pnpm check
   ```

6. Wybierz język w **Settings > General** i obejrzyj go na komputerze oraz na telefonie. Zwróć uwagę na długie
   etykiety, podpowiedzi, ekrany ładowania i błędów oraz kierunek pisma.
7. Wypchnij gałąź do swojego forka i
   [otwórz pull request](https://github.com/Pasta-Devs/Marinara-Engine/compare), wybierając
   `Pasta-Devs/Marinara-Engine:staging` jako gałąź bazową.

W opisie PR podaj język, źródło tłumaczenia, poziom biegłości lub sprawdzenia, użyte polecenia walidacyjne oraz
obszary, które wciąż wymagają przejrzenia przez rodzimego użytkownika języka. Wypełnij szablon PR uczciwie i zaznacz
tylko te punkty ręczne, które faktycznie zostały sprawdzone osobiście.

## Używanie tłumaczeń w kodzie klienta

Komponenty React korzystają z `useTranslation`:

```tsx
import { useTranslation } from "react-i18next";

const { t } = useTranslation();
return <button>{t("common.actions.save")}</button>;
```

W konfiguracji interfejsu na poziomie modułu przechowuj klucze tłumaczeń, a nie gotowe teksty. Dzięki temu zmiana
języka działa od razu, bez przeładowania strony. Pomocnicze funkcje klienta spoza React mogą korzystać z eksportowanej
funkcji `translate` z pliku `packages/client/src/localization/i18n.ts`.

Tłumacz widoczny tekst: etykiety, teksty zastępcze, podpowiedzi, nazwy dla technologii wspomagających, teksty
alternatywne, ekrany ładowania i puste stany, powiadomienia toast, potwierdzenia oraz statyczne samouczki. Nie
przepuszczaj przez tłumacz interfejsu promptów ani treści przygotowanych przez użytkownika.

Współdzielone starsze komponenty bazowe – kontrolki w sekcji **Settings**, podpowiedzi pomocy i tytuły okien –
rozpoznają też dokładne angielskie wartości z katalogu kanonicznego, dopóki trwa migracja starszych miejsc wywołania.
To pomost zgodności, a nie zalecane API: nowe i mocno przerabiane komponenty nadal muszą używać wprost kluczy
semantycznych `t("area.control.label")`. Angielskiego zdania, którego nie ma w `en.json`, nie da się przetłumaczyć.

Repozytoryjna kontrola lokalizacji sprawdza też pliki TSX klienta pod kątem nieprzetłumaczonych tekstów interfejsu:

```bash
pnpm localization:ui-check
```

Obejmuje widoczny kod JSX, etykiety i komunikaty wstawiane bezpośrednio, nazwy dla technologii wspomagających, teksty
zastępcze, ekrany ładowania i puste stany, powiadomienia toast oraz potwierdzenia. Dosłowna zawartość elementów
`code`, `pre`, `script` i `style` jest celowo pomijana, żeby polecenia, konfiguracja, adresy URL, makra i inne
przykłady przeznaczone dla maszyn pozostały dokładnie takie, jakie są. Poza tłumaczem interfejsu muszą zostać także
wartości dynamiczne: tworzone przez użytkownika, generowane, zapisywane, prompty i wartości protokołów.

## Interfejsy pobieranych agentów

Ekrany agentów należących do silnika korzystają z plików języków silnika. Pobierane klienty rozszerzeń przechowują
własne tłumaczenia w repozytorium Marinara-Agents.

Każdy element niestandardowy rozszerzenia dostaje wybrany język przez atrybuty `lang` i `dir`, a także przez:

```ts
capabilityProps.localization = {
  locale: "pl",
  direction: "ltr",
};
```

Przy zmianie języka uruchamia się dotychczasowe zdarzenie `marinara-capability-props`. Interfejs pakietu powinien
wybrać dołączony do siebie język, w razie jego braku wrócić do angielskiego z pakietu i po tym zdarzeniu
wyrenderować się ponownie.
