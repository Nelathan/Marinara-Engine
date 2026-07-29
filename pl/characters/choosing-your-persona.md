# Wybór persony w czacie

Ten przewodnik wyjaśnia, jak wybrać personę, która reprezentuje cię w czacie. Znajdziesz tu opis globalnej persony aktywnej, persony ustawionej dla pojedynczego czatu oraz szybkich przełączników.

## Persona aktywna i persony poszczególnych czatów

Persona (postać, w którą się wcielasz) to twoja własna karta postaci – tożsamość, której aplikacja Marinara Engine używa, żeby cię przedstawić. Przekazuje AI imię i szczegóły, dzięki czemu AI wie, z kim rozmawia. O tym, jak ją zbudować, mówi przewodnik [Persony użytkownika](personas.md).

Marinara wybiera personę na dwóch poziomach:

- **Persona aktywna** to globalne ustawienie domyślne. Marinara używa jej w każdym czacie, który nie ma własnej persony.
- Persona czatu ma pierwszeństwo przed personą aktywną, ale tylko w tym jednym czacie.

Aktywna może być dokładnie jedna persona naraz. Może też nie być żadnej.

## Ustawianie persony aktywnej

Oto, co trzeba zrobić, żeby ustawić globalną personę domyślną:

1. Otwórz panel **Personas** (Persony) na pasku bocznym po prawej – ikona osoby.
2. Najedź wskaźnikiem na wybraną personę na liście.
3. Kliknij przycisk **Set as active** (ustawienie jako aktywnej) – ikona ptaszka w tym wierszu.

Persona aktywna ma na awatarze małą plakietkę z ptaszkiem. Ustawienie nowej persony zdejmuje plakietkę z poprzedniej, więc aktywna jest zawsze tylko jedna.

Listę da się filtrować kafelkami **Active** (aktywne) i **Inactive** (nieaktywne), żeby sprawdzić, która persona jest domyślna.

Nowe, zduplikowane i zaimportowane persony nigdy nie stają się aktywne same z siebie. Aktywną trzeba ustawić samodzielnie.

## Wybór persony dla jednego czatu

Każdy czat może mieć zapisaną własną personę. To właśnie persona czatu i zawsze ma ona pierwszeństwo przed personą aktywną.

### Z panelu Chat Settings

1. Otwórz panel **Chat Settings** (ustawienia czatu) – ikona koła zębatego przy czacie.
2. Znajdź sekcję **Persona**. Jej tekst pomocy zaczyna się od "Your persona defines who you are in this chat."
3. Kiedy żadna persona nie jest ustawiona, widać napis "No persona selected."
4. Kliknij przycisk **Choose Persona** (wybór persony). Po ustawieniu persony przycisk zmienia nazwę na **Change Persona**.
5. Wyszukaj personę w oknie wyboru (tekst zastępczy "Search personas...") i kliknij ją.

Żeby usunąć personę czatu, kliknij przycisk usuwania (X) obok niej albo wybierz opcję **None** na górze okna wyboru.

W trybie Game Mode ta sekcja jest opisana jako drużyna w grze, ale etykieta pozostaje ta sama: **Persona**.

### Podczas tworzenia czatu

Kreator **New Chat** ma pole **Your Persona** (twoja persona). Działa w nim to samo okno wyboru z wyszukiwarką oraz opcja **None**. W kreatorze **New Game Setup** to samo pole nosi nazwę **Player's Persona**.

## Przełącznik **Quick Persona Switcher**

W otwartym czacie, obok pola wiadomości, znajduje się mały okrągły przycisk z awatarem. To właśnie przełącznik **Quick Persona Switcher** (szybki przełącznik person). Kiedy żadna persona nie jest ustawiona, podpowiedź pokazuje tę właśnie nazwę.

1. Kliknij przycisk z awatarem.
2. Otwiera się menu o nazwie **Personas**.
3. Kliknij dowolną personę, żeby przełączyć się od razu, albo kliknij opcję **None**, żeby nie używać żadnej.

Persony są pogrupowane według folderów. Persony bez folderu trafiają do grupy **Ungrouped**.

Na telefonie przełączanie person dzieli menu z przełączaniem połączeń. Dotknij strzałki **Quick Switcher** obok pola wiadomości, a potem otwórz zakładkę **Personas**. Zakładka **Connections** jest w tym samym menu.

## Która persona wygrywa

Marinara wybiera personę czatu w takiej kolejności:

1. Persona czatu, jeśli została dla niego ustawiona.
2. W przeciwnym razie globalna persona aktywna.
3. Jeśli nie ma ani jednej, ani drugiej, AI zwraca się do ciebie per "User" i nie dostaje żadnych szczegółów persony.

W trybie Game Mode personę wybiera się raz, w kreatorze **New Game Setup**. Czat zachowuje personę wybraną w tym miejscu. Czat w trybie Game Mode nie przełącza się na ekranie na personę aktywną.

Przełączenie persony w trakcie czatu nie zmienia wcześniejszych wiadomości. Każda wysłana wiadomość zachowuje tę personę, z którą została wysłana.

## Powiązane przewodniki

- [Persony użytkownika: tworzenie i edycja](personas.md)
- [Panel **Chat Settings** – przegląd](../chats/chat-settings.md)
