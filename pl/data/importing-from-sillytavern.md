# Importowanie z SillyTavern

Z tego przewodnika dowiesz się, jak przenieść dane z aplikacji SillyTavern do aplikacji Marinara Engine. Pliki da się importować pojedynczo albo przeskanować cały folder SillyTavern i zaimportować wszystko naraz.

## Co można przenieść

Marinara Engine importuje takie rodzaje danych z aplikacji SillyTavern:

- Postacie (karty postaci)
- Czaty (zapisy wiadomości)
- Czaty grupowe (czaty z więcej niż jedną postacią)
- Presety (ustawienia generowania)
- Lorebooki (w aplikacji SillyTavern noszą nazwę "World Info")
- Tła (obrazy tła czatu)
- Persony (profile, które opisują **{{user}}**)

Lorebook to zestaw notatek, które AI czyta wtedy, gdy w czacie padną określone słowa. Preset to zapisany zestaw ustawień generowania. Persona to profil zastępujący czytelnika w czacie, czyli postać, w którą się wcielasz.

Import działa na dwa sposoby. Do pojedynczych plików służą przyciski importu jednego pliku. Cały folder z instalacją SillyTavern przenosi kreator **Import from SillyTavern Folder** (import z folderu SillyTavern).

## Szybki import pojedynczych plików

Otwórz panel **Settings** (Ustawienia), przejdź do zakładki **Imports** (Importy) i znajdź sekcję **SillyTavern Import**. Jej opis brzmi "Bring over characters, chats, presets, and lorebooks from SillyTavern files."

W tej sekcji są cztery przyciski do importu jednego pliku. Każdy otwiera zwykłe okno wyboru pliku, bez dodatkowych opcji:

- Przycisk **Import Character (JSON/PNG)** przyjmuje kartę postaci w pliku `.json` lub `.png`.
- Przycisk **Import Chat (JSONL)** przyjmuje zapis czatu w pliku `.jsonl`. Zawsze tworzy czat w trybie **Roleplay** i od razu go otwiera.
- Przycisk **Import Preset (JSON)** przyjmuje plik presetu `.json`.
- Przycisk **Import Lorebook (JSON)** przyjmuje plik World Info `.json`.

JSONL oznacza jeden rekord JSON w każdej linii. W tym formacie aplikacja SillyTavern zapisuje przebieg czatu.

Jeśli importowana karta postaci ma lorebook w środku, przeglądarka pyta, czy zaimportować go dodatkowo jako osobny lorebook w aplikacji Marinara Engine. Kliknij przycisk **OK**, żeby zachować World Info jako samodzielny lorebook do wielokrotnego użytku. Kliknij przycisk **Cancel**, żeby pominąć ten krok i zaimportować samą postać.

Te szybkie przyciski działają na sztywnych ustawieniach, których nie da się tutaj zmienić. Zachowują wszystkie tagi ze źródła, a skrypty regex ograniczają wyłącznie do danej postaci. Skrypt regex, czyli wyrażenie regularne, to reguła znajdź-i-zamień, która zmienia tekst przed pokazaniem go AI albo po odpowiedzi. Aby samodzielnie wybrać te opcje, użyj przycisku **Import** w panelu **Characters**. Zobacz [Importowanie i eksportowanie kart postaci](../characters/import-export.md).

### Import czatu do wybranego trybu

Przycisk **Import Chat (JSONL)** opisany wyżej zawsze tworzy czat w trybie **Roleplay**. Jeśli czat ma trafić do innego trybu, użyj małego przycisku importu na górze listy czatów. Jego podpowiedź brzmi **Import SillyTavern or Marinara chat JSONL**. Ten przycisk importuje plik do trybu z aktualnie otwartej zakładki, na przykład Conversation, Roleplay albo Game. Więcej o imporcie i eksporcie czatów znajdziesz w przewodniku [Eksport i import czatów](../chats/export-import.md).

## Import from SillyTavern Folder

Ten kreator przegląda cały folder SillyTavern i importuje wiele elementów naraz. Odczytuje razem postacie, czaty, czaty grupowe, presety, lorebooki, tła i persony.

Aby go otworzyć, przejdź do panelu **Settings**, potem do zakładki **Imports**, następnie do sekcji **SillyTavern Import**, i kliknij przycisk **Import from SillyTavern Folder**. Otwiera się okno o tytule **Import from SillyTavern**.

### Krok 1: wskaż folder SillyTavern

1. W polu **SillyTavern Folder Path** wpisz ścieżkę do folderu SillyTavern. Przykładowa ścieżka to `/path/to/SillyTavern`.
2. Możesz też kliknąć przycisk **Browse** i wskazać folder w systemowym oknie wyboru. Na zdalnym serwerze bez interfejsu graficznego, gdzie takiego okna nie ma, otwiera się wbudowana przeglądarka folderów z przyciskiem **Select This Folder**.
3. Wskaż główny folder SillyTavern. Wskazówka w oknie mówi, że zwykle jest to folder zawierający w sobie folder `data/` albo `public/`.
4. Kliknij przycisk **Scan Folder**. W trakcie pracy przycisk pokazuje napis **Scanning...**.

Po skanowaniu Marinara podaje, ile elementów znalazła w każdej kategorii. Jeśli nie potrafi odczytać folderu, pokazuje błąd, na przykład "Could not find SillyTavern data directory."

### Krok 2: wybierz, co zaimportować

Kolejny ekran nosi tytuł **Choose exactly what to import**. Pokazuje listę wyboru dla każdej kategorii: **Characters**, **Chats**, **Group Chats**, **Presets**, **Lorebooks**, **Backgrounds** i **Personas**. Licznik pokazuje liczbę zaznaczonych elementów.

Przy każdej kategorii są przyciski **All** i **None** oraz przełącznik **Show** / **Hide**, dzięki któremu widać poszczególne elementy i ich daty.

Prawie wszystko jest zaznaczone od początku. Wyjątkiem są presety wbudowane w aplikację SillyTavern. Marinara je rozpoznaje i zostawia niezaznaczone, a baner wyjaśnia dlaczego. To standardowe presety, takie jak `default`, `deterministic`, `neutral` oraz presety `universal-*`. Zostaw je niezaznaczone, chyba że naprawdę potrzebne są ich kopie.

Jeśli skanowanie znalazło jakieś postacie, pojawiają się dwie dodatkowe kontrolki:

- Ustawienie **Imported character tags** decyduje o sposobie importu tagów. Wybierz **All tags**, żeby zachować tagi ze źródła, **No tags**, żeby je pominąć, albo **Existing only**, żeby zachować tylko tagi już obecne w aplikacji Marinara Engine. Domyślnie jest to **All tags**.
- Ustawienie **Imported regex scripts** decyduje o zasięgu skryptów regex. Wybierz **Character only**, żeby skrypty działały tylko przy danej postaci, albo **Global**, żeby trafiły do sekcji **Presets -> Regexes** i działały w każdym czacie. Domyślnie jest to **Character only**.

Kiedy zaznaczenie wygląda dobrze, kliknij przycisk **Import Selected**. Przycisk **Back** wraca do kroku z wyborem folderu.

### Krok 3: obserwuj postęp

Marinara importuje elementy pojedynczo. Widać wskaźnik pracy, bieżącą kategorię i nazwę elementu, pasek postępu oraz rosnące liczniki dla każdej kategorii.

### Krok 4: sprawdź wynik

Na ostatnim kroku pojawia się baner **Import complete!** przy powodzeniu albo baner z błędem przy niepowodzeniu. Po udanym imporcie kafelek każdej kategorii pokazuje jej końcową liczbę. Jeśli któryś element się nie udał, lista ostrzeżeń pokazuje jedną linię na każde niepowodzenie, na przykład `Character "Foo": error message`. Kliknij przycisk **Done**, żeby zamknąć okno.

### Jak kreator obchodzi się z danymi

- Import przebiega osobno dla każdego elementu. Jeśli któraś postać, czat, preset, lorebook, tło albo persona się nie powiedzie, Marinara pomija ten element, zapisuje ostrzeżenie i pracuje dalej nad resztą.
- Kilka plików czatu należących do jednej postaci trafia do jednego czatu jako jego gałęzie, a nie jako osobne czaty.
- Czaty grupowe zawsze importują się jako czaty w trybie **Roleplay**.
- Zaimportowane elementy zachowują datę ostatniej zmiany pliku źródłowego jako swoją datę w aplikacji Marinara Engine. Nie dostają daty i godziny samego importu.

## Dostęp i zasady dotyczące folderów

Przyciski importu pojedynczych plików działają u wszystkich, bez dodatkowej konfiguracji.

Kreator **Import from SillyTavern Folder** czyta pliki z dysku, więc wymaga podwyższonych uprawnień. Na tym samym urządzeniu co serwer (przez pętlę zwrotną) działa bez dodatkowej konfiguracji. Z innego urządzenia lub innej przeglądarki trzeba ustawić na serwerze sekret administratora. Następnie zapisz tę samą wartość w sekcji **Settings -> Advanced -> Admin Access**. Sposób ustawienia sekretu administratora opisuje [Konfiguracja serwera](../CONFIGURATION.md).

Jeśli serwer ma ustawioną zmienną `IMPORT_ALLOWED_ROOTS`, Marinara odrzuca wpisane ręcznie ścieżki spoza tych folderów. Foldery wskazane przyciskiem **Browse** albo wbudowaną przeglądarką folderów działają zawsze, nawet przy włączonym tym ustawieniu.

## Czego kreator nie przenosi

Kreator folderu przegląda wyłącznie siedem wymienionych wyżej kategorii. Pozostałych danych z aplikacji SillyTavern, takich jak ogólne ustawienia aplikacji i szybkie odpowiedzi, nie odczytuje i nie importuje.

Presety wbudowane w aplikację SillyTavern są domyślnie niezaznaczone, więc nie przenoszą się, dopóki nie zaznaczysz ich samodzielnie.

Marinara pomija każdy element, którego nie da się przekonwertować. Dokładną listę pominiętych rzeczy pokazuje lista ostrzeżeń na ostatnim kroku kreatora.

## Powiązane przewodniki

- [Importowanie i eksportowanie kart postaci](../characters/import-export.md)
- [Importowanie i eksportowanie lorebooków](../lorebooks/import-export.md)
- [Eksport i import czatów](../chats/export-import.md)
- [Skrypty regex](../extending/regex-scripts.md)
