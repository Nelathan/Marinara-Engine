# Memory Recall i podsumowania czatu

Ten przewodnik wyjaśnia, jak Marinara Engine pilnuje spójności długiego czatu, gdy ten przerośnie ilość tekstu, którą model AI czyta naraz. Opisuje sekcję **Memory Recall** (wyszukiwanie semantyczne w starszych wiadomościach), panel **Chat Summary** (podsumowanie czatu) w czatach Roleplay oraz sekcję **Automatic Summarization** (automatyczne podsumowywanie) w czatach Conversation.

## Dwa systemy pamięci

Każdy model AI czyta naraz tylko ograniczoną ilość tekstu. Ten limit nazywa się oknem kontekstu. W długim czacie najstarsze wiadomości wypadają poza to okno i AI o nich zapomina. Marinara Engine (dalej: Marinara) ma na to dwa niezależne systemy.

- **Memory Recall** przeszukuje starsze wiadomości pod kątem fragmentów najbliższych temu, co właśnie zostało napisane, a potem po cichu dokłada je z powrotem do promptu. Działa we wszystkich trybach czatu.
- Podsumowania ściskają stare wiadomości w krótkie streszczenia, które zastępują w prompcie surowe wiadomości. Czaty Roleplay korzystają z panelu **Chat Summary**. Czaty Conversation korzystają z sekcji **Automatic Summarization**.

Czaty Game Mode dostają wyłącznie sekcję **Memory Recall**. Żadnej z funkcji podsumowań tam nie ma.

Obu systemów można używać jednocześnie. Robią co innego i nie wchodzą sobie w drogę.

## Konfiguracja Memory Recall

**Memory Recall** wyszukuje istotne fragmenty z wcześniejszej części czatu i wstawia je do promptu jako wspomnienia. Korzysta z embeddingu, czyli liczbowego odcisku palca znaczenia wiadomości. Marinara porównuje odcisk palca nowej wiadomości z zapisanymi odciskami wcześniejszych wiadomości i dokłada najbliższe trafienia.

### Włączanie Memory Recall

1. Otwórz czat i kliknij przycisk **Chat Settings** (ustawienia czatu) w nagłówku czatu.
2. Znajdź sekcję **Memory Recall** (rozpoznasz ją po ikonie mózgu).
3. Włącz przełącznik **Enable Memory Recall**.

Przełącznik **Enable Memory Recall** działa osobno dla każdego czatu. Wartość domyślna zależy od trybu:

- Włączony domyślnie w czatach Conversation.
- Włączony domyślnie w czatach Roleplay i Game z aktywną sceną.
- Wyłączony domyślnie we wszystkich pozostałych czatach.

Wyłączenie przełącznika sprawia, że przywołane wspomnienia przestają trafiać do promptu. Nic z tego, co już zapisano, nie zostaje usunięte.

### Źródło embeddingów

Do budowania odcisków palca znaczenia sekcja **Memory Recall** potrzebuje źródła embeddingów. Ustawia się je w połączeniu, a nie w ustawieniach czatu. Połączenie to zapisany skrót do dostawcy AI.

1. Otwórz panel **Connections** (połączenia) i przejdź do edycji połączenia.
2. Znajdź sekcję **Semantic Search (Embeddings)** (wyszukiwanie semantyczne).
3. W polu modelu wpisz nazwę modelu embeddingów. Przykładowa wartość to `text-embedding-3-small`.
4. Opcjonalnie ustaw pole **Embedding Endpoint URL**, żeby nadpisać adres.
5. Opcjonalnie skorzystaj z listy rozwijanej **Embedding Connection**, żeby pożyczyć klucz i adres z innego połączenia. Do wyboru są między innymi **Same as this connection** i **Local Model (sidecar)**.

Część dostawców nie udostępnia embeddingów. Wtedy Marinara pokazuje uwagę z prośbą o wskazanie osobnego połączenia do embeddingów, na przykład zgodnego z OpenAI, połączenia Google albo **Local Model**.

Jeśli nie zostanie ustawione żadne połączenie do embeddingów, Marinara przechodzi na wbudowany, lokalny model embeddingów. Pobiera go jeden raz i uruchamia na twoim komputerze, bez żadnego klucza API. Więcej o wbudowanym modelu znajdziesz w przewodniku [Konfiguracja modelu Local Model](../connections/local-model.md).

To samo ustawienie **Semantic Search (Embeddings)** napędza też wyszukiwanie semantyczne w lorebookach, więc jedna konfiguracja obsługuje obie funkcje.

### Memories for This Chat

Żeby zobaczyć, co czat zapamiętał, otwórz panel **Chat Settings**, przejdź do sekcji **Memory Recall** i kliknij przycisk **Access memories for this chat**. Otwiera się okno **Memories for This Chat** (wspomnienia z tego czatu).

Okno pokazuje liczbę zapisanych fragmentów wspomnień i przybliżony szacunek w tokenach. Każda karta fragmentu zawiera zakres dat, którego dotyczy, liczbę wiadomości, status oraz datę utworzenia. Status ma jedną z trzech wartości:

- **Vectorized**: odcisk palca jest gotowy i można go przeszukiwać.
- **Waiting for vector**: odcisk palca dopiero powstaje.
- **Embedding unavailable**: żadne źródło embeddingów nie mogło go zbudować.

Na pasku narzędzi są ikony eksportu wspomnień, importu wspomnień, przebudowy wspomnień oraz wyczyszczenia wszystkich wspomnień. Każdy fragment ma dodatkowo własną ikonę kosza, która usuwa tylko ten jeden fragment.

- Kliknięcie ikony kosza przy fragmencie otwiera okno **Forget Memory**. Potwierdź przyciskiem **Forget**.
- Ikona kosza czyszcząca wszystko otwiera okno **Clear Memories**. Potwierdź przyciskiem **Clear**. Usuwa to wspomnienia, ale wiadomości czatu zostają nietknięte.
- Ikona odświeżania przebudowuje każdy fragment wspomnień z bieżących wiadomości czatu. Użyj jej po zmianie modelu embeddingów.
- Eksport zapisuje plik `.marinara.json`. Import przyjmuje pliki `.json` i `.marinara`, a ich zawartość dołącza do istniejących wspomnień.

### Jak zachowuje się Memory Recall

Warto pamiętać o kilku rzeczach:

- Marinara zapisuje fragmenty wspomnień w tle zawsze, gdy dostępne jest źródło embeddingów, nawet przy wyłączonym przełączniku **Enable Memory Recall**. Przełącznik decyduje wyłącznie o tym, czy zapisane wspomnienia trafiają do promptu. Żeby zatrzymać zapisywanie, usuń źródło embeddingów albo co jakiś czas czyść wspomnienia.
- Fragment powstaje dopiero z co najmniej 5 nowych wiadomości. Mniejsze porcje czekają na kolejną odpowiedź.
- Przywołane fragmenty muszą być na tyle bliskie tematycznie, żeby przejść test podobieństwa. Słabe trafienia są pomijane, więc wyszukiwanie potrafi nic nie zwrócić, choć wspomnienia istnieją.
- Na przywołane wspomnienia przypada tylko niewielki wycinek promptu, więc dokładanych jest zawsze zaledwie kilka najtrafniejszych.
- Po zmianie modelu embeddingów, gdy wspomnienia już istnieją, stare fragmenty przestają pasować. Przebuduj je ikoną odświeżania.
- Usunięcie wiadomości czatu kasuje też jego fragmenty wspomnień.

Niektóre kontenerowe wersje aplikacji Marinara Engine, znane jako Marinara Lite, wyłączają sekcję **Memory Recall** całkowicie. Na tych wersjach sekcja **Memory Recall** w ogóle się nie pojawia.

## Chat Summary (Roleplay)

**Chat Summary** ściska starsze wiadomości w krótkie streszczenia fabularne, nazywane wpisami podsumowania. Każdy wpis może napisać AI albo ty samodzielnie, a każdy da się włączyć i wyłączyć niezależnie. Ta funkcja istnieje wyłącznie w czatach Roleplay.

Żeby ją otworzyć, kliknij przycisk **Chat Summary** (ikona zwoju) w nagłówku czatu Roleplay. Otwiera się panel podręczny **Chat Summary**.

### Tworzenie wpisu podsumowania

1. W sekcji **Summary Scope** wybierz **Last**, żeby podsumować najnowsze wiadomości, albo **Range**, żeby wskazać konkretny zakres wiadomości.
2. Kliknij przycisk **Generate**, żeby AI napisało wpis z tego zakresu.
3. Możesz też kliknąć przycisk **Write**, utworzyć pusty wpis i wpisać streszczenie ręcznie.

Każdy wpis na liście pokazuje tytuł, zakres źródłowy lub liczbę wiadomości oraz szacowany rozmiar w tokenach. Wpis da się włączyć lub wyłączyć, rozwinąć, zmienić przyciskiem **Edit** albo usunąć przyciskiem **Delete**. Przyciski zbiorcze pozwalają na **Show Inactive** lub **Hide Inactive** oraz na **Activate All** albo **Deactivate All** za jednym razem.

### Automatic Summaries

Panel **Automatic Summaries** (automatyczne podsumowania) dba o aktualność podsumowań w trakcie dalszej rozmowy. Pojawia się wyłącznie w czatach Roleplay.

- Włącz przełącznik **Enabled** wewnątrz panelu **Automatic Summaries**.
- Częstotliwość ustaw w polu **Every**, liczoną w wiadomościach użytkownika. Domyślnie jest to 5, a zakres wynosi od 1 do 200.
- Kliknij przycisk **Backfill Summary**, żeby nadrobić starszy czat, który nigdy nie miał podsumowań. Przetwarza on czat porcjami, a w trakcie widać pasek postępu. Kliknij przycisk **Stop**, żeby przerwać wcześniej.

### Szablony Summary Prompt

Panel **Summary Prompt** steruje instrukcjami, według których AI pisze podsumowanie. Kliknij przycisk **Edit**, żeby zmienić aktywny prompt. Kliknij przycisk **Templates**, żeby otworzyć menedżera szablonów. Przycisk **New template** zapisuje tam nazwany prompt. Każdy zapisany szablon ma własne przyciski **Duplicate**, **Edit** i **Delete**.

Zapisane szablony to ustawienie globalne, wspólne dla całej aplikacji. Edycja lub wybór szablonu w jednym czacie Roleplay zmienia prompt podsumowania we wszystkich czatach Roleplay.

### Summary Connection i rozmiar wyniku

Panel **Summary Connection** wskazuje połączenie, które pisze podsumowania. Domyślna wartość nazywa się **Agent default (falls back to chat connection)**. Oznacza to, że w pierwszej kolejności używane jest domyślne połączenie agenta, a w drugiej własne połączenie czatu.

Pole **Maximum output size** decyduje o tym, jak długie może być wygenerowane podsumowanie. Domyślnie jest to 4096 tokenów, a zakres wynosi od 1 do 32768.

### Opcje wyświetlania

Sekcja **Display** w panelu podręcznym decyduje o tym, jak podsumowane wiadomości wyglądają na ekranie:

- **Hide summarised messages**: ukrywa surowe wiadomości, gdy obejmie je podsumowanie. Domyślnie wyłączone.
- **Recent message tail**: zostawia tyle najnowszych wiadomości w pełni widocznych nawet przy włączonym ukrywaniu. Domyślnie jest to 10, a przyjmowana jest każda nieujemna liczba całkowita. Wartość 0 ukrywa całą podsumowaną porcję. Wyższe wartości zwiększają rozmiar promptu i koszt modelu.
- **Collapse hidden messages**: steruje wyglądem ukrytych wiadomości w zapisie czatu.

Jeśli czat wymaga zatwierdzania zapisów przez agenta (osobne ustawienie w sekcji Agents), podsumowania napisane przez AI czekają na twoją weryfikację, zanim zaczną obowiązywać.

## Automatic Summarization (Conversation)

Czaty Conversation korzystają z innego systemu, nazwanego **Automatic Summarization**. Zamyka on każdy dzień kalendarzowy w podsumowaniu dnia, a zakończone tygodnie podsumowań dziennych łączy w podsumowanie tygodnia. Prompt wysyła potem tylko podsumowania tygodni, podsumowania dni z bieżącego tygodnia i dzisiejsze wiadomości. Dzięki temu każde żądanie zostaje małe.

Ta funkcja działa samodzielnie i w czatach Conversation nie da się jej wyłączyć.

### Otwieranie edytora

1. Otwórz czat Conversation i kliknij przycisk **Chat Settings**.
2. Znajdź sekcję **Automatic Summarization** (rozpoznasz ją po ikonie kalendarza).
3. Kliknij przycisk **Edit Summaries**, żeby otworzyć okno **Automatic Summarization**.

Okno pokazuje najpierw wpisy tygodniowe, a pod nimi dni, których jeszcze nie zwinięto w tydzień. Rozwiń wpis, żeby zmienić jego tekst w polu **Summary** oraz listę **Key Details**, w której da się dodawać i usuwać wiersze.

### Day Rollover Hour i Recent Message Tail

Dwa ustawienia w sekcji **Automatic Summarization** decydują o podziale na dni:

- **Day Rollover Hour**: godzina, o której na potrzeby podsumowań zaczyna się nowy dzień. Domyślnie jest to 4 AM, a do wyboru są godziny od 12 AM (północ) do 11 AM. Wiadomości wysłane przed tą godziną liczą się do dnia poprzedniego. Wybierz porę, o której nigdy nie piszesz, żeby nocna sesja nie została przecięta na pół.
- **Recent Message Tail**: ile dzisiejszych najnowszych wiadomości zostaje w formie dosłownej nawet po podsumowaniu. Domyślnie jest to 10, a przyjmowana jest każda nieujemna liczba całkowita. Wyższe wartości zwiększają rozmiar promptu i koszt modelu.

Po zmianie ustawienia **Day Rollover Hour**, gdy podsumowania już istnieją, Marinara ostrzega, że starsze podsumowania powstały przy poprzedniej wartości.

### Uzupełnianie brakujących dni

Czasem dzień nie dostaje podsumowania, na przykład po imporcie starego czatu. Panel **Missing Summaries** w tym oknie ma przycisk **Backfill**, który ponawia próbę dla ostatnich dni bez podsumowania. Sięga wstecz najwyżej o 14 dni naraz.

Zmiana połączenia lub modelu używanego do podsumowań nie przepisuje wpisów dziennych i tygodniowych, które już istnieją.

## Rozwiązywanie problemów

### Memory Recall nic nie przywołuje

- Sprawdź, czy skonfigurowane jest źródło embeddingów. Jeśli fragmenty w oknie **Memories for This Chat** mają status **Embedding unavailable**, uzupełnij sekcję **Semantic Search (Embeddings)** w połączeniu albo oprzyj się na wbudowanym modelu lokalnym. Zobacz przewodnik [Konfiguracja modelu Local Model](../connections/local-model.md).
- Jeśli fragmenty mają status **Waiting for vector**, daj im chwilę. Odciski palca powstają po odpowiedziach.
- Wyszukiwanie dokłada wyłącznie wspomnienia blisko związane z twoją ostatnią wiadomością. Gdy nic nie pasuje, nie dokłada nic. Tak ma być.
- Jeśli model embeddingów zmienił się niedawno, użyj ikony odświeżania w oknie **Memories for This Chat**, żeby stare fragmenty pasowały do nowego modelu.

### Podsumowania nie powstają

- Sprawdź, czy czat ma działające połączenie tekstowe. Panel **Chat Summary** używa połączenia z panelu **Summary Connection**, a sekcja **Automatic Summarization** ustalonego połączenia do podsumowań. Gdy żadne nie działa, generowanie zostaje pominięte.
- Jeśli czat wymaga zatwierdzania zapisów przez agenta, podsumowania AI czekają na twoją zgodę.
- Nieudane podsumowanie ponawia się automatycznie po chwili. Jeśli sprawa stoi w miejscu, uruchom ręcznie przycisk **Backfill Summary** (Roleplay) albo **Backfill** (Conversation).

## Powiązane przewodniki

- [Konfiguracja modelu Local Model](../connections/local-model.md)
- [Łączenie z dostawcą AI](../connections/connecting-to-a-provider.md)
- [Tryb Conversation: pierwsze kroki](../conversation/getting-started.md)
- [Tryb Roleplay: pierwsze kroki](../roleplay/getting-started.md)
- [Rozwiązywanie problemów w aplikacji Marinara Engine](../TROUBLESHOOTING.md)
