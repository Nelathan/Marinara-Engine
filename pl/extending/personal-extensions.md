# Rozszerzenia osobiste

Rozszerzenia osobiste to prywatne szkice kodu, które przygotowuje dla ciebie Professor Mari. Otwórz **Settings** (Ustawienia) > **Addons** (dodatki) > **Personal Extensions** (rozszerzenia osobiste).

Domyślnie widać komunikat:

> Ask Professor Mari to create an extension for you. Nothing runs until you enable it and approve the exact code hash.

W tej sekcji nie ma akcji tworzenia nowego szkicu ani żadnych kontrolek importu. O utworzenie lub poprawienie szkicu poproś Professor Mari. Asystentka zapisze kod, ale nie zatwierdzi go ani nie włączy.

## Przegląd kodu i włączenie

Każdy szkic zaczyna jako wyłączony. Marinara wylicza odcisk dokładnie tego kodu, który ma się wykonać, algorytmem SHA-256. Otwórz szkic, przejrzyj kod, porównaj wyświetlony odcisk i dopiero wtedy wybierz **Review and Run** (przegląd i uruchomienie) – tylko jeśli akceptujesz dokładnie tę wersję. Każda zmiana w wykonywanym kodzie i każda przywrócona wersja wyłączają rozszerzenie i wymagają ponownego zatwierdzenia.

Piaskownica ogranicza uprawnienia, ale nie sprawia, że dowolny kod staje się godny zaufania. Złośliwe rozszerzenie wciąż może marnować moc procesora, dopóki nie zatrzyma go strażnik, zapełnić własną przestrzeń danych w ramach narzuconych limitów albo zachowywać się zwodniczo w logach. Zawsze przejrzyj kod przed włączeniem.

## Izolacja środowiska uruchomieniowego

Rozszerzenie przeglądarkowe działa w osobnym wątku Worker wewnątrz ramki iframe z piaskownicą i nieprzezroczystym pochodzeniem. Nie ma dostępu do strony aplikacji Marinara Engine, drzewa DOM, ciasteczek, pamięci przeglądarki, interfejsów API danego pochodzenia ani do sieci. Ma do dyspozycji prywatną pamięć rozszerzenia, logi, zarządzane liczniki czasu, rejestrację sprzątania, ograniczone okna oraz bezpieczne miejsca na wkład w interfejs aplikacji.

Rozszerzenia mogą dodawać akcje na górnym pasku, pozycje w menu Extensions i trwałe panele po prawej stronie za pomocą `marinara.ui.registerContribution(...)`. Marinara rysuje te elementy w aktywnym motywie i korzysta ze stałego zestawu kontrolek: nagłówki, tekst, wynik w formacie preformatowanym, przyciski, pola tekstowe, listy rozwijane, przełączniki, suwaki, kontrolki koloru i odstępy. Rozszerzenie dostarcza treść i stan, nigdy kod HTML, CSS, adresy URL, komponenty React ani obsługę zdarzeń aplikacji.

Te możliwości interfejsu i te zasady są takie same dla każdego rozszerzenia przeglądarkowego, niezależnie od jego pochodzenia. Zaimportowane rozszerzenie zewnętrzne (External) dostaje ten sam interfejs wkładu, gdy tylko przejdzie zgody w pliku `.env` i w sekcji Danger Zone oraz zatwierdzenie dokładnego odcisku. Nadal nie sięgnie do drzewa DOM ani interfejsów API aplikacji Marinara Engine.

### Dodanie panelu rysowanego przez Marinara Engine

```js
const panel = marinara.ui.registerContribution({
  id: "weather-settings",
  kind: "panel",
  label: "Weather controls",
  description: "Tune a weather scene without leaving Marinara.",
  icon: "sparkles",
  elements: [
    { kind: "heading", text: "Atmosphere" },
    {
      kind: "select",
      id: "weather",
      label: "Weather",
      value: "rain",
      options: [
        { value: "rain", label: "Rain" },
        { value: "snow", label: "Snow" },
        { value: "aurora", label: "Aurora" },
      ],
    },
    { kind: "slider", id: "intensity", label: "Intensity", min: 0, max: 100, value: 60 },
    { kind: "toggle", id: "lightning", label: "Lightning", checked: false },
    { kind: "color", id: "tint", label: "Tint", value: "#6d8cff" },
    { kind: "button", id: "apply", label: "Apply" },
  ],
  onActivate: async () => {
    const settings = await marinara.storage.get();
    // Update the panel when stored state should be reflected in the controls.
  },
  onEvent: async ({ elementId, values }) => {
    if (elementId !== "apply") return;
    await marinara.storage.patch(values);
  },
});

marinara.onCleanup(() => panel.remove());
```

Wartość `kind: "button"` daje zwięzłą akcję na górnym pasku lub w menu Extensions, a `kind: "menu-item"` – akcję dostępną tylko z menu. Obie wywołują `onActivate`. Rodzaj `panel` wywołuje `onActivate` przy otwarciu, a jego przyciski wywołują `onEvent` z bieżącymi wartościami wszystkich kontrolek panelu. Zwrócony uchwyt obsługuje `update({ label?, description?, icon?, elements? })` oraz `remove()`. Identyfikatory mogą zawierać litery, cyfry oraz znaki `.`, `_` i `-`.

Rozbudowane narzędzia mogą budować interfejsy wieloetapowe, aktualizując elementy panelu po zdarzeniu. Stan aplikacji trzymaj w `marinara.storage`, nigdy nie zapisuj go w samych znacznikach.

### Przeniesienie starszych rozszerzeń

Sterowniki pogody, edytory promptów i inne rozbudowane procesy to dobre zastosowania dla wkładu w interfejs. Ich bezpieczne wersje mogą korzystać z uruchamiania z menu lub górnego paska oraz z paneli aktualizowanych krok po kroku. Istniejące paczki, które wstawiają nakładki do drzewa DOM, odpytują selektory CSS aplikacji Marinara Engine, przeszukują wnętrze biblioteki React albo wywołują trasy `/api` z tego samego pochodzenia, nie zaimportują się do bezpiecznego środowiska bez zmian.

Wkład w interfejs daje sam interfejs, a nie dodatkowe uprawnienia. Funkcje, które potrzebują dostępu do czatów, presetów, lorebooków, postaci, person albo efektów wizualnych sceny, wymagają też osobnego pośrednika udostępnionego przez Marinara Engine i wyraźnie zatwierdzonego przez użytkownika. Dopóki takiego pośrednika nie ma, rozszerzenie nie może go udawać przez dostęp do drzewa DOM aplikacji ani przez nieograniczone zapytania sieciowe.

Starszy interfejs `marinara.ui.showWindow(...)` nadal działa i otwiera tymczasowe okno wewnątrz ramki iframe o nieprzezroczystym pochodzeniu. Korzysta z tego samego stałego zestawu kontrolek i zwraca uchwyty `update(...)` oraz `close()`. Kiedy narzędzie ma być osiągalne przez zwykłą nawigację aplikacji Marinara Engine, lepiej wybrać wkład w interfejs.

Rozszerzenie serwerowe działa w osobnym procesie Node z ograniczonymi uprawnieniami, wewnątrz mechanizmu Seatbelt na macOS albo Bubblewrap na Linux. Nie ma dostępu do plików aplikacji Marinara Engine, plików użytkownika, odziedziczonych sekretów serwera, sieci, procesów potomnych, wątków roboczych ani dodatków natywnych. Jeśli Marinara nie zestawi obsługiwanej piaskownicy systemowej, rozszerzenia serwerowe pozostają wyłączone.

### Obsługiwane platformy

Rozszerzenia przeglądarkowe zamyka w piaskownicy sama przeglądarka, więc działają wszędzie. Rozszerzenia serwerowe wymagają obsługiwanej piaskownicy systemowej – tam, gdzie jej nie ma, zostają wyłączone i nie da się ich włączyć. Marinara nigdy nie uruchamia ich awaryjnie poza piaskownicą.

| Platforma                | Rozszerzenia przeglądarkowe | Rozszerzenia serwerowe                          |
| ------------------------ | --------------------------- | ----------------------------------------------- |
| macOS                    | ✅ W piaskownicy            | ✅ W piaskownicy (Seatbelt)                     |
| Linux (z Bubblewrap)     | ✅ W piaskownicy            | ✅ W piaskownicy (Bubblewrap)                   |
| Linux (bez `bwrap`)      | ✅ W piaskownicy            | ⛔ Wyłączone – zainstaluj `bwrap`               |
| Windows                  | ✅ W piaskownicy            | ⛔ Wyłączone – użyj rozszerzenia przeglądarkowego |
| Android                  | ✅ W piaskownicy            | ⛔ Wyłączone – użyj rozszerzenia przeglądarkowego |

Na systemach Windows i Android nie ma obsługiwanej systemowej piaskownicy procesów, więc rozszerzeń serwerowych celowo tam nie ma. Użyj zamiast tego rozszerzenia przeglądarkowego albo uruchom serwer Marinara Engine na macOS lub Linux (z `bwrap`), jeśli rozszerzenie serwerowe jest niezbędne.

## Rozszerzenia zewnętrzne

Import cudzych rozszerzeń jest domyślnie zablokowany i ukryty. Trzeba wykonać dwa kroki:

1. Na komputerze z serwerem Marinara Engine ustaw `ENABLE_EXTERNAL_EXTENSIONS=true` w pliku `.env`.
2. Otwórz **Settings** > **Advanced** (zaawansowane) > **Danger Zone** (strefa zagrożenia), przewiń poniżej kontrolek usuwania danych, przeczytaj ostrzeżenie i włącz przełącznik **Allow third-party extension imports** (zgoda na import cudzych rozszerzeń).

Dopiero wtedy sekcja **Settings** > **Addons** pokazuje **External Extensions** (rozszerzenia zewnętrzne) razem z kontrolkami importu plików i folderów. Obsługiwane formaty są zawsze rozwinięte:

- `.personal-extension.zip` oraz zgodne paczki `.zip`;
- manifesty `.json`;
- `.css`;
- `.js`, `.mjs` i `.cjs`;
- `.server.js`, `.server.mjs` i `.server.cjs`.

Import nigdy nie przenosi zatwierdzenia i nie potrafi sam się włączyć. Wpisy starsze, wciągnięte z profilu, zapisane ręcznie oraz te o nieznanym pochodzeniu również liczą się jako zewnętrzne. Pozostają ukryte, nie da się ich zatwierdzić i oba środowiska uruchomieniowe je pomijają, dopóki obie blokady nie zostaną zdjęte.

Wyłączenie którejkolwiek z tych blokad zatrzymuje działające zewnętrzne procesy serwerowe, usuwa wątki robocze w przeglądarce i wyłącza zapisane wpisy zewnętrzne. Ponowne zdjęcie blokad nie uruchamia ich automatycznie.

Cudze rozszerzenia mogą zawierać złośliwy lub niebezpieczny kod. Przejrzyj każdą linijkę, zanim cokolwiek pobierzesz, zaimportujesz lub włączysz. Cała odpowiedzialność jest po twojej stronie.

## Eksport, wersje i odzyskiwanie

Akcja eksportu w rozszerzeniu pobiera przenośną paczkę. Paczki wyeksportowane i przywrócone pozostają wyłączone. Przywrócenie wcześniejszej wersji też zamienia ją z powrotem w wyłączony szkic.

Jeśli rozszerzenie zachowuje się źle, wybierz **Disable** (wyłączenie). Jeśli interfejs jest niedostępny, zatrzymaj Marinara Engine i ustaw wartość `enabled` na `"false"` we właściwym wpisie `installed_extensions`. Nigdy nie ustawiaj `approvedHash` ręcznie.

## Powiązane przewodniki

- [Professor Mari](../home/professor-mari.md)
- [Konfiguracja serwera](../CONFIGURATION.md)
- [Kopia zapasowa i przywracanie](../data/backup-and-restore.md)
- [Dostęp zdalny](../REMOTE_ACCESS.md)
