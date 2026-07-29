# Przewodnik instalacji w systemie Windows

Z tego przewodnika dowiesz się, jak zainstalować aplikację Marinara Engine w systemie Windows. Do wyboru są dwie drogi: instalator uruchamiany jednym kliknięciem (droga łatwa) albo konfiguracja ze źródeł. Opisujemy tu również wymagania systemowe, funkcje opcjonalne i sposoby na późniejszą aktualizację.

## Wymagania systemowe

Aplikacja Marinara Engine działa na własnym komputerze z systemem Windows. Potrzebne są:

- Windows 10 lub Windows 11 (64-bitowy).
- Kilka gigabajtów wolnego miejsca na dysku, na aplikację i jej zależności.
- Połączenie z internetem w trakcie instalacji, żeby pobrać kod i pakiety.

Obie metody instalacji wymagają dwóch narzędzi. Instalator potrafi pobrać je za ciebie. Przy metodzie ze źródeł instalujesz je samodzielnie:

- **Node.js** w wersji 24, 25 lub 26. To na nim działa aplikacja. Zalecana jest wersja 24 z oznaczeniem LTS. LTS to skrót od Long Term Support i oznacza wydanie stabilne, z długim wsparciem.
- **Git**. Program Git pobiera kod i pozwala aplikacji aktualizować się później samodzielnie.

pnpm to menedżer pakietów, który instaluje poszczególne części aplikacji. Przy instalatorze albo programie uruchamiającym **start.bat** nie trzeba instalować pnpm samodzielnie. Oba pobierają właściwą wersję pnpm przez Corepack, czyli pomocnika dołączonego do Node.js, albo przez tymczasowe pobranie. Polecenie `pnpm` w systemie jest potrzebne wyłącznie przy konfiguracji ręcznej, bez programu uruchamiającego. Ten krok instalacji opisuje odpowiednia sekcja niżej.

## Metoda 1: instalator dla systemu Windows (zalecana)

Instalator to najprostszy początek. Sprawdza obecność Node.js i Git, pomaga je zainstalować, jeśli ich brakuje, pobiera aplikację, buduje ją i tworzy skróty.

Wykonaj kolejno te kroki:

1. Otwórz w przeglądarce stronę z wydaniami aplikacji Marinara Engine.

```text
https://github.com/Pasta-Devs/Marinara-Engine/releases
```

2. Pobierz z tej strony najnowszy plik instalatora dla systemu Windows.
3. Uruchom instalator i postępuj zgodnie z komunikatami na ekranie. Jeśli brakuje Node.js albo Git, pozwól instalatorowi je zainstalować.
4. Wskaż folder instalacji, kiedy pojawi się pytanie, albo zostaw ustawienie domyślne.
5. Poczekaj, aż instalator pobierze aplikację i ją zbuduje. To może potrwać kilka minut.
6. Po zakończeniu kliknij dwukrotnie nowy skrót na pulpicie, żeby uruchomić aplikację Marinara Engine.

Po krótkiej chwili przeglądarka powinna otworzyć aplikację. Jeśli nie otworzy się sama, otwórz przeglądarkę i wpisz ten adres:

```text
http://127.0.0.1:7860
```

Instalator przygotowuje kopię aplikacji opartą na Git. Dzięki temu przy kolejnym uruchomieniu aplikacja może zaktualizować się sama. Zajrzyj do sekcji o aktualizacji poniżej.

Jeśli program antywirusowy ostrzega przed instalatorem, to znany fałszywy alarm. Instalator pobiera Node.js i Git, a część antywirusów uznaje takie zachowanie za podejrzane. Uruchamiaj wyłącznie instalator pobrany z oficjalnej strony z wydaniami, do której prowadzi odnośnik powyżej.

## Metoda 2: instalacja ze źródeł

Wybierz tę metodę, jeśli wolisz wpisywać polecenia samodzielnie albo chcesz korzystać z wersji testowej (staging).

### Krok 1: zainstaluj Node.js i Git

1. Pobierz instalator Node.js z oficjalnej strony i uruchom go.

```text
https://nodejs.org/en/download
```

2. Pobierz instalator Git z oficjalnej strony i uruchom go.

```text
https://git-scm.com/download/win
```

3. Otwórz nowe okno wiersza polecenia. Sprawdź, czy Node.js ma wersję 24, 25 albo 26:

```bat
node -v
```

4. Sprawdź, czy Git jest zainstalowany:

```bat
git --version
```

Po każdym poleceniu powinien pojawić się numer wersji. Jeśli polecenie nie zostało znalezione, zamknij i otwórz ponownie wiersz polecenia albo zainstaluj brakujące narzędzie jeszcze raz.

### Krok 2: pobierz kod i uruchom aplikację

Program uruchamiający o nazwie **start.bat** wykonuje konfigurację za ciebie. Dobiera właściwą wersję pnpm, instaluje zależności, buduje aplikację i otwiera przeglądarkę.

1. Pobierz kod przy użyciu Git:

```bat
git clone https://github.com/Pasta-Devs/Marinara-Engine.git
```

2. Wejdź do nowego folderu:

```bat
cd Marinara-Engine
```

3. Opcjonalnie: przełącz się na wersję testową. Pobrany kod startuje na wersji stabilnej. Jeśli zamiast niej ma być wersja testowa (staging), wpisz to polecenie przed pierwszym uruchomieniem. Pomiń ten krok, jeśli wolisz wersję stabilną. Przed sięgnięciem po wersje testowe utwórz kopię zapasową danych.

```bat
git checkout staging
```

Po tym przełączeniu program uruchamiający trzyma się wersji testowej także przy aktualizacjach.

4. Uruchom program uruchamiający:

```bat
start.bat
```

Pierwsze uruchomienie trwa kilka minut, bo wszystko musi się zainstalować i zbudować. Kiedy będzie gotowe, przeglądarka otworzy aplikację pod adresem `http://127.0.0.1:7860`. Żeby uruchomić aplikację ponownie później, wpisz **start.bat** w tym samym folderze.

Program uruchamiający domyślnie udostępnia aplikację w sieci lokalnej, więc inne urządzenia w tej samej sieci mogą się z nią połączyć. Zajrzyj do sekcji o dostępie z innego urządzenia poniżej.

### Konfiguracja ręczna, bez programu uruchamiającego

Jeśli wolisz wpisywać każde polecenie samodzielnie zamiast używać **start.bat**, wykonaj poniższe kroki wewnątrz folderu `Marinara-Engine`.

1. Zainstaluj pnpm. Ta droga nie korzysta z programu uruchamiającego, więc polecenie `pnpm` musi istnieć w systemie. Polecenie `npm` jest częścią Node.js. Wpisz to raz:

```bat
npm install -g pnpm
```

2. Zainstaluj zależności:

```bat
pnpm install --force
```

3. Zbuduj aplikację:

```bat
pnpm build
```

4. Uruchom serwer:

```bat
pnpm start
```

5. Otwórz aplikację w przeglądarce:

```text
http://127.0.0.1:7860
```

Wszystko działa na twoim komputerze. Przy tej ręcznej metodzie aplikacja nasłuchuje na `127.0.0.1`, więc dostęp ma tylko ten jeden komputer. Żeby połączyły się z nią inne urządzenia w sieci, utwórz plik o nazwie `.env` w folderze `Marinara-Engine`. Dodaj do niego tę linię, a potem uruchom serwer ponownie:

```env
HOST=0.0.0.0
```

## Opcjonalnie: usuwanie tła sprite'ów przez AI

Aplikacja Marinara Engine prosi o natywną przezroczystość dla generowanych statycznych sprite'ów i ma wbudowane adaptacyjne czyszczenie maski dla jednolitych kolorów oraz starszych białych teł. Dodatkowo można zainstalować opcjonalne narzędzie `backgroundremover`, które wkracza do akcji przy szczegółowej scenerii i innych niejednolitych tłach. Jest opcjonalne, bo pobiera duże pliki uczenia maszynowego.

Do jego działania potrzebny jest Python. Zainstaluj Python 3.11 z oficjalnej strony, a potem wpisz polecenie instalacji w folderze `Marinara-Engine`:

```text
https://www.python.org/downloads/windows/
```

Wykonaj krok instalacji:

```bat
pnpm backgroundremover:install
```

W ten sposób powstaje prywatny folder Python (venv) wewnątrz folderu z danymi. Aplikacja Marinara Engine korzysta z niego dalej automatycznie przy czyszczeniu sprite'ów. Venv to samodzielne środowisko Python, które nie wpływa na resztę systemu.

Inna opcja: pozwól, żeby **start.bat** zainstalował to narzędzie przy następnym uruchomieniu. Dodaj tę linię do pliku `.env`:

```env
BACKGROUNDREMOVER_AUTO_INSTALL=true
```

## Dostęp z innego urządzenia

Aplikację Marinara Engine można otworzyć na telefonie, tablecie albo innym komputerze w tej samej sieci. Kroki konfiguracji i opcje bezpieczeństwa opisuje przewodnik [Najczęściej zadawane pytania](../FAQ.md).

## Aktualizacja aplikacji Marinara Engine

Czaty, postacie i ustawienia zostają na miejscu po aktualizacji. W systemie Windows aplikacja Marinara Engine daje trzy sposoby na aktualizację.

### Automatyczne aktualizacje przez program uruchamiający

Przy starcie ze skrótu na pulpicie albo z **start.bat** w kopii opartej na Git program uruchamiający najpierw sprawdza dostępność aktualizacji. Jeśli istnieje nowsza wersja, pobiera zmiany, instaluje ponownie zależności, buduje aplikację od nowa i dopiero potem ją startuje. Działa to zarówno przy instalacji z instalatora, jak i przy ręcznym sklonowaniu kodu.

Polecenie `start.bat --skip-update` pomija jedno sprawdzenie. Żeby zachować zainstalowaną wersję Marinara Engine między uruchomieniami, dodaj `AUTO_UPDATE_ENABLED=false` do pliku `.env`. Sprawdzanie ręczne, zastosowanie aktualizacji w aplikacji i ręczna aktualizacja przez Git nadal działają.

Jeśli w kodzie są niezapisane zmiany lokalne, program uruchamiający próbuje bezpiecznie odłożyć je na bok. Po aktualizacji przywraca je na miejsce. Jeśli mu się to nie uda, zostawia bieżącą wersję i wypisuje stosowną informację.

### Aktualizacje z poziomu aplikacji

Dostępność aktualizacji można też sprawdzić wewnątrz aplikacji.

1. Otwórz panel **Settings** (Ustawienia).
2. Przejdź do zakładki **Advanced**.
3. Znajdź sekcję **Updates**.
4. Wybierz kanał na liście rozwijanej **Release Channel**. Opcja **Latest Stable** oznacza wersję zwykłą, a **Staging/UAT** wczesne wersje testowe. Przed sięgnięciem po wersje testowe utwórz kopię zapasową danych.
5. Kliknij przycisk **Check for Updates**. Aplikacja poinformuje, czy jest dostępna nowsza wersja.

Przycisk **Apply Update** jest domyślnie wyłączony ze względów bezpieczeństwa. Zastosowanie aktualizacji z wnętrza aplikacji wymaga dodatkowej konfiguracji. Ustaw w pliku `.env` te wartości:

```env
UPDATES_APPLY_ENABLED=true
ADMIN_SECRET=your-own-secret-value
```

Następnie otwórz panel **Settings**, przejdź do zakładki **Advanced**, znajdź sekcję **Admin Access** i wklej tam tę samą tajną wartość. Od tej chwili przycisk **Apply Update** jest dostępny.

Jeśli aplikacja jest otwarta na iPhonie albo iPadzie połączonym z tym komputerem z systemem Windows, przycisk **Apply Update** aktualizuje właśnie ten serwer w systemie Windows. Zdalne zastosowanie aktualizacji wymaga jeszcze jednej wartości w pliku `.env`:

```env
UPDATES_ALLOW_REMOTE_APPLY=true
```

Bez włączonego stosowania aktualizacji w aplikacji wystarczy uruchomić aplikację ponownie ze skrótu albo przez **start.bat**.

### Aktualizacja ręczna

Przy kopii Git bez programu uruchamiającego aktualizację da się wykonać ręcznie. Wpisz te polecenia w folderze `Marinara-Engine`.

1. Pobierz najnowszy kod stabilny:

```bat
git fetch origin +refs/heads/main:refs/remotes/origin/main
```

2. Przejdź na najnowszą wersję stabilną:

```bat
git merge --ff-only origin/main || git checkout --detach origin/main
```

3. Zainstaluj ponownie zależności:

```bat
pnpm install --force
```

4. Zbuduj aplikację od nowa:

```bat
pnpm build
```

5. Uruchom serwer ponownie:

```bat
pnpm start
```

Przy wersjach testowych używa się gałęzi staging. Wpisz te dwa polecenia zamiast kroków 1 i 2 powyżej. Potem przejdź do kroków z instalacją i budowaniem:

```bat
git fetch origin +refs/heads/staging:refs/remotes/origin/staging
```

```bat
git checkout -B staging origin/staging
```

## Kiedy coś pójdzie nie tak

Jeśli instalacja albo uruchomienie się nie powiedzie, najpierw sprawdź, czy Node.js ma wersję 24, 25 lub 26 i czy Git jest zainstalowany. Jeśli program antywirusowy blokuje instalator albo pobieranie, to znany fałszywy alarm, opisany wyżej.

Więcej sposobów na naprawę znajdziesz w przewodniku [Rozwiązywanie problemów w aplikacji Marinara Engine](../TROUBLESHOOTING.md).

## Powiązane przewodniki

- [Instalacja aplikacji Marinara Engine](../INSTALLATION.md): wybierz metodę instalacji odpowiednią dla swojego urządzenia.
- [Aktualizacja aplikacji Marinara Engine](../UPGRADING.md): więcej szczegółów o utrzymywaniu aplikacji w najnowszej wersji.
- [Rozwiązywanie problemów w aplikacji Marinara Engine](../TROUBLESHOOTING.md): sposoby na typowe kłopoty.
- [Najczęściej zadawane pytania](../FAQ.md): szybkie odpowiedzi, w tym o dostępie przez sieć.
