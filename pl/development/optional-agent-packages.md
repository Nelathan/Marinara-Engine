# Opcjonalne pakiety agentów i możliwości

Status: zaimplementowane w cyklu rozwojowym v2.3.0 w zgłoszeniu #3612.

## Cel

Podstawowa dystrybucja aplikacji Marinara Engine nie może kompilować ani dostarczać opcjonalnych implementacji agentów i możliwości. Świeża instalacja startuje bez żadnych opcjonalnych pakietów. Aktualizacja zachowuje możliwości, które były dostępne przed wprowadzeniem tego systemu pakietów.

Oficjalny katalog, źródła pakietów, powtarzalne artefakty, skrypty walidacyjne i proces współtworzenia znajdziesz w repozytorium [Pasta-Devs/Marinara-Agents](https://github.com/Pasta-Devs/Marinara-Agents). Zainstalowane artefakty lądują wewnątrz skonfigurowanego folderu danych aplikacji Marinara Engine, więc aktualizacja aplikacji ich nie nadpisze.

## Model pakietu

Pakiet agenta może wnosić jednego lub kilku deklaratywnych agentów oraz opcjonalne zaufane możliwości wykonywalne:

- serwerowe punkty wejścia dla tras, haków cyklu życia, dostawców promptów, obsługi wyników i migracji magazynu danych;
- klienckie punkty wejścia dla paneli, powierzchni czatu, sekcji ustawień, wyborów w kreatorze konfiguracji i widoków czasu wykonania;
- wspólne schematy JSON i stabilne kontrakty transmisji;
- zasoby, dokumentację i fragmenty wiedzy dla asystentki Professor Mari należące do pakietu.

Pakiety celują w wersjonowane API możliwości aplikacji Marinara Engine. Nie mogą importować prywatnych ścieżek źródłowych silnika.

Klienckie elementy możliwości dostają wybrany w aplikacji język interfejsu przez atrybuty `lang` i `dir` oraz przez
obiekt `capabilityProps.localization`. Interfejsy należące do pakietu mają własne pliki językowe i wracają do angielskiego
z pakietu; Marinara Engine nie tłumaczy promptów pakietu ani wartości maszynowych zapisanych w pakiecie. Zmiana języka
nadal korzysta z istniejącego zdarzenia `marinara-capability-props`, więc zainstalowany interfejs odświeża się bez restartu aplikacji.

API możliwości w wersji 1.1 dodaje do serwerowego kontekstu aktywacji ogólną
fasadę środowiska uruchomieniowego. Pakiety mogą odczytać obowiązujący stan debugowania agentów i pisać
przez logger Pino aplikacji Marinara Engine, łącznie z jawnym wymuszeniem trybu debugowania, bez importowania
prywatnych modułów loggera ani konfiguracji środowiska uruchomieniowego. Fasada udostępnia operacje,
a nie same obiekty silnika.

API możliwości w wersji 1.2 dodaje operacje na czatach i wiadomościach w obrębie transakcji,
wąskie zapisy metadanych czatu, odczyty istnienia wpisów lorebooka oraz zgodnościowy
magazyn migawek przestrzennych. Pakiety mogą sprawdzić poprawność zmian w domenie wewnątrz transakcji
silnika i atomowo zatwierdzić metadane razem z wiadomością właściciela, swipe'em lub migawką
przestrzenną, bez dostępu do uchwytu bazy danych czy obiektu tabeli. Marinara Engine odpowiada za
wycofywanie zmian i zgodność z historycznym magazynem, a pakiety za walidację i
zasady domeny. To samo API udostępnia znormalizowane rekordy czatów i postaci, wybór
kwalifikujących się wpisów lorebooka, parsowanie odpowiedzi zbliżonych do formatu JSON oraz rozstrzygnięte wywołania modeli językowych.
Dane uwierzytelniające połączeń, implementacje dostawców, uchwyty bazy danych i obiekty magazynu
pozostają prywatne dla silnika.

## Pakiety początkowe

- wszyscy dotychczas wbudowani agenci;
- hierarchiczne mapy przestrzenne dla trybów Roleplay i Game Mode;
- rozmowy audio i wideo w trybie Conversation;
- UNO;
- Chess;
- Poker;
- 8-Ball Pool;
- Tic-Tac-Toe;
- Rock-Paper-Scissors.

W podstawie zostaje menedżer pakietów, klient katalogu, ogólne kontrakty potoku agentów, ogólne kontrakty hosta gier turowych oraz puste interfejsy hosta. Konkretne implementacje należą do pakietów.

## Zaufanie i instalacja

Oficjalny katalog to wersjonowany dokument JSON o sprawdzanym schemacie, pobierany przez HTTPS. Każdy wpis wydania zawiera niezmienne adresy URL artefaktów, skróty SHA-256, rozmiary w bajtach, informacje o zgodności z silnikiem, uprawnienia oraz to, czy dane środowisko uruchomieniowe wymaga restartu.

Przy starcie serwera host pobiera katalog jeden raz, o ile zainstalowany jest przynajmniej jeden oficjalny pakiet. Wybiera tylko nowsze wersje zgodne z działającym silnikiem i z API możliwości, weryfikuje je zwykłym potokiem instalacyjnym i instaluje jeszcze przed aktywacją środowisk uruchomieniowych pakietów. Awarie są izolowane osobno dla każdego pakietu. Gdy katalog jest niedostępny albo weryfikacja się nie powiedzie, dotychczasowe pliki i stan rejestru nadal działają, a niepowodzenie gotowości środowiska serwerowego korzysta ze ścieżki wycofania do poprzedniej wersji.

Instalator musi:

1. wymagać uprzywilejowanego dostępu przez pętlę zwrotną lub konto administratora;
2. wymuszać HTTPS, limity pobierania i limity czasu;
3. sprawdzić zaufanie do katalogu i skrót SHA-256 artefaktu jeszcze przed rozpakowaniem;
4. odrzucać ścieżki bezwzględne, przejścia w górę drzewa, dowiązania, pliki urządzeń i pliki niezadeklarowane;
5. sprawdzić poprawność manifestu i zgodność z silnikiem;
6. rozpakować pliki do tymczasowego folderu obok docelowego;
7. przeprowadzić atomową aktywację dopiero po udanej walidacji;
8. zachować poprzednią wersję do czasu, aż nowe środowisko uruchomieniowe wystartuje poprawnie;
9. wycofać aktywację w razie niepowodzenia;
10. nigdy nie uruchamiać skryptów instalacji, aktualizacji ani odinstalowania.

Oficjalny katalog włącza wyłącznie zaufane pakiety wykonywalne od twórców aplikacji. Przyszła ścieżka dla pakietów zewnętrznych wymaga osobnego, jawnego projektu zaufania.

## Środowisko uruchomieniowe i zachowanie przy restarcie

Serwer jest właścicielem rejestru zainstalowanych pakietów i udostępnia zainstalowane możliwości klientom. Moduły deklaratywne i przeładowywalne aktywują się natychmiast. Po aktywacji interfejs unieważnia zapytania o katalog, agentów, możliwości trybu i aktywny czat.

Manifest może deklarować `restartRequired` tylko wtedy, gdy host nie potrafi bezpiecznie przeładować danego punktu wejścia. Udana aktywacja na gorąco kończy się komunikatem `Agent installed. It is ready to use.` Aktywacja wymagająca restartu kończy się komunikatem `Agent installed. Restart Marinara Engine to finish setup.`

Pakiety gier turowych da się przeładować na gorąco: instalacja od razu rejestruje ich silnik serwerowy i ręczną komendę slash do uruchomienia, a odinstalowanie odłącza środowisko uruchomieniowe bez restartu aplikacji. Ustawienia Conversation Commands w danym czacie decydują wyłącznie o tym, czy postacie mogą wysyłać ukrytą komendę pakietu; nie blokują komendy slash uruchamianej ręcznie. Obecne oficjalne manifesty gier turowych zachowują zachowawczy, dawny znacznik restartu dla zgodności z silnikiem w wersji 2.x. Silnik w wersji 3.x rozpoznaje rodzaj `turn-game`, przeprowadza bezpieczną aktywację na gorąco i zwraca pakiet jako aktywny i gotowy do użycia.

## Migracja zgodności

Przy pierwszym uruchomieniu po aktualizacji:

- własni agenci pozostają nietknięci;
- każdy dawny wbudowany agent widoczny w tej instalacji zostaje zapisany jako zainstalowany;
- mapy, rozmowy w trybie Conversation i gry w trybie Conversation zachowują dotychczasową dostępność;
- dotychczasowa konfiguracja poszczególnych czatów, migawki, stan gry, historia rozmów i pamięć agentów zostają na miejscu;
- migracja jest idempotentna i zapisuje swoje zakończenie dopiero wtedy, gdy wszystkie wpisy o dawnej dostępności są trwałe.

Artefakty dawnych pakietów nadal są dostępne w oficjalnym katalogu jako źródła migracji. Świeża instalacja ich nie pokazuje ani nie aktywuje, dopóki nie zostaną zainstalowane ręcznie.

## Odinstalowanie

Odinstalowanie usuwa pakiet z wyborów w aktywnych czatach, kasuje jego konfigurację agenta oraz pobrane pliki wykonywalne, a w razie potrzeby odłącza jego środowisko uruchomieniowe przy restarcie. Historyczne czaty, wiadomości, migawki map, podsumowania rozmów i zakończone rozgrywki nadal da się odczytać, więc usunięcie pakietu nie zniszczy niczyjej pracy. Trwałe usunięcie historycznych danych domenowych to osobna, jawna decyzja użytkownika.

Każde odinstalowanie wymaga potwierdzenia. Objęte nim czaty wracają do zwykłych powierzchni podstawowych bez uszkodzenia historii.

## Interfejs katalogu

Panel **Agents** (Agenci) zawiera przycisk `Download Agents`, który odpowiada przyciskowi `Download Cards` w panelu Card Browser. Otwiera on pełnoekranową, responsywną bibliotekę z wyszukiwaniem, rodzajami pakietów, informacją o zgodności, stanem instalacji i aktualizacji, uprawnieniami, kosztem miejsca na dysku, dokumentacją oraz przyciskami odinstalowania.

Na komputerze widać listę do przeglądania i sąsiadujący z nią obszar szczegółów. Na telefonie jest jeden panel, z jawną nawigacją wstecz i akcjami wygodnymi pod palec. Stany pusty, offline, niezgodny, uszkodzone pobieranie, przerwana instalacja, aktualizacja, wycofanie i wymagany restart są obsłużone pełnoprawnie.

## Warunek zakończenia wydzielenia

Wydzielenie jest kompletne dopiero wtedy, gdy podstawowe produkcyjne paczki klienta i serwera nie zawierają już implementacji pakietu, świeża instalacja nie potrafi jej aktywować bez pobrania pakietu, instalacja po aktualizacji ją zachowuje, a instalacja, aktualizacja i odinstalowanie pakietu przechodzą pomyślnie na komputerze, telefonie i systemach plików zgodnych z Termux.
