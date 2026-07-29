# Własne motywy CSS (Theme Library)

Z tego przewodnika dowiesz się, jak zmienić cały wygląd aplikacji Marinara Engine za pomocą własnego motywu CSS. Zobaczysz, jak tworzyć, importować, eksportować i włączać motywy. Poznasz też zmienne CSS, które da się nadpisać, oraz to, jak motywy współpracują z Card CSS.

## Czym jest własny motyw

Własny motyw to blok kodu CSS, który przemalowuje aplikację Marinara Engine. CSS, czyli Cascading Style Sheets, to kod odpowiadający za kolory, obramowania i odstępy w całej aplikacji. Motyw może zmienić tło strony, kolor akcentu, karty, obramowania, tekst i sporo więcej.

Własne motywy mieszkają w sekcji **Theme Library** (biblioteka motywów). Marinara zapisuje je na serwerze, więc synchronizują się z każdym urządzeniem i każdą przeglądarką połączoną z tym samym serwerem. Tym różnią się od większości pozostałych ustawień wyglądu, które zostają na jednym urządzeniu. Ustawienia przypisane do jednego urządzenia opisuje przewodnik [Ustawienia wyglądu](appearance-settings.md).

Aktywny może być tylko jeden własny motyw naraz. W bibliotece da się trzymać dowolnie wiele motywów i przełączać się między nimi.

## Gdzie znaleźć sekcję Theme Library

1. Otwórz **Settings** (Ustawienia).
2. Przejdź do zakładki **Addons**.
3. Znajdź sekcję **Theme Library**.

Sekcja nosi tytuł **Theme Library**, a jej opis brzmi "Create, import, activate, edit, export, or remove custom CSS themes."

## Tworzenie motywu

1. W sekcji **Theme Library** kliknij przycisk **Create Theme** (utworzenie motywu).
2. Wpisz nazwę w polu **Theme name**.
3. Wpisz lub wklej kod CSS w dużym polu tekstowym.
4. Zostaw przełącznik **Preview** (podgląd) włączony, żeby widzieć zmiany w aplikacji na żywo podczas pisania. Wyłącz **Preview**, aby zatrzymać podgląd na żywo.
5. Kliknij przycisk **Save**.

Nowy motyw powstaje z szablonu. Szablon wypisuje najczęściej używane zmienne jako zakomentowane przykłady, więc wystarczy usunąć znaki komentarza i wpisać własne wartości. Zupełnie nowy motyw Marinara włącza od razu po zapisaniu. Pokazuje przy tym potwierdzenie z nazwą motywu, na przykład: Theme "My Theme" saved and activated.

Aby zmienić motyw później, znajdź go na liście **Installed Themes** (zainstalowane motywy). Kliknij ikonę kodu (jej podpowiedź brzmi **Edit theme CSS**), wprowadź zmiany i kliknij przycisk **Save**. Edycja zapisanego motywu aktualizuje go, ale nie zmienia tego, który motyw jest aktywny.

## Importowanie i eksportowanie motywów

Motywami da się dzielić w postaci plików. Przydaje się to przy przenoszeniu motywu między serwerami albo przy przekazywaniu go znajomym.

Aby zaimportować motyw:

1. Kliknij przycisk **Import File** (import pliku) w sekcji **Theme Library**.
2. Wybierz plik `.css` albo plik `.json`.
3. Przeczytaj komunikat, który się pojawi. Podaje on, ile motywów zostało zaimportowanych, pominiętych lub odrzuconych.

Plik `.css` staje się jednym motywem, a jego nazwa pochodzi od nazwy pliku. Plik `.json` może zawierać jeden motyw lub więcej i występuje w dwóch odmianach.

Pierwsza odmiana to plik wyeksportowany z aplikacji Marinara Engine. Każdy motyw jest w nim opakowany w dodatkowe pola, które Marinara dokłada przy eksporcie. Nie trzeba tego czytać ani edytować. Zaimportuj plik bez zmian.

Druga odmiana to mały plik napisany samodzielnie. Dla pojedynczego motywu wystarczy tyle:

```
{ "name": "My Theme", "css": "..." }
```

Zaimportowane motywy synchronizują się z serwerem, ale nie włączają się same. Motyw, który już jest na serwerze pod tą samą nazwą i z tym samym kodem CSS, zostaje pominięty, a nie dodany po raz drugi.

Aby wyeksportować motyw, znajdź go na liście **Installed Themes** i kliknij ikonę wysyłania (jej podpowiedź brzmi **Export theme**). Marinara pobiera plik `.json`, który da się zaimportować w innym miejscu.

## Włączanie motywu

Lista **Installed Themes** pokazuje wszystkie motywy, a na samej górze znajduje się **Default Theme** (motyw domyślny).

1. Kliknij nazwę motywu, aby go włączyć. Aktywny motyw jest oznaczony haczykiem.
2. Kliknij **Default Theme**, aby wyłączyć własne motywy i wrócić do wbudowanego wyglądu aplikacji Marinara Engine.

Przycisk **Reset Appearance** (przywrócenie wyglądu) znajduje się na górze sekcji **App Style** w **Settings -> Appearance**. Jego użycie wyłącza także aktywny własny motyw.

Aby usunąć motyw na dobre, kliknij ikonę kosza w jego wierszu (jej podpowiedź brzmi **Remove theme**), a potem potwierdź w oknie **Delete Theme**. To trwale kasuje kod CSS motywu z serwera.

## Wykaz zmiennych CSS

Edytor motywu ma rozwijaną sekcję **CSS Variable Reference**. Kliknij ją, aby zobaczyć najbardziej przydatne zmienne, które można nadpisać. Motyw zmienia wygląd aplikacji, ustawiając te zmienne w bloku `:root`. Wykaz wymienia następujące zmienne:

| Zmienna | Za co odpowiada |
| --- | --- |
| `--background` | Tło strony |
| `--foreground` | Główny tekst |
| `--primary` | Akcent i przyciski |
| `--primary-foreground` | Tekst na kolorze primary |
| `--secondary` | Karty i pola |
| `--card` | Tło karty |
| `--border` | Obramowania |
| `--muted-foreground` | Przygaszony tekst |
| `--sidebar` | Tło paska bocznego |
| `--sidebar-border` | Obramowanie paska bocznego |
| `--marinara-shell-edge-border` | Lewa i prawa krawędź obudowy |
| `--destructive` | Błędy i usuwanie |
| `--popover` | Tło listy rozwijanej |
| `--accent` | Podświetlenia pod kursorem |

Ta lista nie jest granicą. Motyw może ustawić dowolną zmienną CSS używaną przez aplikację Marinara Engine, a do tego dołożyć własne style.

Niektóre efekty wizualne mają swoje własne zmienne. Motyw może na przykład poprosić o animację pulsowania akcentu, ustawiając `--marinara-theme-accent-pulse: enabled`.

Kod CSS własnego motywu przechodzi przez czyszczenie, zanim zacznie działać – dla bezpieczeństwa. Style, które wczytują plik z innej strony, nie działają. Aby użyć w motywie obrazka albo czcionki, osadź je jako URI `data:` zamiast odnośnika sieciowego. URI `data:` mieści treść pliku bezpośrednio w kodzie CSS.

## Limity rozmiaru i nazwy

Nazwa motywu może mieć do 200 znaków. Kod CSS może zajmować do 256 KiB, liczone w bajtach UTF-8, a nie w znakach. Większy motyw zostaje odrzucony przy zapisie lub imporcie.

## Admin Access przy instalacji zdalnej

Tworzenie, edycja, import, włączanie i usuwanie motywu to działania chronione. Ma to znaczenie tylko wtedy, gdy aplikacja Marinara Engine jest otwierana przez sieć.

Jeśli aplikacja Marinara Engine jest otwarta na tym samym komputerze, na którym działa serwer, przez pętlę zwrotną (zwaną też localhost), te działania działają bez dodatkowych kroków. Jeśli otwierasz aplikację z innego urządzenia, na przykład z telefonu albo z innego komputera w sieci, serwer potrzebuje najpierw sekretu administratora.

Aby zarządzać motywami przez sieć:

1. Na serwerze ustaw `ADMIN_SECRET` w pliku `.env`.
2. W aplikacji otwórz **Settings -> Advanced -> Admin Access** i wpisz tę samą wartość.

Bez tego zmiany motywów przez sieć kończą się błędem. Pełną konfigurację opisują [Konfiguracja serwera](../CONFIGURATION.md) oraz przewodnik [Dostęp zdalny](../REMOTE_ACCESS.md).

## Jak motywy współpracują z Card CSS

Marinara ma dwa sposoby na dodanie własnego kodu CSS. To osobne funkcje i obie mogą być aktywne jednocześnie.

Własny motyw przemalowuje całą aplikację. Wolno mu nadpisywać podstawowe zmienne aplikacji Marinara Engine, używać `!important` oraz `position: fixed`. Na tym właśnie polega motyw.

Card CSS działa inaczej. Autor postaci lub persony może osadzić kod CSS w karcie, a ty włączasz go osobno dla każdego czatu. Card CSS jest czyszczony ostrzej. Nie może nadpisać podstawowych zmiennych aplikacji, `!important` zostaje usunięty, a `position: fixed` zamienia się w `position: absolute`. Nadaje styl wiadomościom w czacie, a nie całej aplikacji. Zobacz [Przewodnik po stylowaniu kart w CSS](card-css-theming.md).

Jeśli aplikacja wygląda źle, warto sprawdzić zarówno aktywny motyw, jak i Card CSS. Przyczyną może być każde z nich.

## Powiązane przewodniki

- [Przewodnik po stylowaniu kart w CSS](card-css-theming.md)
- [Ustawienia wyglądu](appearance-settings.md)
- [Konfiguracja serwera](../CONFIGURATION.md)
- [Dostęp zdalny: Basic Auth i lista dozwolonych adresów IP](../REMOTE_ACCESS.md)
